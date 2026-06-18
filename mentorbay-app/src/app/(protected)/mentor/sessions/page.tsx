import { getMySessions } from "@/lib/sessions";
import { createSessionAction } from "@/app/actions";

export default async function MentorSessionsPage({ searchParams }: { searchParams: { created?: string; error?: string } }) {
  const sessions = await getMySessions();
  const upcoming = sessions.filter((s) => s.upcoming);
  const past = sessions.filter((s) => !s.upcoming);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy">Sessions</h1>

      {searchParams.created && <p className="text-sm text-teal-700 bg-teal-50 px-4 py-2.5 rounded-lg">Session scheduled.</p>}
      {searchParams.error === "pending" && <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-lg">Your account is pending approval, so you can&apos;t schedule sessions yet.</p>}
      {searchParams.error === "missing" && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2.5 rounded-lg">Please enter a topic and a date/time.</p>}

      <section className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-navy mb-4">Schedule a session</h3>
        <form action={createSessionAction} className="grid sm:grid-cols-4 gap-3 items-end">
          <div className="sm:col-span-2"><label className="block text-xs font-semibold text-navy mb-1">Topic</label><input name="topic" required className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="e.g. Career roadmap review" /></div>
          <div><label className="block text-xs font-semibold text-navy mb-1">Date &amp; time</label><input name="scheduled_at" type="datetime-local" required className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" /></div>
          <div><label className="block text-xs font-semibold text-navy mb-1">Mode</label><select name="mode" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none"><option>Google Meet</option><option>Zoom</option><option>In-person</option></select></div>
          <div className="sm:col-span-4 flex justify-end"><button className="px-5 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">+ Schedule</button></div>
        </form>
      </section>

      <section className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-navy mb-4">Upcoming sessions</h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No upcoming sessions.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-slate-50">
                <div className="w-11 h-11 rounded-lg bg-navy text-white grid place-items-center font-bold">{s.counterpart[0]}</div>
                <div className="flex-1 min-w-0"><p className="font-semibold text-navy">{s.topic}</p><p className="text-xs text-slate-500">with {s.counterpart} · {s.mode}</p></div>
                <span className="text-sm font-medium text-slate-600">{s.when}</span>
                <button className="px-4 py-2 bg-teal text-white text-sm font-semibold rounded-lg">Start</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-bold text-navy mb-4">Past sessions</h3>
          <ul className="divide-y divide-slate-100">
            {past.map((s) => (<li key={s.id} className="flex items-center justify-between py-3"><div><p className="font-medium text-navy text-sm">{s.topic}</p><p className="text-xs text-slate-500">with {s.counterpart}</p></div><span className="text-xs text-slate-400">{s.when}</span></li>))}
          </ul>
        </section>
      )}
    </div>
  );
}
