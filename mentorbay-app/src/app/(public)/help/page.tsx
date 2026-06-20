import Link from "next/link";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Help Center - MentorBay" };

const FAQS: { q: string; a: string }[] = [
  { q: "How do I find and connect with a mentor?", a: "Browse the Mentors page, open a mentor's profile to see their expertise, programs and availability, then request a session or apply to a program. Once the mentor accepts, you'll be connected." },
  { q: "Is MentorBay free?", a: "Yes. During our launch, programs and mentor sessions are free. We'll always make it clear before anything carries a cost." },
  { q: "How do I become a mentor?", a: "Click 'Become a Mentor' and sign up with the mentor role. Your account is reviewed by our team, and once approved you can publish programs, events and sessions." },
  { q: "Why is my mentor account 'pending'?", a: "New mentor accounts are reviewed before going live to keep quality high. You'll get an email the moment your account is approved." },
  { q: "How do programs and events get published?", a: "Mentor-created programs, events and sessions are submitted for a quick admin review. Once approved, they appear publicly and the mentor is notified by email." },
  { q: "How do I update my profile or avatar?", a: "Go to your dashboard Settings. You can edit your name, headline, bio, location, languages and upload an avatar there." },
  { q: "I forgot my password.", a: "Use the 'Forgot password' link on the login page. We'll email you a secure link to reset it." },
  { q: "How do I report a problem or inappropriate content?", a: "Use the Contact Us page or email our support team. Reviews and content can be flagged for moderation by our admins." },
];

export default async function HelpCenterPage() {
  const { supportEmail } = await getSettings();
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <p className="text-sm font-semibold text-teal-600">Support</p>
      <h1 className="text-3xl lg:text-4xl font-extrabold text-navy mt-1">Help Center</h1>
      <p className="text-slate-600 mt-3">
        Answers to the questions we hear most. Can&apos;t find what you need? <Link href="/contact" className="text-teal-600 font-semibold hover:underline">Contact us</Link>.
      </p>

      <div className="mt-10 space-y-4">
        {FAQS.map((f) => (
          <details key={f.q} className="group bg-white rounded-2xl shadow-card p-5 open:ring-1 open:ring-teal-100">
            <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-navy">
              {f.q}
              <span className="ml-4 text-teal-500 transition group-open:rotate-45 text-xl leading-none">+</span>
            </summary>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>

      <div className="mt-12 bg-slate-50 rounded-2xl p-6 text-center">
        <h2 className="font-bold text-navy">Still need help?</h2>
        <p className="text-sm text-slate-600 mt-1">Our team is happy to assist.</p>
        <div className="mt-4 flex flex-wrap gap-3 justify-center">
          <Link href="/contact" className="px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Contact Us</Link>
          {supportEmail && (
            <a href={`mailto:${supportEmail}`} className="px-5 py-2.5 bg-white border border-slate-200 text-navy text-sm font-semibold rounded-lg hover:border-teal transition">Email Support</a>
          )}
        </div>
      </div>
    </div>
  );
}
