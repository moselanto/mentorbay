"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { mentorDeclineApplicationAction } from "@/app/actions";

function SubmitDecline() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="px-4 py-2 text-sm font-semibold text-white bg-rose-500 rounded-lg hover:bg-rose-600 transition disabled:opacity-60">
      {pending ? "Sending..." : "Decline application"}
    </button>
  );
}

// Mentor action: decline a mentorship application, optionally with a note
// (e.g. capacity, fit) that is emailed to and shown in-app to the mentee.
export default function DeclineApplicationButton({ applicationId, className }: { applicationId: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className ?? "px-4 py-2 border border-slate-200 text-slate-500 text-sm font-semibold rounded-lg hover:border-rose-300 hover:text-rose-500 transition"}>
        Decline
      </button>
      {open && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-navy font-bold">Decline this application</h4>
            <p className="mt-1 text-sm text-slate-500">Optional: add a short, kind note (e.g. you&apos;re at capacity, or suggest a better-fit mentor). It&apos;s shown to the mentee in-app and by email.</p>
            <form action={mentorDeclineApplicationAction} className="mt-4 space-y-3">
              <input type="hidden" name="id" value={applicationId} />
              <textarea name="reason" rows={3} placeholder="e.g. I'm fully booked this quarter - Jane Mwangi mentors in the same area and has openings." className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none text-sm" />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:border-slate-300 transition">Cancel</button>
                <SubmitDecline />
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
