import Link from "next/link";
import { getMyEnrollments } from "@/lib/enrollments";

export default async function MenteeProgramsPage() {
  const enrolled = await getMyEnrollments();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy">My Programs</h1>
        <Link href="/programs" className="px-4 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Browse programs</Link>
      </div>

      {enrolled.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center">
          <p className="text-slate-500">You&apos;re not enrolled in any programs yet.</p>
          <Link href="/programs" className="inline-block mt-4 px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Explore programs</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolled.map((p) => (
            <div key={p.slug} className="bg-white rounded-2xl shadow-card overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.img} alt={p.title} className="w-full h-32 object-cover bg-slate-100" />
              <div className="p-5">
                <span className="text-xs font-semibold text-teal-600">{p.category}</span>
                <h3 className="font-bold text-navy mt-1 leading-snug">{p.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{p.mentor}</p>
                <div className="h-2 bg-slate-100 rounded-full mt-3 overflow-hidden"><div className="h-full bg-teal" style={{ width: `${p.pct}%` }} /></div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-500">{p.status === "completed" ? "Completed" : `${p.pct}% complete`}</span>
                  <Link href={`/programs/${p.slug}`} className="text-xs font-semibold text-teal-600 hover:underline">{p.status === "completed" ? "Review" : "Continue"}</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
