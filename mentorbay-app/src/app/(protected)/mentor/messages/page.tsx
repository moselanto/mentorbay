import Link from "next/link";
import { getAcceptedMentees } from "@/lib/applications";
import { getConversation, getMyMessageThreads, markConversationRead } from "@/lib/messages";
import ConversationPanel from "@/components/ConversationPanel";

export const dynamic = "force-dynamic";

export default async function MentorMessagesPage({ searchParams }: { searchParams: { with?: string } }) {
  const [mentees, threads] = await Promise.all([getAcceptedMentees(), getMyMessageThreads()]);
  // Merge accepted mentees with anyone the mentor has an actual message thread with.
  const map = new Map<string, { personId: string; name: string }>();
  for (const m of mentees) if (m.personId) map.set(m.personId, { personId: m.personId, name: m.name });
  for (const t of threads) if (!map.has(t.personId)) map.set(t.personId, { personId: t.personId, name: t.name });
  const people = Array.from(map.values());

  const activeId = searchParams.with && people.some((p) => p.personId === searchParams.with)
    ? searchParams.with
    : people[0]?.personId ?? undefined;
  const active = people.find((p) => p.personId === activeId) ?? null;
  if (active) await markConversationRead(active.personId);
  const messages = active ? await getConversation(active.personId) : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy">Messages</h1>
      {people.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center text-slate-500">
          No conversations yet. When you accept an application or a mentee messages you, the conversation appears here.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden grid md:grid-cols-[280px_1fr] h-[520px]">
          <aside className="border-r border-slate-100 overflow-y-auto">
            {people.map((p) => (
              <Link key={p.personId} href={`/mentor/messages?with=${p.personId}`} className={`w-full flex items-center gap-3 p-4 text-left border-b border-slate-50 ${p.personId === activeId ? "bg-teal-50/60" : "hover:bg-slate-50"}`}>
                <span className="w-10 h-10 rounded-full bg-gradient-to-br from-navy to-teal grid place-items-center text-white text-sm font-bold">{p.name.charAt(0)}</span>
                <div className="min-w-0"><p className="font-semibold text-navy text-sm truncate">{p.name}</p><p className="text-xs text-slate-400 truncate">Mentee</p></div>
              </Link>
            ))}
          </aside>
          {active && <ConversationPanel counterpartId={active.personId} counterpartName={active.name} messages={messages} redirectTo="/mentor/messages" />}
        </div>
      )}
    </div>
  );
}
