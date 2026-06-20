"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendNotificationEmail } from "@/lib/email";

type ServerClient = ReturnType<typeof createClient>;

async function mentorApproved(supabase: ServerClient, userId: string): Promise<boolean> {
  const { data } = await supabase.from("profiles").select("role, approval_status").eq("id", userId).maybeSingle();
  if (!data) return false;
  return data.role !== "mentor" || data.approval_status === "approved";
}

function slugify(title: string): string {
  return (
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) +
    "-" + Math.random().toString(36).slice(2, 6)
  );
}


async function getUserContact(supabase: ServerClient, id: string): Promise<{ email: string | null; name: string }> {
  const { data } = await supabase.from("profiles").select("email, full_name").eq("id", id).maybeSingle();
  return { email: (data?.email as string | null) ?? null, name: (data?.full_name as string | null) ?? "there" };
}

// ---------- Profile (Settings) ----------
export async function updateProfileAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const str = (k: string) => { const v = formData.get(k); return typeof v === "string" && v.length > 0 ? v : null; };
  await supabase.from("profiles").update({
    full_name: str("full_name"), headline: str("headline"), title: str("title"),
    bio: str("bio"), location: str("location"), languages: str("languages"), avatar_url: str("avatar_url"),
  }).eq("id", user.id);
  revalidatePath("/mentee/settings");
  revalidatePath("/mentor/settings");
  redirect(`${formData.get("redirect") ?? "/mentee/settings"}?saved=1`);
}

// ---------- Create Program (submitted for admin approval) ----------
export async function createProgramAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!(await mentorApproved(supabase, user.id))) redirect("/mentor/create-program?error=pending");
  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect("/mentor/create-program?error=title");

  const learn = String(formData.get("learn") ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
  const requirements = String(formData.get("requirements") ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
  const curriculum = String(formData.get("curriculum") ?? "")
    .split("\n").map((l) => l.trim()).filter(Boolean)
    .map((line) => { const p = line.split("|").map((x) => x.trim()).filter(Boolean); return { title: p[0] ?? "Module", lessons: p.slice(1) }; });
  const durationLabel = String(formData.get("duration") ?? "").trim();
  const weeksMatch = durationLabel.match(/(\d+)\s*week/i);
  const weeks = weeksMatch ? Number(weeksMatch[1]) : 0;
  const lessons = Number(formData.get("lessons") ?? 0) || curriculum.reduce((n, m) => n + m.lessons.length, 0);

  const { error } = await supabase.from("programs").insert({
    slug: slugify(title), title,
    category: String(formData.get("category") ?? "Leadership"),
    level: String(formData.get("level") ?? "Beginner"),
    weeks, lessons,
    description: String(formData.get("description") ?? ""),
    about: String(formData.get("about") ?? ""),
    learn, curriculum, requirements, duration_label: durationLabel || null,
    cover_url: String(formData.get("cover_url") ?? "") || null,
    status: "pending", created_by: user.id, rating: 0, enrolled: 0,
  });
  if (error) redirect("/mentor/create-program?error=save");
  revalidatePath("/mentor/programs");
  redirect("/mentor/programs?submitted=1");
}

// ---------- Create Event ----------
export async function createEventAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!(await mentorApproved(supabase, user.id))) redirect("/mentor/create-event?error=pending");
  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect("/mentor/create-event?error=title");
  const dateStr = String(formData.get("date") ?? "");
  const d = dateStr ? new Date(dateStr) : null;
  const mon = d ? d.toLocaleString("en-US", { month: "short" }).toUpperCase() : "";
  const day = d ? String(d.getDate()) : "";
  const dateLabel = d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : dateStr;
  const { error } = await supabase.from("events").insert({
    slug: slugify(title), title, when_status: "upcoming",
    category: String(formData.get("category") ?? "Business"),
    format: String(formData.get("format") ?? "Online"),
    mon, day, date_label: dateLabel,
    time_label: String(formData.get("time") ?? ""),
    location: String(formData.get("location") ?? ""),
    speaker: String(formData.get("speaker") ?? ""),
    img: String(formData.get("cover_url") ?? "") || "", face: "", going: 0, featured: false,
    status: "published", created_by: user.id,
  });
  if (error) redirect("/mentor/create-event?error=save");
  revalidatePath("/mentor/events");
  redirect("/mentor/events?created=1");
}

// ---------- Create Session (defaults to pending approval) ----------
export async function createSessionAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!(await mentorApproved(supabase, user.id))) redirect("/mentor/sessions?error=pending");
  const topic = String(formData.get("topic") ?? "").trim();
  const when = String(formData.get("scheduled_at") ?? "");
  if (!topic || !when) redirect("/mentor/sessions?error=missing");
  const { error } = await supabase.from("sessions").insert({
    mentor_id: user.id, topic,
    mode: String(formData.get("mode") ?? "Google Meet"),
    scheduled_at: new Date(when).toISOString(), status: "upcoming",
  });
  if (error) redirect("/mentor/sessions?error=save");
  revalidatePath("/mentor/sessions");
  redirect("/mentor/sessions?created=1");
}

// ---------- Delete own session ----------
export async function deleteSessionAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabase.from("sessions").delete().eq("id", id).eq("mentor_id", user.id);
  revalidatePath("/mentor/sessions");
}

// ---------- Mentor: accept/decline applications ----------
export async function setApplicationStatusAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["accepted", "declined"].includes(status)) return;
  await supabase.from("applications").update({ status }).eq("id", id).eq("mentor_id", user.id);
  revalidatePath("/mentor/applications");
  revalidatePath("/mentor/mentees");
  revalidatePath("/mentor");
}

// ---------- Admin: approve/reject a user ----------
export async function setApprovalAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["approved", "rejected"].includes(status)) return;
  await supabase.from("profiles").update({ approval_status: status }).eq("id", id);
  const who = await getUserContact(supabase, id);
  if (status === "approved") {
    await sendNotificationEmail({ to: who.email, subject: "Your MentorBay mentor account is approved",
      html: `<p>Hi ${who.name},</p><p>Good news - your mentor account has been approved. You can now publish programs, events and sessions.</p><p><a href="https://mentorbay.vercel.app/mentor">Go to your dashboard</a></p>` });
  } else {
    await sendNotificationEmail({ to: who.email, subject: "Update on your MentorBay mentor application",
      html: `<p>Hi ${who.name},</p><p>Thank you for your interest in mentoring on MentorBay. After review, your mentor application was not approved at this time.</p>` });
  }
  revalidatePath("/admin/approvals");
  revalidatePath("/admin");
  revalidatePath("/admin/users");
}

// ---------- Admin: approve/reject a program ----------
export async function setProgramApprovalAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") ?? "");
  const decision = String(formData.get("status") ?? "");
  if (!id || !["approved", "rejected"].includes(decision)) return;
  const { data: prog } = await supabase.from("programs").update({ status: decision === "approved" ? "published" : "rejected" }).eq("id", id).select("title, created_by").maybeSingle();
  if (prog?.created_by) {
    const owner = await getUserContact(supabase, prog.created_by as string);
    const title = (prog.title as string) ?? "Your program";
    await sendNotificationEmail({ to: owner.email,
      subject: decision === "approved" ? `Your program "${title}" is now live` : `Your program "${title}" was not approved`,
      html: decision === "approved"
        ? `<p>Hi ${owner.name},</p><p>Your program <strong>${title}</strong> has been approved and is now published on MentorBay.</p>`
        : `<p>Hi ${owner.name},</p><p>Your program <strong>${title}</strong> was reviewed but not approved. You can edit it and resubmit from your dashboard.</p>` });
  }
  revalidatePath("/admin/approvals");
  revalidatePath("/mentor/programs");
  revalidatePath("/programs");
}

// ---------- Admin: approve/reject a session ----------
export async function setSessionApprovalAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["approved", "rejected"].includes(status)) return;
  const { data: sess } = await supabase.from("sessions").update({ approval_status: status }).eq("id", id).select("topic, mentor_id").maybeSingle();
  if (sess?.mentor_id) {
    const owner = await getUserContact(supabase, sess.mentor_id as string);
    const topic = (sess.topic as string) ?? "your session";
    await sendNotificationEmail({ to: owner.email,
      subject: status === "approved" ? `Your session "${topic}" is approved` : `Your session "${topic}" was not approved`,
      html: status === "approved"
        ? `<p>Hi ${owner.name},</p><p>Your session <strong>${topic}</strong> has been approved and is now visible to mentees.</p><p><a href="https://mentorbay.vercel.app/mentor/sessions">View your sessions</a></p>`
        : `<p>Hi ${owner.name},</p><p>Your session <strong>${topic}</strong> was reviewed but not approved.</p>` });
  }
  revalidatePath("/admin/approvals");
  revalidatePath("/mentor/sessions");
}

// ---------- Admin: review moderation ----------
export async function setReviewStatusAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["visible", "removed"].includes(status)) return;
  await supabase.from("reviews").update({ status }).eq("id", id);
  revalidatePath("/admin/moderation");
}

export async function suspendAuthorAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const authorId = String(formData.get("author_id") ?? "");
  if (!authorId) return;
  await supabase.from("profiles").update({ suspended: true }).eq("id", authorId);
  revalidatePath("/admin/moderation");
  revalidatePath("/admin/users");
}

// ---------- Admin: suspend / unsuspend a user ----------
export async function setSuspendedAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") ?? "");
  const suspended = String(formData.get("suspended") ?? "") === "true";
  if (!id) return;
  await supabase.from("profiles").update({ suspended }).eq("id", id);
  if (suspended) {
    const who = await getUserContact(supabase, id);
    await sendNotificationEmail({ to: who.email, subject: "Your MentorBay account has been suspended",
      html: `<p>Hi ${who.name},</p><p>Your MentorBay account has been suspended and access is temporarily restricted. If you believe this is a mistake, reply to this email to reach our support team.</p>` });
  }
  revalidatePath("/admin/users");
}

// ---------- Email admins when a new mentor signs up (best-effort) ----------
export async function notifyAdminsOfSignupAction(payload: { name: string; email: string; role: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_NOTIFY_EMAIL;
  if (!apiKey || !to) return;
  const from = process.env.NOTIFY_FROM_EMAIL || "MentorBay <onboarding@resend.dev>";
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from, to,
        subject: `New ${payload.role} awaiting approval: ${payload.name}`,
        html: `<p>A new ${payload.role} just signed up on MentorBay and is awaiting approval.</p>
               <p><strong>Name:</strong> ${payload.name}<br/><strong>Email:</strong> ${payload.email}</p>
               <p>Review them here: <a href="https://mentorbay.vercel.app/admin/approvals">Approvals dashboard</a></p>`,
      }),
    });
  } catch {
    // best-effort
  }
}

// ---------- Admin: approve/reject an event ----------
export async function setEventApprovalAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["approved", "rejected"].includes(status)) return;
  const { data: evt } = await supabase.from("events").update({ approval_status: status }).eq("id", id).select("title, created_by").maybeSingle();
  if (evt?.created_by) {
    const owner = await getUserContact(supabase, evt.created_by as string);
    const title = (evt.title as string) ?? "Your event";
    await sendNotificationEmail({ to: owner.email,
      subject: status === "approved" ? `Your event "${title}" is now live` : `Your event "${title}" was not approved`,
      html: status === "approved"
        ? `<p>Hi ${owner.name},</p><p>Your event <strong>${title}</strong> has been approved and is now published on MentorBay.</p>`
        : `<p>Hi ${owner.name},</p><p>Your event <strong>${title}</strong> was reviewed but not approved. You can edit it and resubmit from your dashboard.</p>` });
  }
  revalidatePath("/admin/approvals");
  revalidatePath("/events");
  revalidatePath("/mentor/events");
}

// ---------- Edit own program ----------
export async function updateProgramAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const slug = String(formData.get("slug") ?? "");
  if (!slug) redirect("/mentor/programs");
  const learn = String(formData.get("learn") ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
  const requirements = String(formData.get("requirements") ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
  const curriculum = String(formData.get("curriculum") ?? "")
    .split("\n").map((l) => l.trim()).filter(Boolean)
    .map((line) => { const p = line.split("|").map((x) => x.trim()).filter(Boolean); return { title: p[0] ?? "Module", lessons: p.slice(1) }; });
  const durationLabel = String(formData.get("duration") ?? "").trim();
  const weeksMatch = durationLabel.match(/(\d+)\s*week/i);
  const weeks = weeksMatch ? Number(weeksMatch[1]) : 0;
  const lessons = Number(formData.get("lessons") ?? 0) || curriculum.reduce((n, m) => n + m.lessons.length, 0);
  await supabase.from("programs").update({
    title: String(formData.get("title") ?? ""),
    category: String(formData.get("category") ?? ""),
    level: String(formData.get("level") ?? ""),
    weeks, lessons,
    description: String(formData.get("description") ?? ""),
    about: String(formData.get("about") ?? ""),
    learn, curriculum, requirements, duration_label: durationLabel || null,
    cover_url: String(formData.get("cover_url") ?? "") || null,
  }).eq("slug", slug).eq("created_by", user.id);
  revalidatePath("/mentor/programs");
  revalidatePath(`/programs/${slug}`);
  redirect("/mentor/programs?updated=1");
}

// ---------- Edit own event ----------
export async function updateEventAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const slug = String(formData.get("slug") ?? "");
  if (!slug) redirect("/mentor/events");
  const dateLabel = String(formData.get("date_label") ?? "");
  const t = dateLabel ? new Date(dateLabel).getTime() : NaN;
  const valid = Number.isFinite(t);
  const dd = valid ? new Date(t) : null;
  const mon = dd ? dd.toLocaleString("en-US", { month: "short" }).toUpperCase() : "";
  const day = dd ? String(dd.getDate()) : "";
  await supabase.from("events").update({
    title: String(formData.get("title") ?? ""),
    category: String(formData.get("category") ?? ""),
    format: String(formData.get("format") ?? ""),
    date_label: dateLabel, mon, day,
    time_label: String(formData.get("time") ?? ""),
    location: String(formData.get("location") ?? ""),
    speaker: String(formData.get("speaker") ?? ""),
    img: String(formData.get("cover_url") ?? "") || "",
  }).eq("slug", slug).eq("created_by", user.id);
  revalidatePath("/mentor/events");
  revalidatePath(`/events/${slug}`);
  redirect("/mentor/events?updated=1");
}

// ---------- Delete own program ----------
export async function deleteProgramAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;
  await supabase.from("programs").delete().eq("slug", slug).eq("created_by", user.id);
  revalidatePath("/mentor/programs");
  revalidatePath("/programs");
  redirect("/mentor/programs?deleted=1");
}

// ---------- Admin: save platform settings (name + support email) ----------
export async function saveSettingsAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (prof?.role !== "admin") redirect("/admin/settings");
  const platform_name = String(formData.get("platform_name") ?? "MentorBay").trim() || "MentorBay";
  const support_email = String(formData.get("support_email") ?? "").trim() || null;
  await supabase.from("app_settings").update({ platform_name, support_email, updated_at: new Date().toISOString() }).eq("id", 1);
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}

// ---------- Welcome email on signup (best-effort, env-gated) ----------
export async function sendWelcomeEmailAction(payload: { name: string; email: string; role: string }) {
  const greeting = payload.name ? payload.name : "there";
  const roleNote =
    payload.role === "mentor"
      ? "<p>Your mentor account is pending review by our team - we'll email you as soon as it's approved, and then you can publish programs, events and sessions.</p>"
      : "<p>You can now browse mentors, programs and events, and request sessions that fit your goals.</p>";
  await sendNotificationEmail({
    to: payload.email,
    subject: "Welcome to MentorBay",
    html: `<p>Hi ${greeting},</p><p>Welcome to MentorBay - we're glad to have you.</p>${roleNote}<p><a href="https://mentorbay.vercel.app/${payload.role === "mentor" ? "mentor" : "mentee"}">Go to your dashboard</a></p>`,
  });
}
