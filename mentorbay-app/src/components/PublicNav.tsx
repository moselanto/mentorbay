"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogoWordmark } from "./Logo";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/mentors", label: "Mentors" },
  { href: "/programs", label: "Programs" },
  { href: "/events", label: "Events" },
  { href: "/success-stories", label: "Success Stories" },
  { href: "/resources", label: "Resources" },
];

export default function PublicNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="shrink-0">
            <LogoWordmark />
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={isActive(l.href) ? "text-teal font-semibold" : "hover:text-teal transition"}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-navy border border-slate-200 rounded-lg hover:border-teal hover:text-teal transition"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-semibold text-white bg-navy rounded-lg hover:bg-navy-700 transition"
            >
              Join Now
            </Link>
          </div>

          <button onClick={() => setOpen((v) => !v)} className="lg:hidden p-2 text-navy" aria-label="Menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`block py-2 font-medium ${isActive(l.href) ? "text-teal" : "text-slate-700"}`}
            >
              {l.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-3">
            <Link href="/login" className="flex-1 text-center px-4 py-2 text-sm font-semibold text-navy border border-slate-200 rounded-lg">
              Login
            </Link>
            <Link href="/signup" className="flex-1 text-center px-4 py-2 text-sm font-semibold text-white bg-navy rounded-lg">
              Join Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
