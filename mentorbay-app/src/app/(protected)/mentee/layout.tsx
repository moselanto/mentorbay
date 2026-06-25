export const dynamic = "force-dynamic";

import DashboardShell, { type NavItem } from "@/components/DashboardShell";
import { requireRole } from "@/lib/dashboard-access";
import { getUnreadCount } from "@/lib/messages";
import MessagesRealtime from "@/components/MessagesRealtime";
import ApprovalGate from "@/components/ApprovalGate";

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/mentee", icon: "home" },
  { label: "My Mentor", href: "/mentee/my-mentor", icon: "user" },
  { label: "Programs", href: "/mentee/programs", icon: "book" },
  { label: "Events", href: "/mentee/events", icon: "calendar" },
  { label: "Progress", href: "/mentee/progress", icon: "chart" },
  { label: "Sessions", href: "/mentee/sessions", icon: "calendar" },
  { label: "Certificates", href: "/mentee/certificates", icon: "award" },
  { label: "Messages", href: "/mentee/messages", icon: "mail" },
  { label: "Settings", href: "/mentee/settings", icon: "settings" },
];

export default async function MenteeLayout({ children }: { children: React.ReactNode }) {
  const { userId, userName, avatarUrl, approvalStatus, suspended } = await requireRole("mentee");
  const unread = await getUnreadCount();
  const nav = NAV.map((n) => (n.href === "/mentee/messages" ? { ...n, badge: unread } : n));
  return (
    <>
    <MessagesRealtime userId={userId} />
    <DashboardShell roleLabel="Mentee" nav={nav} userName={userName} avatarUrl={avatarUrl}>
      <ApprovalGate approvalStatus={approvalStatus} suspended={suspended} roleLabel="Mentee">{children}</ApprovalGate>
    </DashboardShell>
    </>
  );
}
