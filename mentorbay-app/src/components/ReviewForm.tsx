"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { submitReviewAction } from "@/app/actions";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition disabled:opacity-60">
      {pending ? "Submitting..." : "Submit review"}
    </button>
  );
}

// Review form: 1-5 star rating + body. Submitted reviews are visible immediately
// and can be moderated by admins. Shows a pending state while submitting.
export default function ReviewForm({ mentorSlug, signedIn, redirectTo }: { mentorSlug: string; signedIn: boolean; redirectTo: string }) {
  if (!signedIn) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-6 text-center">
        <p className="text-slate-600 text-sm">Want to share your experience?</p>
        <Link href={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="inline-block mt-3 px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Log in to write a review</Link>
      </div>
    );
  }
  return (
    <form action={submitReviewAction} className="bg-white rounded-2xl shadow-card p-6 space-y-4">
      <h3 className="font-bold text-navy">Write a review</h3>
      <input type="hidden" name="mentor_slug" value={mentorSlug} />
      <input type="hidden" name="redirect" value={redirectTo} />
      <div>
        <label className="block text-sm font-semibold text-navy mb-1">Rating</label>
        <select name="rating" defaultValue="5" className="px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none">
          <option value="5">5 - Excellent</option>
          <option value="4">4 - Very good</option>
          <option value="3">3 - Good</option>
          <option value="2">2 - Fair</option>
          <option value="1">1 - Poor</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-navy mb-1">Your review</label>
        <textarea name="body" rows={4} required className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="Share how this mentor helped you..." />
      </div>
      <div className="flex justify-end">
        <SubmitBtn />
      </div>
    </form>
  );
}
