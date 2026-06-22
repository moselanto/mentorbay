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


// Server-side: the current signed-in user's role ("mentee" | "mentor" | "admin"), or null.
export async function currentUserRole(): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    return (data?.role as string | null) ?? null;
  } catch {
    return null;
  }
}
