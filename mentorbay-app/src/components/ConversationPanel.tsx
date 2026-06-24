import MessageComposer from "@/components/MessageComposer";
import type { ChatMessage, MessageStatus } from "@/lib/messages";

// Sent = single tick, Delivered = double tick (grey), Read = double tick (teal).
function StatusTicks({ status }: { status: MessageStatus }) {
  const label = status === "read" ? "Read" : status === "delivered" ? "Delivered" : "Sent";
  if (status === "sent") {
    return (
      <span title="Sent" aria-label="Sent" className="inline-flex items-center text-teal-100/80">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </span>
    );
  }
  const color = status === "read" ? "text-teal-300" : "text-teal-100/80";
  return (
    <span title={label} aria-label={label} className={`inline-flex items-center ${color}`}>
      <svg width="18" height="14" viewBox="0 0 22 16" fill="none" aria-hidden="true">
        <path d="M2.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 11.5l1.2 1.2 6-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  );
}

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
                {m.body}
                <span className={`flex items-center gap-1 text-[10px] mt-1 ${m.fromMe ? "text-teal-100 justify-end" : "text-slate-400"}`}>
                  {m.at}
                  {m.fromMe && <StatusTicks status={m.status} />}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      <MessageComposer recipientId={counterpartId} redirectTo={redirectTo} />
    </section>
  );
}
