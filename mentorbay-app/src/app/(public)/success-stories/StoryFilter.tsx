"use client";

import { useState } from "react";
import type { Story } from "@/lib/data";

const CATS = ["All", "Tech", "Business", "Design", "Data", "Finance"];

export default function StoryFilter({ stories }: { stories: Story[] }) {
  const [active, setActive] = useState("All");
  const list = stories.filter((s) => active === "All" || s.cat === active);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`px-4 py-2 text-sm font-semibold rounded-full ${
              active === c ? "bg-navy text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-teal"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((s) => (
          <div key={s.name} className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.img} alt={s.name} className="w-14 h-14 rounded-full object-cover" />
              <div>
                <p className="font-bold text-navy">{s.name}</p>
                <p className="text-xs text-slate-500">{s.cat}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 text-sm">
              <span className="text-slate-500">{s.from}</span>
              <svg className="w-4 h-4 text-teal" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              <span className="font-semibold text-navy">{s.to}</span>
            </div>
            <p className="text-slate-600 text-sm mt-4 leading-relaxed">&quot;{s.quote}&quot;</p>
            <p className="text-xs text-slate-400 mt-4 pt-4 border-t border-slate-100">
              Mentored by <span className="font-semibold text-teal-600">{s.mentor}</span>
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
