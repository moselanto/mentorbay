import { REVIEWS } from "@/lib/mentor-demo";

function Stars({ n }: { n: number }) {
  return <span className="text-amber-400">{"★".repeat(n)}<span className="text-slate-200">{"★".repeat(5 - n)}</span></span>;
}

export default function MentorReviewsPage() {
  const avg = (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(1);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy">Reviews</h1>

      <div className="bg-white rounded-2xl shadow-card p-6 flex items-center gap-6">
        <div className="text-center"><p className="text-4xl font-extrabold text-navy">{avg}</p><Stars n={Math.round(Number(avg))} /><p className="text-xs text-slate-400 mt-1">{REVIEWS.length} reviews</p></div>
        <div className="flex-1 text-sm text-slate-500">Your mentees rate their experience after sessions. Keep up the great work!</div>
      </div>

      <div className="space-y-4">
        {REVIEWS.map((r) => (
          <div key={r.name} className="bg-white rounded-2xl shadow-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><span className="w-9 h-9 rounded-full bg-teal-50 text-teal-700 grid place-items-center font-bold">{r.name[0]}</span><p className="font-semibold text-navy text-sm">{r.name}</p></div>
              <Stars n={r.rating} />
            </div>
            <p className="text-sm text-slate-600 mt-3">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
