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


export type MyMentorApplication = { mentorId: string; mentorName: string; status: string };

/** The signed-in mentee's mentorship applications with mentor names. */
export async function getMyMentorApplications(): Promise<MyMentorApplication[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase
      .from("applications")
      .select("mentor_id, status, mentor:profiles!applications_mentor_id_fkey(full_name)")
      .eq("mentee_id", user.id);
    const rows = (data as unknown as { mentor_id: string | null; status: string; mentor: { full_name: string | null } | null }[] | null ?? [])
      .filter((r) => r.mentor_id);
    // Dedupe by mentor so each connection shows once (accepted wins over pending).
    const byMentor = new Map<string, MyMentorApplication>();
    const rank = (s: string) => (s === "accepted" ? 2 : s === "pending" ? 1 : 0);
    for (const r of rows) {
      const id = r.mentor_id as string;
      const cand: MyMentorApplication = { mentorId: id, mentorName: r.mentor?.full_name ?? "Mentor", status: r.status };
      const cur = byMentor.get(id);
      if (!cur || rank(cand.status) > rank(cur.status)) byMentor.set(id, cand);
    }
    return Array.from(byMentor.values());
  } catch { return []; }
}
