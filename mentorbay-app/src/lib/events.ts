import { createClient } from "@/lib/supabase/server";
import { EVENTS, type EventItem } from "@/lib/data";

function hasSupabase() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

type EventRow = {
  slug: string; title: string; when_status: "upcoming" | "past"; category: string; format: "Online" | "In-person";
  mon: string; day: string; date_label: string; time_label: string; location: string;
  speaker: string; face: string; img: string; going: number; featured: boolean;
};

function rowToEvent(r: EventRow): EventItem {
  return {
    id: r.slug, title: r.title, when: r.when_status, category: r.category, type: r.format,
    mon: r.mon, day: r.day, date: r.date_label, time: r.time_label, loc: r.location,
    speaker: r.speaker, face: r.face, img: r.img, going: r.going, featured: r.featured,
  };
}

export async function getEvents(): Promise<EventItem[]> {
  if (!hasSupabase()) return EVENTS;
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("events").select("*").eq("status", "published");
    if (error || !data || data.length === 0) return EVENTS;
    return (data as EventRow[]).map(rowToEvent);
  } catch { return EVENTS; }
}

export async function getEvent(slug: string): Promise<EventItem | null> {
  if (!hasSupabase()) return EVENTS.find((e) => e.id === slug) ?? null;
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("events").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
    if (error || !data) return EVENTS.find((e) => e.id === slug) ?? null;
    return rowToEvent(data as EventRow);
  } catch { return EVENTS.find((e) => e.id === slug) ?? null; }
}

export type MyEvent = EventItem & { approvalStatus: string };
export async function getMyEvents(): Promise<MyEvent[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase.from("events").select("*").eq("created_by", user.id).order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as (EventRow & { approval_status: string | null })[]).map((r) => ({ ...rowToEvent(r), approvalStatus: r.approval_status ?? "approved" }));
  } catch { return []; }
}

export async function getMyEventBySlug(slug: string): Promise<MyEvent | null> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase.from("events").select("*").eq("slug", slug).eq("created_by", user.id).maybeSingle();
    if (error || !data) return null;
    const r = data as (EventRow & { approval_status: string | null });
    return { ...rowToEvent(r), approvalStatus: r.approval_status ?? "approved" };
  } catch { return null; }
}
