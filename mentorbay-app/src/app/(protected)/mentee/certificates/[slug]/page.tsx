import Link from "next/link";
import { notFound } from "next/navigation";
import { getMyCertificates } from "@/lib/enrollments";
import { requireRole } from "@/lib/dashboard-access";
import PrintButton from "@/components/PrintButton";
import { Logo } from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function CertificatePage({ params }: { params: { slug: string } }) {
  const { userName } = await requireRole("mentee");
  const certs = await getMyCertificates();
  const cert = certs.find((c) => c.slug === params.slug);
  if (!cert) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/mentee/certificates" className="text-sm text-slate-500 hover:text-teal-600">&larr; Certificates</Link>
        <PrintButton />
      </div>

      {/* The certificate itself - this is the only thing that prints (see cert-print-area in globals.css) */}
      <div className="cert-print-area bg-white rounded-2xl shadow-card mx-auto max-w-3xl print:shadow-none">
        <div className="m-3 border-4 border-double border-navy/40 rounded-xl p-10 text-center">
          <div className="flex flex-col items-center">
            <Logo className="h-14 w-14" />
            <p className="mt-2 text-lg font-extrabold text-navy">Mentor<span className="text-teal">Bay</span></p>
          </div>
          <h1 className="text-3xl font-extrabold text-navy mt-6">Certificate of Completion</h1>
          <p className="text-slate-500 mt-6">This certifies that</p>
          <p className="text-2xl font-bold text-navy mt-2">{userName}</p>
          <p className="text-slate-500 mt-4">has successfully completed the program</p>
          <p className="text-xl font-semibold text-teal-700 mt-2">{cert.title}</p>
          <p className="text-slate-500 mt-6">Mentored by <span className="font-semibold text-navy">{cert.mentor}</span></p>
          <div className="flex items-center justify-between mt-12 px-6">
            <div className="text-center">
              <p className="text-sm font-semibold text-navy border-t border-slate-300 pt-1 px-6">{cert.issuedAt}</p>
              <p className="text-xs text-slate-400 mt-1">Date issued</p>
            </div>
            <div className="text-center">
              <Logo className="h-8 w-8 mx-auto" />
              <p className="text-sm font-semibold text-navy border-t border-slate-300 pt-1 px-6 mt-1">MentorBay</p>
              <p className="text-xs text-slate-400 mt-1">Issued by</p>
            </div>
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-slate-400 print:hidden">Tip: use your browser&apos;s print dialog to save as PDF.</p>
    </div>
  );
}
