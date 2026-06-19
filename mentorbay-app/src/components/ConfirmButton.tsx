"use client";

import type { ComponentProps } from "react";

// A submit button that asks for confirmation before the form submits.
// Guards destructive actions (delete / remove / suspend) against accidental
// clicks. Works with server-action <form action={...}> and forwards any
// native button props (disabled, title, className, etc.).
export default function ConfirmButton({
  message,
  children,
  ...rest
}: { message: string } & ComponentProps<"button">) {
  return (
    <button
      type="submit"
      {...rest}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
