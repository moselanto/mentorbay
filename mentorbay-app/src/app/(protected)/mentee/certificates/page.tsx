import Link from "next/link";
import { getMyCertificates, getCompletableEnrollments } from "@/lib/enrollments";
import { confirmCompletionAction } from "@/app/actions";
import ConfirmButton from "@/components/ConfirmButton";

export const dynamic = "force-dynamic";

export default async function CertificatesPage({ searchParams }: { searchParams: { granted?: string } }) {
  const [certs, completable] = await Promise.all([getMyCertificates(), getCompletableEnrollments()]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy">Certificates</h1>
      <p className="text-slate-500 -mt-3">Finish a program, confirm completion, and earn a printable certificate.</p>

      {searchParams.granted && <p className="text-sm text-teal-700 bg-teal-50 px-4 py-2.5 rounded-lg">Congratulations! Your certificate has been issued. You can print it below.</p>}

      {/* Programs ready to confirm */}
      <section>
        <h2 className="font-bold text-navy mb-3">Your enrolled programs</h2>
        {completable.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card p-6 text-center text-slate-500 text-sm">
            No programs awaiting completion. <Link href="/programs" className="text-teal-600 font-semibold hover:underline">Browse programs</Link> to enroll.
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
                  <ConfirmButton message={`Confirm you've finished "${c.title}"? This issues your certificate.`} className="px-4 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Mark complete &amp; get certificate</ConfirmButton>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Earned certificates */}
      <section>
        <h2 className="font-bold text-navy mb-3">Earned certificates</h2>
        {certs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card p-6 text-center text-slate-500 text-sm">No certificates yet. Confirm a completed program above to earn one.</div>
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
