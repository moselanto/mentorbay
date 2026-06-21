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
      .select("program_slug, progress, status, programs(title, category, cover_url, mentors(name))")
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
