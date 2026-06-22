import { createClient } from "@/lib/supabase/server";

export type ChatMessage = { id: string; fromMe: boolean; body: string; at: string };

function fmt(iso: string): string {
  try { return new Date(iso).toLocaleString("en-KE", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); }
  catch { return ""; }
}

/** Conversation between the signed-in user and a counterpart, oldest first. */
export async function getConversation(counterpartId: string): Promise<ChatMessage[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !counterpartId) return [];
    const { data } = await supabase
      .from("messages")
      .select("id, sender_id, body, created_at")
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${counterpartId}),and(sender_id.eq.${counterpartId},recipient_id.eq.${user.id})`)
      .order("created_at", { ascending: true })
      .limit(200);
    return (data as { id: string; sender_id: string; body: string; created_at: string }[] | null ?? [])
      .map((m) => ({ id: m.id, fromMe: m.sender_id === user.id, body: m.body, at: fmt(m.created_at) }));
  } catch { return []; }
}
