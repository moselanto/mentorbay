export const dynamic = "force-dynamic";

import Link from "next/link";
import { getMyEnrollments, getMyPendingEnrollments, getMyDeclinedEnrollments } from "@/lib/enrollments";

export default async function MenteeProgramsPage() {
  const [enrolled, pending, declined] = await Promise.all([getMyEnrollments(), getMyPendingEnrollments(), getMyDeclinedEnrollments()]);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy">My Programs</h1>
        <Link href="/programs" className="px-4 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Browse programs</Link>
      </div>

      {pending.length > 0 && (
        <section className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-bold text-navy mb-1">Pending approval <span className="text-sm font-normal text-slate-400">- waiting for the mentor to confirm you meet the requirements</span></h3>
          <p className="text-xs text-slate-500 mb-4">These won&apos;t appear as active programs until your mentor approves your enrollment.</p>
          <div className="space-y-3">
            {pending.map((p) => (
              <div key={p.slug} className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-amber-50/60 border border-amber-100">
                <div className="w-11 h-11 rounded-lg bg-amber-100 text-amber-700 grid place-items-center font-bold shrink-0">{(p.title[0] ?? "P")}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy truncate">{p.title}</p>
                  <p className="text-xs text-slate-500">{p.category}{p.mentor ? ` · ${p.mentor}` : ""}</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">Awaiting approval</span>
                <Link href={`/programs/${p.slug}`} className="text-xs font-semibold text-teal-600 hover:underline shrink-0">View program</Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {declined.length > 0 && (
        <section className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-bold text-navy mb-1">Not approved <span className="text-sm font-normal text-slate-400">- the mentor couldn&apos;t accept this enrollment</span></h3>
          <p className="text-xs text-slate-500 mb-4">You can browse other programs that may be a better fit.</p>
          <div className="space-y-3">
            {declined.map((p) => (
              <div key={p.slug} className="p-4 rounded-xl bg-rose-50/60 border border-rose-100">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="w-11 h-11 rounded-lg bg-rose-100 text-rose-600 grid place-items-center font-bold shrink-0">{(p.title[0] ?? "P")}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy truncate">{p.title}</p>
                    <p className="text-xs text-slate-500">{p.category}{p.mentor ? ` · ${p.mentor}` : ""}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-600 shrink-0">Not approved</span>
                </div>
                {p.declineReason && <p className="mt-2 text-sm text-slate-600"><span className="font-semibold text-navy">Mentor&apos;s note:</span> {p.declineReason}</p>}
                <Link href="/programs" className="mt-2 inline-block text-xs font-semibold text-teal-600 hover:underline">Browse other programs</Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {enrolled.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center">
          <p className="text-slate-500">{pending.length > 0 ? "No approved programs yet - your requests above are awaiting mentor approval." : "You're not enrolled in any programs yet."}</p>
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
