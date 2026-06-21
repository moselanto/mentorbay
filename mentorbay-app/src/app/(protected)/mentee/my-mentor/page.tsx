import Link from "next/link";
import { getMentors } from "@/lib/mentors";
import { getMyMentorApplications } from "@/lib/registrations";
import { applyMentorshipAction } from "@/app/actions";

function statusPill(status: string) {
  if (status === "accepted") return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700">Connected</span>;
  if (status === "declined") return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-600">Declined</span>;
  return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">Pending</span>;
}

export default async function MyMentorPage({ searchParams }: { searchParams: { applied?: string; applyerror?: string } }) {
  const [mentors, apps] = await Promise.all([getMentors(), getMyMentorApplications()]);
  const appliedIds = new Set(apps.map((a) => a.mentorId));
  // Available mentors the mentee hasn't applied to yet.
  const available = mentors.filter((m) => m.profileId && !appliedIds.has(m.profileId)).filter((m) => m.avail === "Available");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy">My Mentor</h1>
      {searchParams.applied && <p className="text-sm text-teal-700 bg-teal-50 px-4 py-2.5 rounded-lg">Application sent. The mentor will be in touch.</p>}
      {searchParams.applyerror && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2.5 rounded-lg">Could not send your application. Please try again.</p>}

      <section className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-navy mb-4">Your mentor connections</h3>
        {apps.length === 0 ? (
          <p className="text-sm text-slate-500">You haven&apos;t connected with a mentor yet. Browse available mentors below and apply.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {apps.map((a) => (
              <li key={a.mentorId} className="flex items-center justify-between py-3">
                <div><p className="font-semibold text-navy text-sm">{a.mentorName}</p></div>
                {statusPill(a.status)}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="font-bold text-navy mb-4">Available mentors</h3>
        {available.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card p-8 text-center text-slate-500">
            No other mentors available right now. <Link href="/mentors" className="text-teal-600 font-semibold hover:underline">Browse all mentors</Link>.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {available.map((m) => (
              <div key={m.id} className="bg-white rounded-2xl shadow-card p-5">
                <Link href={`/mentors/${m.id}`} className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {m.img ? <img src={m.img} alt={m.name} className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 rounded-full bg-gradient-to-br from-navy to-teal grid place-items-center text-white font-bold">{m.name.charAt(0)}</div>}
                  <div><p className="font-bold text-navy">{m.name}</p><p className="text-xs text-slate-500">{m.role}</p></div>
                </Link>
                {m.skills[0] && <span className="inline-block mt-3 text-xs font-medium text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">{m.skills[0]}</span>}
                <form action={applyMentorshipAction} className="mt-4">
                  <input type="hidden" name="mentor_id" value={m.profileId ?? ""} />
                  <input type="hidden" name="redirect" value="/mentee/my-mentor" />
                  <button className="w-full py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Apply for mentorship</button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
