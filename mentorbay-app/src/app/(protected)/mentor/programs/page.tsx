import Link from "next/link";
import { getMyPrograms } from "@/lib/programs";
import { getProgramEnrollees, getMentorEnrollmentRequests, getMentorCompletionRequests } from "@/lib/enrollments";
import { deleteProgramAction, mentorApproveEnrollmentAction, mentorApproveCompletionAction } from "@/app/actions";
import ConfirmButton from "@/components/ConfirmButton";
import EnrolleeList from "@/components/EnrolleeList";
import DeclineEnrollmentButton from "@/components/DeclineEnrollmentButton";
import DeclineCompletionButton from "@/components/DeclineCompletionButton";

export const dynamic = "force-dynamic";

function statusStyle(status?: string): { label: string; cls: string } {
  switch (status) {
    case "published": return { label: "Published", cls: "bg-teal-50 text-teal-700" };
    case "rejected": return { label: "Rejected", cls: "bg-rose-50 text-rose-600" };
    case "draft": return { label: "Draft", cls: "bg-slate-100 text-slate-600" };
    default: return { label: "Pending approval", cls: "bg-amber-50 text-amber-600" };
  }
}

export default async function MentorProgramsPage({ searchParams }: { searchParams: { submitted?: string; updated?: string; deleted?: string; enrollapproved?: string; enrolldeclined?: string; completionapproved?: string; completiondeclined?: string; error?: string } }) {
  const [mine, requests, completionRequests] = await Promise.all([getMyPrograms(), getMentorEnrollmentRequests(), getMentorCompletionRequests()]);
  const enrolleeLists = await Promise.all(mine.map((p) => getProgramEnrollees(p.id)));
  const byProgram = new Map(mine.map((p, i) => [p.id, enrolleeLists[i]]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy">My Programs</h1>
        <Link href="/mentor/create-program" className="px-4 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">+ Create Program</Link>
      </div>
      {searchParams.submitted && <p className="text-sm text-teal-700 bg-teal-50 px-4 py-2.5 rounded-lg">Program submitted. An admin will review it before it goes live.</p>}
      {searchParams.updated && <p className="text-sm text-teal-700 bg-teal-50 px-4 py-2.5 rounded-lg">Program updated.</p>}
      {searchParams.deleted && <p className="text-sm text-slate-600 bg-slate-100 px-4 py-2.5 rounded-lg">Program deleted.</p>}
      {searchParams.enrollapproved && <p className="text-sm text-teal-700 bg-teal-50 px-4 py-2.5 rounded-lg">Enrollment approved. The mentee has been notified and the program now shows in their My Programs.</p>}
      {searchParams.enrolldeclined && <p className="text-sm text-slate-700 bg-slate-100 px-4 py-2.5 rounded-lg">Enrollment request declined. The mentee has been notified.</p>}
      {searchParams.completionapproved && <p className="text-sm text-teal-700 bg-teal-50 px-4 py-2.5 rounded-lg">Completion approved. The certificate has been issued and the mentee notified.</p>}
      {searchParams.completiondeclined && <p className="text-sm text-slate-700 bg-slate-100 px-4 py-2.5 rounded-lg">Completion sent back to the mentee with your note.</p>}
      {searchParams.error === "notyours" && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2.5 rounded-lg">That request isn&apos;t for one of your programs.</p>}

      <section className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-navy mb-1">Enrollment requests <span className="text-sm font-normal text-slate-400">- mentees waiting to join your programs</span></h3>
        <p className="text-xs text-slate-500 mb-4">Approve to add them to the program, or decline if they don&apos;t meet the requirements yet.</p>
        {requests.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No pending enrollment requests.</p>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-amber-50/60 border border-amber-100">
                <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-700 grid place-items-center font-bold shrink-0">{r.menteeName.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy truncate"><span className="text-navy">{r.menteeName}</span> wants to join</p>
                  <p className="text-xs text-slate-500 truncate">{r.programTitle}{r.requestedAt ? ` · requested ${r.requestedAt}` : ""}</p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs">
                    {r.phone ? <a href={`tel:${r.phone}`} className="font-semibold text-teal-600 hover:underline">{r.phone}</a> : <span className="text-slate-400">No phone</span>}
                    {r.email ? <a href={`mailto:${r.email}`} className="font-semibold text-teal-600 hover:underline">{r.email}</a> : <span className="text-slate-400">No email</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/programs/${r.programSlug}`} target="_blank" className="text-sm font-semibold text-navy hover:text-teal hover:underline">View program</Link>
                  <form action={mentorApproveEnrollmentAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <button type="submit" className="px-3 py-2 bg-teal text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition">Approve</button>
                  </form>
                  <DeclineEnrollmentButton enrollmentId={r.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-navy mb-1">Completion requests <span className="text-sm font-normal text-slate-400">- mentees asking you to sign off their certificate</span></h3>
        <p className="text-xs text-slate-500 mb-4">Approve to issue the certificate, or send it back with a note if something&apos;s still outstanding.</p>
        {completionRequests.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No completion requests right now.</p>
        ) : (
          <div className="space-y-3">
            {completionRequests.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-amber-50/60 border border-amber-100">
                <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-700 grid place-items-center font-bold shrink-0">{r.menteeName.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy truncate"><span className="text-navy">{r.menteeName}</span> finished a program</p>
                  <p className="text-xs text-slate-500 truncate">{r.programTitle}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <form action={mentorApproveCompletionAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <button type="submit" className="px-3 py-2 bg-teal text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition">Approve &amp; issue certificate</button>
                  </form>
                  <DeclineCompletionButton enrollmentId={r.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {mine.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center">
          <p className="text-slate-500">You haven&apos;t created any programs yet.</p>
          <Link href="/mentor/create-program" className="inline-block mt-4 px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Create your first program</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {mine.map((p) => {
            const s = statusStyle(p.status);
            const enrollees = byProgram.get(p.id) ?? [];
            return (
              <div key={p.id} className="bg-white rounded-2xl shadow-card p-5">
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.img ? <img src={p.img} alt="" className="w-14 h-14 rounded-xl object-cover" /> : <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-navy to-teal" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy truncate">{p.title}</p>
                    <p className="text-xs text-slate-500">{p.category} · {p.durationLabel ?? `${p.weeks} weeks`} · {p.lessons} lessons</p>
                  </div>
                  <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full shrink-0">{enrollees.length} enrolled</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${s.cls}`}>{s.label}</span>
                  <div className="flex items-center gap-3 shrink-0">
                    <Link href={`/programs/${p.id}`} target="_blank" className="text-sm font-semibold text-navy hover:text-teal hover:underline">View</Link>
                    <Link href={`/mentor/programs/${p.id}/edit`} className="text-sm font-semibold text-teal-600 hover:underline">Edit</Link>
                    <form action={deleteProgramAction} className="inline"><input type="hidden" name="slug" value={p.id} /><ConfirmButton message="Delete this program? This cannot be undone." className="text-sm font-semibold text-rose-500 hover:underline">Delete</ConfirmButton></form>
                  </div>
                </div>
                <EnrolleeList enrollees={enrollees} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
