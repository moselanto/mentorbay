"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoWordmark } from "@/components/Logo";
import SignOutButton from "@/components/SignOutButton";

export type NavItem = { label: string; href: string; icon: keyof typeof ICONS; ready?: boolean };

const ICONS = {
  home: "m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  user: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
  chart: "M3 3v18h18 M18 17V9 M13 17V5 M8 17v-3",
  calendar: "M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  award: "M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M8.21 13.89 7 23l5-3 5 3-1.21-9.12",
  mail: "M22 6 12 13 2 6 M2 6h20v12H2z",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  clipboard: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2 M9 2h6a1 1 0 0 1 1 1v2H8V3a1 1 0 0 1 1-1z",
  plus: "M12 5v14 M5 12h14",
  star: "m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6",
  dollar: "M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  flag: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22v-7",
} as const;

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {ICONS[name].split(" M").map((seg, i) => (
        <path key={i} d={(i === 0 ? seg : "M" + seg)} />
      ))}
    </svg>
  );
}

export default function DashboardShell({
  roleLabel,
  nav,
  userName,
  avatarUrl = null,
  theme = "light",
  children,
}: {
  roleLabel: string;
  nav: NavItem[];
  userName: string;
  avatarUrl?: string | null;
  theme?: "light" | "dark";
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dark = theme === "dark";

  const sidebar = dark ? "bg-navy text-slate-200" : "bg-white text-slate-600 border-r border-slate-100";
  const activeCls = dark ? "bg-teal text-white" : "bg-teal-50 text-teal-700";
  const idleCls = dark ? "hover:bg-white/10" : "hover:bg-slate-50";

  const links = (
    <nav className="px-3 space-y-1">
      {nav.map((item) => {
        const active = pathname === item.href;
        if (item.ready === false) {
          return (
            <span key={item.label} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium opacity-40 cursor-not-allowed ${dark ? "text-slate-400" : "text-slate-400"}`}>
              <Icon name={item.icon} /> {item.label}
              <span className="ml-auto text-[10px] uppercase tracking-wide">Soon</span>
            </span>
          );
        }
        return (
          <Link key={item.label} href={item.href} onClick={() => setOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${active ? activeCls : idleCls}`}>
            <Icon name={item.icon} /> {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      {/* Sidebar (desktop) */}
      <aside className={`hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 ${sidebar}`}>
        <div className="h-16 flex items-center px-5 shrink-0">
          <Link href="/"><LogoWordmark /></Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4">{links}</div>
        <div className={`p-4 text-xs ${dark ? "text-slate-400 border-t border-white/10" : "text-slate-400 border-t border-slate-100"}`}>{roleLabel} workspace</div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className={`absolute inset-y-0 left-0 w-64 flex flex-col ${sidebar}`}>
            <div className="h-16 flex items-center px-5"><LogoWordmark /></div>
            <div className="flex-1 overflow-y-auto py-4">{links}</div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="lg:pl-64 flex-1 min-w-0">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-500" aria-label="Open menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <span className="text-sm font-semibold text-navy">{roleLabel} Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 hidden sm:inline">{userName}</span>
            <span className="w-9 h-9 rounded-full bg-teal-50 text-teal-700 grid place-items-center text-sm font-bold overflow-hidden">{avatarUrl ? (/* eslint-disable-next-line @next/next/no-img-element */ <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />) : (userName?.[0]?.toUpperCase() ?? "U")}</span>
            <SignOutButton />
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
