"use client";

import { useState } from "react";

const PRESET = ["Leadership", "Technology", "Business", "Marketing", "Finance", "Design", "Data"];

// Category picker with an "Other" option that reveals a free-text input.
// Submits the chosen value under `name` (default "category").
export default function CategorySelect({ name = "category", initial = "" }: { name?: string; initial?: string }) {
  const isPresetInitial = !initial || PRESET.includes(initial);
  const [choice, setChoice] = useState(isPresetInitial ? (initial || PRESET[0]) : "Other");
  const [other, setOther] = useState(isPresetInitial ? "" : initial);

  const value = choice === "Other" ? other.trim() : choice;

  return (
    <div>
      <label className="block text-sm font-semibold text-navy mb-1">Category</label>
      <input type="hidden" name={name} value={value || "Other"} />
      <select
        value={choice}
        onChange={(e) => setChoice(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none"
      >
        {PRESET.map((c) => <option key={c}>{c}</option>)}
        <option value="Other">Other (type your own)</option>
      </select>
      {choice === "Other" && (
        <input
          value={other}
          onChange={(e) => setOther(e.target.value)}
          placeholder="Enter a category"
          className="mt-2 w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none"
        />
      )}
    </div>
  );
}
