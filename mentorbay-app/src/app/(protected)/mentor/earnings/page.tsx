export default function MentorEarningsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy">Earnings</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[["KES 0", "This month"], ["KES 0", "Pending payout"], ["KES 0", "Lifetime"]].map(([v, l]) => (
          <div key={l} className="bg-white rounded-2xl shadow-card p-5"><p className="text-2xl font-extrabold text-navy">{v}</p><p className="text-sm text-slate-500 mt-1">{l}</p></div>
        ))}
      </div>

      <div className="rounded-2xl p-6 bg-amber-50 border border-amber-100">
        <p className="font-bold text-amber-800">Free during launch</p>
        <p className="text-sm text-amber-700 mt-1">Mentorship is free while MentorBay launches, so earnings are KES 0 for now. When paid programs switch on, your payouts and history will appear here automatically.</p>
      </div>

      <section className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-navy mb-4">Payout history</h3>
        <div className="text-center py-10 text-sm text-slate-400">No payouts yet.</div>
      </section>

      <section className="bg-white rounded-2xl shadow-card p-6 max-w-lg">
        <h3 className="font-bold text-navy mb-4">Payout method</h3>
        <div className="space-y-4">
          <div><label className="block text-sm font-semibold text-navy mb-1">M-Pesa number</label><input className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="07XX XXX XXX" /></div>
          <button className="px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Save payout method</button>
        </div>
      </section>
    </div>
  );
}
