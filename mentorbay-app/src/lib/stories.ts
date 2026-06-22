import { createClient } from "@/lib/supabase/server";

export type Story = { id: string; name: string; quote: string; rating: number; mentor: string; avatar: string | null };

/** Featured success stories = reviews an admin marked as featured (visible only). */
export async function getFeaturedStories(): Promise<Story[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("reviews")
      .select("id, author_name, body, rating, mentor_slug, author:profiles!reviews_author_id_fkey(full_name, avatar_url)")
      .eq("status", "visible").eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(24);
    return (data as unknown as { id: string; author_name: string | null; body: string; rating: number; mentor_slug: string | null; author: { full_name: string | null; avatar_url: string | null } | null }[] | null ?? [])
      .map((r) => ({
        id: r.id,
        name: r.author?.full_name ?? r.author_name ?? "Mentee",
        quote: r.body,
        rating: r.rating,
        mentor: r.mentor_slug ?? "",
        avatar: r.author?.avatar_url ?? null,
      }));
  } catch { return []; }
}
