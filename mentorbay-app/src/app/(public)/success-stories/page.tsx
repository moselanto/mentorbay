import type { Metadata } from "next";
import Link from "next/link";
import { STORIES } from "@/lib/data";
import StoryFilter from "./StoryFilter";

export const metadata: Metadata = { title: "Success Stories — MentorBay" };

const featured = STORIES.find((s) => s.name === "Brian Otieno") ?? STORIES[0];

export default function SuccessStoriesPage() {
  return (
    <>
      {/* HERO */}
      <section className="cta-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <nav className="text-sm text-teal-50/80 mb-4">
            <Link href="/" className="hover:text-white">Home</Link> <span className="mx-1">›</span>
            <span className="text-white font-medium">Success Stories</span>
          </nav>
          <h1 className="text-3xl lg:text-4xl font-extrabold">Real People. Real Growth.</h1>
          <p className="mt-3 text-teal-50/90 max-w-2xl mx-auto">See how mentees across Kenya and Africa transformed their careers with the right mentor on MentorBay.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 max-w-3xl mx-auto">
            {[["12,000+", "Mentees"], ["85%", "Advanced their careers"], ["300+", "Partner companies"], ["4.9/5", "Avg. mentee rating"]].map(([n, l]) => (
              <div key={l} className="bg-white/10 rounded-xl p-4 backdrop-blur">
                <p className="text-2xl font-extrabold">{n}</p>
                <p className="text-xs text-teal-50/80">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-card grid md:grid-cols-2 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={featured.img} alt={featured.name} className="w-full h-full object-cover min-h-64" />
          <div className="p-8">
            <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">Featured Story</span>
            <h2 className="text-2xl font-extrabold text-navy mt-4">&quot;MentorBay changed the trajectory of my career.&quot;</h2>
            <p className="text-slate-600 mt-3 leading-relaxed">&quot;{featured.quote}&quot;</p>
            <div className="flex items-center gap-3 mt-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={featured.img} alt={featured.name} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="font-bold text-navy">{featured.name}</p>
                <p className="text-sm text-slate-500">{featured.from} → {featured.to}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-5 text-xs">
              <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">Mentor: {featured.mentor}</span>
            </div>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <StoryFilter stories={STORIES} />
      </section>

      {/* CTA */}
      <section className="cta-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h3 className="text-2xl font-extrabold text-white">Your success story starts here</h3>
          <p className="text-teal-50/90 mt-2">Find a mentor, join a program, and write your own chapter.</p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Link href="/signup" className="px-7 py-3 bg-white text-navy font-semibold rounded-lg hover:bg-slate-100 transition">Get Started Free</Link>
            <Link href="/mentors" className="px-7 py-3 bg-teal text-white font-semibold rounded-lg hover:bg-teal-600 transition">Browse Mentors</Link>
          </div>
        </div>
      </section>
    </>
  );
}
