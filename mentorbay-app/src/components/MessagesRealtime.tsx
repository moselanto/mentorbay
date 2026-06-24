"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Mounted in the dashboard layouts. Subscribes to message inserts/updates that
// involve the signed-in user and refreshes the route so server-rendered pieces
// (sidebar unread badge, conversation list counts, read/delivered ticks) update
// live without a manual reload. Debounced to coalesce bursts.
export default function MessagesRealtime({ userId }: { userId: string }) {
  const router = useRouter();
  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    let timer: ReturnType<typeof setTimeout> | null = null;
    const refresh = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), 250);
    };
    const channel = supabase
      .channel(`messages:${userId}`)
      // New message addressed to me -> unread count goes up.
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `recipient_id=eq.${userId}` }, refresh)
      // A message I sent was delivered/read -> my status ticks update.
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: `sender_id=eq.${userId}` }, refresh)
      // A message addressed to me was marked read (e.g. from another tab) -> badge updates.
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: `recipient_id=eq.${userId}` }, refresh)
      .subscribe();
    return () => { if (timer) clearTimeout(timer); supabase.removeChannel(channel); };
  }, [userId, router]);
  return null;
}
