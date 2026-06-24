"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { applyMentorshipAction } from "@/app/actions";

function SubmitBtn({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={disabled || pending} className="w-full py-3 bg-navy text-white font-semibold rounded-lg hover:bg-navy-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
      {pending ? "Sending..." : "Apply for Mentorship"}
    </button>
  );
}

// Apply form: the mentee self-certifies the mentor's program requirements
// (must tick all to enable Apply) and provides contact details that the mentor
// sees on the pending application so they can reach out before approving.
export default function ApplyMentorshipForm({ mentorProfileId, redirectTo, requirements }: { mentorProfileId: string; redirectTo: string; requirements: string[] }) {
  const reqs = requirements ?? [];
  const [checked, setChecked] = useState<boolean[]>(() => reqs.map(() => false));
  const allChecked = reqs.length === 0 || checked.every(Boolean);

  return (
    <form action={applyMentorshipAction} className="space-y-4">
      <input type="hidden" name="mentor_id" value={mentorProfileId} />
      <input type="hidden" name="redirect" value={redirectTo} />

      {reqs.length > 0 && (
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-sm font-bold text-navy">Before you apply, confirm you meet the requirements</p>
          <p className="text-xs text-slate-500 mt-0.5">These come from this mentor&apos;s programs. Tick each one to continue.</p>
          <ul className="mt-3 space-y-2">
            {reqs.map((r, i) => (
              <li key={`${r}-${i}`} className="flex items-start gap-2.5">
                <input
                  id={`req-${i}`}
                  type="checkbox"
                  name="confirmed_requirements"
                  value={r}
                  checked={checked[i]}
                  onChange={(e) => setChecked((prev) => prev.map((c, j) => (j === i ? e.target.checked : c)))}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal focus:ring-teal"
                />
                <label htmlFor={`req-${i}`} className="text-sm text-slate-700 leading-snug">{r}</label>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-navy mb-1">Your phone</label>
          <input name="phone" type="tel" required placeholder="e.g. 0712 345678" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-navy mb-1">Your email</label>
          <input name="email" type="email" required placeholder="you@example.com" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-navy mb-1">Note to the mentor <span className="font-normal text-slate-400">(optional)</span></label>
        <textarea name="note" rows={2} placeholder="A short intro and what you'd like help with." className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none text-sm" />
      </div>

      {!allChecked && <p className="text-xs text-amber-600">Tick all requirements above to enable applying.</p>}
      <SubmitBtn disabled={!allChecked} />
      <p className="text-xs text-slate-400 text-center">Your phone and email are shared with this mentor so they can contact you before approving.</p>
    </form>
  );
}
