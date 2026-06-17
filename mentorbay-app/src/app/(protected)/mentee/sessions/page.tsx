import { getMySessions } from "@/lib/sessions";

export default async function SessionsPage() {
  const sessions = await getMySessions();
  const upcoming = sessions.filter((s) => s.upcoming);
  const past = sessions.filter((s) => !s.upcoming);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy">Sessions</h1>
        <button className="px-4 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">+ Book session</button>
      </div>

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
                <button className="px-4 py-2 bg-teal text-white text-sm font-semibold rounded-lg">Join</button>
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
