"use client";

import { useMemo, useState } from "react";
import type { Program } from "@/lib/data";
import ProgramCard from "@/components/ProgramCard";

type Sort = "popular" | "rating" | "newest";

export default function ProgramBrowser({ programs, enrolledSlugs = [], enrolledCounts = {} }: { programs: Program[]; enrolledSlugs?: string[]; enrolledCounts?: Record<string, number> }) {
  const enrolledSet = new Set(enrolledSlugs);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [level, setLevel] = useState("");
  const [dur, setDur] = useState("");
  const [price, setPrice] = useState("");
  const [sort, setSort] = useState<Sort>("popular");
  const [showFilters, setShowFilters] = useState(false);

  const results = useMemo(() => {
    let list = programs.filter((p, i) => {
      (p as Program & { _i?: number })._i = i;
      if (q && !`${p.title} ${p.category} ${p.mentor}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (cat && p.category !== cat) return false;
      if (level && p.level !== level) return false;
      if (dur === "short" && p.weeks > 4) return false;
      if (dur === "mid" && (p.weeks < 5 || p.weeks > 8)) return false;
      if (dur === "long" && p.weeks < 9) return false;
      const paid = !!p.isPaid && (p.priceKes ?? 0) > 0;
      if (price === "Paid" && !paid) return false;
      if (price === "Free" && paid) return false;
      return true;
    });
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    else if (sort === "newest") list = [...list].sort((a, b) => programs.indexOf(b) - programs.indexOf(a));
    else list = [...list].sort((a, b) => (enrolledCounts[b.id] ?? b.enrolled ?? 0) - (enrolledCounts[a.id] ?? a.enrolled ?? 0));
    return list;
  }, [programs, q, cat, level, dur, price, sort, enrolledCounts]);

  const clearAll = () => { setQ(""); setCat(""); setLevel(""); setDur(""); setPrice(""); setSort("popular"); };
  const select = "w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1">
          <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} type="text" placeholder="Search programs by title, topic or mentor..." className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-teal focus:border-teal outline-none" />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowFilters((v) => !v)} className="lg:hidden px-4 py-3 rounded-lg border border-slate-200 bg-white font-semibold text-navy">Filters</button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500 whitespace-nowrap">Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="px-3 py-3 rounded-lg border border-slate-200 bg-white font-medium text-navy focus:ring-2 focus:ring-teal outline-none">
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
      </div>

      <div className="py-8 grid lg:grid-cols-[260px_1fr] gap-8">
        <aside className={`${showFilters ? "block" : "hidden"} lg:block`}>
          <div className="bg-white rounded-2xl shadow-card p-6 lg:sticky lg:top-24">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-navy text-lg">Filters</h2>
              <button onClick={clearAll} className="text-sm font-semibold text-teal-600 hover:underline">Clear all</button>
            </div>
            <div className="space-y-5 text-sm">
              <div>
                <label className="block font-semibold text-navy mb-1.5">Category</label>
                <select value={cat} onChange={(e) => setCat(e.target.value)} className={select}>
                  <option value="">All Categories</option>
                  {["Technology", "Business", "Marketing", "Finance", "Design", "Data", "Leadership"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-navy mb-1.5">Level</label>
                <select value={level} onChange={(e) => setLevel(e.target.value)} className={select}>
                  <option value="">All Levels</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-navy mb-1.5">Duration</label>
                <select value={dur} onChange={(e) => setDur(e.target.value)} className={select}>
                  <option value="">Any duration</option>
                  <option value="short">1-4 weeks</option>
                  <option value="mid">5-8 weeks</option>
                  <option value="long">9+ weeks</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-navy mb-1.5">Price</label>
                <select value={price} onChange={(e) => setPrice(e.target.value)} className={select}>
                  <option value="">Any</option><option>Free</option><option>Paid</option>
                </select>
                
              </div>
            </div>
          </div>
        </aside>

        <section>
          <p className="text-sm text-slate-500 mb-5"><span className="font-semibold text-navy">{results.length}</span> programs found</p>
          {results.length > 0 ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {results.map((p) => <ProgramCard key={p.id} program={p} enrolled={enrolledSet.has(p.id)} liveEnrolled={enrolledCounts[p.id]} />)}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="font-semibold text-navy">No programs match your filters</p>
              <button onClick={clearAll} className="mt-4 px-5 py-2.5 bg-teal text-white font-semibold rounded-lg hover:bg-teal-600 transition">Clear filters</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
