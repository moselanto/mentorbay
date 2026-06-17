import { EVENTS } from "@/lib/data";

export default function MentorEventsPage() {
  const hosting = EVENTS.filter((e) => e.when === "upcoming").slice(0, 3);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy">My Events</h1>
        <button className="px-4 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">+ Host event</button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {hosting.map((e) => (
          <div key={e.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={e.img} alt={e.title} className="w-full h-32 object-cover" />
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
