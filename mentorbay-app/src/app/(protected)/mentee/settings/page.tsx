export default function MenteeSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-extrabold text-navy">Settings</h1>

      <section className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-navy mb-4">Profile</h3>
        <div className="space-y-4">
          <div><label className="block text-sm font-semibold text-navy mb-1">Full name</label><input className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" defaultValue="" placeholder="Your name" /></div>
          <div><label className="block text-sm font-semibold text-navy mb-1">Headline</label><input className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="e.g. Aspiring product manager" /></div>
          <div><label className="block text-sm font-semibold text-navy mb-1">Bio</label><textarea rows={3} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="Tell mentors about yourself" /></div>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-navy mb-4">Notifications</h3>
        <div className="space-y-3">
          {["Session reminders", "New messages", "Program updates", "Weekly progress digest"].map((n, i) => (
            <label key={n} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{n}</span>
              <input type="checkbox" defaultChecked={i < 3} className="w-5 h-5 accent-teal" />
            </label>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <button className="px-6 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Save changes</button>
      </div>
      <p className="text-xs text-slate-400">Note: settings form is presentational for now - it will save to your profile once the profile-edit endpoint is wired.</p>
    </div>
  );
}
