export const dynamic = "force-dynamic";

import Link from "next/link";
import { getMySessions } from "@/lib/sessions";
import { getMyMentorApplications } from "@/lib/registrations";
import SessionBookingForm from "@/components/SessionBookingForm";

export default async function SessionsPage({ searchParams }: { searchParams: { booked?: string; error?: string } }) {
  const [sessions, apps] = await Promise.all([getMySessions(), getMyMentorApplications()]);
  // Only mentor-CONFIRMED future sessions are "Upcoming".
  const upcoming = sessions.filter((s) => s.upcoming && s.approvalStatus === "approved");
  // Future sessions still awaiting the mentor's confirmation.
  const pending = sessions.filter((s) => s.upcoming && s.approvalStatus === "pending");
  // Sessions the mentor said they were not available for.
  const declined = sessions.filter((s) => s.approvalStatus === "rejected");
  const past = sessions.filter((s) => !s.upcoming && s.approvalStatus !== "rejected");
  const connected = apps.filter((a) => a.status === "accepted");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy">Sessions</h1>

      {searchParams.booked && (
        <div className="bg-white rounded-2xl shadow-card border border-teal/30 p-6">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-full bg-teal-50 grid place-items-center shrink-0">
              <svg className="w-6 h-6 text-teal" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-navy">Request sent - waiting for your mentor to confirm</h3>
              <ol className="mt-3 space-y-2 text-sm text-slate-600">
                <li className="flex gap-2"><span className="font-bold text-teal-600">1.</span> Your request is under <span className="font-semibold text-navy">Awaiting confirmation</span> below until your mentor accepts the time.</li>
                <li className="flex gap-2"><span className="font-bold text-teal-600">2.</span> Once confirmed it moves to <span className="font-semibold text-navy">Upcoming</span> and a <span className="font-semibold text-navy">Join link</span> appears so you can join at the scheduled time.</li>
                <li className="flex gap-2"><span className="font-bold text-teal-600">3.</span> If the mentor is not available, you&apos;ll see their note here so you can pick another time. <a href="/mentee/messages" className="text-teal-600 font-semibold hover:underline">Message your mentor</a> any time.</li>
              </ol>
            </div>
          </div>
        </div>
      )}
      {searchParams.error === "missing" && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2.5 rounded-lg">Please choose a mentor, topic and time.</p>}
      {searchParams.error === "notconnected" && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2.5 rounded-lg">You can only book sessions with mentors you&apos;re connected to.</p>}
      {searchParams.error === "save" && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2.5 rounded-lg">Could not book the session. Please try again.</p>}

      <section className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-navy mb-4">Book a session</h3>
        {connected.length === 0 ? (
          <p className="text-sm text-slate-500">Connect with a mentor first to book a session. <Link href="/mentee/my-mentor" className="text-teal-600 font-semibold hover:underline">Find a mentor</Link>.</p>
        ) : (
          <SessionBookingForm connected={connected.map((c) => ({ mentorId: c.mentorId, mentorName: c.mentorName }))} />
        )}
      </section>

      <section className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-navy mb-4">Awaiting confirmation <span className="text-sm font-normal text-slate-400">- not yet accepted by your mentor</span></h3>
        {pending.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No pending requests.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-amber-50/60 border border-amber-100">
                <div className="w-11 h-11 rounded-lg bg-amber-100 text-amber-700 grid place-items-center font-bold">{s.counterpart[0]}</div>
                <div className="flex-1 min-w-0"><p className="font-semibold text-navy">{s.topic}</p><p className="text-xs text-slate-500">with {s.counterpart} · {s.mode}</p></div>
                <span className="text-sm font-medium text-slate-600">{s.when}</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">Awaiting confirmation</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-navy mb-4">Upcoming <span className="text-sm font-normal text-slate-400">- confirmed by your mentor</span></h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No confirmed sessions yet.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-slate-50">
                <div className="w-11 h-11 rounded-lg bg-teal-50 text-teal-700 grid place-items-center font-bold">{s.counterpart[0]}</div>
                <div className="flex-1 min-w-0"><p className="font-semibold text-navy">{s.topic}</p><p className="text-xs text-slate-500">with {s.counterpart} · {s.mode}</p></div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700">Confirmed</span>
                <span className="text-sm font-medium text-slate-600">{s.when}</span>
                {s.meetingUrl ? (
                  <a href={s.meetingUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-teal text-white text-sm font-semibold rounded-lg">Join</a>
                ) : (
                  <span className="px-4 py-2 border border-slate-200 text-slate-400 text-sm font-semibold rounded-lg">Link TBD</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {declined.length > 0 && (
        <section className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-bold text-navy mb-4">Not available <span className="text-sm font-normal text-slate-400">- mentor couldn&apos;t take this time</span></h3>
          <div className="space-y-3">
            {declined.map((s) => (
              <div key={s.id} className="p-4 rounded-xl bg-rose-50/60 border border-rose-100">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-0"><p className="font-semibold text-navy">{s.topic}</p><p className="text-xs text-slate-500">with {s.counterpart} · {s.mode} · {s.when}</p></div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-600">Not available</span>
                </div>
                {s.declineReason && <p className="mt-2 text-sm text-slate-600"><span className="font-semibold text-navy">Mentor&apos;s note:</span> {s.declineReason}</p>}
                <p className="mt-2 text-xs text-slate-500">Pick another time using <span className="font-medium">Book a session</span> above.</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-navy mb-4">Past sessions</h3>
        {past.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No past sessions yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {past.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-3">
                <div><p className="font-medium text-navy text-sm">{s.topic}</p><p className="text-xs text-slate-500">with {s.counterpart}</p></div>
                <span className="text-xs text-slate-400">{s.when}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
