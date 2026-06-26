"use client";
import { useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { payProgramAction, startMpesaProgramPaymentAction, getPaymentIntentStatus } from "@/app/actions";

function fmt(n: number) { return "KES " + Math.round(n).toLocaleString("en-KE"); }

function PayBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}
      className="w-full px-4 py-2.5 rounded-lg bg-teal text-white font-semibold hover:bg-teal/90 disabled:opacity-60">
      {pending ? "Sending request..." : label}
    </button>
  );
}

function SimPayBtn({ label, confirmMsg }: { label: string; confirmMsg: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}
      onClick={(e) => { if (!window.confirm(confirmMsg)) e.preventDefault(); }}
      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-navy font-semibold hover:border-teal disabled:opacity-60">
      {pending ? "Processing..." : label}
    </button>
  );
}

// Polls the M-Pesa payment intent after an STK push, so the mentee sees a clear
// "check your phone" state that resolves to success / failed without a manual refresh.
function MpesaWaiting({ intentId }: { intentId: string }) {
  const [status, setStatus] = useState<string>("pending");
  const [receipt, setReceipt] = useState<string | null>(null);
  const [desc, setDesc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let tries = 0;
    const timer = setInterval(async () => {
      tries += 1;
      const res = await getPaymentIntentStatus(intentId);
      if (active && res) {
        setStatus(res.status);
        setReceipt(res.receipt);
        setDesc(res.desc);
        if (res.status === "success" || res.status === "failed") clearInterval(timer);
      }
      if (tries > 40) clearInterval(timer); // ~2 min safety stop
    }, 3000);
    return () => { active = false; clearInterval(timer); };
  }, [intentId]);

  if (status === "success") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="font-semibold text-emerald-800">Payment received</p>
        <p className="text-sm text-emerald-700 mt-1">Thank you - your M-Pesa payment was confirmed{receipt ? ` (receipt ${receipt})` : ""}. Refresh to see your updated balance.</p>
      </div>
    );
  }
  if (status === "failed") {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-5">
        <p className="font-semibold text-rose-700">Payment not completed</p>
        <p className="text-sm text-rose-600 mt-1">{desc || "The M-Pesa request was cancelled or timed out."} You can try again below.</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
      <p className="font-semibold text-amber-800">Check your phone</p>
      <p className="text-sm text-amber-700 mt-1">We sent an M-Pesa request to your phone. Enter your M-Pesa PIN to complete the payment. This will update automatically once confirmed.</p>
      <div className="mt-3 flex items-center gap-2 text-xs text-amber-600"><span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> Waiting for confirmation...</div>
    </div>
  );
}

type Props = {
  slug: string; price: number; paid: number; balance: number; fullyPaid: boolean;
  maxInstallments: number; approved?: boolean;
  mpesaEnabled?: boolean; pendingIntentId?: string | null; defaultPhone?: string | null;
  allowSimulated?: boolean;
};

export default function ProgramPaymentPanel({
  slug, price, paid, balance, fullyPaid, maxInstallments, approved = true,
  mpesaEnabled = false, pendingIntentId = null, defaultPhone = null, allowSimulated = false,
}: Props) {
  const [plan, setPlan] = useState(1);
  const [phone, setPhone] = useState(defaultPhone ?? "");
  const pct = price > 0 ? Math.min(100, Math.round((paid / price) * 100)) : 0;

  if (fullyPaid) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="font-semibold text-emerald-800">Payment complete</p>
        <p className="text-sm text-emerald-700 mt-1">You have paid {fmt(price)} in full. You have full access to this program.</p>
      </div>
    );
  }

  if (!approved) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <p className="font-semibold text-amber-800">Awaiting mentor approval</p>
        <p className="text-sm text-amber-700 mt-1">Once your mentor approves your enrollment you&apos;ll be able to pay {fmt(price)} (in full or in installments) and unlock the program.</p>
      </div>
    );
  }

  const perInstallment = plan <= 1 ? balance : Math.ceil(price / plan);
  const payNow = Math.min(balance, perInstallment);
  const installmentOptions = Array.from({ length: maxInstallments }, (_, i) => i + 1).filter((n) => n >= 1);
  const simConfirm = `Confirm a simulated (test) payment of ${fmt(payNow)}${plan > 1 ? ` (installment 1 of ${plan})` : " (pay in full)"}?`;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
      <div>
        <p className="font-semibold text-navy">Complete your payment</p>
        <p className="text-sm text-slate-500">Secure your spot by paying for this program.</p>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-sm"><span className="text-slate-500">Program price</span><span className="font-medium text-navy">{fmt(price)}</span></div>
        <div className="flex justify-between text-sm"><span className="text-slate-500">Paid so far</span><span className="font-medium text-navy">{fmt(paid)}</span></div>
        <div className="flex justify-between text-sm"><span className="text-slate-500">Balance owed</span><span className="font-semibold text-teal">{fmt(balance)}</span></div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden mt-2"><div className="h-full bg-teal" style={{ width: pct + "%" }} /></div>
      </div>

      {/* Live M-Pesa waiting state, shown after an STK push was started. */}
      {pendingIntentId ? <MpesaWaiting intentId={pendingIntentId} /> : null}

      {maxInstallments > 1 && (
        <div>
          <label className="block text-sm font-semibold text-navy mb-1.5">Payment plan</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setPlan(1)}
              className={"px-3 py-2 rounded-lg border text-sm font-medium " + (plan === 1 ? "border-teal bg-teal/10 text-teal" : "border-slate-200 text-slate-600")}>
              Pay in full
            </button>
            {installmentOptions.filter((n) => n > 1).map((n) => (
              <button key={n} type="button" onClick={() => setPlan(n)}
                className={"px-3 py-2 rounded-lg border text-sm font-medium " + (plan === n ? "border-teal bg-teal/10 text-teal" : "border-slate-200 text-slate-600")}>
                {n} installments
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Primary: M-Pesa (when configured) */}
      {mpesaEnabled ? (
        <form action={startMpesaProgramPaymentAction} className="space-y-2">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="plan" value={plan} />
          <label className="block text-sm font-semibold text-navy">Pay with M-Pesa</label>
          <input
            name="phone" value={phone} onChange={(e) => setPhone(e.target.value)}
            inputMode="tel" placeholder="07XX XXX XXX" required
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-teal outline-none"
          />
          <PayBtn label={"Pay " + fmt(payNow) + " with M-Pesa" + (plan > 1 ? " (installment)" : "")} />
          <p className="text-xs text-slate-400">You&apos;ll get an M-Pesa prompt on this phone. Enter your PIN to confirm.</p>
        </form>
      ) : (
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">M-Pesa payments are not configured yet. Use the test payment below for now.</p>
      )}

      {/* Fallback: simulated test payment - hidden unless explicitly enabled via
          NEXT_PUBLIC_ALLOW_SIMULATED_PAYMENTS so real users only pay via M-Pesa. */}
      {allowSimulated ? (
        <form action={payProgramAction}>
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="plan" value={plan} />
          <SimPayBtn label={"Simulate test payment of " + fmt(payNow)} confirmMsg={simConfirm} />
        </form>
      ) : null}

      <p className="text-xs text-slate-400">The mentor receives their share once the program is fully paid.</p>
    </div>
  );
}
