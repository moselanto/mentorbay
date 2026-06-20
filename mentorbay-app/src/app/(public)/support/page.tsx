import Link from "next/link";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Support - MentorBay" };

export default async function SupportPage() {
  const { supportEmail } = await getSettings();
  const cards = [
    { href: "/help", title: "Help Center", desc: "Browse FAQs and step-by-step guidance for mentees and mentors." },
    { href: "/contact", title: "Contact Us", desc: "Reach our team directly with a question, issue or partnership idea." },
    { href: "/terms", title: "Terms of Service", desc: "The rules and agreement governing your use of MentorBay." },
    { href: "/privacy", title: "Privacy Policy", desc: "How we collect, use and protect your personal information." },
  ];
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <p className="text-sm font-semibold text-teal-600">We&apos;re here to help</p>
      <h1 className="text-3xl lg:text-4xl font-extrabold text-navy mt-1">Support</h1>
      <p className="text-slate-600 mt-3 max-w-2xl">
        Find answers, get in touch, or review our policies. {supportEmail && (
          <>You can also email us anytime at <a href={`mailto:${supportEmail}`} className="text-teal-600 font-semibold hover:underline">{supportEmail}</a>.</>
        )}
      </p>
      <div className="mt-10 grid sm:grid-cols-2 gap-5">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="bg-white rounded-2xl shadow-card p-6 hover:-translate-y-1 transition block">
            <h2 className="font-bold text-navy">{c.title}</h2>
            <p className="text-sm text-slate-600 mt-2">{c.desc}</p>
            <span className="inline-block mt-4 text-sm font-semibold text-teal-600">Open &rarr;</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
