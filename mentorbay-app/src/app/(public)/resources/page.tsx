import type { Metadata } from "next";
import Link from "next/link";
import { RESOURCES } from "@/lib/data";
import ResourceBrowser from "./ResourceBrowser";
import NewsletterSignup from "@/components/NewsletterSignup";

export const metadata: Metadata = { title: "Resources — MentorBay" };

export default function ResourcesPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <nav className="text-sm text-slate-500 mb-3">
          <Link href="/" className="hover:text-teal">Home</Link>
          <span className="mx-1">›</span>
          <span className="text-slate-700 font-medium">Resources</span>
        </nav>
        <h1 className="text-3xl lg:text-4xl font-extrabold text-navy">Learning Resources</h1>
        <p className="text-slate-500 mt-2">Free articles, videos, courses, and guides from Africa&apos;s top mentors to help you grow.</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ResourceBrowser resources={RESOURCES} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <NewsletterSignup />
      </div>
    </div>
  );
}
