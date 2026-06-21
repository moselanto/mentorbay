import { createClient } from "@/lib/supabase/server";

export type Story = { id: string; name: string; quote: string; rating: number; mentor: string };

/** Featured success stories = reviews an admin marked as featured (visible only). */
export async function getFeaturedStories(): Promise<Story[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("reviews")
      .select("id, author_name, body, rating, mentor_slug")
      .eq("status", "visible").eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(12);
    return (data as { id: string; author_name: string | null; body: string; rating: number; mentor_slug: string | null }[] | null ?? [])
      .map((r) => ({ id: r.id, name: r.author_name ?? "Mentee", quote: r.body, rating: r.rating, mentor: r.mentor_slug ?? "" }));
  } catch { return []; }
}
