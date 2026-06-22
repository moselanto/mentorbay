import Link from "next/link";
import { getMyMentorApplications } from "@/lib/registrations";

export default async function MessagesPage() {
  const apps = await getMyMentorApplications();
  const connections = apps.filter((a) => a.status === "accepted");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy">Messages</h1>

      {connections.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center">
          <p className="text-slate-500">You don&apos;t have any mentor conversations yet.</p>
          <p className="text-sm text-slate-400 mt-1">Once a mentor accepts your application, you&apos;ll be able to message them here.</p>
          <Link href="/mentors" className="inline-block mt-4 px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition">Find a mentor</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden grid md:grid-cols-[280px_1fr] h-[520px]">
          <aside className="border-r border-slate-100 overflow-y-auto">
            {connections.map((c, i) => (
              <div key={c.mentorId} className={`w-full flex items-center gap-3 p-4 text-left border-b border-slate-50 ${i === 0 ? "bg-teal-50/60" : ""}`}>
                <span className="w-10 h-10 rounded-full bg-gradient-to-br from-navy to-teal grid place-items-center text-white text-sm font-bold">{c.mentorName.charAt(0)}</span>
                <div className="min-w-0"><p className="font-semibold text-navy text-sm truncate">{c.mentorName}</p><p className="text-xs text-slate-400 truncate">Connected</p></div>
              </div>
            ))}
          </aside>

          <section className="flex flex-col">
            <div className="flex items-center gap-3 p-4 border-b border-slate-100">
              <span className="w-9 h-9 rounded-full bg-gradient-to-br from-navy to-teal grid place-items-center text-white text-sm font-bold">{connections[0].mentorName.charAt(0)}</span>
              <p className="font-semibold text-navy text-sm">{connections[0].mentorName}</p>
            </div>
            <div className="flex-1 grid place-items-center p-6 bg-slate-50 text-center">
              <p className="text-sm text-slate-400">Start the conversation with {connections[0].mentorName.split(" ")[0]}.</p>
            </div>
            <div className="p-3 border-t border-slate-100 flex gap-2">
              <input className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none text-sm" placeholder="Type a message..." />
              <button className="px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg">Send</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
