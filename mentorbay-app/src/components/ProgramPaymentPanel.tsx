"use client";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { payProgramAction } from "@/app/actions";

function fmt(n: number) { return "KES " + Math.round(n).toLocaleString("en-KE"); }

function PayBtn({ label, confirmMsg }: { label: string; confirmMsg: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}
      onClick={(e) => { if (!window.confirm(confirmMsg)) e.preventDefault(); }}
      className="w-full px-4 py-2.5 rounded-lg bg-teal text-white font-semibold hover:bg-teal/90 disabled:opacity-60">
      {pending ? "Processing..." : label}
    </button>
  );
}

type Props = { slug: string; price: number; paid: number; balance: number; fullyPaid: boolean; maxInstallments: number; approved?: boolean };

export default function ProgramPaymentPanel({ slug, price, paid, balance, fullyPaid, maxInstallments, approved = true }: Props) {
  const [plan, setPlan] = useState(1);
  const pct = price > 0 ? Math.min(100, Math.round((paid / price) * 100)) : 0;

  if (fullyPaid) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="font-semibold text-emerald-800">Payment complete</p>
        <p className="text-sm text-emerald-700 mt-1">You have paid {fmt(price)} in full. You have full access to this program.</p>
      </div>
    );
  }

  // Until the mentor approves the enrollment, there is nothing to pay yet.
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
  const confirmMsg = `Confirm a simulated payment of ${fmt(payNow)}${plan > 1 ? ` (installment 1 of ${plan})` : " (pay in full)"}?` +
    (plan <= 1 ? " This will mark the program as fully paid." : "");

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
      <div>
        <p className="font-semibold text-navy">Complete your payment</p>
        <p className="text-sm text-slate-500">Secure your spot by paying for this program. Payments are simulated for now - no real money is charged.</p>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-sm"><span className="text-slate-500">Program price</span><span className="font-medium text-navy">{fmt(price)}</span></div>
        <div className="flex justify-between text-sm"><span className="text-slate-500">Paid so far</span><span className="font-medium text-navy">{fmt(paid)}</span></div>
        <div className="flex justify-between text-sm"><span className="text-slate-500">Balance owed</span><span className="font-semibold text-teal">{fmt(balance)}</span></div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden mt-2"><div className="h-full bg-teal" style={{ width: pct + "%" }} /></div>
      </div>
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
      <form action={payProgramAction}>
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="plan" value={plan} />
        <PayBtn label={"Pay " + fmt(payNow) + (plan > 1 ? " (installment)" : "")} confirmMsg={confirmMsg} />
      </form>
      <p className="text-xs text-slate-400">The mentor receives their share once the program is fully paid.</p>
    </div>
  );
}
