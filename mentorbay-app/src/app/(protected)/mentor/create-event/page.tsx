import { createEventAction } from "@/app/actions";
import CoverUpload from "@/components/CoverUpload";
import SpeakersBuilder from "@/components/SpeakersBuilder";
import AgendaBuilder from "@/components/AgendaBuilder";
import EventPricingFields from "@/components/EventPricingFields";

export default function CreateEventPage({ searchParams }: { searchParams: { error?: string } }) {
  const pending = searchParams.error === "pending";
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-extrabold text-navy">Host an Event</h1>
      <p className="text-slate-500 -mt-3">Events are reviewed by an admin before they go live. You can edit them afterwards.</p>

      {pending && <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-lg">Your mentor account is still pending approval, so you can&apos;t create events yet.</p>}
      {searchParams.error === "title" && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2.5 rounded-lg">Please enter an event title.</p>}
      {searchParams.error === "save" && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2.5 rounded-lg">Something went wrong. Please try again.</p>}

      <form action={createEventAction} className="space-y-6">
        <section className="bg-white rounded-2xl shadow-card p-6 space-y-4">
          <CoverUpload name="cover_url" label="Event banner (cover image)" />
          <div><label className="block text-sm font-semibold text-navy mb-1">Event title</label><input name="title" required className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="e.g. Women in Tech Summit" /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-navy mb-1">Category</label><select name="category" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none"><option>Business</option><option>Technology</option><option>Marketing</option><option>Finance</option><option>Leadership</option><option>Design</option></select></div>
            <div><label className="block text-sm font-semibold text-navy mb-1">Format</label><select name="format" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none"><option>Online</option><option>In-person</option></select></div>
            <div><label className="block text-sm font-semibold text-navy mb-1">Date</label><input name="date" type="date" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" /></div>
            <div><label className="block text-sm font-semibold text-navy mb-1">Time</label><input name="time" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="9:00 AM" /></div>
          </div>
          <SpeakersBuilder />
          <div><label className="block text-sm font-semibold text-navy mb-1">Location / address</label><input name="location" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="Venue name and full address, or 'Online (Zoom)'" /></div>
          <EventPricingFields />
        </section>

        <section className="bg-white rounded-2xl shadow-card p-6 space-y-4">
          <div><label className="block text-sm font-semibold text-navy mb-1">About this event</label><textarea name="about" rows={4} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="Describe what the event is about and who it is for." /></div>
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">What attendees will gain</label>
            <textarea name="gains" rows={4} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder={"One point per line, e.g.\nInsights from industry leaders\nHigh-value networking"} />
            <p className="text-xs text-slate-400 mt-1">One point per line.</p>
          </div>
          <AgendaBuilder />
        </section>

        <div className="flex justify-end">
          <button type="submit" className="px-6 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Submit for approval</button>
        </div>
      </form>
    </div>
  );
}
