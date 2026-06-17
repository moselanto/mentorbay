import Link from "next/link";
import { MENTORS } from "@/lib/data";

const STATS = [
  { label: "Active Mentees", value: "12" },
  { label: "Sessions This Week", value: "8" },
  { label: "Avg Rating", value: "4.9" },
  { label: "Pending Reviews", value: "3" },
];

const SESSIONS = [
  { name: "James Otieno", topic: "Portfolio review", when: "Today · 4:00 PM" },
  { name: "Aisha Hassan", topic: "Career strategy", when: "Tomorrow · 10:00 AM" },
];

export default function MentorDashboard() {
  const applicants = MENTORS.slice(1, 4);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Mentor workspace</h1>
          <p className="text-slate-500 mt-1">Manage your mentees, sessions, and programs.</p>
        </div>
        <Link href="/mentor/create-program" className="px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">+ Create Program</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl shadow-card p-5">
            <p className="text-2xl font-extrabold text-navy">{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-bold text-navy mb-4">Pending applications</h2>
          <div className="space-y-3">
            {applicants.map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.img} alt={a.name} className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1 min-w-0"><p className="font-semibold text-navy text-sm truncate">{a.name}</p><p className="text-xs text-slate-500 truncate">Wants help with {a.industry}</p></div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-teal text-white text-xs font-semibold rounded-lg">Accept</button>
                  <button className="px-3 py-1.5 border border-slate-200 text-slate-500 text-xs font-semibold rounded-lg">Decline</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-bold text-navy mb-4">Upcoming sessions</h2>
          <div className="space-y-3">
            {SESSIONS.map((s, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50">
                <div className="w-10 h-10 rounded-lg bg-navy text-white grid place-items-center text-sm font-bold">{s.name[0]}</div>
                <div className="flex-1 min-w-0"><p className="font-semibold text-navy text-sm">{s.topic}</p><p className="text-xs text-slate-500">with {s.name}</p></div>
                <span className="text-xs font-medium text-slate-500 whitespace-nowrap">{s.when}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="rounded-2xl p-6 bg-amber-50 border border-amber-100">
        <p className="font-bold text-amber-800">Payouts paused during launch</p>
        <p className="text-sm text-amber-700 mt-1">Mentorship is free while MentorBay launches, so earnings show KES 0 for now. Paid programs and payouts will switch on later - the Earnings page is already built for it.</p>
      </div>
    </div>
  );
}
