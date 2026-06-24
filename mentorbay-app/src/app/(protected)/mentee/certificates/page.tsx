import Link from "next/link";
import { getMyCertificates, getCompletableEnrollments, getMyPendingCompletions, getMyDeclinedCompletions } from "@/lib/enrollments";
import { confirmCompletionAction } from "@/app/actions";
import ConfirmButton from "@/components/ConfirmButton";

export const dynamic = "force-dynamic";

export default async function CertificatesPage({ searchParams }: { searchParams: { granted?: string; requested?: string } }) {
  const [certs, completable, pendingCompletions, declinedCompletions] = await Promise.all([
    getMyCertificates(), getCompletableEnrollments(), getMyPendingCompletions(), getMyDeclinedCompletions(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy">Certificates</h1>
      <p className="text-slate-500 -mt-3">Finish a program, request completion, and your mentor signs off before your certificate is issued.</p>

      {searchParams.requested && <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-lg">Completion requested. Your mentor will review and sign off - you&apos;ll get your certificate once approved.</p>}
      {searchParams.granted && <p className="text-sm text-teal-700 bg-teal-50 px-4 py-2.5 rounded-lg">Congratulations! Your certificate has been issued. You can print it below.</p>}

      {/* Programs ready to request completion */}
      <section>
        <h2 className="font-bold text-navy mb-3">Your enrolled programs</h2>
        {completable.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card p-6 text-center text-slate-500 text-sm">
            No programs awaiting a completion request. <Link href="/programs" className="text-teal-600 font-semibold hover:underline">Browse programs</Link> to enroll.
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-card divide-y divide-slate-100">
            {completable.map((c) => (
              <div key={c.slug} className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy truncate">{c.title}</p>
                  <div className="h-1.5 bg-slate-100 rounded-full mt-2 max-w-xs overflow-hidden"><div className="h-full bg-teal" style={{ width: `${c.pct}%` }} /></div>
                  <p className="text-xs text-slate-500 mt-1">{c.pct}% complete</p>
                </div>
                <form action={confirmCompletionAction}>
                  <input type="hidden" name="slug" value={c.slug} />
                  <ConfirmButton message={`Request completion sign-off for "${c.title}"? Your mentor will review before your certificate is issued.`} className="px-4 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Request completion</ConfirmButton>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Awaiting mentor sign-off */}
      {pendingCompletions.length > 0 && (
        <section>
          <h2 className="font-bold text-navy mb-3">Awaiting mentor sign-off</h2>
          <div className="bg-white rounded-2xl shadow-card divide-y divide-slate-100">
            {pendingCompletions.map((c) => (
              <div key={c.slug} className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 grid place-items-center font-bold shrink-0">{c.title[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy truncate">{c.title}</p>
                  <p className="text-xs text-slate-500">Mentor: {c.mentor}</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 shrink-0">Awaiting sign-off</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Completion declined */}
      {declinedCompletions.length > 0 && (
        <section>
          <h2 className="font-bold text-navy mb-3">Not signed off</h2>
          <div className="space-y-3">
            {declinedCompletions.map((c) => (
              <div key={c.slug} className="rounded-2xl shadow-card bg-white p-4 border border-rose-100">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-0"><p className="font-semibold text-navy truncate">{c.title}</p><p className="text-xs text-slate-500">Mentor: {c.mentor}</p></div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 shrink-0">Not signed off</span>
                </div>
                {c.reason && <p className="mt-2 text-sm text-slate-600"><span className="font-semibold text-navy">Mentor&apos;s note:</span> {c.reason}</p>}
                <form action={confirmCompletionAction} className="mt-3">
                  <input type="hidden" name="slug" value={c.slug} />
                  <ConfirmButton message={`Request completion again for "${c.title}"?`} className="px-4 py-2 border border-slate-200 text-navy text-sm font-semibold rounded-lg hover:border-teal hover:text-teal transition">Request again</ConfirmButton>
                </form>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Earned certificates */}
      <section>
        <h2 className="font-bold text-navy mb-3">Earned certificates</h2>
        {certs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card p-6 text-center text-slate-500 text-sm">No certificates yet. Once your mentor signs off a completed program, it appears here.</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {certs.map((c) => (
              <div key={c.slug} className="rounded-2xl shadow-card p-6 bg-white border-2 border-teal/30">
                <div className="w-12 h-12 rounded-xl grid place-items-center mb-4 bg-teal-50 text-teal-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>
                </div>
                <h3 className="font-bold text-navy">{c.title}</h3>
                <p className="text-xs text-slate-500 mt-1">Mentor: {c.mentor}</p>
                <p className="text-xs text-slate-400 mt-1">Issued {c.issuedAt}</p>
                <Link href={`/mentee/certificates/${c.slug}`} className="mt-4 block text-center py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">View &amp; print certificate</Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
