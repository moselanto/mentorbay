"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { bookSessionAction } from "@/app/actions";

type Connected = { mentorId: string; mentorName: string };

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="px-5 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition disabled:opacity-60">
      {pending ? "Booking..." : "+ Book session"}
    </button>
  );
}

export default function SessionBookingForm({ connected }: { connected: Connected[] }) {
  const [mentorId, setMentorId] = useState(connected[0]?.mentorId ?? "");
  const [topics, setTopics] = useState<string[]>([]);
  const [topic, setTopic] = useState("");
  const [custom, setCustom] = useState("");

  // When the mentor changes, fetch that mentor's program topics.
  useEffect(() => {
    let active = true;
    if (!mentorId) { setTopics([]); return; }
    fetch(`/api/mentor-topics/${mentorId}`)
      .then((r) => r.json())
      .then((d) => { if (active) { setTopics(d.topics ?? []); setTopic((d.topics?.[0] as string) ?? ""); } })
      .catch(() => { if (active) setTopics([]); });
    return () => { active = false; };
  }, [mentorId]);

  const finalTopic = topic === "__custom__" ? custom : topic;

  return (
    <form action={bookSessionAction} className="grid sm:grid-cols-4 gap-3 items-end">
      <input type="hidden" name="topic" value={finalTopic} />
      <div className="sm:col-span-2">
        <label className="block text-xs font-semibold text-navy mb-1">Mentor</label>
        <select name="mentor_id" required value={mentorId} onChange={(e) => setMentorId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none">
          {connected.map((c) => <option key={c.mentorId} value={c.mentorId}>{c.mentorName}</option>)}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-semibold text-navy mb-1">Topic</label>
        {topics.length > 0 ? (
          <select value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none">
            {topics.map((t) => <option key={t} value={t}>{t}</option>)}
            <option value="__custom__">Other (type your own)</option>
          </select>
        ) : (
          <input value={custom} onChange={(e) => { setCustom(e.target.value); setTopic("__custom__"); }} required className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="e.g. Career roadmap review" />
        )}
        {topics.length > 0 && topic === "__custom__" && (
          <input value={custom} onChange={(e) => setCustom(e.target.value)} required className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="Enter a topic" />
        )}
      </div>
      <div className="sm:col-span-2"><label className="block text-xs font-semibold text-navy mb-1">Date &amp; time</label><input name="scheduled_at" type="datetime-local" required className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" /></div>
      <div><label className="block text-xs font-semibold text-navy mb-1">Mode</label><select name="mode" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none"><option>Google Meet</option><option>Zoom</option><option>In-person</option></select></div>
      <div className="flex justify-end"><SubmitBtn /></div>
    </form>
  );
}
