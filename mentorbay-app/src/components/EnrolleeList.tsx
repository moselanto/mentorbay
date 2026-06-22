"use client";

import { useState } from "react";

type Enrollee = { name: string; pct: number; status: string };

export default function EnrolleeList({ enrollees }: { enrollees: Enrollee[] }) {
  const [open, setOpen] = useState(false);
  if (enrollees.length === 0) {
    return <p className="mt-3 text-xs text-slate-400">No enrollees yet.</p>;
  }
  return (
    <div className="mt-3">
      <button onClick={() => setOpen((v) => !v)} className="text-sm font-semibold text-teal-600 hover:underline">
        {open ? "Hide" : "View"} {enrollees.length} enrolled {enrollees.length === 1 ? "mentee" : "mentees"}
      </button>
      {open && (
        <ul className="mt-3 space-y-2">
          {enrollees.map((e, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 grid place-items-center text-xs font-bold shrink-0">{e.name.charAt(0)}</span>
              <span className="flex-1 min-w-0 text-sm text-navy truncate">{e.name}</span>
              <div className="w-24 shrink-0">
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-teal" style={{ width: `${e.pct}%` }} /></div>
              </div>
              <span className="text-xs text-slate-500 w-20 text-right shrink-0">{e.status === "completed" ? "Completed" : `${e.pct}%`}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
