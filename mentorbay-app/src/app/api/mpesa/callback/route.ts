import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// Safaricom Daraja STK Push callback. Safaricom POSTs here after the mentee
// responds to (or ignores) the PIN prompt. THIS is where money is actually
// applied: we look up the pending payment_intent by CheckoutRequestID, and on
// success run the ledger logic (payments row, running total, commission split
// released once) for a program enrollment, a paid event ticket, OR a paid
// mentorship, depending on the intent's `kind`. Runs with the service-role
// client because the mentee is not allowed to mutate these rows.
//
// We always return ResultCode 0 to Safaricom (acknowledge receipt) so they do
// not retry indefinitely; our own status tracking is in payment_intents.
export const dynamic = "force-dynamic";

type CallbackItem = { Name: string; Value?: string | number };

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  const stk = (body as { Body?: { stkCallback?: Record<string, unknown> } })?.Body?.stkCallback;
  if (!stk) return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });

  const checkoutRequestId = String(stk.CheckoutRequestID ?? "");
  const resultCode = String(stk.ResultCode ?? "");
  const resultDesc = String(stk.ResultDesc ?? "");
  if (!checkoutRequestId) return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });

  // Find the pending intent this callback belongs to. `kind` + the *_slug
  // columns distinguish a program enrollment, a paid-event ticket, and a
  // paid mentorship.
  const { data: intent } = await supabase
    .from("payment_intents")
    .select("id, mentee_id, mentor_id, program_slug, event_slug, mentor_slug, kind, amount_kes, plan, status, applied")
    .eq("checkout_request_id", checkoutRequestId)
    .maybeSingle();
  if (!intent) return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });

  // Already processed? Acknowledge and stop (idempotent against retries).
  if (intent.applied || intent.status === "success" || intent.status === "failed") {
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  // Failure / cancellation path: mark failed, do not move money.
  if (resultCode !== "0") {
    await supabase.from("payment_intents").update({
      status: "failed", result_code: resultCode, result_desc: resultDesc, updated_at: new Date().toISOString(),
    }).eq("id", intent.id);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  // Success: pull the M-Pesa receipt from the callback metadata.
  const items = ((stk.CallbackMetadata as { Item?: CallbackItem[] })?.Item ?? []) as CallbackItem[];
  const receiptItem = items.find((i) => i.Name === "MpesaReceiptNumber");
  const mpesaReceipt = receiptItem?.Value ? String(receiptItem.Value) : null;

  // Mark the intent successful and claim the "applied" guard atomically-ish:
  // we set applied=true only if it is still false, then re-read to confirm we won.
  const { data: claimed } = await supabase
    .from("payment_intents")
    .update({ status: "success", result_code: resultCode, result_desc: resultDesc, mpesa_receipt: mpesaReceipt, applied: true, updated_at: new Date().toISOString() })
    .eq("id", intent.id)
    .eq("applied", false)
    .select("id")
    .maybeSingle();
  if (!claimed) {
    // Another concurrent callback already applied it.
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  const menteeId = intent.mentee_id as string;
  const mentorId = (intent.mentor_id as string) ?? null;
  const payNow = Number(intent.amount_kes ?? 0);
  const kind = String(intent.kind ?? "program");

  // ======================= PAID MENTORSHIP =======================
  // A mentee pays a mentor's per-period (week/month) rate. Full amount in one
  // go: record the ledger row, open/refresh the mentorship access window, and
  // release the commission split once.
  if (kind === "mentorship") {
    const mentorSlug = intent.mentor_slug as string;
    if (mentorSlug) {
      const { data: m } = await supabase.from("mentors").select("profile_id, billing_interval").eq("slug", mentorSlug).maybeSingle();
      const interval = String(m?.billing_interval ?? "month") === "week" ? "week" : "month";

      // 1) Ledger row.
      await supabase.from("payments").insert({
        mentee_id: menteeId,
        mentor_id: mentorId,
        mentor_slug: mentorSlug,
        amount_kes: payNow,
        kind: "mentorship",
        provider: "mpesa",
        reference: mpesaReceipt,
        payment_intent_id: intent.id,
      });

      // 2) Open/extend the mentorship access window.
      const now = new Date();
      const end = new Date(now);
      if (interval === "week") end.setDate(end.getDate() + 7);
      else end.setMonth(end.getMonth() + 1);
      await supabase.from("mentorships").insert({
        mentor_slug: mentorSlug,
        mentee_id: menteeId,
        billing_interval: interval,
        amount_paid_kes: payNow,
        payment_intent_id: intent.id,
        period_start: now.toISOString(),
        period_end: end.toISOString(),
        active: true,
      });

      // 3) Release the split once (admin commission + mentor wallet share).
      if (payNow > 0) {
        const { data: setRow } = await supabase.from("app_settings").select("commission_pct, admin_balance_kes").eq("id", 1).maybeSingle();
        const pct = Math.max(0, Math.min(100, Number(setRow?.commission_pct ?? 15)));
        const adminCut = Math.round((payNow * pct) / 100);
        const mentorShare = payNow - adminCut;
        await supabase.from("app_settings").update({ admin_balance_kes: Number(setRow?.admin_balance_kes ?? 0) + adminCut }).eq("id", 1);
        const ownerId = (m?.profile_id as string) ?? mentorId;
        if (ownerId) {
          const { data: mp } = await supabase.from("profiles").select("wallet_balance_kes").eq("id", ownerId).maybeSingle();
          await supabase.from("profiles").update({ wallet_balance_kes: Number(mp?.wallet_balance_kes ?? 0) + mentorShare }).eq("id", ownerId);
        }
      }
    }
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  // ======================= PAID EVENT TICKET =======================
  // For events the full ticket price is paid in one go: mark the registration
  // paid (creating it if missing) and release the commission split once.
  if (kind === "event") {
    const eventSlug = intent.event_slug as string;
    if (eventSlug) {
      const { data: ev } = await supabase.from("events").select("price_kes, created_by").eq("slug", eventSlug).maybeSingle();
      const price = Number(ev?.price_kes ?? 0);

      // 1) Ledger row.
      await supabase.from("payments").insert({
        mentee_id: menteeId,
        mentor_id: mentorId,
        event_slug: eventSlug,
        amount_kes: payNow,
        kind: "event",
        provider: "mpesa",
        reference: mpesaReceipt,
        payment_intent_id: intent.id,
      });

      // 2) Confirm/insert the registration as paid (idempotent on user+event).
      await supabase.from("event_registrations").upsert({
        user_id: menteeId,
        event_slug: eventSlug,
        amount_paid_kes: payNow,
        paid: true,
        payment_intent_id: intent.id,
      }, { onConflict: "user_id,event_slug" });

      // 3) Release the split once (admin commission + mentor wallet share).
      if (price > 0) {
        const { data: setRow } = await supabase.from("app_settings").select("commission_pct, admin_balance_kes").eq("id", 1).maybeSingle();
        const pct = Math.max(0, Math.min(100, Number(setRow?.commission_pct ?? 15)));
        const adminCut = Math.round((payNow * pct) / 100);
        const mentorShare = payNow - adminCut;
        await supabase.from("app_settings").update({ admin_balance_kes: Number(setRow?.admin_balance_kes ?? 0) + adminCut }).eq("id", 1);
        const ownerId = (ev?.created_by as string) ?? mentorId;
        if (ownerId) {
          const { data: mp } = await supabase.from("profiles").select("wallet_balance_kes").eq("id", ownerId).maybeSingle();
          await supabase.from("profiles").update({ wallet_balance_kes: Number(mp?.wallet_balance_kes ?? 0) + mentorShare }).eq("id", ownerId);
        }
      }
    }
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  // ======================= PROGRAM ENROLLMENT =======================
  // (same logic as payProgramAction) — supports installments + full payment.
  const slug = intent.program_slug as string;
  const plan = Number(intent.plan ?? 1);

  const { data: enr } = await supabase.from("enrollments")
    .select("id, amount_paid_kes, fully_paid, payout_released")
    .eq("user_id", menteeId).eq("program_slug", slug).maybeSingle();
  const { data: prog } = await supabase.from("programs").select("price_kes, created_by").eq("slug", slug).maybeSingle();
  const price = Number(prog?.price_kes ?? 0);

  if (enr && price > 0) {
    const already = Number(enr.amount_paid_kes ?? 0);
    const newPaid = already + payNow;
    const nowFull = newPaid >= price;

    // 1) Ledger row.
    await supabase.from("payments").insert({
      mentee_id: menteeId,
      mentor_id: mentorId,
      program_slug: slug,
      amount_kes: payNow,
      kind: nowFull && plan <= 1 ? "full" : "installment",
      provider: "mpesa",
      reference: mpesaReceipt,
      payment_intent_id: intent.id,
    });

    // 2) Enrollment running total + plan.
    await supabase.from("enrollments").update({
      amount_paid_kes: newPaid, payment_plan: plan, fully_paid: nowFull,
    }).eq("id", enr.id as string);

    // 3) On FULL payment, release the split exactly once.
    if (nowFull && !enr.payout_released) {
      const { data: setRow } = await supabase.from("app_settings").select("commission_pct, admin_balance_kes").eq("id", 1).maybeSingle();
      const pct = Math.max(0, Math.min(100, Number(setRow?.commission_pct ?? 15)));
      const adminCut = Math.round((price * pct) / 100);
      const mentorShare = price - adminCut;
      await supabase.from("app_settings").update({ admin_balance_kes: Number(setRow?.admin_balance_kes ?? 0) + adminCut }).eq("id", 1);
      if (prog?.created_by) {
        const { data: mp } = await supabase.from("profiles").select("wallet_balance_kes").eq("id", prog.created_by as string).maybeSingle();
        await supabase.from("profiles").update({ wallet_balance_kes: Number(mp?.wallet_balance_kes ?? 0) + mentorShare }).eq("id", prog.created_by as string);
      }
      await supabase.from("enrollments").update({ payout_released: true }).eq("id", enr.id as string);
    }
  }

  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
