const CERTS = [
  { title: "Digital Marketing Fundamentals", mentor: "David Ochieng", date: "May 28, 2026", earned: true },
  { title: "Leadership Foundations", mentor: "Sarah Mwangi", date: "In progress", earned: false },
];

export default function CertificatesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy">Certificates</h1>
      <p className="text-slate-500 -mt-3">Earn a certificate for every program you complete.</p>

      <div className="grid sm:grid-cols-2 gap-6">
        {CERTS.map((c) => (
          <div key={c.title} className={`rounded-2xl shadow-card p-6 border-2 ${c.earned ? "bg-white border-teal/30" : "bg-slate-50 border-dashed border-slate-200"}`}>
            <div className={`w-12 h-12 rounded-xl grid place-items-center mb-4 ${c.earned ? "bg-teal-50 text-teal-600" : "bg-slate-200 text-slate-400"}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>
            </div>
            <h3 className="font-bold text-navy">{c.title}</h3>
            <p className="text-xs text-slate-500 mt-1">{c.mentor}</p>
            <p className="text-xs text-slate-400 mt-1">{c.date}</p>
            {c.earned ? (
              <button className="mt-4 w-full py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Download PDF</button>
            ) : (
              <button disabled className="mt-4 w-full py-2.5 bg-slate-200 text-slate-400 text-sm font-semibold rounded-lg cursor-not-allowed">Complete to unlock</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
