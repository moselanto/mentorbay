export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { getEvents } from "@/lib/events";
import EventBrowser from "./EventBrowser";

export const metadata: Metadata = { title: "Events — MentorBay" };

export default async function EventsPage() {
  const events = await getEvents();
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <nav className="text-sm text-slate-500 mb-3">
          <Link href="/" className="hover:text-teal">Home</Link>
          <span className="mx-1">›</span>
          <span className="text-slate-700 font-medium">Events</span>
        </nav>
        <h1 className="text-3xl lg:text-4xl font-extrabold text-navy">Events</h1>
        <p className="text-slate-500 mt-2">Workshops, summits, and masterclasses with Africa&apos;s leading mentors - online and across Kenya.</p>
      </div>
      <EventBrowser events={events} />
    </div>
  );
}
