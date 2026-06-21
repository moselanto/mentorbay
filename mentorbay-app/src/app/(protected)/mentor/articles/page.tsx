import Link from "next/link";
import { getMyArticles } from "@/lib/articles";
import { deleteArticleAction } from "@/app/actions";
import ConfirmButton from "@/components/ConfirmButton";

function statusStyle(a: { status: string; approvalStatus: string }): { label: string; cls: string } {
  if (a.status === "draft") return { label: "Draft", cls: "bg-slate-100 text-slate-600" };
  if (a.approvalStatus === "approved") return { label: "Published", cls: "bg-teal-50 text-teal-700" };
  if (a.approvalStatus === "rejected") return { label: "Rejected", cls: "bg-rose-50 text-rose-600" };
  return { label: "Pending approval", cls: "bg-amber-50 text-amber-600" };
}

export default async function MentorArticlesPage({ searchParams }: { searchParams: { submitted?: string; saved?: string; updated?: string; deleted?: string; error?: string } }) {
  const articles = await getMyArticles();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy">Articles</h1>
        <Link href="/mentor/articles/new" className="px-4 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">+ Write article</Link>
      </div>
      <p className="text-slate-500 -mt-3">Share knowledge with the MentorBay community.</p>

      {searchParams.submitted && <p className="text-sm text-teal-700 bg-teal-50 px-4 py-2.5 rounded-lg">Article submitted. An admin will review it before it goes live.</p>}
      {searchParams.saved && <p className="text-sm text-slate-600 bg-slate-100 px-4 py-2.5 rounded-lg">Draft saved.</p>}
      {searchParams.updated && <p className="text-sm text-teal-700 bg-teal-50 px-4 py-2.5 rounded-lg">Article updated.</p>}
      {searchParams.deleted && <p className="text-sm text-slate-600 bg-slate-100 px-4 py-2.5 rounded-lg">Article deleted.</p>}
      {searchParams.error === "pending" && <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-lg">Your account is pending approval, so you can&apos;t publish articles yet.</p>}

      {articles.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center">
          <p className="text-slate-500">You haven&apos;t written any articles yet.</p>
          <Link href="/mentor/articles/new" className="inline-block mt-4 px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Write your first article</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card divide-y divide-slate-100">
          {articles.map((a) => {
            const s = statusStyle(a);
            return (
              <div key={a.rowId} className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy truncate">{a.title}</p>
                  <p className="text-xs text-slate-400">{a.date} · {a.views.toLocaleString()} views</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.cls}`}>{s.label}</span>
                <Link href={`/mentor/articles/${a.id}/edit`} className="ml-2 text-sm font-semibold text-teal-600 hover:underline">Edit</Link>
                <form action={deleteArticleAction} className="ml-2 inline"><input type="hidden" name="slug" value={a.id} /><ConfirmButton message="Delete this article? This cannot be undone." className="text-sm font-semibold text-rose-500 hover:underline">Delete</ConfirmButton></form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
