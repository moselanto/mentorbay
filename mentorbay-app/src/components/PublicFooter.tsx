import Link from "next/link";
import { Logo } from "./Logo";

export default function PublicFooter() {
  return (
    <footer className="bg-navy text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid md:grid-cols-2 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Logo light className="h-9 w-9" />
            <span className="text-xl font-extrabold text-white">
              Mentor<span className="text-teal-400">Bay</span>
            </span>
          </div>
          <p className="text-sm text-slate-400 max-w-xs">
            Connecting ambitious African learners with exceptional mentors to build a better future.
          </p>
          <p className="text-sm font-semibold text-teal-400 mt-3">Connect · Grow · Succeed</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Platform</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/mentors" className="hover:text-teal-400">Browse Mentors</Link></li>
            <li><Link href="/programs" className="hover:text-teal-400">Programs</Link></li>
            <li><Link href="/events" className="hover:text-teal-400">Events</Link></li>
            <li><Link href="/success-stories" className="hover:text-teal-400">Success Stories</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">For Mentors</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/signup" className="hover:text-teal-400">Become a Mentor</Link></li>
            <li><Link href="/resources" className="hover:text-teal-400">Mentor Resources</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/help" className="hover:text-teal-400">Help Center</Link></li>
            <li><Link href="/contact" className="hover:text-teal-400">Contact Us</Link></li>
            <li><Link href="/terms" className="hover:text-teal-400">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-teal-400">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-sm text-slate-400">
        © 2026 MentorBay. All rights reserved. Made in Nairobi, Kenya.
      </div>
    </footer>
  );
}
