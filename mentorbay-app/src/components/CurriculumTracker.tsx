import Link from "next/link";
import { toggleLessonAction } from "@/app/actions";
import type { Module } from "@/components/Accordion";

// Interactive curriculum for ENROLLED mentees: each lesson is a checkbox that
// toggles completion via a server action, which auto-recomputes progress.
export default function CurriculumTracker({ slug, modules, completed }: { slug: string; modules: Module[]; completed: string[] }) {
  const done = new Set(completed);
  const total = modules.reduce((n, m) => n + m.lessons.length, 0) || 1;
  const doneCount = modules.reduce((n, m, mi) => n + m.lessons.filter((_, li) => done.has(`${mi}:${li}`)).length, 0);

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">Check off lessons as you complete them - your progress updates automatically.</p>
      {modules.map((m, mi) => {
        const modDone = m.lessons.filter((_, li) => done.has(`${mi}:${li}`)).length;
        const modComplete = modDone === m.lessons.length && m.lessons.length > 0;
        return (
          <div key={m.title} className={`border rounded-xl overflow-hidden ${modComplete ? "border-teal/40 bg-teal-50/30" : "border-slate-200"}`}>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="font-semibold text-navy">{m.title}</span>
              <span className={`text-xs font-semibold ${modComplete ? "text-teal-700" : "text-slate-400"}`}>{modDone}/{m.lessons.length}{modComplete ? " \u2713" : ""}</span>
            </div>
            <ul className="px-4 pb-3 space-y-1">
              {m.lessons.map((l, li) => {
                const key = `${mi}:${li}`;
                const isDone = done.has(key);
                return (
                  <li key={key}>
                    <form action={toggleLessonAction}>
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="lesson_key" value={key} />
                      <input type="hidden" name="total_lessons" value={total} />
                      <button className="w-full flex items-center gap-3 py-1.5 text-left text-sm group">
                        <span className={`w-5 h-5 rounded-md border grid place-items-center shrink-0 transition ${isDone ? "bg-teal border-teal text-white" : "border-slate-300 group-hover:border-teal"}`}>
                          {isDone && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg>}
                        </span>
                        <span className={isDone ? "text-slate-400 line-through" : "text-slate-700"}>{l}</span>
                      </button>
                    </form>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      {doneCount >= total && (
        <div className="rounded-xl bg-teal-50 border border-teal/30 p-4 text-center">
          <p className="font-semibold text-teal-700">All lessons complete!</p>
          <Link href="/mentee/certificates" className="inline-block mt-2 text-sm font-semibold text-teal-700 hover:underline">View your certificate &rarr;</Link>
        </div>
      )}
    </div>
  );
}
