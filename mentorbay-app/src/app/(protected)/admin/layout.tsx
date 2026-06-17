import DashboardShell, { type NavItem } from "@/components/DashboardShell";
import { requireRole } from "@/lib/dashboard-access";

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "home" },
  { label: "Approvals", href: "/admin/approvals", icon: "clipboard" },
  { label: "Users", href: "/admin/users", icon: "users" },
  { label: "Moderation", href: "/admin/moderation", icon: "flag" },
  { label: "Reports", href: "/admin/reports", icon: "chart" },
  { label: "Settings", href: "/admin/settings", icon: "settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userName } = await requireRole("admin");
  return (
    <DashboardShell roleLabel="Admin" nav={NAV} userName={userName} theme="dark">
      {children}
    </DashboardShell>
  );
}
