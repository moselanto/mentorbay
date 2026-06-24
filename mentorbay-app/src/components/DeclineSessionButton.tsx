"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { mentorDeclineSessionAction } from "@/app/actions";

function SubmitDecline() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="px-4 py-2 text-sm font-semibold text-white bg-rose-500 rounded-lg hover:bg-rose-600 transition disabled:opacity-60">
      {pending ? "Sending..." : "Send to mentee"}
    </button>
  );
}

// Mentor action: decline a session request with a REQUIRED reason that is sent
// back to the mentee. Uses a lightweight non-blocking modal (not window.prompt).
export default function DeclineSessionButton({ sessionId }: { sessionId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-3 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:border-rose-300 hover:text-rose-500 transition"
      >
        Not available
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-navy font-bold">Decline this session request</h4>
            <p className="mt-1 text-sm text-slate-500">Let your mentee know why you&apos;re not available for this time. Your note is sent to them so they can pick another slot.</p>
            <form action={mentorDeclineSessionAction} className="mt-4 space-y-3">
              <input type="hidden" name="id" value={sessionId} />
              <textarea
                name="reason"
                required
                rows={3}
                placeholder="e.g. I have a clash at that time - could we try Thursday after 2pm instead?"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none text-sm"
              />
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
