import DashboardShell, { type NavItem } from "@/components/DashboardShell";
import { requireRole } from "@/lib/dashboard-access";

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/mentee", icon: "home" },
  { label: "My Mentor", href: "/mentee/my-mentor", icon: "user", ready: false },
  { label: "Programs", href: "/mentee/programs", icon: "book", ready: false },
  { label: "Progress", href: "/mentee/progress", icon: "chart", ready: false },
  { label: "Sessions", href: "/mentee/sessions", icon: "calendar", ready: false },
  { label: "Certificates", href: "/mentee/certificates", icon: "award", ready: false },
  { label: "Messages", href: "/mentee/messages", icon: "mail", ready: false },
  { label: "Settings", href: "/mentee/settings", icon: "settings", ready: false },
];

export default async function MenteeLayout({ children }: { children: React.ReactNode }) {
  const { userName } = await requireRole("mentee");
  return (
    <DashboardShell roleLabel="Mentee" nav={NAV} userName={userName}>
      {children}
    </DashboardShell>
  );
}
