import { createClient } from "@/lib/supabase/server";
import { type Mentor } from "@/lib/data";

function hasSupabase() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

type MentorRow = {
  slug: string; name: string; role: string; industry: string; country: string; city: string;
  available: boolean; languages: string[] | null; experience: number; rating: number; reviews: number;
  mentees: number; skills: string[] | null; avatar_url: string | null; profile_id: string | null;
};

function rowToMentor(r: MentorRow): Mentor {
  return {
    id: r.slug, name: r.name, role: r.role, industry: r.industry, country: r.country, city: r.city,
    avail: r.available ? "Available" : "Busy", langs: r.languages ?? [], exp: r.experience,
    rating: Number(r.rating), reviews: r.reviews, mentees: r.mentees, skills: r.skills ?? [],
    img: r.avatar_url ?? "", profileId: r.profile_id ?? undefined,
  };
}

/** All approved mentors (demo fallback when Supabase isn't configured). */
export async function getMentors(): Promise<Mentor[]> {
  if (!hasSupabase()) return [];
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("mentors").select("*").eq("status", "approved").order("mentees", { ascending: false });
    if (error || !data) return [];
    return (data as MentorRow[]).map(rowToMentor);
  } catch {
    return [];
  }
}

/** A single mentor by slug, for the profile page. */
export async function getMentorBySlug(slug: string): Promise<Mentor | null> {
  if (!hasSupabase()) return null;
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("mentors").select("*").eq("slug", slug).eq("status", "approved").maybeSingle();
    if (error || !data) return null;
    return rowToMentor(data as MentorRow);
  } catch {
    return null;
  }
}
