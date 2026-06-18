import { createClient } from "@/lib/supabase/server";

export type MySession = {
  id: string; topic: string; mode: string; when: string; counterpart: string; upcoming: boolean; approvalStatus: string;
};

type Row = {
  id: string; topic: string; mode: string; scheduled_at: string; mentor_id: string | null; mentee_id: string | null;
  approval_status: string | null;
  mentor: { full_name: string | null } | null;
  mentee: { full_name: string | null } | null;
};

function fmt(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-KE", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export async function getMySessions(): Promise<MySession[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from("sessions")
      .select("id, topic, mode, scheduled_at, mentor_id, mentee_id, approval_status, mentor:profiles!sessions_mentor_id_fkey(full_name), mentee:profiles!sessions_mentee_id_fkey(full_name)")
      .or(`mentee_id.eq.${user.id},mentor_id.eq.${user.id}`)
      .order("scheduled_at", { ascending: true });
    if (error || !data) return [];
    const now = Date.now();
    return (data as unknown as Row[]).map((r) => {
      const isMentee = r.mentee_id === user.id;
      const counterpart = (isMentee ? r.mentor?.full_name : r.mentee?.full_name) ?? "Mentee TBD";
      return {
        id: r.id, topic: r.topic, mode: r.mode, when: fmt(r.scheduled_at),
        counterpart, upcoming: new Date(r.scheduled_at).getTime() >= now,
        approvalStatus: r.approval_status ?? "approved",
      };
    });
  } catch { return []; }
}
