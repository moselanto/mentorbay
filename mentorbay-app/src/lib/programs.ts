import { createClient } from "@/lib/supabase/server";
import { PROGRAMS, type Program } from "@/lib/data";
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
  };
}

export async function getPrograms(): Promise<Program[]> {
  if (!hasSupabase()) return PROGRAMS;
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("programs").select(SELECT).eq("status", "published");
    if (error || !data || data.length === 0) return PROGRAMS;
    return (data as ProgramRow[]).map(rowToProgram);
  } catch { return PROGRAMS; }
}

export async function getProgram(slug: string, opts?: { preview?: boolean }): Promise<Program | null> {
  if (!hasSupabase()) return PROGRAMS.find((p) => p.id === slug) ?? null;
  try {
    const supabase = createClient();
    const allowPreview = opts?.preview === true && (await currentUserIsAdmin());
    let q = supabase.from("programs").select(SELECT).eq("slug", slug);
    if (!allowPreview) q = q.eq("status", "published");
    const { data, error } = await q.maybeSingle();
    if (error || !data) return PROGRAMS.find((p) => p.id === slug) ?? null;
    return rowToProgram(data as ProgramRow);
  } catch { return PROGRAMS.find((p) => p.id === slug) ?? null; }
}

export async function getProgramsByMentor(mentorSlug: string): Promise<Program[]> {
  if (!hasSupabase()) return PROGRAMS.filter((p) => p.mentorId === mentorSlug);
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("programs").select(SELECT).eq("mentor_slug", mentorSlug).eq("status", "published");
    if (error || !data) return PROGRAMS.filter((p) => p.mentorId === mentorSlug);
    return (data as ProgramRow[]).map(rowToProgram);
  } catch { return PROGRAMS.filter((p) => p.mentorId === mentorSlug); }
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
