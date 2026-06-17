const SIGNUPS = [
  { m: "Jan", v: 40 }, { m: "Feb", v: 65 }, { m: "Mar", v: 90 }, { m: "Apr", v: 120 }, { m: "May", v: 180 }, { m: "Jun", v: 240 },
];
const MAX = Math.max(...SIGNUPS.map((s) => s.v));

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy">Reports</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[["1,240", "Total users"], ["86", "Mentors"], ["9,300", "Sessions held"], ["+19%", "MoM growth"]].map(([v, l]) => (
          <div key={l} className="bg-navy text-white rounded-2xl shadow-card p-5"><p className="text-2xl font-extrabold">{v}</p><p className="text-sm text-slate-300 mt-1">{l}</p></div>
        ))}
      </div>

      <section className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-navy mb-6">New sign-ups (last 6 months)</h3>
        <div className="flex items-end justify-between gap-3 h-48">
          {SIGNUPS.map((s) => (
            <div key={s.m} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-teal/80 rounded-t-lg transition-all" style={{ height: `${(s.v / MAX) * 100}%` }} title={`${s.v}`} />
              <span className="text-xs text-slate-400">{s.m}</span>
            </div>
          ))}
        </div>
      </section>

      <p className="text-xs text-slate-400">Demo analytics. These charts will read aggregated data from live tables once reporting is wired.</p>
    </div>
  );
}
