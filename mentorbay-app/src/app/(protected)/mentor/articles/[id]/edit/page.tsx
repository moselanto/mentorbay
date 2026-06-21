import Link from "next/link";
import { notFound } from "next/navigation";
import { getMyArticleBySlug } from "@/lib/articles";
import { updateArticleAction } from "@/app/actions";

export default async function EditArticlePage({ params, searchParams }: { params: { id: string }; searchParams: { error?: string } }) {
  const a = await getMyArticleBySlug(params.id);
  if (!a) notFound();
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/mentor/articles" className="text-sm text-slate-500 hover:text-teal-600">&larr; Articles</Link>
      </div>
      <h1 className="text-2xl font-extrabold text-navy">Edit article</h1>

      <form action={updateArticleAction} className="bg-white rounded-2xl shadow-card p-6 space-y-4">
        <input type="hidden" name="slug" value={a.id} />
        <div>
          <label className="block text-sm font-semibold text-navy mb-1">Title</label>
          <input name="title" required defaultValue={a.title} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-navy mb-1">Short summary</label>
          <input name="excerpt" defaultValue={a.excerpt} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-navy mb-1">Cover image URL <span className="text-slate-400 font-normal">(optional)</span></label>
          <input name="cover_url" defaultValue={a.coverUrl ?? ""} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-navy mb-1">Body</label>
          <textarea name="body" rows={12} defaultValue={a.body} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" />
        </div>
        <div className="flex flex-wrap gap-3 justify-end pt-2">
          <button name="publish" value="false" className="px-5 py-2.5 border border-slate-200 text-navy text-sm font-semibold rounded-lg hover:border-teal transition">Save as draft</button>
          <button name="publish" value="true" className="px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Save &amp; submit for review</button>
        </div>
      </form>
    </div>
  );
}
