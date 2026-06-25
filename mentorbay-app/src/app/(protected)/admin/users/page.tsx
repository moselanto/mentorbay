export const dynamic = "force-dynamic";

import { getAllUsers } from "@/lib/admin";
import { setSuspendedAction, setApprovalAction, deleteUserAction } from "@/app/actions";
import ConfirmButton from "@/components/ConfirmButton";

export default async function AdminUsersPage({ searchParams }: { searchParams?: { deleted?: string; delerror?: string } }) {
  const users = await getAllUsers();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy">Users</h1>
        <span className="text-sm text-slate-500">{users.length} total</span>
      </div>
      {searchParams?.deleted && <p className="text-sm text-slate-700 bg-slate-100 px-4 py-2.5 rounded-lg">Member deleted.</p>}
      {searchParams?.delerror === "self" && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2.5 rounded-lg">You can&apos;t delete your own admin account.</p>}

      {users.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center text-slate-500">No users yet.</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr><th className="px-5 py-3 font-semibold">User</th><th className="px-5 py-3 font-semibold">Role</th><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3 font-semibold text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className={u.suspended ? "bg-rose-50/40" : ""}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-full bg-teal-50 text-teal-700 grid place-items-center font-bold text-xs overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {u.avatarUrl ? <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" /> : u.name[0]}
                      </span>
                      <span className="font-medium text-navy">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 capitalize text-slate-600">{u.role}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.approvalStatus === "approved" ? "bg-teal-50 text-teal-700" : u.approvalStatus === "rejected" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"}`}>{u.approvalStatus}</span>
                      {u.suspended && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-700">suspended</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      {u.approvalStatus === "pending" && (
                        <form action={setApprovalAction}><input type="hidden" name="id" value={u.id} /><input type="hidden" name="status" value="approved" /><button className="px-3 py-1.5 bg-teal text-white text-xs font-semibold rounded-lg">Approve</button></form>
                      )}
                      {u.suspended ? (
                        <form action={setSuspendedAction}><input type="hidden" name="id" value={u.id} /><input type="hidden" name="suspended" value="false" /><button className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg">Unsuspend</button></form>
                      ) : (
                        <form action={setSuspendedAction}><input type="hidden" name="id" value={u.id} /><input type="hidden" name="suspended" value="true" /><ConfirmButton message="Suspend this user? They will lose access until unsuspended." className="px-3 py-1.5 border border-slate-200 text-slate-500 text-xs font-semibold rounded-lg hover:border-rose-300 hover:text-rose-500 transition">Suspend</ConfirmButton></form>
                      )}
                      <form action={deleteUserAction}><input type="hidden" name="id" value={u.id} /><ConfirmButton message="Permanently delete this member? This removes their account and all their data and cannot be undone." className="px-3 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition">Delete</ConfirmButton></form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
