import DashboardShell, { type NavItem } from "@/components/DashboardShell";
import { requireRole } from "@/lib/dashboard-access";

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
  const { userName, avatarUrl } = await requireRole("mentee");
  return (
    <DashboardShell roleLabel="Mentee" nav={NAV} userName={userName} avatarUrl={avatarUrl}>
      {children}
    </DashboardShell>
  );
}
