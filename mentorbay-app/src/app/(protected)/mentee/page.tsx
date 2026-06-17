import Link from "next/link";
import { MENTORS, PROGRAMS } from "@/lib/data";

const STATS = [
  { label: "Active Programs", value: "2", tint: "text-teal-600 bg-teal-50" },
  { label: "Upcoming Sessions", value: "3", tint: "text-indigo-600 bg-indigo-50" },
  { label: "Certificates", value: "1", tint: "text-amber-600 bg-amber-50" },
  { label: "Overall Progress", value: "68%", tint: "text-rose-600 bg-rose-50" },
];

const SESSIONS = [
  { with: "Sarah Mwangi", topic: "Career roadmap review", when: "Thu, Jun 18 · 3:00 PM" },
  { with: "Sarah Mwangi", topic: "Mock interview practice", when: "Mon, Jun 22 · 11:00 AM" },
];

export default function MenteeDashboard() {
  const mentor = MENTORS[0];
  const learning = PROGRAMS.slice(0, 2).map((p, i) => ({ ...p, pct: i === 0 ? 72 : 40 }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">Welcome back!</h1>
        <p className="text-slate-500 mt-1">Here&apos;s a snapshot of your mentorship journey.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl shadow-card p-5">
            <span className={`inline-grid place-items-center w-10 h-10 rounded-xl text-lg font-bold ${s.tint}`}>{s.value[0]}</span>
            <p className="text-2xl font-extrabold text-navy mt-3">{s.value}</p>
            <p className="text-sm text-slate-500">{s.label}</p>
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
            <div className="space-y-4">
              {learning.map((p) => (
                <div key={p.id} className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.img} alt="" className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy truncate">{p.title}</p>
                    <p className="text-xs text-slate-500">{p.mentor}</p>
                    <div className="h-2 bg-slate-100 rounded-full mt-2 overflow-hidden"><div className="h-full bg-teal" style={{ width: `${p.pct}%` }} /></div>
                  </div>
                  <span className="text-sm font-semibold text-teal-600">{p.pct}%</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-bold text-navy mb-4">Upcoming sessions</h2>
            <div className="space-y-3">
              {SESSIONS.map((s, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 grid place-items-center text-sm font-bold">{s.with[0]}</div>
                  <div className="flex-1 min-w-0"><p className="font-semibold text-navy text-sm">{s.topic}</p><p className="text-xs text-slate-500">with {s.with}</p></div>
                  <span className="text-xs font-medium text-slate-500 whitespace-nowrap">{s.when}</span>
                </div>
              ))}
            </div>
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
