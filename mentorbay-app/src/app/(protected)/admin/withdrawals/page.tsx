import { getAllWithdrawals } from "@/lib/earnings";
import { markWithdrawalPaidAction } from "@/app/actions";

export const dynamic = "force-dynamic";

function fmt(n: number) { return "KES " + Math.round(n).toLocaleString("en-KE"); }
function when(s: string) { return s ? new Date(s).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "-"; }

export default async function AdminWithdrawalsPage({ searchParams }: { searchParams?: { paid?: string } }) {
  const all = await getAllWithdrawals();
  const pending = all.filter((w) => w.status === "pending");
  const history = all.filter((w) => w.status !== "pending");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy">Withdrawals</h1>
      {searchParams?.paid && (
        <p className="text-sm text-emerald-700 bg-emerald-50 px-4 py-2.5 rounded-lg">Withdrawal marked as paid.</p>
      )}

      <section className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-navy mb-4">Pending requests ({pending.length})</h3>
        {pending.length === 0 ? (
          <div className="text-center py-10 text-sm text-slate-400">No pending withdrawal requests.</div>
        ) : (
          <div className="space-y-3">
            {pending.map((w) => (
              <div key={w.id} className="flex flex-wrap items-center justify-between gap-3 border border-slate-100 rounded-xl p-4">
                <div>
                  <p className="font-semibold text-navy">{w.mentorName}</p>
                  <p className="text-sm text-slate-500">{fmt(w.amount)} to {w.phone ?? "no number"} - requested {when(w.createdAt)}</p>
                </div>
                <form action={markWithdrawalPaidAction}>
                  <input type="hidden" name="id" value={w.id} />
                  <button type="submit" className="px-4 py-2 bg-teal text-white text-sm font-semibold rounded-lg hover:bg-teal/90 transition">Mark as paid</button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-navy mb-4">History</h3>
        {history.length === 0 ? (
          <div className="text-center py-10 text-sm text-slate-400">No completed payouts yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-slate-400 border-b border-slate-100">
                <th className="py-2 font-medium">Mentor</th><th className="py-2 font-medium">Amount</th><th className="py-2 font-medium">To</th><th className="py-2 font-medium">Status</th><th className="py-2 font-medium">Paid</th>
              </tr></thead>
              <tbody>
                {history.map((w) => (
                  <tr key={w.id} className="border-b border-slate-50">
                    <td className="py-2.5 text-slate-600">{w.mentorName}</td>
                    <td className="py-2.5 font-semibold text-navy">{fmt(w.amount)}</td>
                    <td className="py-2.5 text-slate-600">{w.phone ?? "-"}</td>
                    <td className="py-2.5"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">Paid</span></td>
                    <td className="py-2.5 text-slate-600">{w.paidAt ? when(w.paidAt) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
