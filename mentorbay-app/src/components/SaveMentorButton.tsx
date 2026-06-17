"use client";

import { useState } from "react";

export default function SaveMentorButton() {
  const [saved, setSaved] = useState(false);
  return (
    <button
      onClick={() => setSaved((v) => !v)}
      className={`w-full mt-3 py-3 border font-semibold rounded-lg transition flex items-center justify-center gap-2 ${
        saved ? "border-teal text-teal" : "border-slate-200 text-navy hover:border-teal hover:text-teal"
      }`}
    >
      <svg className="w-4 h-4" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      {saved ? "Saved" : "Save Mentor"}
    </button>
  );
}
