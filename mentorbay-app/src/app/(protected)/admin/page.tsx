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
        {STATS.map((s) => (
          <div key={s.label} className="bg-navy text-white rounded-2xl shadow-card p-5">
            <p className="text-2xl font-extrabold">{s.value}</p>
            <p className="text-sm text-slate-300 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-navy">Mentor approvals queue {pending.length > 0 && <span className="ml-2 text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{pending.length} pending</span>}</h2>
          <Link href="/admin/approvals" className="text-sm text-teal-600 font-semibold hover:underline">View all</Link>
        </div>
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
                <div className="flex-1 min-w-0"><p className="font-semibold text-navy text-sm truncate">{u.name}</p><p className="text-xs text-slate-500 capitalize">{u.role}</p></div>
                <div className="flex gap-2">
                  <form action={setApprovalAction}><input type="hidden" name="id" value={u.id} /><input type="hidden" name="status" value="approved" /><button className="px-3 py-1.5 bg-teal text-white text-xs font-semibold rounded-lg">Approve</button></form>
                  <form action={setApprovalAction}><input type="hidden" name="id" value={u.id} /><input type="hidden" name="status" value="rejected" /><button className="px-3 py-1.5 border border-slate-200 text-slate-500 text-xs font-semibold rounded-lg">Reject</button></form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
