import { getSettings } from "@/lib/settings";

// Sends a notification email via Resend. The admin "Support email" (from
// Platform Settings) is used as the sender identity and reply-to, and is shown
// in the footer. NOTE: Resend requires the sender domain to be verified, so if
// the support address's domain is not verified you can set NOTIFY_FROM_EMAIL to
// a verified sender; the support email is still used as reply-to + contact.
export async function sendNotificationEmail(opts: {
  to: string | null | undefined;
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !opts.to) return; // best-effort, env-gated

  const { platformName, supportEmail } = await getSettings();
  const from =
    process.env.NOTIFY_FROM_EMAIL ||
    (supportEmail ? `${platformName} <${supportEmail}>` : "MentorBay <onboarding@resend.dev>");

  const footer = supportEmail
    ? `<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/><p style="color:#64748b;font-size:12px">You received this email from ${platformName}. Questions? Contact us at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>`
    : "";

  const body: Record<string, unknown> = {
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html + footer,
  };
  if (supportEmail) body.reply_to = supportEmail;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    // best-effort
  }
}
