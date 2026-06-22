import { createClient } from "@/lib/supabase/server";

export type MyEnrollment = {
  slug: string; title: string; category: string; img: string; mentor: string; pct: number; status: string;
};

type Row = {
  program_slug: string; progress: number; status: string;
  programs: { title: string; category: string; cover_url: string | null; mentors: { name: string } | null } | null;
};

export async function getMyEnrollments(): Promise<MyEnrollment[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from("enrollments")
      .select("program_slug, progress, status, programs!left(title, category, cover_url, mentors(name))")
      .eq("user_id", user.id);
    if (error || !data) return [];
    return (data as unknown as Row[]).map((r) => ({
      slug: r.program_slug,
      title: r.programs?.title ?? r.program_slug,
      category: r.programs?.category ?? "",
      img: r.programs?.cover_url ?? "",
      mentor: r.programs?.mentors?.name ?? "",
      pct: r.progress,
      status: r.status,
    }));
  } catch {
    return [];
  }
}


/** Whether the signed-in user is enrolled in a given program. */
export async function isEnrolledInProgram(slug: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase.from("enrollments").select("id").eq("user_id", user.id).eq("program_slug", slug).maybeSingle();
    return !!data;
  } catch { return false; }
}


/** How many mentees are enrolled in a program. */
export async function countEnrollments(slug: string): Promise<number> {
  try {
    const supabase = createClient();
    const { count } = await supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("program_slug", slug);
    return count ?? 0;
  } catch { return 0; }
}


/** The signed-in mentee's progress (0-100) + status for a program, or null if not enrolled. */
export async function getProgramProgress(slug: string): Promise<{ pct: number; status: string } | null> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from("enrollments").select("progress, status").eq("user_id", user.id).eq("program_slug", slug).maybeSingle();
    if (!data) return null;
    return { pct: (data.progress as number) ?? 0, status: (data.status as string) ?? "active" };
  } catch { return null; }
}


/** Slugs of all programs the signed-in mentee is enrolled in. */
export async function getMyEnrolledSlugs(): Promise<string[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase.from("enrollments").select("program_slug").eq("user_id", user.id);
    return (data as { program_slug: string }[] | null ?? []).map((r) => r.program_slug);
  } catch { return []; }
}


/** Completed-lesson keys for the signed-in mentee on a program (empty if not enrolled). */
export async function getCompletedLessons(slug: string): Promise<string[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase.from("enrollments").select("completed_lessons").eq("user_id", user.id).eq("program_slug", slug).maybeSingle();
    return (data?.completed_lessons as string[] | null) ?? [];
  } catch { return []; }
}


export type Enrollee = { name: string; pct: number; status: string };

/** Mentees enrolled in a given program (visible to the program owner via RLS). */
export async function getProgramEnrollees(slug: string): Promise<Enrollee[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("enrollments")
      .select("progress, status, user:profiles!enrollments_user_id_fkey(full_name)")
      .eq("program_slug", slug)
      .order("created_at", { ascending: false });
    return (data as unknown as { progress: number; status: string; user: { full_name: string | null } | null }[] | null ?? [])
      .map((r) => ({ name: r.user?.full_name ?? "Mentee", pct: r.progress ?? 0, status: r.status ?? "active" }));
  } catch { return []; }
}
