"use client";

import { useState } from "react";

// Editor for "What you'll learn": one outcome per row, add/remove rows.
// Serializes to a newline-separated hidden field (the format the program
// actions already parse).
export default function LearnEditor({ name = "learn", initial = [] }: { name?: string; initial?: string[] }) {
  const seed = initial.length ? initial : [""];
  const [rows, setRows] = useState<string[]>(seed);

  const serialized = rows.map((r) => r.trim()).filter(Boolean).join("\n");
  const set = (i: number, v: string) => setRows((p) => p.map((r, idx) => (idx === i ? v : r)));
  const add = () => setRows((p) => [...p, ""]);
  const remove = (i: number) => setRows((p) => { const n = p.filter((_, idx) => idx !== i); return n.length ? n : [""]; });

  return (
    <div>
      <label className="block text-sm font-semibold text-navy mb-1">What you&apos;ll learn</label>
      <input type="hidden" name={name} value={serialized} />
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-teal shrink-0">&#10003;</span>
            <input
              value={r}
              onChange={(e) => set(i, e.target.value)}
              placeholder={`Outcome ${i + 1}, e.g. Build a leadership plan`}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none text-sm"
            />
            <button type="button" onClick={() => remove(i)} className="text-slate-400 hover:text-rose-500 px-1" aria-label="Remove outcome">&times;</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="mt-2 text-sm font-semibold text-teal-600 hover:underline">+ Add outcome</button>
    </div>
  );
}
