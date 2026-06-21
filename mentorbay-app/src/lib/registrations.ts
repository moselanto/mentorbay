import { createClient } from "@/lib/supabase/server";

/** Whether the signed-in user is registered for a given event. */
export async function isRegisteredForEvent(slug: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase.from("event_registrations").select("id").eq("user_id", user.id).eq("event_slug", slug).maybeSingle();
    return !!data;
  } catch { return false; }
}

/** Whether the signed-in user already has a pending/active application to a mentor. */
export async function hasAppliedToMentor(mentorId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !mentorId) return false;
    const { data } = await supabase.from("applications").select("id").eq("mentee_id", user.id).eq("mentor_id", mentorId).maybeSingle();
    return !!data;
  } catch { return false; }
}

/** Whether the signed-in user is logged in (any role). */
export async function isSignedIn(): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  } catch { return false; }
}
