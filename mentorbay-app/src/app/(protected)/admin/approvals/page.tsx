import { MENTORS } from "@/lib/data";

export default function AdminApprovalsPage() {
  const queue = MENTORS.slice(0, 5);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy">Mentor Approvals</h1>
      <p className="text-slate-500 -mt-3">Review and approve mentor applications before they go live.</p>

      <div className="space-y-4">
        {queue.map((m) => (
          <div key={m.id} className="bg-white rounded-2xl shadow-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.img} alt={m.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-navy">{m.name}</p>
              <p className="text-sm text-slate-500">{m.role} · {m.city}, {m.country}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">{m.skills.slice(0, 3).map((s) => <span key={s} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{s}</span>)}</div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button className="px-4 py-2 bg-teal text-white text-sm font-semibold rounded-lg">Approve</button>
              <button className="px-4 py-2 border border-slate-200 text-slate-500 text-sm font-semibold rounded-lg hover:border-rose-300 hover:text-rose-500 transition">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
