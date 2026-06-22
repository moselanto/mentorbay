import { createClient } from "@/lib/supabase/server";

export type MentorApplication = { id: string; personId: string | null; name: string; note: string; when: string; status: string };

type Row = {
  id: string; mentee_id: string | null; note: string | null; status: string; created_at: string;
  mentee: { full_name: string | null } | null;
};

function ago(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)} week${days < 14 ? "" : "s"} ago`;
}

async function fetchByStatus(status: "pending" | "accepted"): Promise<MentorApplication[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from("applications")
      .select("id, note, status, created_at, mentee:profiles!applications_mentee_id_fkey(full_name)")
      .eq("mentor_id", user.id)
      .eq("status", status)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as unknown as Row[]).map((r) => ({
      id: r.id, personId: r.mentee_id, name: r.mentee?.full_name ?? "Mentee", note: r.note ?? "", when: ago(r.created_at), status: r.status,
    }));
  } catch {
    return [];
  }
}

export const getPendingApplications = () => fetchByStatus("pending");
export const getAcceptedMentees = () => fetchByStatus("accepted");
