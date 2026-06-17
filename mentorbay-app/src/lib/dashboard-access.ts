import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "mentee" | "mentor" | "admin";

/**
 * Server-side guard for dashboard layouts. Ensures the user is signed in and
 * has the required role; otherwise redirects them to login or their own
 * dashboard. Returns the resolved name to display in the shell.
 */
export async function requireRole(required: Role): Promise<{ userName: string; role: Role }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("role, full_name").eq("id", user.id).maybeSingle();

  const role = ((profile?.role as Role) ?? "mentee") as Role;
  if (role !== required) redirect(`/${role}`);

  return { userName: (profile?.full_name as string) ?? user.email ?? "User", role };
}
