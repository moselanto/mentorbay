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


export type MyMentorApplication = { mentorId: string; mentorName: string; mentorSlug: string | null; status: string; declineReason?: string | null };

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
    const rows = (data as unknown as { mentor_id: string | null; status: string; decline_reason: string | null; mentor: { full_name: string | null } | null }[] | null ?? [])
      .filter((r) => r.mentor_id);
    // Dedupe by mentor so each connection shows once (accepted wins over pending).
    const byMentor = new Map<string, MyMentorApplication>();
    const rank = (s: string) => (s === "accepted" ? 2 : s === "pending" ? 1 : 0);
    for (const r of rows) {
      const id = r.mentor_id as string;
      const cand: MyMentorApplication = { mentorId: id, mentorName: r.mentor?.full_name ?? "Mentor", mentorSlug: null, status: r.status, declineReason: r.decline_reason ?? null };
      const cur = byMentor.get(id);
      if (!cur || rank(cand.status) > rank(cur.status)) byMentor.set(id, cand);
    }
    const result = Array.from(byMentor.values());
    const ids = result.map((r) => r.mentorId);
    if (ids.length) {
      const { data: ms } = await supabase.from("mentors").select("slug, profile_id").in("profile_id", ids);
      const slugByProfile = new Map((ms as { slug: string; profile_id: string }[] | null ?? []).map((m) => [m.profile_id, m.slug]));
      for (const r of result) r.mentorSlug = slugByProfile.get(r.mentorId) ?? null;
    }
    return result;
  } catch { return []; }
}


/** How many people are registered for an event. */
export async function countRegistrations(slug: string): Promise<number> {
  try {
    const supabase = createClient();
    const { data } = await supabase.rpc("public_event_registration_count", { p_slug: slug });
    return (typeof data === "number" ? data : 0);
  } catch { return 0; }
}


export type Registrant = { name: string };
export type Attendee = { name: string; userId: string | null; email: string | null; phone: string | null; registeredAt: string | null };

/** Registrants (names) for an event by slug. Visible to the event owner/admin via RLS. */
export async function getEventRegistrants(slug: string): Promise<{ count: number; names: string[]; attendees: Attendee[] }> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("event_registrations")
      .select("user_id, created_at, user:profiles!event_registrations_user_id_fkey(full_name, email, payout_phone)")
      .eq("event_slug", slug);
    const rows = (data as unknown as { user_id: string | null; created_at: string | null; user: { full_name: string | null; email: string | null; payout_phone: string | null } | null }[] | null ?? []);
    const attendees: Attendee[] = rows.map((r) => ({ name: r.user?.full_name ?? "Mentee", userId: r.user_id ?? null, email: r.user?.email ?? null, phone: r.user?.payout_phone ?? null, registeredAt: r.created_at ? new Date(r.created_at).toISOString().slice(0, 10) : null }));
    const names = attendees.map((a) => a.name);
    return { count: names.length, names, attendees };
  } catch { return { count: 0, names: [], attendees: [] }; }
}
