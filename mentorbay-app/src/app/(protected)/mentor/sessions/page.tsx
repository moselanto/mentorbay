import { MENTOR_SESSIONS } from "@/lib/mentor-demo";

export default function MentorSessionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy">Sessions</h1>
        <button className="px-4 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">+ Schedule</button>
      </div>

      <section className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-navy mb-4">Upcoming sessions</h3>
        <div className="space-y-3">
          {MENTOR_SESSIONS.map((s, i) => (
            <div key={i} className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-slate-50">
              <div className="w-11 h-11 rounded-lg bg-navy text-white grid place-items-center font-bold">{s.mentee[0]}</div>
              <div className="flex-1 min-w-0"><p className="font-semibold text-navy">{s.topic}</p><p className="text-xs text-slate-500">with {s.mentee} · {s.mode}</p></div>
              <span className="text-sm font-medium text-slate-600">{s.when}</span>
              <button className="px-4 py-2 bg-teal text-white text-sm font-semibold rounded-lg">Start</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
