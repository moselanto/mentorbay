import Link from "next/link";
import type { Program } from "@/lib/data";

export default function ProgramCard({ program: p, enrolled = false, liveEnrolled }: { program: Program; enrolled?: boolean; liveEnrolled?: number }) {
  const enrolledCount = typeof liveEnrolled === "number" ? liveEnrolled : (p.enrolled ?? 0);
  const isPaid = p.isPaid && (p.priceKes ?? 0) > 0;
  return (
    <Link href={`/programs/${p.id}`} className="bg-white rounded-2xl shadow-card overflow-hidden hover:-translate-y-1 transition block">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.img} alt="" className="w-full h-40 object-cover" />
        <span className="absolute top-3 left-3 text-xs font-semibold bg-white/90 text-navy px-2.5 py-1 rounded-full">{p.category}</span>
        {enrolled ? <span className="absolute top-3 right-3 text-xs font-semibold bg-teal text-white px-2.5 py-1 rounded-full">&#10003; Enrolled</span> : (p.badge && <span className="absolute top-3 right-3 text-xs font-semibold bg-teal text-white px-2.5 py-1 rounded-full">{p.badge}</span>)}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-navy leading-snug">{p.title}</h3>
        <div className="flex items-center gap-2 mt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {p.face ? (
            <img src={p.face} alt={p.mentor} className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <span className="w-7 h-7 rounded-full bg-gradient-to-br from-navy to-teal grid place-items-center text-white text-[10px] font-bold">{(p.mentor || "M").charAt(0)}</span>
          )}
          <span className="text-xs text-slate-500">by {p.mentor || "MentorBay"}</span>
        </div>
        <div className="flex items-center gap-3 mt-4 text-xs text-slate-500">
          <span>{p.weeks} weeks</span><span>{p.lessons} lessons</span><span className="font-medium text-slate-600">{p.level}</span>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <span className="flex items-center gap-1 text-sm">
            <span className="text-amber-400">★</span>
            <span className="font-semibold text-navy">{p.rating}</span>
            <span className="text-slate-400">· {enrolledCount.toLocaleString()} enrolled</span>
          </span>
          <span className="text-sm font-bold text-teal-600">{isPaid ? `KES ${(p.priceKes ?? 0).toLocaleString("en-KE")}` : "Free"}</span>
        </div>
      </div>
    </Link>
  );
}
