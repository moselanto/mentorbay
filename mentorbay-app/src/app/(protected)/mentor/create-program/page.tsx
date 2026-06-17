export default function CreateProgramPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-extrabold text-navy">Create a Program</h1>
      <p className="text-slate-500 -mt-3">Design a structured program for your mentees.</p>

      <form className="space-y-6">
        <section className="bg-white rounded-2xl shadow-card p-6 space-y-4">
          <div><label className="block text-sm font-semibold text-navy mb-1">Program title</label><input className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="e.g. Leadership Foundations" /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-navy mb-1">Category</label><select className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none"><option>Leadership</option><option>Technology</option><option>Business</option><option>Marketing</option><option>Finance</option><option>Design</option></select></div>
            <div><label className="block text-sm font-semibold text-navy mb-1">Level</label><select className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>
            <div><label className="block text-sm font-semibold text-navy mb-1">Duration (weeks)</label><input type="number" min={1} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="6" /></div>
            <div><label className="block text-sm font-semibold text-navy mb-1">Lessons</label><input type="number" min={1} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="12" /></div>
          </div>
          <div><label className="block text-sm font-semibold text-navy mb-1">Description</label><textarea rows={4} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="What will mentees learn?" /></div>
        </section>

        <section className="bg-white rounded-2xl shadow-card p-6">
          <label className="block text-sm font-semibold text-navy mb-2">Pricing</label>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-teal-50 text-teal-700 text-sm">
            <input type="checkbox" defaultChecked disabled className="w-5 h-5 accent-teal" />
            Free during launch (paid pricing can be enabled later)
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <button type="button" className="px-5 py-2.5 border border-slate-200 text-slate-500 text-sm font-semibold rounded-lg">Save draft</button>
          <button type="button" className="px-6 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Publish program</button>
        </div>
      </form>
      <p className="text-xs text-slate-400">Note: this form is presentational - it will write to the programs table once the create-program endpoint is wired.</p>
    </div>
  );
}
