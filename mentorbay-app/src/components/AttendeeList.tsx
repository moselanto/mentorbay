"use client";

import { useState } from "react";

export default function AttendeeList({ names }: { names: string[] }) {
  const [open, setOpen] = useState(false);
  if (names.length === 0) {
    return <p className="mt-2 text-xs text-slate-400">No one has registered yet.</p>;
  }
  return (
    <div className="mt-2">
      <button onClick={() => setOpen((v) => !v)} className="text-xs font-semibold text-teal-600 hover:underline">
        {open ? "Hide" : "View"} {names.length} attending
      </button>
      {open && (
        <ul className="mt-2 space-y-1.5">
          {names.map((n, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-navy">
              <span className="w-7 h-7 rounded-full bg-teal-50 text-teal-700 grid place-items-center text-xs font-bold shrink-0">{n.charAt(0)}</span>
              <span className="truncate">{n}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
