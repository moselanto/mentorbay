"use client";

import { useState } from "react";

export type Module = { title: string; lessons: string[] };

export default function Accordion({ items }: { items: Module[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-3">
      {items.map((m, i) => {
        const isOpen = open === i;
        return (
          <div key={m.title} className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3 text-left font-semibold text-navy hover:bg-slate-50"
            >
              <span>{m.title}</span>
              <svg className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {isOpen && (
              <div className="px-4 pb-4">
                <ul className="space-y-2 text-sm text-slate-600">
                  {m.lessons.map((l) => (
                    <li key={l} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-teal" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                      {l}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
