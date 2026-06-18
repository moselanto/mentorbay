import Link from "next/link";
import { getMyPrograms } from "@/lib/programs";

function statusStyle(status?: string): { label: string; cls: string } {
  switch (status) {
    case "published": return { label: "Published", cls: "bg-teal-50 text-teal-700" };
    case "rejected": return { label: "Rejected", cls: "bg-rose-50 text-rose-600" };
    case "draft": return { label: "Draft", cls: "bg-slate-100 text-slate-600" };
    default: return { label: "Pending approval", cls: "bg-amber-50 text-amber-600" };
  }
}

export default async function MentorProgramsPage({ searchParams }: { searchParams: { submitted?: string } }) {
  const mine = await getMyPrograms();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy">My Programs</h1>
        <Link href="/mentor/create-program" className="px-4 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">+ Create Program</Link>
      </div>
      {searchParams.submitted && <p className="text-sm text-teal-700 bg-teal-50 px-4 py-2.5 rounded-lg">Program submitted. An admin will review it before it goes live.</p>}

      {mine.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center">
          <p className="text-slate-500">You haven&apos;t created any programs yet.</p>
          <Link href="/mentor/create-program" className="inline-block mt-4 px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Create your first program</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card divide-y divide-slate-100">
          {mine.map((p) => {
            const s = statusStyle(p.status);
            return (
              <div key={p.id} className="flex items-center gap-4 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.img ? <img src={p.img} alt="" className="w-14 h-14 rounded-xl object-cover" /> : <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-navy to-teal" />}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy truncate">{p.title}</p>
                  <p className="text-xs text-slate-500">{p.category} · {p.durationLabel ?? `${p.weeks} weeks`} · {p.lessons} lessons</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.cls}`}>{s.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
