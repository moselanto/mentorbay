import Link from "next/link";
import { notFound } from "next/navigation";
import { getMentorSessionById } from "@/lib/sessions";
import { updateSessionAction } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function EditSessionPage({ params }: { params: { id: string } }) {
  const s = await getMentorSessionById(params.id);
  if (!s) notFound();
  return (
    <div className="space-y-6 max-w-xl">
      <Link href="/mentor/sessions" className="text-sm text-slate-500 hover:text-teal-600">&larr; Sessions</Link>
      <h1 className="text-2xl font-extrabold text-navy">Session with {s.mentee}</h1>

      <form action={updateSessionAction} className="bg-white rounded-2xl shadow-card p-6 space-y-4">
        <input type="hidden" name="id" value={s.id} />
        <div>
          <label className="block text-sm font-semibold text-navy mb-1">Topic</label>
          <input value={s.topic} disabled className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">Date &amp; time</label>
            <input name="scheduled_at" type="datetime-local" defaultValue={s.scheduledAtLocal} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">Mode</label>
            <select name="mode" defaultValue={s.mode} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none"><option>Google Meet</option><option>Zoom</option><option>In-person</option></select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-navy mb-1">Meeting link <span className="text-slate-400 font-normal">(Google Meet or Zoom URL)</span></label>
          <input name="meeting_url" type="url" defaultValue={s.meetingUrl} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="https://meet.google.com/..." />
          <p className="text-xs text-slate-400 mt-1">Once added, your mentee sees a Join button on their session.</p>
        </div>
        <div className="flex justify-end">
          <button className="px-6 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Save session</button>
        </div>
      </form>
    </div>
  );
}
