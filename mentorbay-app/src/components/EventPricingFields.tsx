"use client";

import { useState } from "react";

// Free/Paid pricing controls for the event create + edit forms.
// Mirrors ProgramPricingFields (programs) but events charge a single entry fee
// (no installments). When Paid, exposes price_kes.
export default function EventPricingFields({ defaultPaid = false, defaultPrice = 0 }: { defaultPaid?: boolean; defaultPrice?: number }) {
  const [paid, setPaid] = useState(defaultPaid);
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <label className="block text-sm font-semibold text-navy mb-2">Pricing</label>
      <input type="hidden" name="is_paid" value={paid ? "true" : "false"} />
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => setPaid(false)} className={`rounded-lg border-2 p-3 text-left transition ${!paid ? "border-teal bg-teal-50" : "border-slate-200"}`}>
          <span className="block font-bold text-navy text-sm">Free</span>
          <span className="block text-xs text-slate-500">Open registration, no payment</span>
        </button>
        <button type="button" onClick={() => setPaid(true)} className={`rounded-lg border-2 p-3 text-left transition ${paid ? "border-teal bg-teal-50" : "border-slate-200"}`}>
          <span className="block font-bold text-navy text-sm">Paid</span>
          <span className="block text-xs text-slate-500">Charge an entry fee (M-Pesa)</span>
        </button>
      </div>

      {paid && (
        <div className="mt-4">
          <label className="block text-xs font-semibold text-navy mb-1">Ticket price (KES)</label>
          <input name="price_kes" type="number" min={1} step="1" defaultValue={defaultPrice || ""} required={paid} placeholder="e.g. 1000" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none text-sm" />
          <p className="text-xs text-slate-400 mt-2">Attendees pay the ticket fee via M-Pesa to confirm their spot. The platform commission is deducted automatically; your share lands in your Earnings wallet.</p>
        </div>
      )}
    </div>
  );
}
