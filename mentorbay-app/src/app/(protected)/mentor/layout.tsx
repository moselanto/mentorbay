import DashboardShell, { type NavItem } from "@/components/DashboardShell";
import { requireRole } from "@/lib/dashboard-access";

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/mentor", icon: "home" },
  { label: "Mentees", href: "/mentor/mentees", icon: "users", ready: false },
  { label: "Applications", href: "/mentor/applications", icon: "clipboard", ready: false },
  { label: "Programs", href: "/mentor/programs", icon: "book", ready: false },
  { label: "Create Program", href: "/mentor/create-program", icon: "plus", ready: false },
  { label: "Sessions", href: "/mentor/sessions", icon: "calendar", ready: false },
  { label: "Events", href: "/mentor/events", icon: "calendar", ready: false },
  { label: "Reviews", href: "/mentor/reviews", icon: "star", ready: false },
  { label: "Articles", href: "/mentor/articles", icon: "file", ready: false },
  { label: "Earnings", href: "/mentor/earnings", icon: "dollar", ready: false },
  { label: "Settings", href: "/mentor/settings", icon: "settings", ready: false },
];

export default async function MentorLayout({ children }: { children: React.ReactNode }) {
  const { userName } = await requireRole("mentor");
  return (
    <DashboardShell roleLabel="Mentor" nav={NAV} userName={userName}>
      {children}
    </DashboardShell>
  );
}
