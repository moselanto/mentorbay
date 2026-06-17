import Link from "next/link";
import { MENTORS } from "@/lib/data";

export default function MyMentorPage() {
  const m = MENTORS[0];
  const resources = [
    { t: "Career Roadmap Template", type: "PDF" },
    { t: "Interview Prep Checklist", type: "DOC" },
    { t: "Recommended Reading List", type: "Link" },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy">My Mentor</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-card p-6 flex flex-col sm:flex-row gap-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.img} alt={m.name} className="w-28 h-28 rounded-2xl object-cover mx-auto sm:mx-0" />
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-extrabold text-navy">{m.name}</h2>
              <p className="text-slate-600">{m.role}</p>
              <p className="text-sm text-slate-500 mt-1">📍 {m.city}, {m.country} · ⭐ {m.rating} ({m.reviews} reviews)</p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                {m.skills.slice(0, 4).map((s) => <span key={s} className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full">{s}</span>)}
              </div>
              <div className="flex gap-3 mt-4 justify-center sm:justify-start">
                <Link href="/mentee/sessions" className="px-4 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Book a session</Link>
                <Link href="/mentee/messages" className="px-4 py-2 border border-slate-200 text-navy text-sm font-semibold rounded-lg hover:border-teal transition">Message</Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="font-bold text-navy mb-4">Shared resources</h3>
            <ul className="divide-y divide-slate-100">
              {resources.map((r) => (
                <li key={r.t} className="flex items-center justify-between py-3">
                  <span className="text-sm font-medium text-navy">{r.t}</span>
                  <span className="text-xs text-slate-400">{r.type}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="font-bold text-navy mb-3">Mentorship summary</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Since</dt><dd className="font-semibold text-navy">Mar 2026</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Sessions</dt><dd className="font-semibold text-navy">9 completed</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Next session</dt><dd className="font-semibold text-navy">Thu, Jun 18</dd></div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
