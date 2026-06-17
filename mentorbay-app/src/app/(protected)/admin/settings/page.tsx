export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-extrabold text-navy">Platform Settings</h1>

      <section className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-navy mb-4">General</h3>
        <div className="space-y-4">
          <div><label className="block text-sm font-semibold text-navy mb-1">Platform name</label><input className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" defaultValue="MentorBay" /></div>
          <div><label className="block text-sm font-semibold text-navy mb-1">Support email</label><input className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="support@mentorbay.app" /></div>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-navy mb-4">Controls</h3>
        <div className="space-y-3">
          {[["Free launch mode (all programs free)", true], ["Require mentor approval", true], ["Allow new sign-ups", true], ["Maintenance mode", false]].map(([l, on]) => (
            <label key={l as string} className="flex items-center justify-between text-sm"><span className="text-slate-600">{l as string}</span><input type="checkbox" defaultChecked={on as boolean} className="w-5 h-5 accent-teal" /></label>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <button className="px-6 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Save settings</button>
      </div>
      <p className="text-xs text-slate-400">Note: platform settings are presentational for now - they will persist once the admin config endpoint is wired.</p>
    </div>
  );
}
