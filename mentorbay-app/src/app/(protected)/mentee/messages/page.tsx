import { MENTORS } from "@/lib/data";

const THREAD = [
  { from: "them", text: "Hi! Great session today. Don't forget to work on the roadmap draft before Thursday.", time: "2:14 PM" },
  { from: "me", text: "Thank you! I'll have it ready and share it before our call.", time: "2:20 PM" },
  { from: "them", text: "Perfect. Also sending over a reading list that should help.", time: "2:21 PM" },
];

export default function MessagesPage() {
  const m = MENTORS[0];
  const convos = [m, MENTORS[3], MENTORS[5]];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy">Messages</h1>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden grid md:grid-cols-[280px_1fr] h-[520px]">
        <aside className="border-r border-slate-100 overflow-y-auto">
          {convos.map((c, i) => (
            <button key={c.id} className={`w-full flex items-center gap-3 p-4 text-left border-b border-slate-50 ${i === 0 ? "bg-teal-50/60" : "hover:bg-slate-50"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.img} alt={c.name} className="w-10 h-10 rounded-full object-cover" />
              <div className="min-w-0"><p className="font-semibold text-navy text-sm truncate">{c.name}</p><p className="text-xs text-slate-400 truncate">{i === 0 ? "Sending over a reading list..." : "Tap to open conversation"}</p></div>
            </button>
          ))}
        </aside>

        <section className="flex flex-col">
          <div className="flex items-center gap-3 p-4 border-b border-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.img} alt={m.name} className="w-9 h-9 rounded-full object-cover" />
            <p className="font-semibold text-navy text-sm">{m.name}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {THREAD.map((t, i) => (
              <div key={i} className={`flex ${t.from === "me" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${t.from === "me" ? "bg-navy text-white rounded-br-sm" : "bg-white text-slate-700 rounded-bl-sm shadow-sm"}`}>
                  {t.text}<span className={`block text-[10px] mt-1 ${t.from === "me" ? "text-teal-100" : "text-slate-400"}`}>{t.time}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-slate-100 flex gap-2">
            <input className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none text-sm" placeholder="Type a message..." />
            <button className="px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg">Send</button>
          </div>
        </section>
      </div>
    </div>
  );
}
