import { createClient } from "@/lib/supabase/server";

// Server-side check: is the current signed-in user an admin?
export async function currentUserIsAdmin(): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    return data?.role === "admin";
  } catch {
    return false;
  }
}
