"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { createSessionAction } from "@/app/actions";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="px-5 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition disabled:opacity-60">
      {pending ? "Scheduling..." : "+ Schedule"}
    </button>
  );
}

// Schedule-a-session form. Wraps the server action and resets the fields after
// a successful submit so the next session starts blank (no carried-over detail).
export default function SessionScheduleForm() {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={ref}
      action={async (fd) => {
        await createSessionAction(fd);
        ref.current?.reset();
      }}
      className="grid sm:grid-cols-4 gap-3 items-end"
    >
      <div className="sm:col-span-2"><label className="block text-xs font-semibold text-navy mb-1">Topic</label><input name="topic" required className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="e.g. Career roadmap review" /></div>
      <div><label className="block text-xs font-semibold text-navy mb-1">Date &amp; time</label><input name="scheduled_at" type="datetime-local" required className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" /></div>
      <div><label className="block text-xs font-semibold text-navy mb-1">Mode</label><select name="mode" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none"><option>Google Meet</option><option>Zoom</option><option>In-person</option></select></div>
      <div className="sm:col-span-4"><label className="block text-xs font-semibold text-navy mb-1">Meeting link <span className="text-slate-400 font-normal">(Google Meet or Zoom URL - optional)</span></label><input name="meeting_url" type="url" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="https://meet.google.com/... or https://zoom.us/j/..." /></div>
      <div className="sm:col-span-4 flex justify-end"><SubmitBtn /></div>
    </form>
  );
}
