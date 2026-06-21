import { createClient } from "@/lib/supabase/server";

export type AdminUser = {
  id: string; name: string; role: string; approvalStatus: string; suspended: boolean; avatarUrl: string | null;
};
type ProfileRow = {
  id: string; full_name: string | null; role: string; approval_status: string; suspended: boolean; avatar_url: string | null;
};
function toUser(r: ProfileRow): AdminUser {
  return { id: r.id, name: r.full_name ?? "(no name)", role: r.role, approvalStatus: r.approval_status, suspended: !!r.suspended, avatarUrl: r.avatar_url ?? null };
}

export async function getPendingApprovals(): Promise<AdminUser[]> {
  try {
    const s = createClient();
    const { data } = await s.from("profiles")
      .select("id, full_name, role, approval_status, suspended, avatar_url")
      .eq("approval_status", "pending");
    return (data as ProfileRow[] | null ?? []).map(toUser);
  } catch { return []; }
}

export async function getAllUsers(): Promise<AdminUser[]> {
  try {
    const s = createClient();
    const { data } = await s.from("profiles")
      .select("id, full_name, role, approval_status, suspended, avatar_url");
    return (data as ProfileRow[] | null ?? []).map(toUser);
  } catch { return []; }
}

export type AdminReview = {
  id: string; mentorSlug: string | null; authorId: string | null; authorName: string; rating: number; body: string; status: string;
};
type ReviewRow = {
  id: string; mentor_slug: string | null; author_id: string | null; author_name: string | null; rating: number; body: string; status: string;
};
export async function getAllReviews(): Promise<AdminReview[]> {
  try {
    const s = createClient();
    const { data } = await s.from("reviews")
      .select("id, mentor_slug, author_id, author_name, rating, body, status")
      .order("created_at", { ascending: false });
    return (data as ReviewRow[] | null ?? []).map((r) => ({
      id: r.id, mentorSlug: r.mentor_slug, authorId: r.author_id,
      authorName: r.author_name ?? "Anonymous", rating: r.rating, body: r.body, status: r.status,
    }));
  } catch { return []; }
}

export type AdminProgram = { id: string; slug: string; title: string; category: string; level: string };
export async function getPendingPrograms(): Promise<AdminProgram[]> {
  try {
    const s = createClient();
    const { data } = await s.from("programs").select("id, slug, title, category, level").eq("status", "pending");
    return (data as { id: string; slug: string; title: string; category: string; level: string }[] | null ?? [])
      .map((r) => ({ id: r.id, slug: r.slug, title: r.title, category: r.category, level: r.level }));
  } catch { return []; }
}

export type AdminSession = { id: string; topic: string; mode: string; when: string };
export async function getPendingSessions(): Promise<AdminSession[]> {
  try {
    const s = createClient();
    const { data } = await s.from("sessions").select("id, topic, mode, scheduled_at").eq("approval_status", "pending");
    return (data as { id: string; topic: string; mode: string; scheduled_at: string }[] | null ?? [])
      .map((r) => ({ id: r.id, topic: r.topic, mode: r.mode, when: new Date(r.scheduled_at).toLocaleString("en-KE", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) }));
  } catch { return []; }
}

export type AdminEvent = { id: string; title: string; category: string; format: string; date: string };
export async function getPendingEvents(): Promise<AdminEvent[]> {
  try {
    const s = createClient();
    const { data } = await s.from("events").select("id, title, category, format, date_label").eq("approval_status", "pending");
    return (data as { id: string; title: string; category: string; format: string; date_label: string }[] | null ?? [])
      .map((r) => ({ id: r.id, title: r.title, category: r.category, format: r.format, date: r.date_label }));
  } catch { return []; }
}


export type AdminArticle = { id: string; title: string; author: string; date: string };
export async function getPendingArticles(): Promise<AdminArticle[]> {
  try {
    const s = createClient();
    const { data } = await s.from("articles")
      .select("id, title, created_at, author:profiles!articles_author_id_fkey(full_name)")
      .eq("status", "published").eq("approval_status", "pending");
    return (data as unknown as { id: string; title: string; created_at: string; author: { full_name: string | null } | null }[] | null ?? [])
      .map((r) => ({ id: r.id, title: r.title, author: r.author?.full_name ?? "Unknown", date: new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }));
  } catch { return []; }
}
