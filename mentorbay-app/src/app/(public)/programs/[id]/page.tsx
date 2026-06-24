import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProgram, getPrograms, getProgramReviews, hasReviewedProgram } from "@/lib/programs";
import ProgramReviewForm from "@/components/ProgramReviewForm";
import Accordion, { type Module } from "@/components/Accordion";
import EnrollButton from "@/components/EnrollButton";
import { isEnrolledInProgram, countEnrollments, getProgramProgress } from "@/lib/enrollments";
import { currentUserRole } from "@/lib/is-admin";
import ProgramProgressPanel from "@/components/ProgramProgressPanel";
import CurriculumTracker from "@/components/CurriculumTracker";
import { getCompletedLessons, getMyPaymentState } from "@/lib/enrollments";
import ProgramPaymentPanel from "@/components/ProgramPaymentPanel";
import ProgramCard from "@/components/ProgramCard";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const p = await getProgram(params.id);
  return { title: p ? `${p.title} — MentorBay` : "Program — MentorBay" };
}

const LEARN = [
  "Lead with clarity and confidence",
  "Communicate and influence effectively",
  "Build and motivate high-performing teams",
  "Give and receive constructive feedback",
  "Make sound decisions under pressure",
  "Develop your personal leadership brand",
];

const CURRICULUM: Module[] = [
  { title: "Module 1 - Foundations", lessons: ["What makes a great leader", "Leadership styles", "Self-awareness assessment"] },
  { title: "Module 2 - Communication & Influence", lessons: ["Active listening", "Persuasion & storytelling", "Difficult conversations"] },
  { title: "Module 3 - Building & Leading Teams", lessons: ["Trust & psychological safety", "Delegation", "Motivating your team"] },
  { title: "Module 4 - Decision Making", lessons: ["Frameworks for decisions", "Managing risk", "Leading through change"] },
  { title: "Module 5 - Capstone Project", lessons: ["Action plan", "Peer presentation", "Certification"] },
];

export default async function ProgramDetailPage({ params, searchParams }: { params: { id: string }; searchParams: { preview?: string; enrollerror?: string; review?: string } }) {
  const p = await getProgram(params.id, { preview: searchParams?.preview === "1" });
  const role = await currentUserRole();
  const isMentee = role === "mentee" || role === null; // logged-out visitors are treated as prospective mentees
  const enrollment = p && isMentee ? await isEnrolledInProgram(p.id) : false;
  const enrolledCount = p ? await countEnrollments(p.id) : 0;
  const progress = p ? await getProgramProgress(p.id) : null;
  // A row exists, but it only counts as "enrolled" once the mentor approves it.
  const pendingEnroll = enrollment && progress?.status === "pending";
  const enrolled = enrollment && !pendingEnroll;
  const payState = p && enrolled ? await getMyPaymentState(p.id) : null;
  const completedLessons = p && enrolled ? await getCompletedLessons(p.id) : [];
  const programReviews = p ? await getProgramReviews(p.id) : [];
  const reviewedAlready = p && enrolled ? await hasReviewedProgram(p.id) : false;
  if (!p) notFound();
  const all = await getPrograms();
  const learn = p.learn && p.learn.length ? p.learn : LEARN;
  const curriculum = p.curriculum && p.curriculum.length ? p.curriculum : CURRICULUM;
  const duration = p.durationLabel ?? `${p.weeks} weeks`;
  const about = p.about || p.description;
  const requirements = p.requirements ?? [];
  const related = all.filter((x) => x.id !== p.id).slice(0, 3);

  return (
    <div className="bg-slate-50">
      {searchParams?.enrollerror && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2.5 rounded-lg">Could not enroll - this program may not be available. Please try another program.</p>
        </div>
      )}
      <section className="cta-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white">
          <nav className="text-sm text-teal-50/80 mb-4">
            <Link href="/" className="hover:text-white">Home</Link> <span className="mx-1">›</span>
            <Link href="/programs" className="hover:text-white">Programs</Link> <span className="mx-1">›</span>
            <span className="text-white font-medium">{p.title}</span>
          </nav>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs font-semibold bg-white/15 px-2.5 py-1 rounded-full">{p.category}</span>
            <span className="text-xs font-semibold bg-white/15 px-2.5 py-1 rounded-full">{p.level}</span>
            {p.badge && <span className="text-xs font-semibold bg-teal px-2.5 py-1 rounded-full">{p.badge}</span>}
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight">{p.title}</h1>
          <p className="mt-3 text-teal-50/90 max-w-2xl">{p.description}</p>
          <div className="flex flex-wrap items-center gap-5 mt-5 text-sm">
            <span className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.face} alt={p.mentor} className="w-8 h-8 rounded-full object-cover" /> by{" "}
              <Link href={`/mentors/${p.mentorId}`} className="font-semibold text-white hover:underline">{p.mentor}</Link>
            </span>
            <span className="flex items-center gap-1"><span className="text-amber-300">★</span> {p.rating}</span>
            <span>{enrolledCount.toLocaleString()} enrolled</span>
            <span>{duration}</span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.img} alt={p.title} className="w-full h-64 object-cover rounded-2xl shadow-card" />

          <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
            <h2 className="text-xl font-bold text-navy mb-3">About this program</h2>
            <p className="text-slate-600 leading-relaxed">{about}</p>
            <h3 className="text-lg font-bold text-navy mt-7 mb-4">What you&apos;ll learn</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {learn.map((l) => (
                <div key={l} className="flex items-start gap-2 text-sm text-slate-600">
                  <svg className="w-5 h-5 text-teal shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>
                  <span>{l}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-navy">Curriculum</h3>
              <span className="text-sm text-slate-500">{p.lessons} lessons</span>
            </div>
            {enrolled ? <CurriculumTracker slug={p.id} modules={curriculum} completed={completedLessons} /> : <Accordion items={curriculum} />}
          </div>

          {requirements.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
              <h3 className="text-lg font-bold text-navy mb-4">Requirements</h3>
              <ul className="space-y-2">
                {requirements.map((r) => (<li key={r} className="flex items-start gap-2 text-sm text-slate-600"><span className="text-teal mt-0.5">&bull;</span><span>{r}</span></li>))}
              </ul>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-navy">Reviews</h3>
              <span className="text-sm text-slate-500"><span className="text-amber-400">&#9733;</span> {p.rating || "0"} · {programReviews.length} review{programReviews.length === 1 ? "" : "s"}</span>
            </div>
            {searchParams?.review === "thanks" && <p className="text-sm text-teal-700 bg-teal-50 px-4 py-2.5 rounded-lg mb-4">Thanks! Your rating has been posted.</p>}
            {searchParams?.review === "notenrolled" && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2.5 rounded-lg mb-4">Enroll in this program before rating it.</p>}
            {searchParams?.review === "empty" && <p className="text-sm text-rose-600 bg-rose-50 px-4 py-2.5 rounded-lg mb-4">Please write something before submitting.</p>}
            {programReviews.length === 0 ? (
              <p className="text-sm text-slate-500">No reviews yet. {enrolled ? "Be the first to rate this program below." : "Enroll to rate this program."}</p>
            ) : (
              <div className="space-y-4">
                {programReviews.map((r) => (
                  <div key={r.id} className="flex gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {r.avatar ? <img src={r.avatar} alt={r.author} className="w-9 h-9 rounded-full object-cover shrink-0" /> : <span className="w-9 h-9 rounded-full bg-gradient-to-br from-navy to-teal grid place-items-center text-white text-xs font-bold shrink-0">{r.author.charAt(0)}</span>}
                    <div>
                      <div className="flex items-center gap-2"><p className="font-semibold text-navy text-sm">{r.author}</p><span className="text-amber-400 text-xs">{"\u2605".repeat(r.rating)}</span></div>
                      <p className="text-sm text-slate-600 mt-0.5">{r.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {enrolled && <div className="mt-6"><ProgramReviewForm slug={p.id} alreadyReviewed={reviewedAlready} /></div>}
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
            <h3 className="text-lg font-bold text-navy mb-4">Your Mentor</h3>
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.face} alt={p.mentor} className="w-16 h-16 rounded-full object-cover" />
              <div>
                <p className="font-bold text-navy">{p.mentor}</p>
                <p className="text-sm text-slate-500">Mentor on MentorBay</p>
              </div>
            </div>
            <Link href={`/mentors/${p.mentorId}`} className="inline-block mt-4 text-sm font-semibold text-teal-600 hover:underline">View full profile →</Link>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 space-y-4">
          {payState && (
            <ProgramPaymentPanel slug={p.id} price={payState.price} paid={payState.paid} balance={payState.balance} fullyPaid={payState.fullyPaid} maxInstallments={payState.maxInstallments} />
          )}
          {enrolled && progress && (
            <ProgramProgressPanel slug={p.id} pct={progress.pct} status={progress.status} lessons={p.lessons} />
          )}
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.img} alt="" className="w-full h-36 object-cover" />
            <div className="p-6">
              <div className="flex items-end gap-2">
                {p.isPaid && (p.priceKes ?? 0) > 0 ? (
                  <span className="text-3xl font-extrabold text-navy">KES {(p.priceKes ?? 0).toLocaleString("en-KE")}</span>
                ) : (
                  <span className="text-3xl font-extrabold text-navy">Free</span>
                )}
              </div>
              {p.isPaid && (p.priceKes ?? 0) > 0 ? (
                <p className="text-xs text-slate-500 font-medium mt-1">{(p.maxInstallments ?? 1) > 1 ? `Pay in full or up to ${p.maxInstallments} installments` : "One-time payment"}</p>
              ) : (
                <p className="text-xs text-teal-600 font-medium mt-1">Free program</p>
              )}
              {isMentee ? (
                <EnrollButton slug={p.id} enrolled={enrolled} pending={!!pendingEnroll} />
              ) : (
                <p className="mt-4 text-center text-sm text-slate-500 bg-slate-50 rounded-lg py-3">Enrolling is for mentees. {role === "mentor" ? "You're viewing this as a mentor." : "Switch to a mentee account to enroll."}</p>
              )}
              <ul className="mt-5 pt-5 border-t border-slate-100 space-y-3 text-sm">
                <li className="flex justify-between"><span className="text-slate-500">Duration</span><span className="font-semibold text-navy">{duration}</span></li>
                <li className="flex justify-between"><span className="text-slate-500">Lessons</span><span className="font-semibold text-navy">{p.lessons} lessons</span></li>
                <li className="flex justify-between"><span className="text-slate-500">Level</span><span className="font-semibold text-navy">{p.level}</span></li>
                <li className="flex justify-between"><span className="text-slate-500">Certificate</span><span className="font-semibold text-navy">Yes</span></li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h3 className="text-xl font-bold text-navy mb-5">Related Programs</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {related.map((r) => <ProgramCard key={r.id} program={r} />)}
        </div>
      </section>
    </div>
  );
}
