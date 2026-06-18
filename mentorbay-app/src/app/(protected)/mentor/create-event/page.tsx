import { createEventAction } from "@/app/actions";

export default function CreateEventPage({ searchParams }: { searchParams: { error?: string } }) {
  const pending = searchParams.error === "pending";
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-extrabold text-navy">Host an Event</h1>
      <p className="text-slate-500 -mt-3">Create a workshop, summit, or masterclass for the community.</p>

      {pending && <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-lg">Your mentor account is still pending approval, so you can&apos;t create events yet. An admin will review you shortly.</p>}
      {searchParams.error === "title" && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2.5 rounded-lg">Please enter an event title.</p>}
      {searchParams.error === "save" && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2.5 rounded-lg">Something went wrong saving the event. Please try again.</p>}

      <form action={createEventAction} className="space-y-6">
        <section className="bg-white rounded-2xl shadow-card p-6 space-y-4">
          <div><label className="block text-sm font-semibold text-navy mb-1">Event title</label><input name="title" required className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="e.g. Women in Tech Summit" /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-navy mb-1">Category</label><select name="category" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none"><option>Business</option><option>Technology</option><option>Marketing</option><option>Finance</option><option>Leadership</option><option>Design</option></select></div>
            <div><label className="block text-sm font-semibold text-navy mb-1">Format</label><select name="format" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none"><option>Online</option><option>In-person</option></select></div>
            <div><label className="block text-sm font-semibold text-navy mb-1">Date</label><input name="date" type="date" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" /></div>
            <div><label className="block text-sm font-semibold text-navy mb-1">Time</label><input name="time" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="9:00 AM" /></div>
            <div><label className="block text-sm font-semibold text-navy mb-1">Location</label><input name="location" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="Online (Zoom) or venue" /></div>
            <div><label className="block text-sm font-semibold text-navy mb-1">Speaker</label><input name="speaker" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="Speaker name" /></div>
          </div>
        </section>
        <div className="flex justify-end">
          <button type="submit" className="px-6 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Publish event</button>
        </div>
      </form>
    </div>
  );
}
