import Link from "next/link";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Contact Us - MentorBay" };

export default async function ContactPage() {
  const { supportEmail } = await getSettings();
  const to = supportEmail || "support@mentorbay.app";
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <p className="text-sm font-semibold text-teal-600">Support</p>
      <h1 className="text-3xl lg:text-4xl font-extrabold text-navy mt-1">Contact Us</h1>
      <p className="text-slate-600 mt-3">
        Questions, feedback or partnership ideas? We&apos;d love to hear from you. Fill in the form below or email us
        directly and we&apos;ll get back to you as soon as we can.
      </p>

      <div className="mt-10 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl shadow-card p-6">
          {/* Mailto form: opens the visitor's email client pre-filled. Works without a backend. */}
          <form action={`mailto:${to}`} method="post" encType="text/plain" className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Your name</label>
              <input name="Name" required className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Your email</label>
              <input name="Email" type="email" required className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Subject</label>
              <input name="Subject" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Message</label>
              <textarea name="Message" rows={5} required className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none" />
            </div>
            <button className="px-6 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Send message</button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-50 rounded-2xl p-5">
            <h3 className="font-semibold text-navy text-sm">Email</h3>
            <a href={`mailto:${to}`} className="text-sm text-teal-600 hover:underline break-all">{to}</a>
          </div>
          <div className="bg-slate-50 rounded-2xl p-5">
            <h3 className="font-semibold text-navy text-sm">Location</h3>
            <p className="text-sm text-slate-600">Nairobi, Kenya</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-5">
            <h3 className="font-semibold text-navy text-sm">Response time</h3>
            <p className="text-sm text-slate-600">We typically reply within 1-2 business days.</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-5">
            <h3 className="font-semibold text-navy text-sm">Looking for quick answers?</h3>
            <Link href="/help" className="text-sm text-teal-600 font-semibold hover:underline">Visit the Help Center &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
