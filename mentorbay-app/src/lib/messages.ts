import { createClient } from "@/lib/supabase/server";

export type MessageStatus = "sent" | "delivered" | "read";
export type ChatMessage = { id: string; fromMe: boolean; body: string; at: string; status: MessageStatus };

function fmt(iso: string): string {
  try { return new Date(iso).toLocaleString("en-KE", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); }
  catch { return ""; }
}

// Relative "x min ago" style label for conversation list timestamps.
function rel(iso: string): string {
  try {
    const then = new Date(iso).getTime();
    const diff = Date.now() - then;
    const m = Math.floor(diff / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hr ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d} day${d === 1 ? "" : "s"} ago`;
    return new Date(iso).toLocaleDateString("en-KE", { month: "short", day: "numeric" });
  } catch { return ""; }
}

/** Conversation between the signed-in user and a counterpart, oldest first. */
export async function getConversation(counterpartId: string): Promise<ChatMessage[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !counterpartId) return [];
    const { data } = await supabase
      .from("messages")
      .select("id, sender_id, body, created_at, delivered_at, read_at")
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${counterpartId}),and(sender_id.eq.${counterpartId},recipient_id.eq.${user.id})`)
      .order("created_at", { ascending: true })
      .limit(200);
    const rows = (data as { id: string; sender_id: string; body: string; created_at: string; delivered_at: string | null; read_at: string | null }[] | null ?? []);
    return rows.map((m) => {
      const fromMe = m.sender_id === user.id;
      // Status is only meaningful on MY outgoing messages (what the recipient did with them).
      const status: MessageStatus = m.read_at ? "read" : m.delivered_at ? "delivered" : "sent";
      return { id: m.id, fromMe, body: m.body, at: fmt(m.created_at), status };
    });
  } catch { return []; }
}


export type Thread = { personId: string; name: string; lastMessage: string; lastAt: string; unread: number };

/** Distinct people the signed-in user has exchanged messages with, enriched with
 *  the last message, a relative timestamp, and the per-conversation unread count. */
export async function getMyMessageThreads(): Promise<Thread[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase
      .from("messages")
      .select("sender_id, recipient_id, body, created_at, read_at, sender:profiles!messages_sender_id_fkey(full_name), recipient:profiles!messages_recipient_id_fkey(full_name)")
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: false });
    const rows = (data as unknown as {
      sender_id: string; recipient_id: string; body: string; created_at: string; read_at: string | null;
      sender: { full_name: string | null } | null; recipient: { full_name: string | null } | null;
    }[] | null ?? []);
    const byPerson = new Map<string, Thread>();
    for (const r of rows) {
      const isSender = r.sender_id === user.id;
      const personId = isSender ? r.recipient_id : r.sender_id;
      const name = (isSender ? r.recipient?.full_name : r.sender?.full_name) ?? "User";
      // Rows are newest-first, so the FIRST row we see per person is the latest message.
      if (!byPerson.has(personId)) {
        byPerson.set(personId, { personId, name, lastMessage: r.body ?? "", lastAt: rel(r.created_at), unread: 0 });
      }
      // Count unread = messages addressed to me from this person, not yet read.
      if (!isSender && !r.read_at) {
        const t = byPerson.get(personId)!;
        t.unread += 1;
      }
    }
    return Array.from(byPerson.values());
  } catch { return []; }
}


/** Number of unread messages addressed to the signed-in user. */
export async function getUnreadCount(): Promise<number> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;
    const { count } = await supabase.from("messages").select("id", { count: "exact", head: true }).eq("recipient_id", user.id).is("read_at", null);
    return count ?? 0;
  } catch { return 0; }
}

/** Mark all messages from a counterpart to the signed-in user as read (and delivered). */
export async function markConversationRead(counterpartId: string): Promise<void> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !counterpartId) return;
    const now = new Date().toISOString();
    // Reading also implies delivery, so stamp delivered_at where it is still null.
    await supabase.from("messages").update({ read_at: now, delivered_at: now })
      .eq("recipient_id", user.id).eq("sender_id", counterpartId).is("read_at", null);
  } catch { /* best-effort */ }
}

/** Mark all messages addressed to the signed-in user as delivered (called when the
 *  user is online / loads their messaging area, before opening any one conversation). */
export async function markAllDelivered(): Promise<void> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("messages").update({ delivered_at: new Date().toISOString() })
      .eq("recipient_id", user.id).is("delivered_at", null);
  } catch { /* best-effort */ }
}
