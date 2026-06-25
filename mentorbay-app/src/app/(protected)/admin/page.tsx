export const dynamic = "force-dynamic";

import Link from "next/link";
import { getPendingApprovals, getAllUsers, getAllReviews } from "@/lib/admin";
import { setApprovalAction } from "@/app/actions";

export default async function AdminDashboard() {
  const [pending, users, reviews] = await Promise.all([
    getPendingApprovals(), getAllUsers(), getAllReviews(),
  ]);
  const mentors = users.filter((u) => u.role === "mentor").length;

  const STATS = [
    { label: "Total Users", value: String(users.length) },
    { label: "Mentors", value: String(mentors) },
    { label: "Pending Approvals", value: String(pending.length) },
    { label: "Reviews", value: String(reviews.length) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">Platform overview</h1>
        <p className="text-slate-500 mt-1">Monitor and manage MentorBay.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => {
          const highlight = s.label === "Pending Approvals" && pending.length > 0;
          return (
            <div key={s.label} className={"rounded-2xl shadow-card p-5 " + (highlight ? "bg-amber-500 text-white ring-2 ring-amber-300" : "bg-navy text-white")}>
              <p className="text-2xl font-extrabold">{s.value}</p>
              <p className={"text-sm mt-1 " + (highlight ? "text-amber-50" : "text-slate-300")}>{s.label}</p>
            </div>
          );
        })}
      </div>

      <section className={"rounded-2xl shadow-card p-6 " + (pending.length > 0 ? "bg-amber-50 border border-amber-200" : "bg-white")}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-bold text-navy flex items-center gap-2">Members awaiting approval {pending.length > 0 && <span className="text-xs font-semibold bg-amber-500 text-white px-2 py-0.5 rounded-full">{pending.length}</span>}</h2>
          <Link href="/admin/users" className="text-sm text-teal-600 font-semibold hover:underline">Manage all members</Link>
        </div>
        <p className="text-xs text-slate-500 mb-4">New mentees and mentors can't access the platform until you approve them.</p>
        {pending.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No pending approvals.</p>
        ) : (
          <div className="space-y-3">
            {pending.slice(0, 5).map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                <span className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 grid place-items-center font-bold shrink-0 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {u.avatarUrl ? <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" /> : u.name[0]}
                </span>
                <div className="flex-1 min-w-0"><p className="font-semibold text-navy text-sm truncate">{u.name}</p><span className={"inline-block mt-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize " + (u.role === "mentor" ? "bg-navy text-white" : "bg-teal-50 text-teal-700")}>{u.role}</span></div>
                <div className="flex gap-2">
                  <form action={setApprovalAction}><input type="hidden" name="id" value={u.id} /><input type="hidden" name="status" value="approved" /><button className="px-3 py-1.5 bg-teal text-white text-xs font-semibold rounded-lg">Approve</button></form>
                  <form action={setApprovalAction}><input type="hidden" name="id" value={u.id} /><input type="hidden" name="status" value="rejected" /><button className="px-3 py-1.5 border border-slate-200 text-slate-500 text-xs font-semibold rounded-lg">Reject</button></form>
                </div>
              </div>
            ))}
            {pending.length > 5 && (
              <Link href="/admin/users" className="block text-center text-sm font-semibold text-teal-600 hover:underline pt-1">+ {pending.length - 5} more awaiting approval</Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
