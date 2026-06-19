import { getAllReviews } from "@/lib/admin";
import { setReviewStatusAction, suspendAuthorAction } from "@/app/actions";
import ConfirmButton from "@/components/ConfirmButton";

export default async function AdminModerationPage() {
  const reviews = await getAllReviews();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy">Moderation</h1>
      <p className="text-slate-500 -mt-3">Review reported content and take action.</p>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center text-slate-500">No reviews to moderate yet.</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl shadow-card p-5">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${r.status === "removed" ? "bg-rose-50 text-rose-600" : "bg-teal-50 text-teal-700"}`}>{r.status === "removed" ? "Removed" : "Visible"}</span>
                <span className="text-xs text-amber-500">{"★".repeat(r.rating)}</span>
                <span className="text-xs text-slate-400">by {r.authorName}{r.mentorSlug ? ` · about ${r.mentorSlug}` : ""}</span>
              </div>
              <p className="text-sm text-slate-600 italic">&ldquo;{r.body}&rdquo;</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <form action={setReviewStatusAction}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="visible" /><button className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:border-teal transition">Keep</button></form>
                <form action={setReviewStatusAction}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="removed" /><ConfirmButton message="Remove this review from public view?" className="px-4 py-2 bg-rose-500 text-white text-sm font-semibold rounded-lg">Remove</ConfirmButton></form>
                <form action={suspendAuthorAction}><input type="hidden" name="author_id" value={r.authorId ?? ""} /><ConfirmButton message="Suspend this author? They will lose access until unsuspended." disabled={!r.authorId} className="px-4 py-2 border border-slate-200 text-slate-500 text-sm font-semibold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:border-rose-300 enabled:hover:text-rose-500 transition" title={r.authorId ? "Suspend this review's author" : "No linked account (seeded review)"}>Suspend author</ConfirmButton></form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
