"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { sendMessageAction } from "@/app/actions";

function SendBtn() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition disabled:opacity-60">
      {pending ? "Sending..." : "Send"}
    </button>
  );
}

// Client composer: submits via the server action then clears the input. Using a
// ref + reset (instead of an uncontrolled input in a server component) prevents
// the double-send / stale-text issue.
export default function MessageComposer({ recipientId, redirectTo }: { recipientId: string; redirectTo: string }) {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={ref}
      action={async (fd) => {
        const body = String(fd.get("body") ?? "").trim();
        if (!body) return;
        ref.current?.reset();
        await sendMessageAction(fd);
      }}
      className="p-3 border-t border-slate-100 flex gap-2"
    >
      <input type="hidden" name="recipient_id" value={recipientId} />
      <input type="hidden" name="redirect" value={redirectTo} />
      <input name="body" required autoComplete="off" className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal outline-none text-sm" placeholder="Type a message..." />
      <SendBtn />
    </form>
  );
}
