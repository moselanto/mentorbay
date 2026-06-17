import { createClient } from "@/lib/supabase/server";
import { MENTORS, type Mentor } from "@/lib/data";

type MentorRow = {
  slug: string;
  name: string;
  role: string;
  industry: string;
  country: string;
  city: string;
  available: boolean;
  languages: string[] | null;
  experience: number;
  rating: number;
  reviews: number;
  mentees: number;
  skills: string[] | null;
  avatar_url: string | null;
};

function rowToMentor(r: MentorRow): Mentor {
  return {
    id: r.slug,
    name: r.name,
    role: r.role,
    industry: r.industry,
    country: r.country,
    city: r.city,
    avail: r.available ? "Available" : "Busy",
    langs: r.languages ?? [],
    exp: r.experience,
    rating: Number(r.rating),
    reviews: r.reviews,
    mentees: r.mentees,
    skills: r.skills ?? [],
    img: r.avatar_url ?? "",
  };
}

/**
 * Reads approved mentors from Supabase.
 * Falls back to the bundled demo data when Supabase isn't configured yet, so the
 * app always renders. Once schema.sql + seed.sql are loaded and .env.local has
 * the Supabase keys, this automatically returns live data instead.
 */
export async function getMentors(): Promise<Mentor[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return MENTORS;
  }
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("mentors")
      .select("*")
      .eq("status", "approved")
      .order("mentees", { ascending: false });

    if (error || !data || data.length === 0) return MENTORS;
    return (data as MentorRow[]).map(rowToMentor);
  } catch {
    return MENTORS;
  }
}
