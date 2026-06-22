"use client";

import { useFormStatus } from "react-dom";
import { submitProgramReviewAction } from "@/app/actions";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition disabled:opacity-60">{pending ? "Submitting..." : "Submit rating"}</button>;
}

export default function ProgramReviewForm({ slug, alreadyReviewed }: { slug: string; alreadyReviewed: boolean }) {
  if (alreadyReviewed) {
    return <p className="text-sm text-teal-700 bg-teal-50 px-4 py-2.5 rounded-lg">Thanks - you&apos;ve already rated this program.</p>;
  }
  return (
    <form action={submitProgramReviewAction} className="bg-white rounded-2xl shadow-card p-6 space-y-4">
      <h3 className="font-bold text-navy">Rate this program</h3>
      <input type="hidden" name="program_slug" value={slug} />
      <div>
        <label className="block text-sm font-semibold text-navy mb-1">Rating</label>
        <select name="rating" defaultValue="5" className="px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none">
          <option value="5">5 - Excellent</option><option value="4">4 - Very good</option><option value="3">3 - Good</option><option value="2">2 - Fair</option><option value="1">1 - Poor</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-navy mb-1">Your feedback</label>
        <textarea name="body" rows={3} required className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="What did you think of this program?" />
      </div>
      <div className="flex justify-end"><SubmitBtn /></div>
    </form>
  );
}
