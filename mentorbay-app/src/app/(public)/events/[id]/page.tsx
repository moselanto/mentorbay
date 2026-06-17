import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getEvent, getEvents } from "@/lib/events";
import { MENTORS } from "@/lib/data";
import EventRegister from "@/components/EventRegister";
import EventCard from "@/components/EventCard";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const e = await getEvent(params.id);
  return { title: e ? `${e.title} — MentorBay` : "Event — MentorBay" };
}

const GAINS = [
  "Insights from industry leaders",
  "Practical, hands-on workshops",
  "High-value networking",
  "Access to hiring partners",
  "Session recordings afterwards",
  "Certificate of attendance",
];

const AGENDA = [
  { t: "9:00 AM", title: "Registration & Welcome Coffee" },
  { t: "9:30 AM", title: "Keynote address" },
  { t: "10:30 AM", title: "Panel discussion" },
  { t: "12:00 PM", title: "Networking lunch" },
  { t: "1:30 PM", title: "Breakout workshops" },
  { t: "3:30 PM", title: "Fireside chat" },
  { t: "4:30 PM", title: "Closing & networking" },
];

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const e = await getEvent(params.id);
  if (!e) notFound();

  const speakers = [
    { name: e.speaker, role: "Keynote Speaker", img: e.face },
    { name: MENTORS[1].name, role: MENTORS[1].role, img: MENTORS[1].img },
    { name: MENTORS[0].name, role: MENTORS[0].role, img: MENTORS[0].img },
  ];
  const all = await getEvents();
  const related = all.filter((x) => x.id !== e.id && x.when === "upcoming").slice(0, 3);

  return (
    <div className="bg-slate-50">
      <section className="cta-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white">
          <nav className="text-sm text-teal-50/80 mb-4">
            <Link href="/" className="hover:text-white">Home</Link> <span className="mx-1">›</span>
            <Link href="/events" className="hover:text-white">Events</Link> <span className="mx-1">›</span>
            <span className="text-white font-medium">{e.title}</span>
          </nav>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs font-semibold bg-white/15 px-2.5 py-1 rounded-full">{e.category}</span>
            <span className="text-xs font-semibold bg-navy px-2.5 py-1 rounded-full">{e.type}</span>
            {e.featured && <span className="text-xs font-semibold bg-teal px-2.5 py-1 rounded-full">Featured</span>}
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight max-w-3xl">{e.title}</h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm text-teal-50/90">
            <span>📅 {e.date}</span><span>🕘 {e.time} EAT</span><span>📍 {e.loc}</span><span>👥 {e.going}+ attending</span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={e.img} alt={e.title} className="w-full h-64 object-cover rounded-2xl shadow-card" />

          <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
            <h2 className="text-xl font-bold text-navy mb-3">About this event</h2>
            <p className="text-slate-600 leading-relaxed">Join professionals, founders, and changemakers for one of Kenya&apos;s standout {e.category.toLowerCase()} events. A day of keynotes, panels, hands-on workshops, and high-value networking with the region&apos;s leading mentors.</p>
            <h3 className="text-lg font-bold text-navy mt-6 mb-3">What you&apos;ll gain</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {GAINS.map((g) => (
                <div key={g} className="flex items-start gap-2 text-sm text-slate-600">
                  <svg className="w-5 h-5 text-teal shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>
                  <span>{g}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
            <h3 className="text-lg font-bold text-navy mb-5">Agenda</h3>
            <div className="space-y-5">
              {AGENDA.map((a) => (
                <div key={a.t} className="flex gap-4">
                  <div className="w-20 shrink-0 text-sm font-semibold text-teal-600">{a.t}</div>
                  <div className="relative pl-5 border-l-2 border-slate-100 pb-1">
                    <span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-teal" />
                    <p className="font-semibold text-navy text-sm">{a.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
            <h3 className="text-lg font-bold text-navy mb-5">Speakers</h3>
            <div className="grid sm:grid-cols-3 gap-5">
              {speakers.map((s) => (
                <div key={s.name} className="text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.img} alt={s.name} className="w-20 h-20 rounded-full object-cover mx-auto" />
                  <p className="font-bold text-navy text-sm mt-3">{s.name}</p>
                  <p className="text-xs text-slate-500">{s.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside>
          <EventRegister event={e} />
        </aside>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h3 className="text-xl font-bold text-navy mb-5">More events you might like</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {related.map((r) => <EventCard key={r.id} event={r} />)}
        </div>
      </section>
    </div>
  );
}
