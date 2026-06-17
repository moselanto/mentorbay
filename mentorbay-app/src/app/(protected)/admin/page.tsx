import Link from "next/link";
import { MENTORS } from "@/lib/data";

const STATS = [
  { label: "Total Users", value: "1,240" },
  { label: "Active Mentors", value: "86" },
  { label: "Programs", value: "40" },
  { label: "Pending Approvals", value: "5" },
];

const ACTIVITY = [
  "New mentor application from Grace Wairimu",
  "Program 'Leadership Foundations' published",
  "12 new mentee sign-ups today",
  "Review flagged for moderation",
];

export default function AdminDashboard() {
  const pending = MENTORS.slice(0, 3);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">Platform overview</h1>
        <p className="text-slate-500 mt-1">Monitor and manage MentorBay.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="bg-navy text-white rounded-2xl shadow-card p-5">
            <p className="text-2xl font-extrabold">{s.value}</p>
            <p className="text-sm text-slate-300 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-navy">Mentor approvals queue</h2>
            <Link href="/admin/approvals" className="text-sm text-teal-600 font-semibold hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {pending.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.img} alt={m.name} className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1 min-w-0"><p className="font-semibold text-navy text-sm truncate">{m.name}</p><p className="text-xs text-slate-500 truncate">{m.role} · {m.city}</p></div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-teal text-white text-xs font-semibold rounded-lg">Approve</button>
                  <button className="px-3 py-1.5 border border-slate-200 text-slate-500 text-xs font-semibold rounded-lg">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-bold text-navy mb-4">Recent activity</h2>
          <ul className="space-y-3">
            {ACTIVITY.map((a, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-600">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-teal shrink-0" />{a}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <p className="text-xs text-slate-400">Figures shown are demo values. They&apos;ll read from live tables (users, applications, reports) as those admin features are wired up.</p>
    </div>
  );
}
