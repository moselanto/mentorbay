import Link from "next/link";
import { getAcceptedMentees } from "@/lib/applications";
import { getConversation } from "@/lib/messages";
import ConversationPanel from "@/components/ConversationPanel";

export default async function MentorMessagesPage({ searchParams }: { searchParams: { with?: string } }) {
  const mentees = (await getAcceptedMentees()).filter((m) => m.personId);
  const activeId = searchParams.with && mentees.some((m) => m.personId === searchParams.with)
    ? searchParams.with
    : mentees[0]?.personId ?? undefined;
  const active = mentees.find((m) => m.personId === activeId) ?? null;
  const messages = active?.personId ? await getConversation(active.personId) : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy">Messages</h1>
      {mentees.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center text-slate-500">
          No mentee conversations yet. Accept an application to start messaging.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden grid md:grid-cols-[280px_1fr] h-[520px]">
          <aside className="border-r border-slate-100 overflow-y-auto">
            {mentees.map((m) => (
              <Link key={m.personId} href={`/mentor/messages?with=${m.personId}`} className={`w-full flex items-center gap-3 p-4 text-left border-b border-slate-50 ${m.personId === activeId ? "bg-teal-50/60" : "hover:bg-slate-50"}`}>
                <span className="w-10 h-10 rounded-full bg-gradient-to-br from-navy to-teal grid place-items-center text-white text-sm font-bold">{m.name.charAt(0)}</span>
                <div className="min-w-0"><p className="font-semibold text-navy text-sm truncate">{m.name}</p><p className="text-xs text-slate-400 truncate">Mentee</p></div>
              </Link>
            ))}
          </aside>
          {active?.personId && <ConversationPanel counterpartId={active.personId} counterpartName={active.name} messages={messages} redirectTo="/mentor/messages" />}
        </div>
      )}
    </div>
  );
}
