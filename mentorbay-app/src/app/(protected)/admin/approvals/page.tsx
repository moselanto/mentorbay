import { getPendingApprovals } from "@/lib/admin";
import { setApprovalAction } from "@/app/actions";

export default async function AdminApprovalsPage() {
  const pending = await getPendingApprovals();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy">Mentor Approvals</h1>
      <p className="text-slate-500 -mt-3">Review and approve new mentor sign-ups before they can create content.</p>

      {pending.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center text-slate-500">No pending approvals right now.</div>
      ) : (
        <div className="space-y-4">
          {pending.map((u) => (
            <div key={u.id} className="bg-white rounded-2xl shadow-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <span className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 grid place-items-center font-bold shrink-0 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {u.avatarUrl ? <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" /> : u.name[0]}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy">{u.name}</p>
                <p className="text-sm text-slate-500 capitalize">{u.role} · awaiting approval</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <form action={setApprovalAction}><input type="hidden" name="id" value={u.id} /><input type="hidden" name="status" value="approved" /><button className="px-4 py-2 bg-teal text-white text-sm font-semibold rounded-lg">Approve</button></form>
                <form action={setApprovalAction}><input type="hidden" name="id" value={u.id} /><input type="hidden" name="status" value="rejected" /><button className="px-4 py-2 border border-slate-200 text-slate-500 text-sm font-semibold rounded-lg hover:border-rose-300 hover:text-rose-500 transition">Reject</button></form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
