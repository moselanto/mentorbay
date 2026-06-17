"use client";

import { useMemo, useState } from "react";
import type { EventItem } from "@/lib/data";
import EventCard from "@/components/EventCard";

export default function EventBrowser({ events }: { events: EventItem[] }) {
  const [when, setWhen] = useState<"upcoming" | "past">("upcoming");
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [cat, setCat] = useState("");
  const [sort, setSort] = useState<"soonest" | "popular">("soonest");

  const results = useMemo(() => {
    let list = events.filter((e) => {
      if (e.when !== when) return false;
      if (q && !`${e.title} ${e.speaker} ${e.category}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (type && e.type !== type) return false;
      if (cat && e.category !== cat) return false;
      return true;
    });
    if (sort === "popular") list = [...list].sort((a, b) => b.going - a.going);
    return list;
  }, [events, when, q, type, cat, sort]);

  const sel = "px-3 py-3 rounded-lg border border-slate-200 bg-white font-medium text-navy text-sm focus:ring-2 focus:ring-teal outline-none";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <div className="inline-flex bg-white rounded-lg border border-slate-200 p-1 mb-5">
        {(["upcoming", "past"] as const).map((w) => (
          <button
            key={w}
            onClick={() => setWhen(w)}
            className={`px-5 py-2 text-sm font-semibold rounded-md capitalize ${when === w ? "bg-navy text-white" : "text-slate-500"}`}
          >
            {w}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1">
          <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} type="text" placeholder="Search events by title, speaker or topic..." className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-teal focus:border-teal outline-none" />
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)} className={sel}>
          <option value="">All Formats</option><option>Online</option><option>In-person</option>
        </select>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className={sel}>
          <option value="">All Categories</option>
          {["Technology", "Business", "Marketing", "Finance", "Leadership"].map((o) => <option key={o}>{o}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as "soonest" | "popular")} className={sel}>
          <option value="soonest">Soonest</option><option value="popular">Most Popular</option>
        </select>
      </div>

      <p className="text-sm text-slate-500 my-6"><span className="font-semibold text-navy">{results.length}</span> events</p>
      {results.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
          {results.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
      ) : (
        <div className="text-center py-20"><p className="font-semibold text-navy">No events found</p><p className="text-slate-500 text-sm mt-1">Try a different filter, or check the Past tab.</p></div>
      )}
    </div>
  );
}
