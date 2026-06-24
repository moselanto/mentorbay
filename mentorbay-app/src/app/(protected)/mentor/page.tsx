import Link from "next/link";
import { getPendingApplications, getAcceptedMentees } from "@/lib/applications";
import { getMySessions } from "@/lib/sessions";
import { getMentorEnrollmentRequests } from "@/lib/enrollments";
import { setApplicationStatusAction } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function MentorDashboard() {
  const [pending, mentees, sessions, enrollRequests] = await Promise.all([
    getPendingApplications(), getAcceptedMentees(), getMySessions(), getMentorEnrollmentRequests(),
  ]);
  // Only mentor-confirmed future sessions count as upcoming.
  const upcoming = sessions.filter((s) => s.upcoming && s.approvalStatus === "approved");
  // Session requests from mentees awaiting this mentor's decision.
  const sessionRequests = sessions.filter((s) => s.approvalStatus === "pending");

  const STATS: { label: string; value: string; href?: string; highlight?: boolean }[] = [
    { label: "Active Mentees", value: String(mentees.length) },
    { label: "Session requests", value: String(sessionRequests.length), href: "/mentor/sessions", highlight: sessionRequests.length > 0 },
    { label: "Upcoming Sessions", value: String(upcoming.length), href: "/mentor/sessions" },
    { label: "Pending Applications", value: String(pending.length), href: "/mentor/applications" },
    { label: "Enrollment requests", value: String(enrollRequests.length), href: "/mentor/programs", highlight: enrollRequests.length > 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Mentor workspace</h1>
          <p className="text-slate-500 mt-1">Manage your mentees, sessions, and programs.</p>
        </div>
        <Link href="/mentor/create-program" className="px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">+ Create Program</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => {
          const card = (
            <div className={`bg-white rounded-2xl shadow-card p-5 h-full ${s.highlight ? "ring-2 ring-amber-300" : ""} ${s.href ? "hover:shadow-md transition cursor-pointer" : ""}`}>
              <p className="text-2xl font-extrabold text-navy">{s.value}</p>
              <p className="text-sm text-slate-500 mt-1">{s.label}</p>
              {s.highlight && <p className="text-xs font-semibold text-amber-600 mt-1">Tap to review</p>}
            </div>
          );
          return s.href ? <Link key={s.label} href={s.href}>{card}</Link> : <div key={s.label}>{card}</div>;
        })}
      </div>

      {sessionRequests.length > 0 && (
        <div className="rounded-2xl p-5 bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-bold text-amber-800">{sessionRequests.length} session {sessionRequests.length === 1 ? "request needs" : "requests need"} your response</p>
            <p className="text-sm text-amber-700 mt-0.5">Confirm the time or let the mentee know you&apos;re not available.</p>
          </div>
          <Link href="/mentor/sessions" className="px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 transition shrink-0">Review requests</Link>
        </div>
      )}

      {enrollRequests.length > 0 && (
        <div className="rounded-2xl p-5 bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-bold text-amber-800">{enrollRequests.length} enrollment {enrollRequests.length === 1 ? "request needs" : "requests need"} your approval</p>
            <p className="text-sm text-amber-700 mt-0.5">Approve mentees into your programs or decline if they don&apos;t meet the requirements.</p>
          </div>
          <Link href="/mentor/programs" className="px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 transition shrink-0">Review requests</Link>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4"><h2 className="font-bold text-navy">Pending applications</h2><Link href="/mentor/applications" className="text-sm text-teal-600 font-semibold hover:underline">View all</Link></div>
          {pending.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">No pending applications.</p>
          ) : (
            <div className="space-y-3">
              {pending.slice(0, 3).map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <span className="w-10 h-10 rounded-full bg-navy text-white grid place-items-center font-bold shrink-0">{a.name[0]}</span>
                  <div className="flex-1 min-w-0"><p className="font-semibold text-navy text-sm truncate">{a.name}</p><p className="text-xs text-slate-500 truncate">{a.note}</p></div>
                  <div className="flex gap-2 shrink-0">
                    <form action={setApplicationStatusAction}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="status" value="accepted" /><button className="px-3 py-1.5 bg-teal text-white text-xs font-semibold rounded-lg">Accept</button></form>
                    <form action={setApplicationStatusAction}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="status" value="declined" /><button className="px-3 py-1.5 border border-slate-200 text-slate-500 text-xs font-semibold rounded-lg">Decline</button></form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4"><h2 className="font-bold text-navy">Upcoming sessions</h2><Link href="/mentor/sessions" className="text-sm text-teal-600 font-semibold hover:underline">View all</Link></div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">No confirmed upcoming sessions.</p>
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 4).map((s) => (
                <div key={s.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50">
                  <div className="w-10 h-10 rounded-lg bg-navy text-white grid place-items-center text-sm font-bold">{s.counterpart[0]}</div>
                  <div className="flex-1 min-w-0"><p className="font-semibold text-navy text-sm">{s.topic}</p><p className="text-xs text-slate-500">with {s.counterpart}</p></div>
                  <span className="text-xs font-medium text-slate-500 whitespace-nowrap">{s.when}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="rounded-2xl p-6 bg-amber-50 border border-amber-100">
        <p className="font-bold text-amber-800">Payouts paused during launch</p>
        <p className="text-sm text-amber-700 mt-1">Mentorship is free while MentorBay launches, so earnings show KES 0 for now. Paid programs and payouts will switch on later.</p>
      </div>
    </div>
  );
}
