import MessageComposer from "@/components/MessageComposer";
import type { ChatMessage } from "@/lib/messages";

export default function ConversationPanel({
  counterpartId, counterpartName, messages, redirectTo,
}: { counterpartId: string; counterpartName: string; messages: ChatMessage[]; redirectTo: string }) {
  return (
    <section className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b border-slate-100">
        <span className="w-9 h-9 rounded-full bg-gradient-to-br from-navy to-teal grid place-items-center text-white text-sm font-bold">{counterpartName.charAt(0)}</span>
        <p className="font-semibold text-navy text-sm">{counterpartName}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-400 text-center mt-6">No messages yet. Say hello to {counterpartName.split(" ")[0]}.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${m.fromMe ? "bg-navy text-white rounded-br-sm" : "bg-white text-slate-700 rounded-bl-sm shadow-sm"}`}>
                {m.body}<span className={`block text-[10px] mt-1 ${m.fromMe ? "text-teal-100" : "text-slate-400"}`}>{m.at}</span>
              </div>
            </div>
          ))
        )}
      </div>
      <MessageComposer recipientId={counterpartId} redirectTo={redirectTo} />
    </section>
  );
}
