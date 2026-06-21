"use client";

import { useState } from "react";

type Speaker = { name: string; role: string };

// Builder for an event speaker line-up (up to 4). Serializes to a hidden input
// named `speakers` as JSON, consumed by the create/update event server actions.
export default function SpeakersBuilder({ initial = [] }: { initial?: Speaker[] }) {
  const seeded = initial.length ? initial.slice(0, 4) : [{ name: "", role: "" }];
  const [rows, setRows] = useState<Speaker[]>(seeded);

  function update(i: number, key: keyof Speaker, val: string) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [key]: val } : row)));
  }
  function add() {
    setRows((r) => (r.length >= 4 ? r : [...r, { name: "", role: "" }]));
  }
  function remove(i: number) {
    setRows((r) => (r.length <= 1 ? r : r.filter((_, idx) => idx !== i)));
  }

  const payload = JSON.stringify(rows.filter((r) => r.name.trim()));

  return (
    <div>
      <label className="block text-sm font-semibold text-navy mb-1">Speaker line-up <span className="text-slate-400 font-normal">(up to 4)</span></label>
      <input type="hidden" name="speakers" value={payload} />
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="flex flex-wrap gap-2 items-center">
            <input
              value={row.name}
              onChange={(e) => update(i, "name", e.target.value)}
              placeholder="Speaker name"
              className="flex-1 min-w-[8rem] px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none"
            />
            <input
              value={row.role}
              onChange={(e) => update(i, "role", e.target.value)}
              placeholder="Role / title (e.g. Keynote Speaker)"
              className="flex-1 min-w-[8rem] px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none"
            />
            {rows.length > 1 && (
              <button type="button" onClick={() => remove(i)} className="px-3 py-2 text-slate-400 hover:text-rose-500 transition" aria-label="Remove speaker">&times;</button>
            )}
          </div>
        ))}
      </div>
      {rows.length < 4 && (
        <button type="button" onClick={add} className="mt-3 text-sm font-semibold text-teal-600 hover:underline">+ Add speaker</button>
      )}
    </div>
  );
}
