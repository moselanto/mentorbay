import type { Metadata } from "next";
import Link from "next/link";
import { getMentors } from "@/lib/mentors";
import MentorBrowser from "./MentorBrowser";

export const metadata: Metadata = { title: "Browse Mentors — MentorBay" };

// Server Component. Reads live mentors from Supabase via getMentors(), which
// falls back to demo data until Supabase is configured. The filtering UI lives
// in the MentorBrowser Client Component.
export default async function MentorsPage() {
  const mentors = await getMentors();

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <nav className="text-sm text-slate-500 mb-3">
          <Link href="/" className="hover:text-teal">Home</Link>
          <span className="mx-1">›</span>
          <span className="text-slate-700 font-medium">Mentors</span>
        </nav>
        <h1 className="text-3xl lg:text-4xl font-extrabold text-navy">Browse Mentors</h1>
        <p className="text-slate-500 mt-2">Connect with verified mentors and experts across Kenya and Africa.</p>
      </div>
      <MentorBrowser mentors={mentors} />
    </div>
  );
}
