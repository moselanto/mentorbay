import Link from "next/link";
import { getEvents } from "@/lib/events";

export default async function MentorEventsPage({ searchParams }: { searchParams: { created?: string } }) {
  const events = await getEvents();
  const upcoming = events.filter((e) => e.when === "upcoming");
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy">My Events</h1>
        <Link href="/mentor/create-event" className="px-4 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">+ Host event</Link>
      </div>
      {searchParams.created && <p className="text-sm text-teal-700 bg-teal-50 px-4 py-2.5 rounded-lg">Event published.</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcoming.map((e) => (
          <div key={e.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {e.img ? <img src={e.img} alt={e.title} className="w-full h-32 object-cover" /> : <div className="w-full h-32 bg-gradient-to-br from-navy to-teal" />}
            <div className="p-5">
              <span className="text-xs font-semibold text-teal-600">{e.type}</span>
              <h3 className="font-bold text-navy mt-1 leading-snug">{e.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{e.date} · {e.time}</p>
              <p className="text-xs text-slate-400 mt-2">{e.going}+ registered</p>
              <button className="mt-3 w-full py-2 border border-slate-200 text-navy text-sm font-semibold rounded-lg hover:border-teal transition">Manage</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
