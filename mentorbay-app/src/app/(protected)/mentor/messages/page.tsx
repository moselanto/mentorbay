import Link from "next/link";
import { getAcceptedMentees } from "@/lib/applications";
import { getConversation, getMyMessageThreads, markConversationRead, markAllDelivered } from "@/lib/messages";
import ConversationPanel from "@/components/ConversationPanel";

export const dynamic = "force-dynamic";

type Person = { personId: string; name: string; lastMessage: string; lastAt: string; unread: number };

export default async function MentorMessagesPage({ searchParams }: { searchParams: { with?: string } }) {
  await markAllDelivered();
  const [mentees, threads] = await Promise.all([getAcceptedMentees(), getMyMessageThreads()]);
  // Merge accepted mentees with anyone the mentor has an actual message thread with.
  const map = new Map<string, Person>();
  for (const m of mentees) if (m.personId) map.set(m.personId, { personId: m.personId, name: m.name, lastMessage: "", lastAt: "", unread: 0 });
  for (const t of threads) {
    const existing = map.get(t.personId);
    if (existing) { existing.lastMessage = t.lastMessage; existing.lastAt = t.lastAt; existing.unread = t.unread; }
    else map.set(t.personId, { personId: t.personId, name: t.name, lastMessage: t.lastMessage, lastAt: t.lastAt, unread: t.unread });
  }
  const people = Array.from(map.values()).sort((a, b) => (b.lastMessage ? 1 : 0) - (a.lastMessage ? 1 : 0));

  const activeId = searchParams.with && people.some((p) => p.personId === searchParams.with)
    ? searchParams.with
    : people[0]?.personId ?? undefined;
  const active = people.find((p) => p.personId === activeId) ?? null;
  if (active) { await markConversationRead(active.personId); active.unread = 0; }
  const messages = active ? await getConversation(active.personId) : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy">Messages</h1>
      {people.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center text-slate-500">
          No conversations yet. When you accept an application or a mentee messages you, the conversation appears here.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden grid md:grid-cols-[300px_1fr] h-[520px]">
          <aside className="border-r border-slate-100 overflow-y-auto">
            {people.map((p) => (
              <Link key={p.personId} href={`/mentor/messages?with=${p.personId}`} className={`w-full flex items-center gap-3 p-4 text-left border-b border-slate-50 ${p.personId === activeId ? "bg-teal-50/60" : "hover:bg-slate-50"}`}>
                <span className="relative w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-navy to-teal grid place-items-center text-white text-sm font-bold">
                  {p.name.charAt(0)}
                  {p.unread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold grid place-items-center">{p.unread}</span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm truncate ${p.unread > 0 ? "font-bold text-navy" : "font-semibold text-navy"}`}>{p.name}</p>
                    {p.lastAt && <span className="text-[10px] text-slate-400 shrink-0">{p.lastAt}</span>}
                  </div>
                  <p className={`text-xs truncate ${p.unread > 0 ? "text-slate-600 font-medium" : "text-slate-400"}`}>{p.lastMessage || "Mentee"}</p>
                </div>
              </Link>
            ))}
          </aside>
          {active && <ConversationPanel counterpartId={active.personId} counterpartName={active.name} messages={messages} redirectTo="/mentor/messages" />}
        </div>
      )}
    </div>
  );
}
