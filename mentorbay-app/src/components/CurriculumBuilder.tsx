"use client";

import { useState } from "react";

type Mod = { title: string; lessons: string[] };

// Lets a mentor add several modules, each with multiple lessons.
// Serializes to "Title | lesson 1 | lesson 2" lines into a hidden field
// (the format the create/update program actions already parse).
export default function CurriculumBuilder({ name, initial = [] }: { name: string; initial?: { title: string; lessons: string[] }[] }) {
  const seed: Mod[] = initial.length
    ? initial.map((m) => ({ title: m.title, lessons: m.lessons.length ? m.lessons : [""] }))
    : [{ title: "", lessons: [""] }];
  const [mods, setMods] = useState<Mod[]>(seed);

  const serialized = mods
    .map((m) => [m.title, ...m.lessons].map((x) => x.trim()).filter(Boolean).join(" | "))
    .filter(Boolean)
    .join("\n");

  const setTitle = (i: number, v: string) => setMods((p) => p.map((m, idx) => (idx === i ? { ...m, title: v } : m)));
  const setLesson = (i: number, j: number, v: string) => setMods((p) => p.map((m, idx) => (idx === i ? { ...m, lessons: m.lessons.map((l, lj) => (lj === j ? v : l)) } : m)));
  const addLesson = (i: number) => setMods((p) => p.map((m, idx) => (idx === i ? { ...m, lessons: [...m.lessons, ""] } : m)));
  const removeLesson = (i: number, j: number) => setMods((p) => p.map((m, idx) => { if (idx !== i) return m; const ls = m.lessons.filter((_, lj) => lj !== j); return { ...m, lessons: ls.length ? ls : [""] }; }));
  const addModule = () => setMods((p) => [...p, { title: "", lessons: [""] }]);
  const removeModule = (i: number) => setMods((p) => { const n = p.filter((_, idx) => idx !== i); return n.length ? n : [{ title: "", lessons: [""] }]; });

  return (
    <div>
      <label className="block text-sm font-semibold text-navy mb-1">Curriculum</label>
      <input type="hidden" name={name} value={serialized} />
      <div className="space-y-4">
        {mods.map((m, i) => (
          <div key={i} className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <input value={m.title} onChange={(e) => setTitle(i, e.target.value)} placeholder={`Module ${i + 1} title`} className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none font-semibold text-sm" />
              <button type="button" onClick={() => removeModule(i)} className="text-xs text-rose-500 font-semibold px-2 py-1 whitespace-nowrap">Remove</button>
            </div>
            <div className="space-y-2 pl-2">
              {m.lessons.map((l, j) => (
                <div key={j} className="flex items-center gap-2">
                  <span className="text-slate-300 text-xs">&bull;</span>
                  <input value={l} onChange={(e) => setLesson(i, j, e.target.value)} placeholder={`Lesson ${j + 1}`} className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none text-sm" />
                  <button type="button" onClick={() => removeLesson(i, j)} className="text-xs text-slate-400 hover:text-rose-500 px-1">&times;</button>
                </div>
              ))}
              <button type="button" onClick={() => addLesson(i)} className="text-xs text-teal-600 font-semibold">+ Add lesson</button>
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={addModule} className="mt-3 w-full px-4 py-2 border border-dashed border-slate-300 text-slate-600 text-sm font-semibold rounded-lg hover:border-teal hover:text-teal transition">+ Add module</button>
    </div>
  );
}
