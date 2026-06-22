import Link from "next/link";
import { getMyMentorApplications } from "@/lib/registrations";
import { getConversation, getMyMessageThreads } from "@/lib/messages";
import ConversationPanel from "@/components/ConversationPanel";

export default async function MessagesPage({ searchParams }: { searchParams: { with?: string } }) {
  const [apps, threads] = await Promise.all([getMyMentorApplications(), getMyMessageThreads()]);
  const map = new Map<string, { mentorId: string; mentorName: string }>();
  for (const a of apps.filter((x) => x.status === "accepted")) map.set(a.mentorId, { mentorId: a.mentorId, mentorName: a.mentorName });
  for (const t of threads) if (!map.has(t.personId)) map.set(t.personId, { mentorId: t.personId, mentorName: t.name });
  const connections = Array.from(map.values());
  const activeId = searchParams.with && connections.some((c) => c.mentorId === searchParams.with)
    ? searchParams.with
    : connections[0]?.mentorId;
  const active = connections.find((c) => c.mentorId === activeId) ?? null;
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
        <div className="bg-white rounded-2xl shadow-card overflow-hidden grid md:grid-cols-[280px_1fr] h-[520px]">
          <aside className="border-r border-slate-100 overflow-y-auto">
            {connections.map((c) => (
              <Link key={c.mentorId} href={`/mentee/messages?with=${c.mentorId}`} className={`w-full flex items-center gap-3 p-4 text-left border-b border-slate-50 ${c.mentorId === activeId ? "bg-teal-50/60" : "hover:bg-slate-50"}`}>
                <span className="w-10 h-10 rounded-full bg-gradient-to-br from-navy to-teal grid place-items-center text-white text-sm font-bold">{c.mentorName.charAt(0)}</span>
                <div className="min-w-0"><p className="font-semibold text-navy text-sm truncate">{c.mentorName}</p><p className="text-xs text-slate-400 truncate">Connected</p></div>
              </Link>
            ))}
          </aside>
          {active && <ConversationPanel counterpartId={active.mentorId} counterpartName={active.mentorName} messages={messages} redirectTo="/mentee/messages" />}
        </div>
      )}
    </div>
  );
}
