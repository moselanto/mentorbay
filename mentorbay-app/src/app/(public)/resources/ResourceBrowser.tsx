"use client";

import { useMemo, useState } from "react";
import type { Resource } from "@/lib/data";

const TYPES = ["All", "Article", "Video", "Course", "Guide"] as const;
const TYPE_COLORS: Record<string, string> = {
  Article: "bg-teal-50 text-teal-600",
  Video: "bg-rose-50 text-rose-500",
  Course: "bg-indigo-50 text-indigo-500",
  Guide: "bg-amber-50 text-amber-600",
};

export default function ResourceBrowser({ resources }: { resources: Resource[] }) {
  const [active, setActive] = useState<string>("All");
  const [q, setQ] = useState("");

  const list = useMemo(
    () =>
      resources.filter(
        (r) =>
          (active === "All" || r.type === active) &&
          (!q || `${r.title} ${r.author} ${r.type}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [resources, active, q],
  );

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1">
          <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} type="text" placeholder="Search resources by title, topic or author..." className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-teal focus:border-teal outline-none" />
        </div>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`px-4 py-2.5 text-sm font-semibold rounded-lg ${active === t ? "bg-navy text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-teal"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-slate-500 my-6"><span className="font-semibold text-navy">{list.length}</span> resources</p>

      {list.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((r) => (
            <a key={r.title} href="#" className="bg-white rounded-2xl shadow-card overflow-hidden hover:-translate-y-1 transition block">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.img} alt="" className="w-full h-40 object-cover" />
                <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE_COLORS[r.type]}`}>{r.type}</span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-navy leading-snug">{r.title}</h3>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.face} alt={r.author} className="w-7 h-7 rounded-full object-cover" />
                    <span className="text-xs text-slate-500">{r.author}</span>
                  </div>
                  <span className="text-xs text-slate-400">{r.meta}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-16"><p className="font-semibold text-navy">No resources found</p><p className="text-slate-500 text-sm mt-1">Try a different keyword or type.</p></div>
      )}
    </>
  );
}
