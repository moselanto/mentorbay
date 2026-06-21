"use client";

import { useState } from "react";
import Link from "next/link";
import type { Mentor, Program } from "@/lib/data";
import ProgramCard from "@/components/ProgramCard";

const img = (id: string) => `/images/${id}.jpg`;

const REVIEWS = [
  { name: "Esther Wanjiru", role: "Product Designer, Nairobi", img: img("sd76649zdx97w9ve28wfndra6d88vdek"), text: "Helped me gain clarity and confidence. Exactly what I needed to move forward." },
  { name: "Collins Mutua", role: "Software Engineer, Kisumu", img: img("sd75by8ns0j4qabn92ryzmvjp988v394"), text: "Through the program I improved my CV, got interviews, and landed my dream job!" },
  { name: "Faith Kemunto", role: "Team Lead, Mombasa", img: img("sd728rcfrx0j7wrnhaa2zh0ya188vf7q"), text: "Practical and life-changing leadership sessions. Highly recommend." },
  { name: "Daniel Kibet", role: "Entrepreneur, Nakuru", img: img("sd71p21y9dxds7tvxmv5hnq1g988v9nv"), text: "A true mentor who genuinely cares about your growth." },
];

const MENTEES = [
  { name: "Esther Wanjiru", img: img("sd76649zdx97w9ve28wfndra6d88vdek"), now: "Now: Senior Product Designer" },
  { name: "Collins Mutua", img: img("sd75by8ns0j4qabn92ryzmvjp988v394"), now: "Now: Tech Lead at Andela" },
  { name: "Faith Kemunto", img: img("sd728rcfrx0j7wrnhaa2zh0ya188vf7q"), now: "Now: Marketing Manager" },
  { name: "Aisha Hassan", img: img("sd75vfdt7nphcmkepenfdabf9188vzec"), now: "Now: Data Scientist at Safaricom" },
];

const EVENTS = [
  { title: "Women in Leadership Forum", date: "Jul 10, 2026", img: img("sd7fbrdmwf1ba8zryhj7mxhy6188vaw2") },
  { title: "Career Clarity Masterclass", date: "Jul 24, 2026", img: img("sd7cw7fxc5jdak3bhrek7g334188tm52") },
];

const ARTICLES = [
  { title: "5 Strategies to Accelerate Your Career Growth", date: "May 12, 2026", img: img("sd7cxyvmncgt75zcbvkjs66p7s88tgjf") },
  { title: "How to Build a Powerful Personal Brand", date: "Apr 28, 2026", img: img("sd7f8shp9xrg8xvwefbhc1peyx88tt44") },
];

export default function MentorProfileTabs({ mentor, programs, signedIn, reviewForm }: { mentor: Mentor; programs: Program[]; signedIn?: boolean; reviewForm?: React.ReactNode }) {
  const tabs = [
    { id: "About", label: "About" },
    { id: "Programs", label: `Programs (${programs.length})` },
    { id: "Reviews", label: `Reviews (${mentor.reviews})` },
    { id: "Mentees", label: `Mentees (${mentor.mentees})` },
    { id: "Events", label: "Events (2)" },
    { id: "Articles", label: "Articles" },
  ];
  const [tab, setTab] = useState("About");

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <div className="border-b border-slate-200 flex gap-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 ${tab === t.id ? "border-teal text-teal" : "border-transparent text-slate-500 hover:text-navy"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="py-8">
        {tab === "About" && (
          <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
            <h2 className="text-xl font-bold text-navy mb-3">About {mentor.name.split(" ")[0]}</h2>
            <p className="text-slate-600 leading-relaxed">
              {mentor.name} is a {mentor.role.toLowerCase()} with {mentor.exp}+ years of experience empowering
              professionals across Kenya and Africa. Practical, personalized, and results-driven.
            </p>
            <h3 className="font-bold text-navy mt-6 mb-3">Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {mentor.skills.map((s) => (
                <span key={s} className="text-sm font-medium text-teal-600 bg-teal-50 px-3 py-1 rounded-full">{s}</span>
              ))}
            </div>
          </div>
        )}

        {tab === "Programs" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.length > 0 ? programs.map((p) => <ProgramCard key={p.id} program={p} />) : <p className="text-slate-500">No programs yet.</p>}
          </div>
        )}

        {tab === "Reviews" && (
          <div className="space-y-6">
            {reviewForm}
            <div className="grid sm:grid-cols-2 gap-6">
            {REVIEWS.map((r) => (
              <div key={r.name} className="bg-white rounded-2xl shadow-card p-6">
                <div className="text-amber-400 text-sm mb-3">★★★★★</div>
                <p className="text-slate-600 text-sm leading-relaxed">&quot;{r.text}&quot;</p>
                <div className="flex items-center gap-3 mt-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.img} alt={r.name} className="w-10 h-10 rounded-full object-cover" />
                  <div><p className="font-bold text-navy text-sm">{r.name}</p><p className="text-xs text-slate-500">{r.role}</p></div>
                </div>
              </div>
            ))}
            </div>
          </div>
        )}

        {tab === "Mentees" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MENTEES.map((m) => (
              <div key={m.name} className="bg-white rounded-2xl shadow-card p-5 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.img} alt={m.name} className="w-12 h-12 rounded-full object-cover" />
                <div><p className="font-bold text-navy text-sm">{m.name}</p><p className="text-xs text-teal-600 mt-0.5">↗ {m.now}</p></div>
              </div>
            ))}
          </div>
        )}

        {tab === "Events" && (
          <div className="space-y-4">
            {EVENTS.map((e) => (
              <div key={e.title} className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={e.img} alt="" className="w-20 h-16 rounded-lg object-cover" />
                <div className="flex-1"><p className="font-bold text-navy">{e.title}</p><p className="text-xs text-slate-500 mt-1">📅 {e.date}</p></div>
                <Link href="/events" className="text-sm font-semibold text-teal-600">View →</Link>
              </div>
            ))}
          </div>
        )}

        {tab === "Articles" && (
          <div className="grid sm:grid-cols-3 gap-6">
            {ARTICLES.map((a) => (
              <Link key={a.title} href="/resources" className="bg-white rounded-2xl shadow-card overflow-hidden hover:-translate-y-1 transition block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.img} alt="" className="w-full h-32 object-cover" />
                <div className="p-5"><p className="font-bold text-navy text-sm leading-snug">{a.title}</p><p className="text-xs text-slate-400 mt-2">{a.date}</p></div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
