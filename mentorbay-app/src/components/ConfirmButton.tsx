"use client";

import { useRef, useState } from "react";
import type { ComponentProps } from "react";

// A destructive submit button that asks for confirmation via a lightweight,
// NON-blocking modal (not window.confirm, which freezes the main thread and
// triggers long-INP warnings). On confirm it submits the parent <form>, so it
// keeps working with server-action forms. Forwards native button props.
export default function ConfirmButton({
  message,
  children,
  confirmLabel = "Confirm",
  ...rest
}: { message: string; confirmLabel?: string } & ComponentProps<"button">) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function doConfirm() {
    setOpen(false);
    // Submit the form this button belongs to (runs the form's server action).
    triggerRef.current?.closest("form")?.requestSubmit();
  }

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        {...rest}
        onClick={() => setOpen(true)}
      >
        {children}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-navy font-semibold leading-relaxed">{message}</p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:border-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={doConfirm}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-500 rounded-lg hover:bg-rose-600 transition"
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
