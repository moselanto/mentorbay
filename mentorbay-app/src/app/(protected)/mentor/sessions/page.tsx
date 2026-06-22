import Link from "next/link";
import { getMyMentorSessions } from "@/lib/sessions";
import { deleteSessionAction } from "@/app/actions";
import SessionScheduleForm from "@/components/SessionScheduleForm";
import ConfirmButton from "@/components/ConfirmButton";

export const dynamic = "force-dynamic";

function approvalBadge(status: string) {
  if (status === "approved") return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">confirmed</span>;
  if (status === "rejected") return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600">rejected</span>;
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">pending</span>;
}

export default async function MentorSessionsPage({ searchParams }: { searchParams: { created?: string; error?: string } }) {
  const sessions = await getMyMentorSessions();
  const upcoming = sessions.filter((s) => s.upcoming);
  const past = sessions.filter((s) => !s.upcoming);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy">Sessions</h1>

      {searchParams.created && <p className="text-sm text-teal-700 bg-teal-50 px-4 py-2.5 rounded-lg">Session created. It will be confirmed once an admin approves it.</p>}
      {searchParams.error === "pending" && <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-lg">Your account is pending approval, so you can&apos;t schedule sessions yet.</p>}
      {searchParams.error === "missing" && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2.5 rounded-lg">Please enter a topic and a date/time.</p>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[["Upcoming", upcoming.length], ["Total booked", sessions.length], ["Confirmed", sessions.filter((s) => s.approvalStatus === "approved").length], ["Pending", sessions.filter((s) => s.approvalStatus !== "approved" && s.approvalStatus !== "rejected").length]].map(([l, n]) => (
          <div key={l as string} className="bg-white rounded-2xl shadow-card p-4 text-center"><p className="text-2xl font-extrabold text-navy">{n as number}</p><p className="text-xs text-slate-500 mt-1">{l as string}</p></div>
        ))}
      </div>

      <section className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-navy mb-4">Schedule a session</h3>
        <SessionScheduleForm />
      </section>

      <section className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-navy mb-4">Upcoming sessions <span className="text-sm font-normal text-slate-400">- who&apos;s booked with you</span></h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No upcoming sessions booked.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-slate-50">
                <div className="w-11 h-11 rounded-full bg-navy text-white grid place-items-center font-bold shrink-0">{s.mentee.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy">{s.topic}</p>
                  <p className="text-xs text-slate-500">with <span className="font-medium text-navy">{s.mentee}</span> · {s.mode}</p>
                </div>
                {approvalBadge(s.approvalStatus)}
                <span className="text-sm font-medium text-slate-600 shrink-0">{s.when}</span>
                <div className="flex items-center gap-2 shrink-0">
                  {s.meetingUrl ? (
                    <a href={s.meetingUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-teal text-white text-sm font-semibold rounded-lg">Join</a>
                  ) : (
                    <Link href={`/mentor/sessions/${s.id}/edit`} className="px-3 py-2 border border-slate-200 text-navy text-sm font-semibold rounded-lg hover:border-teal transition">Add link</Link>
                  )}
                  <form action={deleteSessionAction}><input type="hidden" name="id" value={s.id} /><ConfirmButton message="Cancel this session?" className="px-3 py-2 border border-slate-200 text-slate-500 text-sm font-semibold rounded-lg hover:border-rose-300 hover:text-rose-500 transition">Cancel</ConfirmButton></form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-bold text-navy mb-4">Past sessions</h3>
          <ul className="divide-y divide-slate-100">
            {past.map((s) => (<li key={s.id} className="flex items-center justify-between py-3"><div><p className="font-medium text-navy text-sm">{s.topic}</p><p className="text-xs text-slate-500">with {s.mentee}</p></div><span className="text-xs text-slate-400">{s.when}</span></li>))}
          </ul>
        </section>
      )}
    </div>
  );
}
