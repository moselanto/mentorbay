import Link from "next/link";
import { createArticleAction } from "@/app/actions";

export default function NewArticlePage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/mentor/articles" className="text-sm text-slate-500 hover:text-teal-600">&larr; Articles</Link>
      </div>
      <h1 className="text-2xl font-extrabold text-navy">Write an article</h1>
      {searchParams.error === "title" && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2.5 rounded-lg">Please add a title.</p>}
      {searchParams.error === "save" && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2.5 rounded-lg">Could not save. Please try again.</p>}

      <form action={createArticleAction} className="bg-white rounded-2xl shadow-card p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-navy mb-1">Title</label>
          <input name="title" required className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="e.g. How to ace your first 90 days" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-navy mb-1">Short summary</label>
          <input name="excerpt" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="One or two sentences shown in previews" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-navy mb-1">Cover image URL <span className="text-slate-400 font-normal">(optional)</span></label>
          <input name="cover_url" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="https://..." />
        </div>
        <div>
          <label className="block text-sm font-semibold text-navy mb-1">Body</label>
          <textarea name="body" rows={12} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" placeholder="Write your article here..." />
        </div>
        <div className="flex flex-wrap gap-3 justify-end pt-2">
          <button name="publish" value="false" className="px-5 py-2.5 border border-slate-200 text-navy text-sm font-semibold rounded-lg hover:border-teal transition">Save draft</button>
          <button name="publish" value="true" className="px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Submit for review</button>
        </div>
      </form>
    </div>
  );
}
