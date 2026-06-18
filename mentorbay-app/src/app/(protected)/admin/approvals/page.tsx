import { getPendingApprovals, getPendingPrograms, getPendingSessions } from "@/lib/admin";
import { setApprovalAction, setProgramApprovalAction, setSessionApprovalAction } from "@/app/actions";

export default async function AdminApprovalsPage() {
  const [pendingUsers, pendingPrograms, pendingSessions] = await Promise.all([
    getPendingApprovals(), getPendingPrograms(), getPendingSessions(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">Approvals</h1>
        <p className="text-slate-500 mt-1">Approve new mentors, programs, and sessions before they go live.</p>
      </div>

      <section>
        <h2 className="font-bold text-navy mb-3">Mentor sign-ups {pendingUsers.length > 0 && <span className="ml-1 text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{pendingUsers.length}</span>}</h2>
        {pendingUsers.length === 0 ? <p className="text-sm text-slate-500 bg-white rounded-2xl shadow-card p-6 text-center">No pending mentors.</p> : (
          <div className="space-y-3">
            {pendingUsers.map((u) => (
              <div key={u.id} className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-4">
                <span className="w-11 h-11 rounded-full bg-teal-50 text-teal-700 grid place-items-center font-bold shrink-0 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {u.avatarUrl ? <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" /> : u.name[0]}
                </span>
                <div className="flex-1 min-w-0"><p className="font-semibold text-navy">{u.name}</p><p className="text-sm text-slate-500 capitalize">{u.role}</p></div>
                <div className="flex gap-2">
                  <form action={setApprovalAction}><input type="hidden" name="id" value={u.id} /><input type="hidden" name="status" value="approved" /><button className="px-4 py-2 bg-teal text-white text-sm font-semibold rounded-lg">Approve</button></form>
                  <form action={setApprovalAction}><input type="hidden" name="id" value={u.id} /><input type="hidden" name="status" value="rejected" /><button className="px-4 py-2 border border-slate-200 text-slate-500 text-sm font-semibold rounded-lg hover:border-rose-300 hover:text-rose-500 transition">Reject</button></form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-bold text-navy mb-3">Programs {pendingPrograms.length > 0 && <span className="ml-1 text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{pendingPrograms.length}</span>}</h2>
        {pendingPrograms.length === 0 ? <p className="text-sm text-slate-500 bg-white rounded-2xl shadow-card p-6 text-center">No programs awaiting review.</p> : (
          <div className="space-y-3">
            {pendingPrograms.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0"><p className="font-semibold text-navy truncate">{p.title}</p><p className="text-sm text-slate-500">{p.category} · {p.level}</p></div>
                <div className="flex gap-2">
                  <form action={setProgramApprovalAction}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="status" value="approved" /><button className="px-4 py-2 bg-teal text-white text-sm font-semibold rounded-lg">Approve</button></form>
                  <form action={setProgramApprovalAction}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="status" value="rejected" /><button className="px-4 py-2 border border-slate-200 text-slate-500 text-sm font-semibold rounded-lg hover:border-rose-300 hover:text-rose-500 transition">Reject</button></form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-bold text-navy mb-3">Sessions {pendingSessions.length > 0 && <span className="ml-1 text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{pendingSessions.length}</span>}</h2>
        {pendingSessions.length === 0 ? <p className="text-sm text-slate-500 bg-white rounded-2xl shadow-card p-6 text-center">No sessions awaiting review.</p> : (
          <div className="space-y-3">
            {pendingSessions.map((sn) => (
              <div key={sn.id} className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0"><p className="font-semibold text-navy truncate">{sn.topic}</p><p className="text-sm text-slate-500">{sn.mode} · {sn.when}</p></div>
                <div className="flex gap-2">
                  <form action={setSessionApprovalAction}><input type="hidden" name="id" value={sn.id} /><input type="hidden" name="status" value="approved" /><button className="px-4 py-2 bg-teal text-white text-sm font-semibold rounded-lg">Approve</button></form>
                  <form action={setSessionApprovalAction}><input type="hidden" name="id" value={sn.id} /><input type="hidden" name="status" value="rejected" /><button className="px-4 py-2 border border-slate-200 text-slate-500 text-sm font-semibold rounded-lg hover:border-rose-300 hover:text-rose-500 transition">Reject</button></form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
