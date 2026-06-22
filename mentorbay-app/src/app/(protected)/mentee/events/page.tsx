export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getEvent } from "@/lib/events";
import { googleCalendarUrl } from "@/lib/gcal";

// Events the signed-in mentee has registered for.
async function getMyRegisteredEvents() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase.from("event_registrations").select("event_slug").eq("user_id", user.id);
    const slugs = (data as { event_slug: string }[] | null ?? []).map((r) => r.event_slug);
    const events = await Promise.all(slugs.map((s) => getEvent(s)));
    return events.filter(Boolean);
  } catch { return []; }
}

export default async function MenteeEventsPage() {
  const events = await getMyRegisteredEvents();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy">My Events</h1>
        <Link href="/events" className="px-4 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Browse events</Link>
      </div>
      {events.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center">
          <p className="text-slate-500">You haven&apos;t registered for any events yet.</p>
          <Link href="/events" className="inline-block mt-4 px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Explore events</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((e) => e && (
            <div key={e.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {e.img ? <img src={e.img} alt={e.title} className="w-full h-32 object-cover" /> : <div className="w-full h-32 bg-gradient-to-br from-navy to-teal" />}
              <div className="p-5">
                <span className="text-xs font-semibold text-teal-600">{e.category}</span>
                <h3 className="font-bold text-navy mt-1 leading-snug">{e.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{e.date} · {e.time}</p>
                <p className="text-xs text-slate-400 mt-1 truncate">{e.loc}</p>
                <div className="mt-3 space-y-2">
                  <a href={googleCalendarUrl(e)} target="_blank" rel="noopener noreferrer" className="block text-center py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-700 transition">Add to Google Calendar</a>
                  <div className="grid grid-cols-2 gap-2">
                    <Link href={`/events/${e.id}`} className="text-center py-2 border border-slate-200 text-navy text-xs font-semibold rounded-lg hover:border-teal transition">Details</Link>
                    <a href={`/events/${e.id}/calendar.ics`} className="text-center py-2 border border-slate-200 text-navy text-xs font-semibold rounded-lg hover:border-teal transition">Download .ics</a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
