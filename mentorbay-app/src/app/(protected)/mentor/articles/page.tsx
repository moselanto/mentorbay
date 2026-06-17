import { ARTICLES } from "@/lib/mentor-demo";

export default function MentorArticlesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy">Articles</h1>
        <button className="px-4 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">+ Write article</button>
      </div>
      <p className="text-slate-500 -mt-3">Share knowledge with the MentorBay community.</p>

      <div className="bg-white rounded-2xl shadow-card divide-y divide-slate-100">
        {ARTICLES.map((a) => (
          <div key={a.title} className="flex items-center gap-4 p-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-navy truncate">{a.title}</p>
              <p className="text-xs text-slate-400">{a.date} · {a.views.toLocaleString()} views</p>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${a.status === "Draft" ? "bg-amber-50 text-amber-600" : "bg-teal-50 text-teal-700"}`}>{a.status}</span>
            <button className="text-sm font-semibold text-teal-600 hover:underline">Edit</button>
          </div>
        ))}
      </div>
    </div>
  );
}
