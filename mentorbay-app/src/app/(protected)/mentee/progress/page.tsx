const SKILLS = [
  { name: "Leadership", pct: 80 },
  { name: "Communication", pct: 65 },
  { name: "Technical Skills", pct: 90 },
  { name: "Networking", pct: 50 },
];

const MILESTONES = [
  { t: "Completed onboarding", done: true },
  { t: "Matched with a mentor", done: true },
  { t: "Finished first program", done: true },
  { t: "Attended 10 sessions", done: false },
  { t: "Earned 3 certificates", done: false },
];

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy">My Progress</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[["68%", "Overall"], ["9", "Sessions"], ["1", "Certificates"], ["14", "Day streak"]].map(([v, l]) => (
          <div key={l} className="bg-white rounded-2xl shadow-card p-5"><p className="text-2xl font-extrabold text-navy">{v}</p><p className="text-sm text-slate-500 mt-1">{l}</p></div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-bold text-navy mb-4">Skill development</h3>
          <div className="space-y-4">
            {SKILLS.map((s) => (
              <div key={s.name}>
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-600">{s.name}</span><span className="font-semibold text-navy">{s.pct}%</span></div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-teal" style={{ width: `${s.pct}%` }} /></div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-bold text-navy mb-4">Milestones</h3>
          <ul className="space-y-3">
            {MILESTONES.map((m) => (
              <li key={m.t} className="flex items-center gap-3 text-sm">
                <span className={`w-6 h-6 rounded-full grid place-items-center text-xs ${m.done ? "bg-teal text-white" : "bg-slate-100 text-slate-400"}`}>{m.done ? "✓" : ""}</span>
                <span className={m.done ? "text-navy font-medium" : "text-slate-400"}>{m.t}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
