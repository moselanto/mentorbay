"use client";

import { useState } from "react";

// Toggleable chips that serialize selected values into a hidden field (newline-joined).
export default function ChipMultiSelect({ name, options, initial = [] }: { name: string; options: string[]; initial?: string[] }) {
  const [sel, setSel] = useState<string[]>(initial);
  const toggle = (v: string) => setSel((a) => (a.includes(v) ? a.filter((x) => x !== v) : [...a, v]));
  return (
    <div>
      <input type="hidden" name={name} value={sel.join("\n")} />
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => toggle(o)}
            className={`px-3 py-1.5 rounded-full border text-sm font-medium transition ${sel.includes(o) ? "bg-teal text-white border-teal" : "border-slate-200 text-slate-600 hover:border-teal"}`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
