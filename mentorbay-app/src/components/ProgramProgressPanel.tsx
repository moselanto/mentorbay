import Link from "next/link";
import { setProgressAction } from "@/app/actions";

// Shown on the program page once the mentee is enrolled: progress bar, quick
// "mark progress" controls, and next-step links. This is the post-enroll phase.
export default function ProgramProgressPanel({ slug, pct, status, lessons }: { slug: string; pct: number; status: string; lessons: number }) {
  const done = status === "completed" || pct >= 100;
  const steps = [25, 50, 75, 100];
  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700">Enrolled</span>
        {done && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal text-white">Completed</span>}
      </div>
      <p className="mt-4 text-sm font-semibold text-navy">Your progress</p>
      <div className="h-2.5 bg-slate-100 rounded-full mt-2 overflow-hidden"><div className="h-full bg-teal transition-all" style={{ width: `${pct}%` }} /></div>
      <p className="text-xs text-slate-500 mt-1">{pct}% complete{lessons ? ` · ${Math.round((pct / 100) * lessons)}/${lessons} lessons` : ""}</p>

      {!done && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-navy mb-2">Mark your progress</p>
          <div className="flex flex-wrap gap-2">
            {steps.map((v) => (
              <form key={v} action={setProgressAction}>
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="progress" value={v} />
                <button className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${pct >= v ? "bg-teal-50 border-teal text-teal-700" : "border-slate-200 text-slate-600 hover:border-teal"}`}>{v === 100 ? "Finish" : `${v}%`}</button>
              </form>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 pt-5 border-t border-slate-100 space-y-2">
        <Link href="/mentee/programs" className="block text-center py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Go to My Programs</Link>
        <Link href="/mentee/sessions" className="block text-center py-2.5 border border-slate-200 text-navy text-sm font-semibold rounded-lg hover:border-teal transition">Book a session</Link>
        {done && <Link href="/mentee/certificates" className="block text-center py-2.5 border border-slate-200 text-navy text-sm font-semibold rounded-lg hover:border-teal transition">View certificate</Link>}
      </div>
    </div>
  );
}
