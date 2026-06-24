"use client";

import { useState } from "react";

type Item = { time: string; title: string };

// Builder for an event agenda (timeline rows). Serializes to a hidden input
// named `agenda` as JSON: [{ time, title }], consumed by the event server actions.
export default function AgendaBuilder({ initial = [] }: { initial?: Item[] }) {
  const seeded = initial.length ? initial : [{ time: "", title: "" }];
  const [rows, setRows] = useState<Item[]>(seeded);

  function update(i: number, key: keyof Item, val: string) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [key]: val } : row)));
  }
  function add() { setRows((r) => [...r, { time: "", title: "" }]); }
  function remove(i: number) { setRows((r) => (r.length <= 1 ? r : r.filter((_, idx) => idx !== i))); }

  const payload = JSON.stringify(rows.filter((r) => r.title.trim()));

  return (
    <div>
      <label className="block text-sm font-semibold text-navy mb-1">Agenda <span className="text-slate-400 font-normal">(optional schedule of the day)</span></label>
      <input type="hidden" name="agenda" value={payload} />
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="flex flex-wrap gap-2 items-center">
            <input
              value={row.time}
              onChange={(e) => update(i, "time", e.target.value)}
              placeholder="Time (e.g. 9:00 AM)"
              className="w-32 px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none"
            />
            <input
              value={row.title}
              onChange={(e) => update(i, "title", e.target.value)}
              placeholder="What happens (e.g. Keynote address)"
              className="flex-1 min-w-[10rem] px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none"
            />
            {rows.length > 1 && (
              <button type="button" onClick={() => remove(i)} className="px-3 py-2 text-slate-400 hover:text-rose-500 transition" aria-label="Remove agenda item">&times;</button>
            )}
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="mt-3 text-sm font-semibold text-teal-600 hover:underline">+ Add agenda item</button>
    </div>
  );
}
