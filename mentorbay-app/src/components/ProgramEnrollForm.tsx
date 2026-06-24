"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { enrollProgramAction } from "@/app/actions";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="px-4 py-2 text-sm font-semibold text-white bg-navy rounded-lg hover:bg-navy-700 transition disabled:opacity-60">
      {pending ? "Sending..." : "Send enrollment request"}
    </button>
  );
}

// Not-yet-enrolled state: clicking Enroll opens a modal to collect the mentee's
// phone + email, then submits a pending enrollment request the mentor approves.
export default function ProgramEnrollForm({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="mt-4 w-full py-3 bg-navy text-white font-semibold rounded-lg hover:bg-navy-700 transition">
        Enroll Now
      </button>
      {open && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-navy font-bold">Request to enroll</h4>
            <p className="mt-1 text-sm text-slate-500">Share how the mentor can reach you. They&apos;ll review and approve your enrollment before you start.</p>
            <form action={enrollProgramAction} className="mt-4 space-y-3">
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="action" value="enroll" />
              <input type="hidden" name="redirect" value={`/programs/${slug}`} />
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Your phone</label>
                <input name="phone" type="tel" required placeholder="e.g. 0712 345678" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Your email</label>
                <input name="email" type="email" required placeholder="you@example.com" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none text-sm" />
              </div>
              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:border-slate-300 transition">Cancel</button>
                <SubmitBtn />
              </div>
              <p className="text-xs text-slate-400">Your phone and email are shared with the mentor so they can contact you before approving.</p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
