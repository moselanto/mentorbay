import { getAcceptedMentees } from "@/lib/applications";

export const dynamic = "force-dynamic";

export default async function MentorMenteesPage() {
  const raw = await getAcceptedMentees();
  // Only active (accepted) mentees, deduped by person.
  const seen = new Set<string>();
  const mentees = raw.filter((m) => {
    const key = m.personId ?? m.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy">My Mentees</h1>
        <span className="text-sm text-slate-500">{mentees.length} active</span>
      </div>

      {mentees.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center text-slate-500">
          You don&apos;t have any active mentees yet. Accepted applications will appear here.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card divide-y divide-slate-100">
          {mentees.map((m) => (
            <div key={m.personId ?? m.id} className="flex flex-wrap items-center gap-4 p-4">
              <span className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 grid place-items-center font-bold shrink-0">{m.name[0]}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy">{m.name}</p>
                {m.note && <p className="text-xs text-slate-400 truncate">{m.note}</p>}
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs">
                  {m.phone ? <a href={`tel:${m.phone}`} className="font-semibold text-teal-600 hover:underline">{m.phone}</a> : <span className="text-slate-400">No phone on file</span>}
                  {m.email ? <a href={`mailto:${m.email}`} className="font-semibold text-teal-600 hover:underline">{m.email}</a> : <span className="text-slate-400">No email on file</span>}
                </div>
              </div>
              <a href={`/mentor/messages?with=${m.personId ?? ""}`} className="text-sm font-semibold text-teal-600 hover:underline shrink-0">Message</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
