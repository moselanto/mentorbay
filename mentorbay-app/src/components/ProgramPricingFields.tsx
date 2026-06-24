"use client";

import { useState } from "react";

// Free/Paid pricing controls for the program create + edit forms.
// When Paid, exposes price_kes and max_installments (full only, or up to 2/3/4).
export default function ProgramPricingFields({ defaultPaid = false, defaultPrice = 0, defaultMaxInstallments = 1 }: { defaultPaid?: boolean; defaultPrice?: number; defaultMaxInstallments?: number }) {
  const [paid, setPaid] = useState(defaultPaid);
  return (
    <div className="sm:col-span-2 rounded-xl border border-slate-200 p-4">
      <label className="block text-sm font-semibold text-navy mb-2">Pricing</label>
      <input type="hidden" name="is_paid" value={paid ? "true" : "false"} />
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => setPaid(false)} className={`rounded-lg border-2 p-3 text-left transition ${!paid ? "border-teal bg-teal-50" : "border-slate-200"}`}>
          <span className="block font-bold text-navy text-sm">Free</span>
          <span className="block text-xs text-slate-500">No payment required</span>
        </button>
        <button type="button" onClick={() => setPaid(true)} className={`rounded-lg border-2 p-3 text-left transition ${paid ? "border-teal bg-teal-50" : "border-slate-200"}`}>
          <span className="block font-bold text-navy text-sm">Paid</span>
          <span className="block text-xs text-slate-500">Set a price &amp; installments</span>
        </button>
      </div>

      {paid && (
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          <div>
            <label className="block text-xs font-semibold text-navy mb-1">Price (KES)</label>
            <input name="price_kes" type="number" min={1} step="1" defaultValue={defaultPrice || ""} required={paid} placeholder="e.g. 5000" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-navy mb-1">Installments allowed</label>
            <select name="max_installments" defaultValue={String(defaultMaxInstallments)} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none text-sm">
              <option value="1">Full payment only</option>
              <option value="2">Up to 2 installments</option>
              <option value="3">Up to 3 installments</option>
              <option value="4">Up to 4 installments</option>
            </select>
          </div>
          <p className="sm:col-span-2 text-xs text-slate-400">Mentees pay after you approve their enrollment. The platform commission is deducted automatically; your share lands in your Earnings wallet once a mentee has fully paid.</p>
        </div>
      )}
    </div>
  );
}
