import DashboardShell, { type NavItem } from "@/components/DashboardShell";
import { requireRole } from "@/lib/dashboard-access";

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "home" },
  { label: "Approvals", href: "/admin/approvals", icon: "clipboard", ready: false },
  { label: "Users", href: "/admin/users", icon: "users", ready: false },
  { label: "Moderation", href: "/admin/moderation", icon: "flag", ready: false },
  { label: "Reports", href: "/admin/reports", icon: "chart", ready: false },
  { label: "Settings", href: "/admin/settings", icon: "settings", ready: false },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userName } = await requireRole("admin");
  return (
    <DashboardShell roleLabel="Admin" nav={NAV} userName={userName} theme="dark">
      {children}
    </DashboardShell>
  );
}
