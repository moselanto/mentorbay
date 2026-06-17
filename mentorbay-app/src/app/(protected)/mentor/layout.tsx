import DashboardShell, { type NavItem } from "@/components/DashboardShell";
import { requireRole } from "@/lib/dashboard-access";

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/mentor", icon: "home" },
  { label: "Mentees", href: "/mentor/mentees", icon: "users" },
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
  const { userName } = await requireRole("mentor");
  return (
    <DashboardShell roleLabel="Mentor" nav={NAV} userName={userName}>
      {children}
    </DashboardShell>
  );
}
