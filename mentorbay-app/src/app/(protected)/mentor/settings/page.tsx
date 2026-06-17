export default function MentorSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-extrabold text-navy">Settings</h1>

      <section className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-navy mb-4">Mentor profile</h3>
        <div className="space-y-4">
          <div><label className="block text-sm font-semibold text-navy mb-1">Professional title</label><input className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="e.g. Senior Software Engineer" /></div>
          <div><label className="block text-sm font-semibold text-navy mb-1">Bio</label><textarea rows={4} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="Tell mentees about your experience" /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-navy mb-1">Location</label><input className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="Nairobi, Kenya" /></div>
            <div><label className="block text-sm font-semibold text-navy mb-1">Languages</label><input className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="English, Swahili" /></div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-navy mb-4">Availability</h3>
        <label className="flex items-center justify-between text-sm"><span className="text-slate-600">Accepting new mentees</span><input type="checkbox" defaultChecked className="w-5 h-5 accent-teal" /></label>
      </section>

      <div className="flex justify-end">
        <button className="px-6 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Save changes</button>
      </div>
      <p className="text-xs text-slate-400">Note: settings form is presentational for now - it will save to your mentor profile once the endpoint is wired.</p>
    </div>
  );
}
