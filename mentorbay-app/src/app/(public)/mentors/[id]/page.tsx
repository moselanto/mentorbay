import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMentorBySlug } from "@/lib/mentors";
import { getProgramsByMentor } from "@/lib/programs";
import SaveMentorButton from "@/components/SaveMentorButton";
import MentorProfileTabs from "./MentorProfileTabs";
import ReviewForm from "@/components/ReviewForm";
import { isSignedIn, hasAppliedToMentor } from "@/lib/registrations";
import { applyMentorshipAction } from "@/app/actions";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const m = await getMentorBySlug(params.id);
  return { title: m ? `${m.name} — Mentor Profile | MentorBay` : "Mentor — MentorBay" };
}

export default async function MentorProfilePage({ params }: { params: { id: string } }) {
  const m = await getMentorBySlug(params.id);
  if (!m) notFound();
  const programs = await getProgramsByMentor(m.id);
  const signedIn = await isSignedIn();
  const applied = signedIn ? await hasAppliedToMentor(m.id) : false;
  const here = `/mentors/${m.id}`;

  return (
    <div className="bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav className="text-sm text-slate-500 mb-4">
          <Link href="/" className="hover:text-teal">Home</Link> <span className="mx-1">›</span>
          <Link href="/mentors" className="hover:text-teal">Mentors</Link> <span className="mx-1">›</span>
          <span className="text-slate-700 font-medium">{m.name}</span>
        </nav>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="relative shrink-0 mx-auto sm:mx-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.img} alt={m.name} className="w-32 h-32 rounded-2xl object-cover" />
                <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${m.avail === "Available" ? "bg-teal-50 text-teal-600" : "bg-amber-50 text-amber-600"}`}>
                  ● {m.avail}
                </span>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-extrabold text-navy">{m.name}</h1>
                <p className="text-slate-600 font-medium mt-0.5">{m.role}</p>
                <div className="flex items-center justify-center sm:justify-start flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
                  <span>📍 {m.city}, {m.country}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-3 mt-3">
                  <span className="flex items-center gap-1 text-sm"><span className="text-amber-400">★</span> <span className="font-semibold text-navy">{m.rating}</span> <span className="text-slate-400">({m.reviews} reviews)</span></span>
                  <span className="text-xs font-semibold bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full">🏆 Top Rated Mentor</span>
                </div>
                <p className="text-slate-600 text-sm mt-4 leading-relaxed">
                  I help professionals across Kenya and Africa unlock their potential, advance their careers, and become
                  confident leaders. {m.exp}+ years of experience.
                </p>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="bg-white rounded-2xl shadow-card p-6">
              {signedIn ? (
                applied ? (
                  <div className="text-center py-3 bg-teal-50 text-teal-700 font-semibold rounded-lg">✓ Application sent</div>
                ) : (
                  <form action={applyMentorshipAction}>
                    <input type="hidden" name="mentor_id" value={m.id} />
                    <input type="hidden" name="redirect" value={here} />
                    <button className="w-full py-3 bg-navy text-white font-semibold rounded-lg hover:bg-navy-700 transition">✦ Apply for Mentorship</button>
                  </form>
                )
              ) : (
                <Link href={`/login?redirect=${encodeURIComponent(here)}`} className="block text-center py-3 bg-navy text-white font-semibold rounded-lg hover:bg-navy-700 transition">✦ Apply for Mentorship</Link>
              )}
              <button className="w-full mt-3 py-3 border border-slate-200 text-navy font-semibold rounded-lg hover:border-teal hover:text-teal transition">Message Mentor</button>
              <SaveMentorButton />
              <div className="mt-5 pt-5 border-t border-slate-100 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Mentorship Fee</span><span className="font-semibold text-teal-600">Free during launch</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Languages</span><span className="font-semibold text-navy">{m.langs.join(", ")}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Sessions</span><span className="font-semibold text-navy">Zoom, Google Meet</span></div>
              </div>
            </div>
          </aside>
        </div>

        <div className="bg-white rounded-2xl shadow-card grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100 mt-6">
          {[[m.mentees, "Mentees"], [`${m.exp}+`, "Years Exp"], ["98%", "Success Rate"], ["5", "Countries"]].map(([n, l]) => (
            <div key={l as string} className="p-5 text-center"><p className="text-2xl font-extrabold text-navy">{n}</p><p className="text-sm text-slate-500">{l}</p></div>
          ))}
        </div>
      </section>

      <MentorProfileTabs mentor={m} programs={programs} signedIn={signedIn} reviewForm={<ReviewForm mentorSlug={m.id} signedIn={signedIn} redirectTo={here} />} />

      <section className="cta-gradient mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-extrabold text-white">Be the next success story</h3>
            <p className="text-teal-50/90 mt-1">Join professionals who transformed their careers with the right mentor.</p>
          </div>
          <Link href={signedIn ? here : `/login?redirect=${encodeURIComponent(here)}`} className="px-7 py-3 bg-white text-navy font-semibold rounded-lg hover:bg-slate-100 transition whitespace-nowrap">Apply for Mentorship →</Link>
        </div>
      </section>
    </div>
  );
}
