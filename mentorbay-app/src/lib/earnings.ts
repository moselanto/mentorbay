import "server-only";
import { createClient } from "@/lib/supabase/server";

export type Withdrawal = { id: string; amount: number; phone: string | null; status: string; createdAt: string; paidAt: string | null };
export type MentorEarnings = {
  walletBalance: number;
  payoutPhone: string | null;
  lifetimePaidOut: number;
  pendingWithdrawal: number;
  withdrawals: Withdrawal[];
};

export async function getMentorEarnings(): Promise<MentorEarnings | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: prof } = await supabase.from("profiles").select("wallet_balance_kes, payout_phone").eq("id", user.id).maybeSingle();
  const { data: wds } = await supabase.from("withdrawals")
    .select("id, amount_kes, phone, status, created_at, paid_at")
    .eq("mentor_id", user.id).order("created_at", { ascending: false });
  const withdrawals: Withdrawal[] = (wds ?? []).map((w) => ({
    id: w.id as string, amount: Number(w.amount_kes ?? 0), phone: (w.phone as string | null) ?? null,
    status: (w.status as string) ?? "pending", createdAt: (w.created_at as string) ?? "", paidAt: (w.paid_at as string | null) ?? null,
  }));
  const lifetimePaidOut = withdrawals.filter((w) => w.status === "paid").reduce((a, w) => a + w.amount, 0);
  const pendingWithdrawal = withdrawals.filter((w) => w.status === "pending").reduce((a, w) => a + w.amount, 0);
  return {
    walletBalance: Number(prof?.wallet_balance_kes ?? 0),
    payoutPhone: (prof?.payout_phone as string | null) ?? null,
    lifetimePaidOut, pendingWithdrawal, withdrawals,
  };
}

export type AdminWithdrawal = { id: string; mentorName: string; amount: number; phone: string | null; status: string; createdAt: string; paidAt: string | null };

/** All withdrawals across mentors, newest first (admin view). */
export async function getAllWithdrawals(): Promise<AdminWithdrawal[]> {
  const supabase = createClient();
  const { data: wds } = await supabase.from("withdrawals")
    .select("id, mentor_id, amount_kes, phone, status, created_at, paid_at")
    .order("created_at", { ascending: false });
  const rows = wds ?? [];
  if (rows.length === 0) return [];
  // Resolve mentor names with a second query (PostgREST embeds are unreliable here).
  const ids = Array.from(new Set(rows.map((r) => r.mentor_id as string).filter(Boolean)));
  const nameById = new Map<string, string>();
  if (ids.length) {
    const { data: profs } = await supabase.from("profiles").select("id, full_name, email").in("id", ids);
    for (const pr of profs ?? []) nameById.set(pr.id as string, (pr.full_name as string) || (pr.email as string) || "Mentor");
  }
  return rows.map((r) => ({
    id: r.id as string, mentorName: nameById.get(r.mentor_id as string) ?? "Mentor",
    amount: Number(r.amount_kes ?? 0), phone: (r.phone as string | null) ?? null,
    status: (r.status as string) ?? "pending", createdAt: (r.created_at as string) ?? "", paidAt: (r.paid_at as string | null) ?? null,
  }));
}
