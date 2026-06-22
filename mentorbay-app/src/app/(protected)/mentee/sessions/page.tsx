import Link from "next/link";
import { getMySessions } from "@/lib/sessions";
import { getMyMentorApplications } from "@/lib/registrations";
import { bookSessionAction } from "@/app/actions";

export default async function SessionsPage({ searchParams }: { searchParams: { booked?: string; error?: string } }) {
  const [sessions, apps] = await Promise.all([getMySessions(), getMyMentorApplications()]);
  const upcoming = sessions.filter((s) => s.upcoming);
  const past = sessions.filter((s) => !s.upcoming);
  const connected = apps.filter((a) => a.status === "accepted");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy">Sessions</h1>

      {searchParams.booked && <p className="text-sm text-teal-700 bg-teal-50 px-4 py-2.5 rounded-lg">Session booked. Your mentor will confirm it.</p>}
      {searchParams.error === "missing" && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2.5 rounded-lg">Please choose a mentor, topic and time.</p>}
      {searchParams.error === "notconnected" && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2.5 rounded-lg">You can only book sessions with mentors you&apos;re connected to.</p>}
      {searchParams.error === "save" && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2.5 rounded-lg">Could not book the session. Please try again.</p>}

      <section className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-navy mb-4">Book a session</h3>
        {connected.length === 0 ? (
          <p className="text-sm text-slate-500">Connect with a mentor first to book a session. <Link href="/mentee/my-mentor" className="text-teal-600 font-semibold hover:underline">Find a mentor</Link>.</p>
        ) : (
          <form action={bookSessionAction} className="grid sm:grid-cols-4 gap-3 items-end">
            <div className="sm:col-span-2"><label className="block text-xs font-semibold text-navy mb-1">Mentor</label>
              <select name="mentor_id" required className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none">
                {connected.map((c) => <option key={c.mentorId} value={c.mentorId}>{c.mentorName}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2"><label className="block text-xs font-semibold text-navy mb-1">Topic</label><input name="topic" required className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="e.g. Career roadmap review" /></div>
            <div className="sm:col-span-2"><label className="block text-xs font-semibold text-navy mb-1">Date &amp; time</label><input name="scheduled_at" type="datetime-local" required className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" /></div>
            <div><label className="block text-xs font-semibold text-navy mb-1">Mode</label><select name="mode" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none"><option>Google Meet</option><option>Zoom</option><option>In-person</option></select></div>
            <div className="flex justify-end"><button className="px-5 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">+ Book session</button></div>
          </form>
        )}
      </section>

      <section className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-navy mb-4">Upcoming</h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No upcoming sessions.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-slate-50">
                <div className="w-11 h-11 rounded-lg bg-teal-50 text-teal-700 grid place-items-center font-bold">{s.counterpart[0]}</div>
                <div className="flex-1 min-w-0"><p className="font-semibold text-navy">{s.topic}</p><p className="text-xs text-slate-500">with {s.counterpart} · {s.mode}</p></div>
                <span className="text-sm font-medium text-slate-600">{s.when}</span>
                {s.meetingUrl ? (
                  <a href={s.meetingUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-teal text-white text-sm font-semibold rounded-lg">Join</a>
                ) : (
                  <span className="px-4 py-2 border border-slate-200 text-slate-400 text-sm font-semibold rounded-lg">Link TBD</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-navy mb-4">Past sessions</h3>
        {past.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No past sessions yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {past.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-3">
                <div><p className="font-medium text-navy text-sm">{s.topic}</p><p className="text-xs text-slate-500">with {s.counterpart}</p></div>
                <span className="text-xs text-slate-400">{s.when}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
