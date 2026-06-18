import { notFound } from "next/navigation";
import { getMyEventBySlug } from "@/lib/events";
import { updateEventAction } from "@/app/actions";
import CoverUpload from "@/components/CoverUpload";

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const e = await getMyEventBySlug(params.id);
  if (!e) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-extrabold text-navy">Edit Event</h1>
      <p className="text-slate-500 -mt-3">Update your event details. Changes save immediately.</p>

      <form action={updateEventAction} className="space-y-6">
        <input type="hidden" name="slug" value={e.id} />
        <section className="bg-white rounded-2xl shadow-card p-6 space-y-4">
          <CoverUpload name="cover_url" label="Event banner (cover image)" currentUrl={e.img} />
          <div><label className="block text-sm font-semibold text-navy mb-1">Event title</label><input name="title" required defaultValue={e.title} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-navy mb-1">Category</label><select name="category" defaultValue={e.category} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none"><option>Business</option><option>Technology</option><option>Marketing</option><option>Finance</option><option>Leadership</option><option>Design</option></select></div>
            <div><label className="block text-sm font-semibold text-navy mb-1">Format</label><select name="format" defaultValue={e.type} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none"><option>Online</option><option>In-person</option></select></div>
            <div><label className="block text-sm font-semibold text-navy mb-1">Date</label><input name="date_label" defaultValue={e.date} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="e.g. Jun 25, 2026" /></div>
            <div><label className="block text-sm font-semibold text-navy mb-1">Time</label><input name="time" defaultValue={e.time} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" /></div>
            <div><label className="block text-sm font-semibold text-navy mb-1">Speaker</label><input name="speaker" defaultValue={e.speaker} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" /></div>
          </div>
          <div><label className="block text-sm font-semibold text-navy mb-1">Location / address</label><input name="location" defaultValue={e.loc} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" /></div>
        </section>

        <div className="flex justify-end"><button type="submit" className="px-6 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Save changes</button></div>
      </form>
    </div>
  );
}
