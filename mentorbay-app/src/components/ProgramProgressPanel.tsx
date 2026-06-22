import Link from "next/link";

// Shown on the program page once the mentee is enrolled: progress bar (auto-
// derived from checked-off curriculum lessons) + next-step links.
export default function ProgramProgressPanel({ pct, status, lessons }: { slug: string; pct: number; status: string; lessons: number }) {
  const done = status === "completed" || pct >= 100;
  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700">Enrolled</span>
        {done && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal text-white">Completed</span>}
      </div>
      <p className="mt-4 text-sm font-semibold text-navy">Your progress</p>
      <div className="h-2.5 bg-slate-100 rounded-full mt-2 overflow-hidden"><div className="h-full bg-teal transition-all" style={{ width: `${pct}%` }} /></div>
      <p className="text-xs text-slate-500 mt-1">{pct}% complete{lessons ? ` · ${Math.round((pct / 100) * lessons)}/${lessons} lessons` : ""}</p>
      {!done && <p className="mt-3 text-xs text-slate-500">Tick lessons in the curriculum below to update your progress automatically.</p>}

      <div className="mt-5 pt-5 border-t border-slate-100 space-y-2">
        <Link href="/mentee/programs" className="block text-center py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Go to My Programs</Link>
        <Link href="/mentee/sessions" className="block text-center py-2.5 border border-slate-200 text-navy text-sm font-semibold rounded-lg hover:border-teal transition">Book a session</Link>
        {done && <Link href="/mentee/certificates" className="block text-center py-2.5 border border-slate-200 text-navy text-sm font-semibold rounded-lg hover:border-teal transition">View certificate</Link>}
      </div>
    </div>
  );
}
