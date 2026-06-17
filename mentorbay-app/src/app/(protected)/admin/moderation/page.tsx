const FLAGGED = [
  { type: "Review", author: "Anonymous", reason: "Possible spam", excerpt: "Check out this external site for cheaper courses..." },
  { type: "Article", author: "Kevin O.", reason: "Reported by user", excerpt: "Some claims in this article may be misleading about..." },
  { type: "Message", author: "Unknown", reason: "Harassment report", excerpt: "Reported conversation pending review." },
];

export default function AdminModerationPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy">Moderation</h1>
      <p className="text-slate-500 -mt-3">Review flagged content and take action.</p>

      <div className="space-y-4">
        {FLAGGED.map((f, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full">{f.reason}</span>
              <span className="text-xs text-slate-400">{f.type} · by {f.author}</span>
            </div>
            <p className="text-sm text-slate-600 italic">&ldquo;{f.excerpt}&rdquo;</p>
            <div className="flex gap-2 mt-4">
              <button className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:border-teal transition">Keep</button>
              <button className="px-4 py-2 bg-rose-500 text-white text-sm font-semibold rounded-lg">Remove</button>
              <button className="px-4 py-2 border border-slate-200 text-slate-500 text-sm font-semibold rounded-lg">Suspend author</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
