import { getPendingApplications } from "@/lib/applications";
import { setApplicationStatusAction } from "@/app/actions";

export default async function ApplicationsPage() {
  const apps = await getPendingApplications();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy">Mentee Applications</h1>
      <p className="text-slate-500 -mt-3">Review requests from mentees who want to work with you.</p>

      {apps.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center text-slate-500">No pending applications right now.</div>
      ) : (
        <div className="space-y-4">
          {apps.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl shadow-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <span className="w-11 h-11 rounded-full bg-navy text-white grid place-items-center font-bold shrink-0">{a.name[0]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><p className="font-semibold text-navy">{a.name}</p><span className="text-xs text-slate-400">· {a.when}</span></div>
                <p className="text-sm text-slate-500 mt-0.5">{a.note}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <form action={setApplicationStatusAction}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="status" value="accepted" /><button className="px-4 py-2 bg-teal text-white text-sm font-semibold rounded-lg">Accept</button></form>
                <form action={setApplicationStatusAction}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="status" value="declined" /><button className="px-4 py-2 border border-slate-200 text-slate-500 text-sm font-semibold rounded-lg hover:border-rose-300 hover:text-rose-500 transition">Decline</button></form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
