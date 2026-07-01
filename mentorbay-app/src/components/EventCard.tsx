import Link from "next/link";
import type { EventItem } from "@/lib/data";

function priceLabel(e: EventItem) {
  return e.isPaid && (e.priceKes ?? 0) > 0
    ? "KES " + Math.round(e.priceKes ?? 0).toLocaleString("en-KE")
    : "Free";
}

export default function EventCard({ event: e, liveGoing }: { event: EventItem; liveGoing?: number }) {
  const going = typeof liveGoing === "number" ? liveGoing : (e.going ?? 0);
  const past = e.when === "past";
  const paid = e.isPaid && (e.priceKes ?? 0) > 0;
  return (
    <Link href={`/events/${e.id}`} className="bg-white rounded-2xl shadow-card overflow-hidden hover:-translate-y-1 transition block">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={e.img} alt="" className={`w-full h-40 object-cover ${past ? "grayscale" : ""}`} />
        <div className="absolute top-3 left-3 bg-white rounded-lg px-2.5 py-1 text-center shadow">
          <p className="text-[10px] font-bold text-teal-600 leading-none">{e.mon}</p>
          <p className="text-lg font-extrabold text-navy leading-none">{e.day}</p>
        </div>
        <span className={`absolute top-3 right-3 text-xs font-semibold text-white px-2.5 py-1 rounded-full ${e.type === "Online" ? "bg-teal" : "bg-navy"}`}>
          {e.type}
        </span>
        {/* Free / Paid badge */}
        <span className={`absolute bottom-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full shadow ${paid ? "bg-amber-400 text-navy" : "bg-white text-teal-600"}`}>
          {priceLabel(e)}
        </span>
      </div>
      <div className="p-5">
        <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded">{e.category}</span>
        <h3 className="font-bold text-navy leading-snug mt-2">{e.title}</h3>
        {e.speaker && (
        <div className="flex items-center gap-2 mt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {e.face ? (
            <img src={e.face} alt={e.speaker} className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-navy to-teal grid place-items-center text-white text-[10px] font-bold">{e.speaker.charAt(0)}</span>
          )}
          <span className="text-xs text-slate-500">{e.speaker}</span>
        </div>
        )}
        <p className="text-xs text-slate-500 mt-3">{e.time} · {e.loc}</p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-500">{going} {past ? "attended" : "attending"}</span>
          {past ? <span className="text-xs font-semibold text-slate-400">Ended</span> : <span className="text-sm font-semibold text-teal-600">{paid ? "Get ticket →" : "Register →"}</span>}
        </div>
      </div>
    </Link>
  );
}
