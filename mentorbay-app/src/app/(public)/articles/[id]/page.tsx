import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticle } from "@/lib/articles";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const a = await getArticle(params.id);
  return { title: a ? `${a.title} - MentorBay` : "Article - MentorBay" };
}

export default async function ArticleDetailPage({ params, searchParams }: { params: { id: string }; searchParams: { preview?: string } }) {
  const a = await getArticle(params.id, { preview: searchParams?.preview === "1" });
  if (!a) notFound();
  const paragraphs = a.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <Link href="/articles" className="text-sm text-slate-500 hover:text-teal-600">&larr; All articles</Link>
      <h1 className="text-3xl lg:text-4xl font-extrabold text-navy mt-4 leading-tight">{a.title}</h1>
      <div className="flex items-center gap-3 mt-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {a.authorAvatar ? (
          <img src={a.authorAvatar} alt={a.author} className="w-9 h-9 rounded-full object-cover" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy to-teal grid place-items-center text-white text-sm font-bold">{a.author.charAt(0)}</div>
        )}
        <div>
          <p className="text-sm font-semibold text-navy">{a.author}</p>
          <p className="text-xs text-slate-400">{a.date}</p>
        </div>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      {a.coverUrl && <img src={a.coverUrl} alt="" className="w-full rounded-2xl mt-8 object-cover max-h-96" />}

      {a.excerpt && <p className="text-lg text-slate-600 mt-8 leading-relaxed font-medium">{a.excerpt}</p>}

      <div className="mt-6 space-y-4 text-slate-700 leading-relaxed text-[15px]">
        {paragraphs.length ? paragraphs.map((p, i) => <p key={i}>{p}</p>) : <p className="text-slate-400 italic">This article has no content yet.</p>}
      </div>
    </article>
  );
}
