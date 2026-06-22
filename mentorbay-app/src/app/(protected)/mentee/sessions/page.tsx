export const dynamic = "force-dynamic";

import Link from "next/link";
import { getMySessions } from "@/lib/sessions";
import { getMyMentorApplications } from "@/lib/registrations";
import SessionBookingForm from "@/components/SessionBookingForm";

export default async function SessionsPage({ searchParams }: { searchParams: { booked?: string; error?: string } }) {
  const [sessions, apps] = await Promise.all([getMySessions(), getMyMentorApplications()]);
  const upcoming = sessions.filter((s) => s.upcoming);
  const past = sessions.filter((s) => !s.upcoming);
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
              <h3 className="font-bold text-navy">Session request sent! Here&apos;s what happens next</h3>
              <ol className="mt-3 space-y-2 text-sm text-slate-600">
                <li className="flex gap-2"><span className="font-bold text-teal-600">1.</span> Your mentor reviews and confirms the time - it appears under <span className="font-semibold text-navy">Upcoming</span> below.</li>
                <li className="flex gap-2"><span className="font-bold text-teal-600">2.</span> Once confirmed, a <span className="font-semibold text-navy">Join link</span> (Google Meet / Zoom) shows up on the session so you can join at the scheduled time.</li>
                <li className="flex gap-2"><span className="font-bold text-teal-600">3.</span> Need to share context first? <a href="/mentee/messages" className="text-teal-600 font-semibold hover:underline">Message your mentor</a> ahead of the session.</li>
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
        <h3 className="font-bold text-navy mb-4">Upcoming</h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No upcoming sessions.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-slate-50">
                <div className="w-11 h-11 rounded-lg bg-teal-50 text-teal-700 grid place-items-center font-bold">{s.counterpart[0]}</div>
                <div className="flex-1 min-w-0"><p className="font-semibold text-navy">{s.topic}</p><p className="text-xs text-slate-500">with {s.counterpart} · {s.mode}</p></div>
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
