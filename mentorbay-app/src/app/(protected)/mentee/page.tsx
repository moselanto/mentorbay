import Link from "next/link";
import { MENTORS } from "@/lib/data";
import { getMyEnrollments } from "@/lib/enrollments";
import { getMySessions } from "@/lib/sessions";

export default async function MenteeDashboard() {
  const [enrollments, sessions] = await Promise.all([getMyEnrollments(), getMySessions()]);
  const upcoming = sessions.filter((s) => s.upcoming);
  const mentor = MENTORS[0];

  const avg = enrollments.length ? Math.round(enrollments.reduce((s, e) => s + e.pct, 0) / enrollments.length) : 0;
  const STATS = [
    { label: "Active Programs", value: String(enrollments.filter((e) => e.status !== "completed").length) },
    { label: "Upcoming Sessions", value: String(upcoming.length) },
    { label: "Certificates", value: String(enrollments.filter((e) => e.status === "completed").length) },
    { label: "Avg Progress", value: `${avg}%` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">Welcome back!</h1>
        <p className="text-slate-500 mt-1">Here&apos;s a snapshot of your mentorship journey.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl shadow-card p-5">
            <p className="text-2xl font-extrabold text-navy">{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-navy">Continue learning</h2>
              <Link href="/programs" className="text-sm text-teal-600 font-semibold hover:underline">Browse all</Link>
            </div>
            {enrollments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-slate-500">You haven&apos;t enrolled in any programs yet.</p>
                <Link href="/programs" className="inline-block mt-3 px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Explore programs</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {enrollments.map((p) => (
                  <div key={p.slug} className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.img} alt="" className="w-16 h-16 rounded-xl object-cover bg-slate-100" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy truncate">{p.title}</p>
                      <p className="text-xs text-slate-500">{p.mentor}</p>
                      <div className="h-2 bg-slate-100 rounded-full mt-2 overflow-hidden"><div className="h-full bg-teal" style={{ width: `${p.pct}%` }} /></div>
                    </div>
                    <span className="text-sm font-semibold text-teal-600">{p.pct}%</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-bold text-navy mb-4">Upcoming sessions</h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">No upcoming sessions scheduled.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((s) => (
                  <div key={s.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 grid place-items-center text-sm font-bold">{s.counterpart[0]}</div>
                    <div className="flex-1 min-w-0"><p className="font-semibold text-navy text-sm">{s.topic}</p><p className="text-xs text-slate-500">with {s.counterpart} · {s.mode}</p></div>
                    <span className="text-xs font-medium text-slate-500 whitespace-nowrap">{s.when}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="bg-white rounded-2xl shadow-card p-6 text-center">
            <h2 className="font-bold text-navy mb-4 text-left">Your mentor</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mentor.img} alt={mentor.name} className="w-20 h-20 rounded-full object-cover mx-auto" />
            <p className="font-bold text-navy mt-3">{mentor.name}</p>
            <p className="text-xs text-slate-500">{mentor.role}</p>
            <Link href={`/mentors/${mentor.id}`} className="inline-block mt-4 w-full py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">View profile</Link>
          </section>
          <div className="rounded-2xl p-6 cta-gradient text-white">
            <p className="font-bold">Free during launch</p>
            <p className="text-sm text-teal-50/90 mt-1">All programs and mentorship are free while MentorBay is in launch. Make the most of it!</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
