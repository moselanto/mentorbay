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


export type Thread = { personId: string; name: string };

/** Distinct people the signed-in user has exchanged messages with. */
export async function getMyMessageThreads(): Promise<Thread[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase
      .from("messages")
      .select("sender_id, recipient_id, sender:profiles!messages_sender_id_fkey(full_name), recipient:profiles!messages_recipient_id_fkey(full_name)")
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: false });
    const rows = (data as unknown as { sender_id: string; recipient_id: string; sender: { full_name: string | null } | null; recipient: { full_name: string | null } | null }[] | null ?? []);
    const byPerson = new Map<string, Thread>();
    for (const r of rows) {
      const isSender = r.sender_id === user.id;
      const personId = isSender ? r.recipient_id : r.sender_id;
      const name = (isSender ? r.recipient?.full_name : r.sender?.full_name) ?? "User";
      if (!byPerson.has(personId)) byPerson.set(personId, { personId, name });
    }
    return Array.from(byPerson.values());
  } catch { return []; }
}
