import type { Metadata } from "next";
import Link from "next/link";
import { getFeaturedStories } from "@/lib/stories";

export const metadata: Metadata = { title: "Success Stories - MentorBay" };

export default async function SuccessStoriesPage() {
  const stories = await getFeaturedStories();
  const featured = stories[0];
  const rest = stories.slice(1);

  return (
    <>
      {/* HERO */}
      <section className="cta-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <nav className="text-sm text-teal-50/80 mb-4">
            <Link href="/" className="hover:text-white">Home</Link> <span className="mx-1">&rsaquo;</span>
            <span className="text-white font-medium">Success Stories</span>
          </nav>
          <h1 className="text-3xl lg:text-4xl font-extrabold">Real People. Real Growth.</h1>
          <p className="mt-3 text-teal-50/90 max-w-2xl mx-auto">See how mentees across Kenya and Africa transformed their careers with the right mentor on MentorBay.</p>
        </div>
      </section>

      {!featured ? (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="bg-white rounded-2xl shadow-card p-10">
            <h2 className="text-xl font-bold text-navy">No success stories yet</h2>
            <p className="text-slate-500 mt-2">As mentees share reviews of their mentors, the best ones will be featured here.</p>
            <Link href="/mentors" className="inline-block mt-5 px-6 py-3 bg-navy text-white font-semibold rounded-lg hover:bg-navy-700 transition">Browse Mentors</Link>
          </div>
        </section>
      ) : (
        <>
          {/* FEATURED */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
            <div className="bg-white rounded-2xl shadow-card p-8">
              <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">Featured Story</span>
              <p className="text-amber-400 text-sm mt-4">{"\u2605".repeat(featured.rating)}</p>
              <p className="text-slate-700 mt-3 leading-relaxed text-lg">&quot;{featured.quote}&quot;</p>
              <div className="flex items-center gap-3 mt-6">
                <span className="w-12 h-12 rounded-full bg-gradient-to-br from-navy to-teal grid place-items-center text-white font-bold">{featured.name.charAt(0)}</span>
                <div>
                  <p className="font-bold text-navy">{featured.name}</p>
                  {featured.mentor && <p className="text-sm text-slate-500">Mentored by {featured.mentor}</p>}
                </div>
              </div>
            </div>
          </section>

          {/* GRID */}
          {rest.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((s) => (
                <div key={s.id} className="bg-white rounded-2xl shadow-card p-6">
                  <p className="text-amber-400 text-sm mb-3">{"\u2605".repeat(s.rating)}</p>
                  <p className="text-slate-600 text-sm leading-relaxed">&quot;{s.quote}&quot;</p>
                  <div className="flex items-center gap-3 mt-5">
                    <span className="w-10 h-10 rounded-full bg-gradient-to-br from-navy to-teal grid place-items-center text-white font-bold">{s.name.charAt(0)}</span>
                    <div>
                      <p className="font-bold text-navy text-sm">{s.name}</p>
                      {s.mentor && <p className="text-xs text-slate-500">Mentored by {s.mentor}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </section>
          )}
        </>
      )}

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
