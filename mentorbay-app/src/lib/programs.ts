import { createClient } from "@/lib/supabase/server";
import { type Program } from "@/lib/data";
import { currentUserIsAdmin } from "@/lib/is-admin";

function hasSupabase() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

const SELECT = "*, mentors(name, avatar_url)";

type ProgramRow = {
  slug: string; title: string; category: string; level: string; weeks: number; lessons: number;
  mentor_slug: string | null; rating: number; enrolled: number; badge: string | null;
  cover_url: string | null; description: string | null;
  about: string | null; learn: string[] | null; curriculum: unknown; duration_label: string | null; status: string | null; requirements: string[] | null;
  is_free: boolean | null; price_kes: number | null; max_installments: number | null;
  meeting_type: string | null; meeting_provider: string | null; meeting_url: string | null; program_location: string | null;
  cohort_start: string | null; cohort_status: string | null;
  mentors: { name: string; avatar_url: string | null } | null;
};

function rowToProgram(r: ProgramRow): Program {
  const curriculum = Array.isArray(r.curriculum)
    ? (r.curriculum as { title: string; lessons: string[] }[])
    : [];
  return {
    id: r.slug, title: r.title, category: r.category, level: r.level, weeks: r.weeks, lessons: r.lessons,
    mentor: r.mentors?.name ?? r.mentor_slug ?? "", mentorId: r.mentor_slug ?? "",
    face: r.mentors?.avatar_url ?? "", img: r.cover_url ?? "",
    rating: Number(r.rating), enrolled: r.enrolled, badge: r.badge ?? undefined, description: r.description ?? "",
    about: r.about ?? undefined, learn: r.learn ?? undefined, curriculum,
    durationLabel: r.duration_label ?? undefined, status: r.status ?? undefined, requirements: r.requirements ?? undefined,
    isPaid: r.is_free === false, priceKes: Number(r.price_kes ?? 0), maxInstallments: r.max_installments ?? 1,
    meetingType: (r.meeting_type === "physical" ? "physical" : "online"), meetingProvider: r.meeting_provider ?? undefined,
    meetingUrl: r.meeting_url ?? undefined, programLocation: r.program_location ?? undefined,
    cohortStart: r.cohort_start ?? undefined, cohortStatus: r.cohort_status ?? undefined,
  };
}

export async function getPrograms(): Promise<Program[]> {
  if (!hasSupabase()) return [];
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("programs").select(SELECT).eq("status", "published");
    if (error || !data) return [];
    return (data as ProgramRow[]).map(rowToProgram);
  } catch { return []; }
}

export async function getProgram(slug: string, opts?: { preview?: boolean }): Promise<Program | null> {
  if (!hasSupabase()) return null;
  try {
    const supabase = createClient();
    const allowPreview = opts?.preview === true && (await currentUserIsAdmin());
    let q = supabase.from("programs").select(SELECT).eq("slug", slug);
    if (!allowPreview) q = q.eq("status", "published");
    const { data, error } = await q.maybeSingle();
    if (error || !data) return null;
    return rowToProgram(data as ProgramRow);
  } catch { return null; }
}

export async function getProgramsByMentor(mentorSlug: string): Promise<Program[]> {
  if (!hasSupabase()) return [];
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("programs").select(SELECT).eq("mentor_slug", mentorSlug).eq("status", "published");
    if (error || !data) return [];
    return (data as ProgramRow[]).map(rowToProgram);
  } catch { return []; }
}

// A mentor's OWN programs, any status (so they see pending/rejected too).
export async function getMyPrograms(): Promise<Program[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase.from("programs").select(SELECT).eq("created_by", user.id).order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as ProgramRow[]).map(rowToProgram);
  } catch { return []; }
}

export async function getMyProgramBySlug(slug: string): Promise<Program | null> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase.from("programs").select(SELECT).eq("slug", slug).eq("created_by", user.id).maybeSingle();
    if (error || !data) return null;
    return rowToProgram(data as ProgramRow);
  } catch { return null; }
}


/** Program titles (topics) created by a mentor, looked up by their profile id. */
export async function getMentorProgramTopics(mentorProfileId: string): Promise<string[]> {
  if (!hasSupabase() || !mentorProfileId) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase.from("programs").select("title").eq("created_by", mentorProfileId).eq("status", "published");
    return (data as { title: string }[] | null ?? []).map((r) => r.title).filter(Boolean);
  } catch { return []; }
}


export type ProgramReview = { id: string; author: string; rating: number; body: string; avatar: string | null };

/** Visible reviews for a program. */
export async function getProgramReviews(slug: string): Promise<ProgramReview[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("reviews")
      .select("id, author_name, rating, body, author:profiles!reviews_author_id_fkey(full_name, avatar_url)")
      .eq("program_slug", slug).eq("status", "visible")
      .order("created_at", { ascending: false });
    return (data as unknown as { id: string; author_name: string | null; rating: number; body: string; author: { full_name: string | null; avatar_url: string | null } | null }[] | null ?? [])
      .map((r) => ({ id: r.id, author: r.author?.full_name ?? r.author_name ?? "Mentee", rating: r.rating, body: r.body, avatar: r.author?.avatar_url ?? null }));
  } catch { return []; }
}

/** Whether the signed-in user already reviewed a program. */
export async function hasReviewedProgram(slug: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase.from("reviews").select("id").eq("program_slug", slug).eq("author_id", user.id).maybeSingle();
    return !!data;
  } catch { return false; }
}
