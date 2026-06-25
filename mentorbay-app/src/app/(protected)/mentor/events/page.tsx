import Link from "next/link";
import { getMyEvents } from "@/lib/events";
import { getEventRegistrants } from "@/lib/registrations";
import { deleteEventAction } from "@/app/actions";
import ConfirmButton from "@/components/ConfirmButton";
import AttendeeList from "@/components/AttendeeList";
import ExportAllButton from "@/components/ExportAllButton";

function statusStyle(status: string): { label: string; cls: string } {
  switch (status) {
    case "approved": return { label: "Approved", cls: "bg-teal-50 text-teal-700" };
    case "rejected": return { label: "Rejected", cls: "bg-rose-50 text-rose-600" };
    default: return { label: "Pending approval", cls: "bg-amber-50 text-amber-600" };
  }
}

export default async function MentorEventsPage({ searchParams }: { searchParams: { created?: string; updated?: string; deleted?: string } }) {
  const events = await getMyEvents();
  const registrants = await Promise.all(events.map((e) => getEventRegistrants(e.id)));
  const regBySlug = new Map(events.map((e, i) => [e.id, registrants[i]]));
  const allAttendeeRows: (string | null)[][] = events.flatMap((e, i) =>
    (registrants[i]?.attendees ?? []).map((a) => [e.title, a.name, a.phone, a.email, a.registeredAt])
  );
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy">My Events</h1>
        <div className="flex items-center gap-2">
          <ExportAllButton header={["Event", "Name", "Phone", "Email", "Registered date"]} rows={allAttendeeRows} filename="all-events-attendees.csv" label="Export all attendees (CSV)" emptyMessage="No attendees to export yet." />
          <Link href="/mentor/create-event" className="px-4 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">+ Host event</Link>
        </div>
      </div>
      {searchParams.created && <p className="text-sm text-teal-700 bg-teal-50 px-4 py-2.5 rounded-lg">Event submitted. An admin will review it before it goes live.</p>}
      {searchParams.updated && <p className="text-sm text-teal-700 bg-teal-50 px-4 py-2.5 rounded-lg">Event updated.</p>}
      {searchParams.deleted && <p className="text-sm text-slate-600 bg-slate-100 px-4 py-2.5 rounded-lg">Event deleted.</p>}

      {events.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center">
          <p className="text-slate-500">You haven&apos;t created any events yet.</p>
          <Link href="/mentor/create-event" className="inline-block mt-4 px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Host your first event</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((e) => {
            const s = statusStyle(e.approvalStatus);
            return (
              <div key={e.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {e.img ? <img src={e.img} alt={e.title} className="w-full h-32 object-cover" /> : <div className="w-full h-32 bg-gradient-to-br from-navy to-teal" />}
                <div className="p-5">
                  <div className="flex items-center justify-between"><span className="text-xs font-semibold text-teal-600">{e.type}</span><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.cls}`}>{s.label}</span></div>
                  <h3 className="font-bold text-navy mt-1 leading-snug">{e.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{e.date} · {e.time}</p>
                  <p className="text-xs text-slate-400 mt-1 truncate">{e.loc}</p>
                  <div className="mt-2">
                    <span className="text-xs font-semibold text-teal-600">{regBySlug.get(e.id)?.count ?? 0} attending</span>
                    <AttendeeList attendees={regBySlug.get(e.id)?.attendees ?? []} eventTitle={e.title} />
                  </div>
                  <Link href={`/events/${e.id}`} target="_blank" className="mt-3 block text-center py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">View event</Link>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Link href={`/mentor/events/${e.id}/edit`} className="block text-center py-2 border border-slate-200 text-navy text-sm font-semibold rounded-lg hover:border-teal transition">Edit</Link>
                    <form action={deleteEventAction}><input type="hidden" name="slug" value={e.id} /><ConfirmButton message="Delete this event? This cannot be undone." className="w-full py-2 border border-slate-200 text-rose-500 text-sm font-semibold rounded-lg hover:border-rose-300 transition">Delete</ConfirmButton></form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
