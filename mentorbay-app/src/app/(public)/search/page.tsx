import Link from "next/link";
import { getMentors } from "@/lib/mentors";
import { getPrograms } from "@/lib/programs";
import { getEvents } from "@/lib/events";

export const metadata = { title: "Search - MentorBay" };

function matches(q: string, ...fields: (string | string[] | undefined)[]): boolean {
  const hay = fields.flatMap((f) => (Array.isArray(f) ? f : [f])).filter(Boolean).join(" ").toLowerCase();
  return hay.includes(q);
}

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? "").trim().toLowerCase();
  const [mentors, programs, events] = await Promise.all([getMentors(), getPrograms(), getEvents()]);

  const mMatches = q ? mentors.filter((m) => matches(q, m.name, m.role, m.city, m.country, m.skills)) : [];
  const pMatches = q ? programs.filter((p) => matches(q, p.title, p.category, p.level, p.description)) : [];
  const eMatches = q ? events.filter((e) => matches(q, e.title, e.category, e.speaker, e.loc)) : [];
  const total = mMatches.length + pMatches.length + eMatches.length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <form action="/search" method="get" className="flex gap-3 max-w-xl">
        <input name="q" defaultValue={searchParams.q ?? ""} placeholder="Search mentors, programs or topics..." className="flex-1 px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" />
        <button className="px-6 py-3 bg-teal text-white font-semibold rounded-lg hover:bg-teal-600 transition">Search</button>
      </form>

      {q && <p className="text-slate-500 mt-6">{total} result{total === 1 ? "" : "s"} for &quot;{searchParams.q}&quot;</p>}
      {!q && <p className="text-slate-500 mt-6">Type something above to search across mentors, programs and events.</p>}

      {mMatches.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-navy mb-4">Mentors</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {mMatches.map((m) => (
              <Link key={m.id} href={`/mentors/${m.id}`} className="bg-white rounded-2xl shadow-card p-5 hover:-translate-y-1 transition block">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {m.img ? <img src={m.img} alt={m.name} className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 rounded-full bg-gradient-to-br from-navy to-teal grid place-items-center text-white font-bold">{m.name.charAt(0)}</div>}
                  <div><p className="font-bold text-navy">{m.name}</p><p className="text-xs text-slate-500">{m.role}</p></div>
                </div>
                {m.skills[0] && <span className="inline-block mt-3 text-xs font-medium text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">{m.skills[0]}</span>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {pMatches.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-navy mb-4">Programs</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pMatches.map((p) => (
              <Link key={p.id} href={`/programs/${p.id}`} className="bg-white rounded-2xl shadow-card overflow-hidden hover:-translate-y-1 transition block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.img ? <img src={p.img} alt="" className="w-full h-28 object-cover" /> : <div className="w-full h-28 bg-gradient-to-br from-navy to-teal" />}
                <div className="p-4"><p className="font-bold text-navy text-sm">{p.title}</p><p className="text-xs text-slate-500 mt-1">{p.category} · {p.level}</p></div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {eMatches.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-navy mb-4">Events</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {eMatches.map((e) => (
              <Link key={e.id} href={`/events/${e.id}`} className="bg-white rounded-2xl shadow-card overflow-hidden hover:-translate-y-1 transition block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {e.img ? <img src={e.img} alt="" className="w-full h-28 object-cover" /> : <div className="w-full h-28 bg-gradient-to-br from-navy to-teal" />}
                <div className="p-4"><p className="font-bold text-navy text-sm">{e.title}</p><p className="text-xs text-slate-500 mt-1">{e.date} · {e.loc}</p></div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {q && total === 0 && (
        <div className="mt-10 bg-white rounded-2xl shadow-card p-10 text-center text-slate-500">
          No matches. Try a different keyword, or <Link href="/mentors" className="text-teal-600 font-semibold hover:underline">browse all mentors</Link>.
        </div>
      )}
    </div>
  );
}
