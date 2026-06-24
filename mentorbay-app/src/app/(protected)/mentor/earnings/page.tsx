import { getMentorEarnings } from "@/lib/earnings";
import { savePayoutPhoneAction, requestWithdrawalAction } from "@/app/actions";

export const dynamic = "force-dynamic";

function fmt(n: number) { return "KES " + Math.round(n).toLocaleString("en-KE"); }
function when(s: string) { return s ? new Date(s).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "-"; }

export default async function MentorEarningsPage({ searchParams }: { searchParams?: { saved?: string; wd?: string; wderror?: string } }) {
  const e = await getMentorEarnings();
  const walletBalance = e?.walletBalance ?? 0;
  const pending = e?.pendingWithdrawal ?? 0;
  const lifetime = e?.lifetimePaidOut ?? 0;
  const payoutPhone = e?.payoutPhone ?? "";
  const withdrawals = e?.withdrawals ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy">Earnings</h1>

      {searchParams?.wd === "requested" && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">Withdrawal requested. The admin will process your payout shortly.</div>
      )}
      {searchParams?.saved === "phone" && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">Payout number saved.</div>
      )}
      {searchParams?.wderror === "nophone" && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">Add your M-Pesa payout number below before requesting a withdrawal.</div>
      )}
      {searchParams?.wderror === "nobalance" && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">You have no available balance to withdraw.</div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-card p-5"><p className="text-2xl font-extrabold text-navy">{fmt(walletBalance)}</p><p className="text-sm text-slate-500 mt-1">Available balance</p></div>
        <div className="bg-white rounded-2xl shadow-card p-5"><p className="text-2xl font-extrabold text-navy">{fmt(pending)}</p><p className="text-sm text-slate-500 mt-1">Pending payout</p></div>
        <div className="bg-white rounded-2xl shadow-card p-5"><p className="text-2xl font-extrabold text-navy">{fmt(lifetime)}</p><p className="text-sm text-slate-500 mt-1">Lifetime paid out</p></div>
      </div>

      <section className="bg-white rounded-2xl shadow-card p-6 max-w-lg">
        <h3 className="font-bold text-navy mb-1">Request a withdrawal</h3>
        <p className="text-sm text-slate-500 mb-4">Your share is released to your balance once a mentee fully pays for a program. Request a payout to your M-Pesa number any time.</p>
        <form action={requestWithdrawalAction} className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">Amount (KES)</label>
            <input name="amount" type="number" min={1} max={walletBalance} placeholder={`Up to ${fmt(walletBalance)}`}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" />
            <p className="text-xs text-slate-400 mt-1">Leave blank to withdraw your full available balance.</p>
          </div>
          <button type="submit" disabled={walletBalance <= 0}
            className="px-5 py-2.5 bg-teal text-white text-sm font-semibold rounded-lg hover:bg-teal/90 transition disabled:opacity-50">
            Request withdrawal
          </button>
        </form>
      </section>

      <section className="bg-white rounded-2xl shadow-card p-6 max-w-lg">
        <h3 className="font-bold text-navy mb-1">Payout method</h3>
        <p className="text-sm text-slate-500 mb-4">Where we send your M-Pesa payouts.</p>
        <form action={savePayoutPhoneAction} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">M-Pesa number</label>
            <input name="payout_phone" defaultValue={payoutPhone} placeholder="07XX XXX XXX"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" />
          </div>
          <button type="submit" className="px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Save payout method</button>
        </form>
      </section>

      <section className="bg-white rounded-2xl shadow-card p-6">
        <h3 className="font-bold text-navy mb-4">Payout history</h3>
        {withdrawals.length === 0 ? (
          <div className="text-center py-10 text-sm text-slate-400">No payouts yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-slate-400 border-b border-slate-100">
                <th className="py-2 font-medium">Requested</th><th className="py-2 font-medium">Amount</th><th className="py-2 font-medium">To</th><th className="py-2 font-medium">Status</th><th className="py-2 font-medium">Paid</th>
              </tr></thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id} className="border-b border-slate-50">
                    <td className="py-2.5 text-slate-600">{when(w.createdAt)}</td>
                    <td className="py-2.5 font-semibold text-navy">{fmt(w.amount)}</td>
                    <td className="py-2.5 text-slate-600">{w.phone ?? "-"}</td>
                    <td className="py-2.5">
                      <span className={"px-2 py-0.5 rounded-full text-xs font-medium " + (w.status === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
                        {w.status === "paid" ? "Paid" : "Pending"}
                      </span>
                    </td>
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
