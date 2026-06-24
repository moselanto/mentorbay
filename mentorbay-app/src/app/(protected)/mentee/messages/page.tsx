import Link from "next/link";
import { getMyMentorApplications } from "@/lib/registrations";
import { getConversation, getMyMessageThreads, markConversationRead, markAllDelivered } from "@/lib/messages";
import ConversationPanel from "@/components/ConversationPanel";

export const dynamic = "force-dynamic";

type Conn = { mentorId: string; mentorName: string; lastMessage: string; lastAt: string; unread: number };

export default async function MessagesPage({ searchParams }: { searchParams: { with?: string } }) {
  // Mark everything addressed to me as delivered as soon as I'm in the messaging area.
  await markAllDelivered();
  const [apps, threads] = await Promise.all([getMyMentorApplications(), getMyMessageThreads()]);
  const map = new Map<string, Conn>();
  for (const a of apps.filter((x) => x.status === "accepted")) {
    map.set(a.mentorId, { mentorId: a.mentorId, mentorName: a.mentorName, lastMessage: "", lastAt: "", unread: 0 });
  }
  for (const t of threads) {
    const existing = map.get(t.personId);
    if (existing) { existing.lastMessage = t.lastMessage; existing.lastAt = t.lastAt; existing.unread = t.unread; }
    else map.set(t.personId, { mentorId: t.personId, mentorName: t.name, lastMessage: t.lastMessage, lastAt: t.lastAt, unread: t.unread });
  }
  // Conversations with recent activity first, then the rest.
  const connections = Array.from(map.values()).sort((a, b) => (b.lastMessage ? 1 : 0) - (a.lastMessage ? 1 : 0));
  const activeId = searchParams.with && connections.some((c) => c.mentorId === searchParams.with)
    ? searchParams.with
    : connections[0]?.mentorId;
  const active = connections.find((c) => c.mentorId === activeId) ?? null;
  if (active) { await markConversationRead(active.mentorId); active.unread = 0; }
  const messages = active ? await getConversation(active.mentorId) : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy">Messages</h1>

      {connections.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center">
          <p className="text-slate-500">You don&apos;t have any mentor conversations yet.</p>
          <p className="text-sm text-slate-400 mt-1">Once a mentor accepts your application, you can message them here.</p>
          <Link href="/mentors" className="inline-block mt-4 px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Find a mentor</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden grid md:grid-cols-[300px_1fr] h-[520px]">
          <aside className="border-r border-slate-100 overflow-y-auto">
            {connections.map((c) => (
              <Link key={c.mentorId} href={`/mentee/messages?with=${c.mentorId}`} className={`w-full flex items-center gap-3 p-4 text-left border-b border-slate-50 ${c.mentorId === activeId ? "bg-teal-50/60" : "hover:bg-slate-50"}`}>
                <span className="relative w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-navy to-teal grid place-items-center text-white text-sm font-bold">
                  {c.mentorName.charAt(0)}
                  {c.unread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold grid place-items-center">{c.unread}</span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm truncate ${c.unread > 0 ? "font-bold text-navy" : "font-semibold text-navy"}`}>{c.mentorName}</p>
                    {c.lastAt && <span className="text-[10px] text-slate-400 shrink-0">{c.lastAt}</span>}
                  </div>
                  <p className={`text-xs truncate ${c.unread > 0 ? "text-slate-600 font-medium" : "text-slate-400"}`}>{c.lastMessage || "Connected"}</p>
                </div>
              </Link>
            ))}
          </aside>
          {active && <ConversationPanel counterpartId={active.mentorId} counterpartName={active.mentorName} messages={messages} redirectTo="/mentee/messages" />}
        </div>
      )}
    </div>
  );
}
