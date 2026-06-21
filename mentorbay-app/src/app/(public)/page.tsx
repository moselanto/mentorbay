import Link from "next/link";
import { FEATURED_MENTORS, UPCOMING_EVENTS, POPULAR_PROGRAMS, SUCCESS_STORIES, SCENES } from "@/lib/data";
import { getMentors } from "@/lib/mentors";
import { getPrograms } from "@/lib/programs";
import { getEvents } from "@/lib/events";

export default async function HomePage() {
  const [allMentors, allPrograms, allEvents] = await Promise.all([
    getMentors(),
    getPrograms(),
    getEvents(),
  ]);

  // Live data with demo fallback when nothing is published yet.
  const mentors = (allMentors.length ? allMentors : FEATURED_MENTORS).slice(0, 4);
  const programs = (allPrograms.length ? allPrograms : POPULAR_PROGRAMS).slice(0, 4);
  const upcoming = allEvents.filter((e) => e.when === "upcoming");
  const events = (upcoming.length ? upcoming : UPCOMING_EVENTS).slice(0, 4);

  return (
    <>
      {/* HERO */}
      <section className="hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-teal-600 font-semibold text-sm mb-4">
              Learn. Connect. Grow.
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-navy leading-tight">
              Find the Right Mentor to <span className="text-teal">Accelerate Your Growth</span>
            </h1>
            <p className="mt-5 text-lg text-slate-600 max-w-lg">
              Connect with experienced mentors across Kenya and Africa, join life-changing programs, and attend
              exclusive events that transform careers.
            </p>
            <form action="/search" method="get" className="mt-8 flex flex-col sm:flex-row gap-3 max-w-lg">
              <input
                type="text"
                name="q"
                placeholder="Search mentors, programs or topics..."
                className="flex-1 px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal focus:border-teal outline-none"
              />
              <button className="px-6 py-3 bg-teal text-white font-semibold rounded-lg hover:bg-teal-600 transition">
                Search
              </button>
            </form>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/mentors" className="px-6 py-3 bg-navy text-white font-semibold rounded-lg hover:bg-navy-700 transition">
                Browse Mentors
              </Link>
              <Link href="/signup" className="px-6 py-3 bg-white text-navy font-semibold rounded-lg border border-slate-200 hover:border-teal transition">
                Become a Mentor
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-card bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={SCENES.hero} alt="African mentor and mentee in Nairobi" className="w-full h-80 object-cover" />
            </div>
            <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-card px-4 py-3">
              <p className="text-sm font-bold text-navy">Expert Guidance</p>
              <p className="text-xs text-slate-500">Learn from industry leaders</p>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-card px-4 py-3">
              <p className="text-sm font-bold text-navy">Track Progress</p>
              <p className="text-xs text-slate-500">Achieve your goals</p>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-card grid grid-cols-2 md:grid-cols-5 divide-x divide-slate-100">
          {[
            ["2,500+", "Mentors"],
            ["12,000+", "Mentees"],
            ["150+", "Programs"],
            ["300+", "Events"],
            ["50+", "Counties & Countries"],
          ].map(([n, l]) => (
            <div key={l} className="p-6 text-center">
              <p className="text-2xl font-extrabold text-navy">{n}</p>
              <p className="text-sm text-slate-500">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED MENTORS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-navy">Featured Mentors</h2>
            <p className="text-slate-500 mt-1">Connect with verified mentors and experts across Africa.</p>
          </div>
          <Link href="/mentors" className="text-teal-600 font-semibold text-sm hover:underline whitespace-nowrap">
            View all mentors &rarr;
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mentors.map((m) => (
            <Link key={m.id} href={`/mentors/${m.id}`} className="bg-white rounded-2xl shadow-card p-5 hover:-translate-y-1 transition block">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {m.img ? (
                  <img src={m.img} alt={m.name} className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-navy to-teal flex items-center justify-center text-white font-bold">{m.name.charAt(0)}</div>
                )}
                <div>
                  <p className="font-bold text-navy">{m.name}</p>
                  <p className="text-xs text-slate-500">{m.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4 text-sm">
                <span className="text-amber-400">&#9733;</span>
                <span className="font-semibold text-navy">{m.rating}</span>
                <span className="text-slate-400">({m.reviews})</span>
              </div>
              {m.skills[0] && (
                <span className="inline-block mt-3 text-xs font-medium text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">
                  {m.skills[0]}
                </span>
              )}
              <p className="text-xs text-slate-400 mt-3">{m.exp} Years Experience &middot; {m.city}, {m.country}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* EVENTS + PROGRAMS */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12">
          <div>
            <div className="flex items-end justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-navy">Upcoming Events</h2>
              <Link href="/events" className="text-teal-600 font-semibold text-sm hover:underline">View all events &rarr;</Link>
            </div>
            <div className="space-y-4">
              {events.map((e) => (
                <Link key={e.id} href={`/events/${e.id}`} className="bg-white rounded-xl shadow-card p-4 flex items-center gap-4 hover:shadow-lg transition">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {e.img ? (
                    <img src={e.img} alt="" className="w-16 h-16 rounded-lg object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-navy to-teal" />
                  )}
                  <div className="flex-1">
                    <p className="font-bold text-navy">{e.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{e.date} &middot; {e.time} &middot; {e.loc}</p>
                  </div>
                  <span className="text-xs font-semibold text-teal-600 whitespace-nowrap">{e.going} Attending</span>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-end justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-navy">Popular Programs</h2>
              <Link href="/programs" className="text-teal-600 font-semibold text-sm hover:underline">View all programs &rarr;</Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              {programs.map((p) => (
                <Link key={p.id} href={`/programs/${p.id}`} className="bg-white rounded-xl shadow-card overflow-hidden hover:shadow-lg transition block">
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p.img ? (
                      <img src={p.img} alt="" className="w-full h-28 object-cover" />
                    ) : (
                      <div className="w-full h-28 bg-gradient-to-br from-navy to-teal" />
                    )}
                    {p.badge && (
                      <span className="absolute top-2 left-2 text-xs font-semibold bg-teal text-white px-2 py-0.5 rounded">{p.badge}</span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-navy text-sm leading-snug">{p.title}</p>
                    <p className="text-xs text-slate-500 mt-2">{("durationLabel" in p && p.durationLabel) ? p.durationLabel : `${p.weeks} weeks`} &middot; {p.level}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">Free</span>
                      <span className="text-xs font-semibold text-navy">Enroll &rarr;</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-navy">Success Stories</h2>
          <p className="text-slate-500 mt-2">Real people, real growth. See how MentorBay transformed careers across Kenya.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {SUCCESS_STORIES.map((s) => (
            <div key={s.name} className="bg-white rounded-2xl shadow-card p-6 border border-slate-50">
              <div className="text-amber-400 text-sm mb-3">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              <p className="text-slate-600 text-sm leading-relaxed">&quot;{s.quote}&quot;</p>
              <div className="flex items-center gap-3 mt-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.img} alt={s.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-bold text-navy text-sm">{s.name}</p>
                  <p className="text-xs text-slate-500">{s.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid md:grid-cols-2 gap-8">
          <div className="bg-white/10 rounded-2xl p-8 backdrop-blur">
            <h3 className="text-2xl font-extrabold text-white">Join as a Mentee</h3>
            <p className="text-teal-50/90 mt-2">Find a mentor, set goals, and track your growth.</p>
            <Link href="/signup" className="inline-block mt-5 px-6 py-3 bg-white text-navy font-semibold rounded-lg hover:bg-slate-100 transition">
              Get Started Free
            </Link>
          </div>
          <div className="bg-white/10 rounded-2xl p-8 backdrop-blur">
            <h3 className="text-2xl font-extrabold text-white">Become a Mentor</h3>
            <p className="text-teal-50/90 mt-2">Share your expertise, build programs, grow your impact.</p>
            <Link href="/signup" className="inline-block mt-5 px-6 py-3 bg-teal text-white font-semibold rounded-lg hover:bg-teal-600 transition">
              Apply to Mentor
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
