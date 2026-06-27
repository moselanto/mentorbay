import Link from "next/link";
import { notFound } from "next/navigation";
import { getMyCertificates } from "@/lib/enrollments";
import { getProgram } from "@/lib/programs";
import { requireRole } from "@/lib/dashboard-access";
import PrintButton from "@/components/PrintButton";
import { Logo } from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function CertificatePage({ params }: { params: { slug: string } }) {
  const { userName } = await requireRole("mentee");
  const certs = await getMyCertificates();
  const cert = certs.find((c) => c.slug === params.slug);
  if (!cert) notFound();

  // Pull the program so the BACK of the certificate can list the courses /
  // modules completed. Primary source is the curriculum module titles; if the
  // mentor didn't publish a curriculum we fall back to the "What you'll learn"
  // outcomes, then to a graceful empty state - so the back always renders.
  const program = await getProgram(cert.slug).catch(() => null);
  const curriculumTitles: string[] = Array.isArray(program?.curriculum)
    ? (program!.curriculum as { title?: string }[]).map((m) => m?.title ?? "").filter(Boolean)
    : [];
  const learn: string[] = Array.isArray(program?.learn) ? (program!.learn as string[]) : [];
  const courses = (curriculumTitles.length > 0 ? curriculumTitles : learn).filter(Boolean);

  // A short verification id derived from the slug + issue date, printed on both
  // pages so the front and back are clearly two halves of one document.
  const verifyId = `MB-${cert.slug.replace(/[^a-z0-9]/gi, "").slice(0, 6).toUpperCase()}-${(cert.issuedAt || "").replace(/[^0-9]/g, "").slice(-6) || "000000"}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/mentee/certificates" className="text-sm text-slate-500 hover:text-teal-600">&larr; Certificates</Link>
        <PrintButton />
      </div>

      {/* Both pages live inside the print area. Each .cert-page is sized to a
          landscape sheet and forced onto its own sheet when printing. */}
      <div className="cert-print-area space-y-8 print:space-y-0">

        {/* ============================ FRONT ============================ */}
        <article className="cert-page relative mx-auto w-full max-w-4xl aspect-[1.414/1] bg-white rounded-2xl shadow-card overflow-hidden print:shadow-none print:rounded-none">
          {/* Decorative frame */}
          <div className="absolute inset-3 rounded-xl border border-teal/30" />
          <div className="absolute inset-4 rounded-lg border-2 border-double border-navy/40" />
          {/* Corner flourishes */}
          <span className="absolute top-5 left-5 w-10 h-10 border-t-2 border-l-2 border-teal/60 rounded-tl-lg" />
          <span className="absolute top-5 right-5 w-10 h-10 border-t-2 border-r-2 border-teal/60 rounded-tr-lg" />
          <span className="absolute bottom-5 left-5 w-10 h-10 border-b-2 border-l-2 border-teal/60 rounded-bl-lg" />
          <span className="absolute bottom-5 right-5 w-10 h-10 border-b-2 border-r-2 border-teal/60 rounded-br-lg" />

          <div className="relative h-full flex flex-col items-center justify-center text-center px-10 sm:px-16 py-10">
            <div className="flex flex-col items-center">
              <Logo className="h-14 w-14" />
              <p className="mt-2 text-lg font-extrabold tracking-tight text-navy">Mentor<span className="text-teal">Bay</span></p>
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-teal-600">Certificate of Completion</p>
            <div className="mt-2 h-px w-24 bg-gradient-to-r from-transparent via-teal/50 to-transparent" />

            <p className="text-slate-500 mt-6 text-sm">This is proudly presented to</p>
            <p className="font-serif text-4xl sm:text-5xl font-bold text-navy mt-3 leading-tight">{userName}</p>
            <div className="mt-3 h-px w-48 bg-slate-200" />

            <p className="text-slate-500 mt-5 text-sm max-w-xl">
              for successfully completing the program
            </p>
            <p className="text-2xl font-semibold text-teal-700 mt-2">{cert.title}</p>

            <p className="text-slate-500 mt-5 text-sm">
              Mentored by <span className="font-semibold text-navy">{cert.mentor}</span>
            </p>

            {/* Pointer to the back page */}
            <p className="mt-6 text-xs italic text-slate-500">
              Please see the back of the certificate for courses completed.
            </p>

            {/* Signature / issue row */}
            <div className="w-full max-w-2xl flex items-end justify-between mt-auto pt-8">
              <div className="text-center">
                <p className="text-sm font-semibold text-navy border-t border-slate-300 pt-1 px-8">{cert.issuedAt}</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-1">Date issued</p>
              </div>
              <div className="text-center">
                <Logo className="h-7 w-7 mx-auto" />
                <p className="text-sm font-semibold text-navy border-t border-slate-300 pt-1 px-8 mt-1">MentorBay</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-1">Issued by</p>
              </div>
            </div>

            <p className="absolute bottom-3 text-[10px] text-slate-400">Certificate ID: {verifyId} &middot; Page 1 of 2</p>
          </div>
        </article>

        {/* ============================ BACK ============================ */}
        <article className="cert-page cert-page-back relative mx-auto w-full max-w-4xl aspect-[1.414/1] bg-white rounded-2xl shadow-card overflow-hidden print:shadow-none print:rounded-none">
          <div className="absolute inset-3 rounded-xl border border-teal/30" />
          <div className="absolute inset-4 rounded-lg border-2 border-double border-navy/40" />

          <div className="relative h-full flex flex-col px-10 sm:px-16 py-10">
            <div className="flex items-center justify-center gap-2">
              <Logo className="h-8 w-8" />
              <p className="text-base font-extrabold tracking-tight text-navy">Mentor<span className="text-teal">Bay</span></p>
            </div>

            <h2 className="text-center text-xl font-bold text-navy mt-6">Courses Completed</h2>
            <p className="text-center text-sm text-slate-500 mt-1">{cert.title}</p>
            <div className="mx-auto mt-3 h-px w-24 bg-gradient-to-r from-transparent via-teal/50 to-transparent" />

            <div className="flex-1 overflow-hidden mt-6">
              {courses.length > 0 ? (
                <ol className="grid sm:grid-cols-2 gap-x-10 gap-y-3 max-w-3xl mx-auto list-none">
                  {courses.map((c, i) => (
                    <li key={`${c}-${i}`} className="flex items-start gap-3 text-sm text-slate-700">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-teal-50 text-teal-700 text-xs font-bold grid place-items-center mt-0.5">{i + 1}</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-center text-sm text-slate-500 mt-10">
                  A detailed list of courses for this program is not available.
                </p>
              )}
            </div>

            <div className="text-center mt-6">
              <p className="text-xs text-slate-500">Awarded to <span className="font-semibold text-navy">{userName}</span> &middot; Mentored by <span className="font-semibold text-navy">{cert.mentor}</span></p>
              <p className="text-[10px] text-slate-400 mt-2">Certificate ID: {verifyId} &middot; Page 2 of 2</p>
            </div>
          </div>
        </article>
      </div>

      <p className="text-center text-xs text-slate-400 print:hidden">Tip: use your browser&apos;s print dialog to save as PDF. The front and back print on separate pages.</p>
    </div>
  );
}
