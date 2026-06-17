import Link from "next/link";
import { PROGRAMS } from "@/lib/data";

export default function MentorProgramsPage() {
  const mine = PROGRAMS.slice(0, 4);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy">My Programs</h1>
        <Link href="/mentor/create-program" className="px-4 py-2 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">+ Create Program</Link>
      </div>

      <div className="bg-white rounded-2xl shadow-card divide-y divide-slate-100">
        {mine.map((p, i) => (
          <div key={p.id} className="flex items-center gap-4 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.img} alt="" className="w-14 h-14 rounded-xl object-cover" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-navy truncate">{p.title}</p>
              <p className="text-xs text-slate-500">{p.enrolled.toLocaleString()} enrolled · ⭐ {p.rating}</p>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${i === 3 ? "bg-amber-50 text-amber-600" : "bg-teal-50 text-teal-700"}`}>{i === 3 ? "Draft" : "Published"}</span>
            <button className="text-sm font-semibold text-teal-600 hover:underline">Edit</button>
          </div>
        ))}
      </div>
    </div>
  );
}
