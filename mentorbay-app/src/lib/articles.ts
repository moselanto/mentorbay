import { createClient } from "@/lib/supabase/server";
import { currentUserIsAdmin } from "@/lib/is-admin";

export type Article = {
  id: string;            // slug
  rowId: string;         // uuid
  title: string;
  excerpt: string;
  body: string;
  coverUrl: string | null;
  status: string;        // draft | published
  approvalStatus: string; // pending | approved | rejected
  views: number;
  date: string;
};

type Row = {
  id: string; slug: string; title: string; excerpt: string | null; body: string | null;
  cover_url: string | null; status: string; approval_status: string; views: number; created_at: string;
};

function fmtDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
  catch { return "—"; }
}

function rowToArticle(r: Row): Article {
  return {
    id: r.slug, rowId: r.id, title: r.title, excerpt: r.excerpt ?? "", body: r.body ?? "",
    coverUrl: r.cover_url ?? null, status: r.status, approvalStatus: r.approval_status,
    views: r.views ?? 0, date: fmtDate(r.created_at),
  };
}

/** The signed-in mentor's own articles. */
export async function getMyArticles(): Promise<Article[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from("articles").select("*").eq("author_id", user.id).order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as Row[]).map(rowToArticle);
  } catch { return []; }
}

/** A single article owned by the signed-in mentor (for editing). */
export async function getMyArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from("articles").select("*").eq("slug", slug).eq("author_id", user.id).maybeSingle();
    if (error || !data) return null;
    return rowToArticle(data as Row);
  } catch { return null; }
}


type PubRow = Row & { author: { full_name: string | null; avatar_url: string | null } | null };

export type PublicArticle = Article & { author: string; authorAvatar: string | null };

function rowToPublic(r: PubRow): PublicArticle {
  const base = rowToArticle(r);
  return { ...base, author: r.author?.full_name ?? "MentorBay", authorAvatar: r.author?.avatar_url ?? null };
}

const PUB_SELECT = "id, slug, title, excerpt, body, cover_url, status, approval_status, views, created_at, author:profiles!articles_author_id_fkey(full_name, avatar_url)";

/** All published + approved articles (newest first). */
export async function getArticles(): Promise<PublicArticle[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("articles").select(PUB_SELECT)
      .eq("status", "published").eq("approval_status", "approved")
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as unknown as PubRow[]).map(rowToPublic);
  } catch { return []; }
}

/** A single published article by slug. */
export async function getArticle(slug: string, opts?: { preview?: boolean }): Promise<PublicArticle | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("articles").select(PUB_SELECT)
      .eq("slug", slug).eq("status", "published").eq("approval_status", "approved").maybeSingle();
    if (error || !data) return null;
    return rowToPublic(data as unknown as PubRow);
  } catch { return null; }
}
