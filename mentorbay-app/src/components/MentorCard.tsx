import Link from "next/link";
import type { Mentor } from "@/lib/data";

export default function MentorCard({ mentor }: { mentor: Mentor }) {
  const available = mentor.avail === "Available";
  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden hover:-translate-y-1 transition">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mentor.img} alt={mentor.name} className="w-full h-44 object-cover object-center" />
        <span
          className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${
            available ? "bg-teal-50 text-teal-600" : "bg-amber-50 text-amber-600"
          }`}
        >
          ● {mentor.avail}
        </span>
        <button
          className="absolute top-3 right-3 w-8 h-8 grid place-items-center rounded-lg bg-white/90 text-slate-500 hover:text-teal"
          aria-label="Save mentor"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-navy">{mentor.name}</h3>
        <p className="text-sm text-slate-500">{mentor.role}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {mentor.skills.slice(0, 3).map((s) => (
            <span key={s} className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
              {s}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-4 text-sm text-slate-600">
          <span className="flex items-center gap-1">
            <span className="text-amber-400">★</span>
            <span className="font-semibold text-navy">{mentor.rating}</span>
            <span className="text-slate-400">({mentor.reviews})</span>
          </span>
          <span className="text-slate-300">|</span>
          <span>{mentor.mentees} mentees</span>
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
          <span>
            {mentor.exp}+ yrs · {mentor.city}, {mentor.country}
          </span>
          <span className="font-semibold text-teal-600">Free</span>
        </div>
        <Link
          href={`/mentors/${mentor.id}`}
          className="block text-center mt-4 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
