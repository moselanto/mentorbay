import type { Metadata } from "next";
import Link from "next/link";
import { MENTORS } from "@/lib/data";
import MentorBrowser from "./MentorBrowser";

export const metadata: Metadata = { title: "Browse Mentors — MentorBay" };

// Server Component: in Phase 5 this becomes
//   const { data: mentors } = await supabase.from('mentor_profiles').select(...).eq('status','approved');
// For now we pass the demo MENTORS array straight to the client browser component.
export default function MentorsPage() {
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
      <MentorBrowser mentors={MENTORS} />
    </div>
  );
}
