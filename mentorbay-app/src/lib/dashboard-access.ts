import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "mentee" | "mentor" | "admin";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export type SessionProfile = {
  userId: string;
  userName: string;
  avatarUrl: string | null;
  role: Role;
  approvalStatus: ApprovalStatus;
  suspended: boolean;
};

export async function requireRole(required: Role): Promise<SessionProfile> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, avatar_url, approval_status, suspended")
    .eq("id", user.id)
    .maybeSingle();

  const role = ((profile?.role as Role) ?? "mentee") as Role;
  if (role !== required) redirect(`/${role}`);

  return {
    userId: user.id,
    userName: (profile?.full_name as string) ?? user.email ?? "User",
    avatarUrl: (profile?.avatar_url as string | null) ?? null,
    role,
    approvalStatus: (profile?.approval_status as ApprovalStatus) ?? "approved",
    suspended: Boolean(profile?.suspended),
  };
}
