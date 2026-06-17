"use client";

import { useMemo, useState } from "react";
import type { Mentor } from "@/lib/data";
import MentorCard from "@/components/MentorCard";

type Sort = "popular" | "rating" | "experience";

export default function MentorBrowser({ mentors }: { mentors: Mentor[] }) {
  const [q, setQ] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [avail, setAvail] = useState("");
  const [lang, setLang] = useState("");
  const [price, setPrice] = useState("");
  const [exp, setExp] = useState(0);
  const [sort, setSort] = useState<Sort>("popular");
  const [showFilters, setShowFilters] = useState(false);

  const results = useMemo(() => {
    let list = mentors.filter((m) => {
      if (q && !`${m.name} ${m.role} ${m.skills.join(" ")}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (industry && m.industry !== industry) return false;
      if (country && m.country !== country) return false;
      if (avail && m.avail !== avail) return false;
      if (lang && !m.langs.includes(lang)) return false;
      if (price === "Paid") return false; // all free during launch
      if (m.exp < exp) return false;
      return true;
    });
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    else if (sort === "experience") list = [...list].sort((a, b) => b.exp - a.exp);
    else list = [...list].sort((a, b) => b.mentees - a.mentees);
    return list;
  }, [mentors, q, industry, country, avail, lang, price, exp, sort]);

  const clearAll = () => {
    setQ(""); setIndustry(""); setCountry(""); setAvail(""); setLang(""); setPrice(""); setExp(0); setSort("popular");
  };

  const chips: string[] = [];
  if (q) chips.push(`"${q}"`);
  [industry, country, avail, lang, price].forEach((v) => v && chips.push(v));
  if (exp > 0) chips.push(`${exp}+ yrs`);

  const select = "w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      {/* toolbar */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1">
          <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="text"
            placeholder="Search mentors by name, expertise or keyword..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-teal focus:border-teal outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowFilters((v) => !v)} className="lg:hidden px-4 py-3 rounded-lg border border-slate-200 bg-white font-semibold text-navy">
            Filters
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500 whitespace-nowrap">Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="px-3 py-3 rounded-lg border border-slate-200 bg-white font-medium text-navy focus:ring-2 focus:ring-teal outline-none">
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="experience">Most Experienced</option>
            </select>
          </div>
        </div>
      </div>

      <div className="py-8 grid lg:grid-cols-[280px_1fr] gap-8">
        {/* filter sidebar */}
        <aside className={`${showFilters ? "block" : "hidden"} lg:block`}>
          <div className="bg-white rounded-2xl shadow-card p-6 lg:sticky lg:top-24">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-navy text-lg">Filters</h2>
              <button onClick={clearAll} className="text-sm font-semibold text-teal-600 hover:underline">Clear all</button>
            </div>
            <div className="space-y-5 text-sm">
              <div>
                <label className="block font-semibold text-navy mb-1.5">Industry</label>
                <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={select}>
                  <option value="">All Industries</option>
                  {["Technology", "Business", "Marketing", "Finance", "Design", "Human Resources", "Data"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-navy mb-1.5">Country</label>
                <select value={country} onChange={(e) => setCountry(e.target.value)} className={select}>
                  <option value="">All Countries</option>
                  {["Kenya", "Nigeria", "Uganda", "Ghana", "South Africa"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-navy mb-1.5">Availability</label>
                <select value={avail} onChange={(e) => setAvail(e.target.value)} className={select}>
                  <option value="">Anytime</option><option>Available</option><option>Busy</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-navy mb-1.5">Language</label>
                <select value={lang} onChange={(e) => setLang(e.target.value)} className={select}>
                  <option value="">All Languages</option><option>English</option><option>Swahili</option><option>French</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-navy mb-1.5">Pricing</label>
                <select value={price} onChange={(e) => setPrice(e.target.value)} className={select}>
                  <option value="">Any</option><option>Free</option><option>Paid</option>
                </select>
                <p className="text-xs text-slate-400 mt-1">All mentorship is free during launch.</p>
              </div>
              <div>
                <label className="block font-semibold text-navy mb-1.5">
                  Minimum Experience: <span className="text-teal-600">{exp}</span> yrs
                </label>
                <input type="range" min={0} max={20} value={exp} onChange={(e) => setExp(Number(e.target.value))} className="w-full accent-teal" />
                <div className="flex justify-between text-xs text-slate-400"><span>0 yrs</span><span>20+ yrs</span></div>
              </div>
            </div>
          </div>
        </aside>

        {/* results */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-navy">{results.length}</span> mentors found
            </p>
            <div className="flex flex-wrap gap-2">
              {chips.map((c) => (
                <span key={c} className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{c}</span>
              ))}
            </div>
          </div>

          {results.length > 0 ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {results.map((m) => <MentorCard key={m.id} mentor={m} />)}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="font-semibold text-navy">No mentors match your filters</p>
              <p className="text-slate-500 text-sm mt-1">Try clearing some filters or searching a different keyword.</p>
              <button onClick={clearAll} className="mt-4 px-5 py-2.5 bg-teal text-white font-semibold rounded-lg hover:bg-teal-600 transition">
                Clear filters
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
