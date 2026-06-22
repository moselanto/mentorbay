import type { Metadata } from "next";
import Link from "next/link";
import { getPrograms } from "@/lib/programs";
import { getMyEnrolledSlugs } from "@/lib/enrollments";
import ProgramBrowser from "./ProgramBrowser";

export const metadata: Metadata = { title: "Programs — MentorBay" };

export default async function ProgramsPage() {
  const [programs, enrolledSlugs] = await Promise.all([getPrograms(), getMyEnrolledSlugs()]);
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <nav className="text-sm text-slate-500 mb-3">
          <Link href="/" className="hover:text-teal">Home</Link>
          <span className="mx-1">›</span>
          <span className="text-slate-700 font-medium">Programs</span>
        </nav>
        <h1 className="text-3xl lg:text-4xl font-extrabold text-navy">Mentorship Programs</h1>
        <p className="text-slate-500 mt-2">Structured programs led by Africa&apos;s top mentors. Learn, practice, and grow - free during launch.</p>
      </div>
      <ProgramBrowser programs={programs} enrolledSlugs={enrolledSlugs} />
    </div>
  );
}
