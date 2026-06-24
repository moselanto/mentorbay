import { getPendingApplications } from "@/lib/applications";
import { setApplicationStatusAction } from "@/app/actions";
import DeclineApplicationButton from "@/components/DeclineApplicationButton";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage({ searchParams }: { searchParams: { declined?: string } }) {
  const apps = await getPendingApplications();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy">Mentee Applications</h1>
      <p className="text-slate-500 -mt-3">Review requests from mentees who want to work with you. You can contact them using the details below before deciding.</p>
      {searchParams.declined && <p className="text-sm text-slate-700 bg-slate-100 px-4 py-2.5 rounded-lg">Application declined. The mentee has been notified.</p>}

      {apps.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center text-slate-500">No pending applications right now.</div>
      ) : (
        <div className="space-y-4">
          {apps.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl shadow-card p-5">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <span className="w-11 h-11 rounded-full bg-navy text-white grid place-items-center font-bold shrink-0">{a.name[0]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><p className="font-semibold text-navy">{a.name}</p><span className="text-xs text-slate-400">· {a.when}</span></div>
                  {a.note && <p className="text-sm text-slate-500 mt-0.5">{a.note}</p>}

                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    {a.phone ? (
                      <span className="text-slate-600">Phone: <a href={`tel:${a.phone}`} className="font-semibold text-teal-600 hover:underline">{a.phone}</a></span>
                    ) : <span className="text-slate-400">Phone: not provided</span>}
                    {a.email ? (
                      <span className="text-slate-600">Email: <a href={`mailto:${a.email}`} className="font-semibold text-teal-600 hover:underline">{a.email}</a></span>
                    ) : <span className="text-slate-400">Email: not provided</span>}
                  </div>

                  {a.confirmedRequirements.length > 0 && (
                    <div className="mt-3 rounded-lg bg-teal-50/60 border border-teal-100 p-3">
                      <p className="text-xs font-semibold text-navy">Requirements the mentee confirmed</p>
                      <ul className="mt-1.5 space-y-1">
                        {a.confirmedRequirements.map((r, i) => (
                          <li key={`${r}-${i}`} className="flex items-start gap-2 text-sm text-slate-600">
                            <svg className="w-4 h-4 text-teal mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg>
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <form action={setApplicationStatusAction}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="status" value="accepted" /><button className="px-4 py-2 bg-teal text-white text-sm font-semibold rounded-lg hover:bg-teal-600 transition">Accept</button></form>
                  <DeclineApplicationButton applicationId={a.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
