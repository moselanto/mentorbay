import Link from "next/link";
import { getArticles } from "@/lib/articles";

export const metadata = { title: "Articles - MentorBay" };

export default async function ArticlesPage() {
  const articles = await getArticles();
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <p className="text-sm font-semibold text-teal-600">Insights</p>
      <h1 className="text-3xl lg:text-4xl font-extrabold text-navy mt-1">Articles</h1>
      <p className="text-slate-600 mt-3 max-w-2xl">Practical knowledge and career insights from MentorBay mentors.</p>

      {articles.length === 0 ? (
        <div className="mt-10 bg-white rounded-2xl shadow-card p-10 text-center text-slate-500">
          No articles published yet. Check back soon.
        </div>
      ) : (
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a) => (
            <Link key={a.id} href={`/articles/${a.id}`} className="bg-white rounded-2xl shadow-card overflow-hidden hover:-translate-y-1 transition block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {a.coverUrl ? <img src={a.coverUrl} alt="" className="w-full h-40 object-cover" /> : <div className="w-full h-40 bg-gradient-to-br from-navy to-teal" />}
              <div className="p-5">
                <h2 className="font-bold text-navy leading-snug">{a.title}</h2>
                {a.excerpt && <p className="text-sm text-slate-500 mt-2 line-clamp-3">{a.excerpt}</p>}
                <p className="text-xs text-slate-400 mt-4">{a.author} · {a.date}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
