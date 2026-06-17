import { MENTEES } from "@/lib/mentor-demo";

export default function MentorMenteesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy">My Mentees</h1>
        <span className="text-sm text-slate-500">{MENTEES.length} active</span>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr><th className="px-5 py-3 font-semibold">Mentee</th><th className="px-5 py-3 font-semibold hidden sm:table-cell">Program</th><th className="px-5 py-3 font-semibold">Progress</th><th className="px-5 py-3 font-semibold">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MENTEES.map((m) => (
              <tr key={m.name}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full bg-teal-50 text-teal-700 grid place-items-center font-bold">{m.name[0]}</span>
                    <div><p className="font-semibold text-navy">{m.name}</p><p className="text-xs text-slate-400">{m.goal}</p></div>
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-600 hidden sm:table-cell">{m.program}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2"><div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-teal" style={{ width: `${m.pct}%` }} /></div><span className="text-xs text-slate-500">{m.pct}%</span></div>
                </td>
                <td className="px-5 py-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${m.status === "New" ? "bg-amber-50 text-amber-600" : "bg-teal-50 text-teal-700"}`}>{m.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
