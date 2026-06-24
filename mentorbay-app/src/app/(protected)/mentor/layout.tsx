export const dynamic = "force-dynamic";

import DashboardShell, { type NavItem } from "@/components/DashboardShell";
import { requireRole } from "@/lib/dashboard-access";
import { getUnreadCount } from "@/lib/messages";
import MessagesRealtime from "@/components/MessagesRealtime";

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/mentor", icon: "home" },
  { label: "Mentees", href: "/mentor/mentees", icon: "users" },
  { label: "Messages", href: "/mentor/messages", icon: "mail" },
  { label: "Applications", href: "/mentor/applications", icon: "clipboard" },
  { label: "Programs", href: "/mentor/programs", icon: "book" },
  { label: "Create Program", href: "/mentor/create-program", icon: "plus" },
  { label: "Sessions", href: "/mentor/sessions", icon: "calendar" },
  { label: "Events", href: "/mentor/events", icon: "calendar" },
  { label: "Reviews", href: "/mentor/reviews", icon: "star" },
  { label: "Articles", href: "/mentor/articles", icon: "file" },
  { label: "Earnings", href: "/mentor/earnings", icon: "dollar" },
  { label: "Settings", href: "/mentor/settings", icon: "settings" },
];

export default async function MentorLayout({ children }: { children: React.ReactNode }) {
  const { userId, userName, avatarUrl, approvalStatus } = await requireRole("mentor");
  const unread = await getUnreadCount();
  const nav = NAV.map((n) => (n.href === "/mentor/messages" ? { ...n, badge: unread } : n));
  return (
    <>
    <MessagesRealtime userId={userId} />
    <DashboardShell roleLabel="Mentor" nav={nav} userName={userName} avatarUrl={avatarUrl}>
      {approvalStatus !== "approved" && (
        <div className={`mb-6 rounded-xl border p-4 text-sm ${approvalStatus === "rejected" ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
          {approvalStatus === "rejected" ? (
            <span><span className="font-semibold">Your mentor application was not approved.</span> Please contact support if you believe this is a mistake.</span>
          ) : (
            <span><span className="font-semibold">Your mentor account is pending admin approval.</span> You can edit your profile now, but creating programs, events, and sessions is disabled until an admin approves you.</span>
          )}
        </div>
      )}
      {children}
    </DashboardShell>
    </>
  );
}
