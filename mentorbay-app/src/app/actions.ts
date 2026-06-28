"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendNotificationEmail } from "@/lib/email";
import { mpesaConfigured, normalizeMpesaPhone, stkPush } from "@/lib/daraja";

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

// Returns the email addresses of all admins, plus the ADMIN_NOTIFY_EMAIL env
// fallback if set. De-duplicated; empty entries dropped. Used to notify admins
// of events that need their attention (e.g. a new mentorship application).
async function getAdminEmails(supabase: ServerClient): Promise<string[]> {
  const { data } = await supabase.from("profiles").select("email").eq("role", "admin");
  const emails = (data ?? [])
    .map((r) => (r.email as string | null) ?? null)
    .filter((e): e is string => Boolean(e) && (e as string).includes("@"));
  const envTo = process.env.ADMIN_NOTIFY_EMAIL;
  if (envTo) emails.push(envTo);
  return Array.from(new Set(emails));
}

// ---------- Profile (Settings) ----------
export async function updateProfileAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const str = (k: string) => { const v = formData.get(k); return typeof v === "string" && v.length > 0 ? v : null; };
  // NOTE: avatar_url is intentionally NOT updated here. The AvatarUpload
  // component saves the avatar directly on upload; including it in this form
  // patch would overwrite the saved photo with null (no avatar field exists
  // in this form), which previously made the photo disappear on reload.
  const list = (k: string) => String(formData.get(k) ?? "").split("\n").map((x) => x.trim()).filter(Boolean);
  const patch: Record<string, unknown> = {
    full_name: str("full_name"), headline: str("headline"), title: str("title"),
    bio: str("bio"), location: str("location"), languages: str("languages"),
  };
  if (formData.get("interests") !== null) patch.interests = list("interests");
  if (formData.get("goals") !== null) patch.goals = list("goals");
  if (formData.get("experience_years") !== null) patch.experience_years = Math.max(0, Math.min(60, Number(formData.get("experience_years") ?? 0)));
  await supabase.from("profiles").update(patch).eq("id", user.id);
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

  const { data: mrow } = await supabase.from("mentors").select("slug").eq("profile_id", user.id).maybeSingle();
  const mentorSlug = mrow?.slug ?? null;
  const isPaid = String(formData.get("is_paid") ?? "") === "true";
  const priceKes = isPaid ? Math.max(0, Number(formData.get("price_kes") ?? 0)) : 0;
  const maxInstallments = isPaid ? Math.max(1, Math.min(4, Number(formData.get("max_installments") ?? 1))) : 1;
  const { error } = await supabase.from("programs").insert({
    slug: slugify(title), title,
    category: String(formData.get("category") ?? "Leadership"),
    level: String(formData.get("level") ?? "Beginner"),
    weeks, lessons,
    description: String(formData.get("description") ?? ""),
    about: String(formData.get("about") ?? ""),
    learn, curriculum, requirements, duration_label: durationLabel || null,
    cover_url: String(formData.get("cover_url") ?? "") || null,
    mentor_slug: mentorSlug,
    status: "pending", created_by: user.id, rating: 0, enrolled: 0,
    is_free: !isPaid, price_kes: priceKes, max_installments: maxInstallments,
  });
  if (error) redirect("/mentor/create-program?error=save");
  revalidatePath("/mentor/programs");
  redirect("/mentor/programs?submitted=1");
}


// Parse the speakers builder payload (a JSON string of [{name, role}]). Caps at 4.
function parseSpeakers(raw: unknown): { name: string; role: string }[] {
  try {
    const arr = JSON.parse(String(raw ?? "[]"));
    if (!Array.isArray(arr)) return [];
    return arr
      .map((x) => ({ name: String(x?.name ?? "").trim(), role: String(x?.role ?? "").trim() }))
      .filter((x) => x.name.length > 0)
      .slice(0, 4);
  } catch {
    return [];
  }
}

function parseAgenda(raw: FormDataEntryValue | null): { time: string; title: string }[] {
  try {
    const arr = JSON.parse(String(raw ?? "[]"));
    if (!Array.isArray(arr)) return [];
    return arr
      .map((x) => ({ time: String(x?.time ?? "").trim(), title: String(x?.title ?? "").trim() }))
      .filter((x) => x.title);
  } catch { return []; }
}

// ---------- Create Event ----------
export async function createEventAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!(await mentorApproved(supabase, user.id))) redirect("/mentor/create-event?error=pending");
  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect("/mentor/create-event?error=title");
  const speakersList = parseSpeakers(formData.get("speakers"));
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
    speaker: speakersList[0]?.name ?? String(formData.get("speaker") ?? ""), speakers: speakersList,
    img: String(formData.get("cover_url") ?? "") || "", face: "", going: 0, featured: false,
    about: String(formData.get("about") ?? "").trim() || null,
    gains: String(formData.get("gains") ?? "").split("\n").map((x) => x.trim()).filter(Boolean),
    agenda: parseAgenda(formData.get("agenda")),
    is_paid: String(formData.get("is_paid") ?? "false") === "true",
    price_kes: String(formData.get("is_paid") ?? "false") === "true" ? Math.max(1, Math.round(Number(formData.get("price_kes")) || 0)) : 0,
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
    meeting_url: String(formData.get("meeting_url") ?? "").trim() || null,
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
  const { data: app } = await supabase.from("applications").update({ status }).eq("id", id).eq("mentor_id", user.id).select("mentee_id").maybeSingle();
  // On acceptance, let the mentee know their request was approved (best-effort, env-gated).
  if (status === "accepted" && app?.mentee_id) {
    const mentee = await getUserContact(supabase, app.mentee_id as string);
    const me = await getUserContact(supabase, user.id);
    await sendNotificationEmail({ to: mentee.email,
      subject: "Your MentorBay mentorship request was approved",
      html: `<p>Hi ${mentee.name},</p><p>Good news - ${me.name} has accepted your mentorship request. You are now connected and can book sessions and message your mentor.</p><p><a href="https://mentorbay.vercel.app/mentee/my-mentor">Go to My Mentor</a></p>` });
  }
  revalidatePath("/mentor/applications");
  revalidatePath("/mentor/mentees");
  revalidatePath("/mentor");
}

// ---------- Mentor: decline an application with an optional reason ----------
export async function mentorDeclineApplicationAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  if (!id) return;
  const { data: app } = await supabase.from("applications")
    .update({ status: "declined", decline_reason: reason || null })
    .eq("id", id).eq("mentor_id", user.id)
    .select("mentee_id").maybeSingle();
  if (app?.mentee_id) {
    const mentee = await getUserContact(supabase, app.mentee_id as string);
    const me = await getUserContact(supabase, user.id);
    const note = reason ? `<p><strong>Note from ${me.name}:</strong> ${reason}</p>` : "";
    await sendNotificationEmail({ to: mentee.email,
      subject: "Update on your MentorBay mentorship request",
      html: `<p>Hi ${mentee.name},</p><p>Thank you for your interest in working with ${me.name}. They aren&apos;t able to take this mentorship on at the moment.</p>${note}<p>There are other great mentors on MentorBay who may be a strong fit.</p><p><a href="https://mentorbay.vercel.app/mentors">Browse mentors</a></p>` });
  }
  revalidatePath("/mentor/applications");
  revalidatePath("/mentor/mentees");
  revalidatePath("/mentor");
  revalidatePath("/mentee/my-mentor");
  redirect("/mentor/applications?declined=1");
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
  // Role-aware approval/decline email (applies to both mentees and mentors).
  const { data: prof } = await supabase.from("profiles").select("role").eq("id", id).maybeSingle();
  const role = (prof?.role as string) ?? "mentee";
  const dashUrl = role === "mentor" ? "https://mentorbay.vercel.app/mentor" : "https://mentorbay.vercel.app/mentee";
  if (status === "approved") {
    const what = role === "mentor"
      ? "You can now publish programs, events and sessions, and connect with mentees."
      : "You can now browse mentors and programs, apply for mentorship, and join events.";
    await sendNotificationEmail({ to: who.email, subject: "Your MentorBay account is approved",
      html: `<p>Hi ${who.name},</p><p>Good news - your MentorBay account has been approved. ${what}</p><p><a href="${dashUrl}">Go to your dashboard</a></p>` });
  } else {
    await sendNotificationEmail({ to: who.email, subject: "Update on your MentorBay account",
      html: `<p>Hi ${who.name},</p><p>Thank you for signing up for MentorBay. After review, your account was not approved at this time. If you believe this is a mistake, please reply to this email to reach our support team.</p>` });
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

// ---------- Admin: permanently delete a member ----------
// Hard delete (distinct from suspend). Admin-only. Clears the non-cascading FK
// references first (programs.created_by / events.created_by have no ON DELETE
// rule), then deletes the profile row - child rows with ON DELETE CASCADE
// (enrollments, applications, sessions, messages, event_registrations, etc.)
// are removed automatically.
export async function deleteUserAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (me?.role !== "admin") redirect("/admin/users");
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/users");
  if (id === user.id) redirect("/admin/users?delerror=self");  // never delete yourself
  // Notify the member before removing their record (best-effort).
  const who = await getUserContact(supabase, id);
  // Detach content authored by this member so the profile delete is not blocked.
  await supabase.from("programs").delete().eq("created_by", id);
  await supabase.from("events").delete().eq("created_by", id);
  // Remove the profile (cascades to enrollments / applications / sessions / messages / registrations).
  await supabase.from("profiles").delete().eq("id", id);
  if (who.email) {
    await sendNotificationEmail({ to: who.email, subject: "Your MentorBay account has been removed",
      html: `<p>Hi ${who.name},</p><p>Your MentorBay account has been removed by an administrator. If you believe this is a mistake, please reply to this email to reach our support team.</p>` });
  }
  revalidatePath("/admin/users");
  redirect("/admin/users?deleted=1");
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
  const { data: mrow2 } = await supabase.from("mentors").select("slug").eq("profile_id", user.id).maybeSingle();
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
  const isPaidU = String(formData.get("is_paid") ?? "") === "true";
  const priceKesU = isPaidU ? Math.max(0, Number(formData.get("price_kes") ?? 0)) : 0;
  const maxInstallmentsU = isPaidU ? Math.max(1, Math.min(4, Number(formData.get("max_installments") ?? 1))) : 1;
  await supabase.from("programs").update({
    title: String(formData.get("title") ?? ""),
    category: String(formData.get("category") ?? ""),
    level: String(formData.get("level") ?? ""),
    weeks, lessons,
    description: String(formData.get("description") ?? ""),
    about: String(formData.get("about") ?? ""),
    learn, curriculum, requirements, duration_label: durationLabel || null,
    cover_url: String(formData.get("cover_url") ?? "") || null,
    mentor_slug: mrow2?.slug ?? null,
    is_free: !isPaidU, price_kes: priceKesU, max_installments: maxInstallmentsU,
  }).eq("slug", slug).eq("created_by", user.id);
  revalidatePath("/mentor/programs");
  revalidatePath(`/programs/${slug}`);
  redirect("/mentor/programs?updated=1");
}

// ---------- Mentor: reschedule / advance a program cohort ----------
// Batches run in sequence: set a start date for the next cohort, or mark the
// current one running/finished. When one finishes the mentor sets the next date.
export async function rescheduleCohortAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) redirect("/mentor/programs");
  const cohortStart = String(formData.get("cohort_start") ?? "").trim() || null;
  const rawStatus = String(formData.get("cohort_status") ?? "scheduled").trim();
  const cohortStatus = ["scheduled", "running", "finished"].includes(rawStatus) ? rawStatus : "scheduled";
  await supabase.from("programs").update({ cohort_start: cohortStart, cohort_status: cohortStatus })
    .eq("slug", slug).eq("created_by", user.id);
  revalidatePath("/mentor/programs");
  revalidatePath(`/programs/${slug}`);
  redirect("/mentor/programs?cohort=1");
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
    speaker: parseSpeakers(formData.get("speakers"))[0]?.name ?? String(formData.get("speaker") ?? ""),
    speakers: parseSpeakers(formData.get("speakers")),
    img: String(formData.get("cover_url") ?? "") || "",
    about: String(formData.get("about") ?? "").trim() || null,
    gains: String(formData.get("gains") ?? "").split("\n").map((x) => x.trim()).filter(Boolean),
    agenda: parseAgenda(formData.get("agenda")),
    is_paid: String(formData.get("is_paid") ?? "false") === "true",
    price_kes: String(formData.get("is_paid") ?? "false") === "true" ? Math.max(1, Math.round(Number(formData.get("price_kes")) || 0)) : 0,
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
  const commission_pct = Math.max(0, Math.min(100, Number(String(formData.get("commission_pct") ?? "15").trim()) || 15));
  await supabase.from("app_settings").update({ platform_name, support_email, commission_pct, updated_at: new Date().toISOString() }).eq("id", 1);
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

// ---------- Delete own event ----------
export async function deleteEventAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;
  await supabase.from("events").delete().eq("slug", slug).eq("created_by", user.id);
  revalidatePath("/mentor/events");
  revalidatePath("/events");
  redirect("/mentor/events?deleted=1");
}

// ---------- Update an existing session (mode + meeting link + time) ----------
export async function updateSessionAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const patch: Record<string, unknown> = {
    mode: String(formData.get("mode") ?? "Google Meet"),
    meeting_url: String(formData.get("meeting_url") ?? "").trim() || null,
  };
  const when = String(formData.get("scheduled_at") ?? "");
  if (when) patch.scheduled_at = new Date(when).toISOString();
  await supabase.from("sessions").update(patch).eq("id", id).eq("mentor_id", user.id);
  revalidatePath("/mentor/sessions");
  redirect("/mentor/sessions?updated=1");
}


// ---------- Admin: approve/reject an article ----------
export async function setArticleApprovalAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["approved", "rejected"].includes(status)) return;
  const { data: art } = await supabase.from("articles").update({ approval_status: status }).eq("id", id).select("title, slug, author_id").maybeSingle();
  if (art?.author_id) {
    const owner = await getUserContact(supabase, art.author_id as string);
    const title = (art.title as string) ?? "Your article";
    await sendNotificationEmail({ to: owner.email,
      subject: status === "approved" ? `Your article "${title}" is now live` : `Your article "${title}" was not approved`,
      html: status === "approved"
        ? `<p>Hi ${owner.name},</p><p>Your article <strong>${title}</strong> has been approved and is now published on MentorBay.</p>`
        : `<p>Hi ${owner.name},</p><p>Your article <strong>${title}</strong> was reviewed but not approved. You can edit it and resubmit from your dashboard.</p>` });
  }
  revalidatePath("/admin/approvals");
  revalidatePath("/articles");
  revalidatePath("/mentor/articles");
}

// ---------- Articles: create (submitted for admin approval) ----------
export async function createArticleAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!(await mentorApproved(supabase, user.id))) redirect("/mentor/articles?error=pending");
  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect("/mentor/articles/new?error=title");
  const publish = String(formData.get("publish") ?? "") === "true";
  const { error } = await supabase.from("articles").insert({
    slug: slugify(title), title,
    excerpt: String(formData.get("excerpt") ?? "").trim() || null,
    body: String(formData.get("body") ?? "").trim() || null,
    cover_url: String(formData.get("cover_url") ?? "").trim() || null,
    author_id: user.id,
    status: publish ? "published" : "draft",
    approval_status: "pending",
  });
  if (error) redirect("/mentor/articles/new?error=save");
  revalidatePath("/mentor/articles");
  redirect(publish ? "/mentor/articles?submitted=1" : "/mentor/articles?saved=1");
}

// ---------- Articles: edit own ----------
export async function updateArticleAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const slug = String(formData.get("slug") ?? "");
  if (!slug) redirect("/mentor/articles");
  const publish = String(formData.get("publish") ?? "") === "true";
  await supabase.from("articles").update({
    title: String(formData.get("title") ?? ""),
    excerpt: String(formData.get("excerpt") ?? "").trim() || null,
    body: String(formData.get("body") ?? "").trim() || null,
    cover_url: String(formData.get("cover_url") ?? "").trim() || null,
    status: publish ? "published" : "draft",
    approval_status: "pending",
    updated_at: new Date().toISOString(),
  }).eq("slug", slug).eq("author_id", user.id);
  revalidatePath("/mentor/articles");
  redirect("/mentor/articles?updated=1");
}

// ---------- Articles: delete own ----------
export async function deleteArticleAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;
  await supabase.from("articles").delete().eq("slug", slug).eq("author_id", user.id);
  revalidatePath("/mentor/articles");
  redirect("/mentor/articles?deleted=1");
}

// ---------- Mentee: enroll / unenroll in a program ----------
export async function enrollProgramAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const slug = String(formData.get("slug") ?? "");
  const redirectTo = String(formData.get("redirect") ?? `/programs/${slug}`);
  if (!user) redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  if (!slug) return;
  const action = String(formData.get("action") ?? "enroll");
  if (action === "unenroll") {
    await supabase.from("enrollments").delete().eq("user_id", user.id).eq("program_slug", slug);
  } else {
    // Explicit check-then-insert (more robust than upsert onConflict across PostgREST versions).
    const { data: existing } = await supabase.from("enrollments").select("id").eq("user_id", user.id).eq("program_slug", slug).maybeSingle();
    if (!existing) {
      const phone = String(formData.get("phone") ?? "").trim();
      const email = String(formData.get("email") ?? "").trim();
      const { error } = await supabase.from("enrollments").insert({ user_id: user.id, program_slug: slug, status: "pending", mentee_phone: phone || null, mentee_email: email || null });
      // 23505 = unique violation (already enrolled) is fine; any other error is real (e.g. FK / RLS).
      if (error && error.code !== "23505") {
        redirect(`/programs/${slug}?enrollerror=1`);
      }
      // Notify the program owner that someone requested enrollment (best-effort, env-gated).
      try {
        const applicant = await getUserContact(supabase, user.id);
        const { data: prog } = await supabase.from("programs").select("title, created_by").eq("slug", slug).maybeSingle();
        if (prog?.created_by) {
          const owner = await getUserContact(supabase, prog.created_by as string);
          const ptitle = (prog.title as string) ?? "your program";
          await sendNotificationEmail({ to: owner.email,
            subject: `New enrollment request for "${ptitle}"`,
            html: `<p>Hi ${owner.name},</p><p><strong>${applicant.name}</strong>` +
              (email ? ` (${email})` : (applicant.email ? ` (${applicant.email})` : ``)) +
              (phone ? `, phone ${phone},` : ``) +
              ` has requested to enroll in <strong>${ptitle}</strong> and is awaiting your approval.</p>` +
              `<p>Log in to review and approve: <a href="https://mentorbay.vercel.app/mentor/programs">My Programs</a></p>` });
        }
      } catch { /* best-effort */ }
    }
  }
  revalidatePath(`/programs/${slug}`);
  revalidatePath("/mentee/programs");
  revalidatePath("/mentee");
}

// ---------- Mentee: pay for a program (simulated; gateway-ready) ----------
// Commission is taken OFF THE TOP of the program price. The mentor's share is
// released to their wallet only once the program is FULLY paid; the platform
// cut accrues to the admin balance at that point. Each payment is recorded in
// the payments ledger so a real gateway (M-Pesa/Paystack) can reconcile later.
export async function payProgramAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const slug = String(formData.get("slug") ?? "").trim();
  const planRaw = String(formData.get("plan") ?? "1");
  if (!slug) redirect("/mentee/programs");
  // Load the enrollment (must be the mentee's own, mentor-approved) + program price.
  const { data: enr } = await supabase.from("enrollments")
    .select("id, status, amount_paid_kes, fully_paid, payout_released")
    .eq("user_id", user.id).eq("program_slug", slug).maybeSingle();
  if (!enr) redirect(`/programs/${slug}?payerror=notenrolled`);
  if (enr.status === "pending") redirect(`/programs/${slug}?payerror=notapproved`);
  if (enr.fully_paid) redirect("/mentee/programs?paid=already");
  const { data: prog } = await supabase.from("programs").select("price_kes, max_installments, created_by, title").eq("slug", slug).maybeSingle();
  const price = Number(prog?.price_kes ?? 0);
  if (!prog || price <= 0) redirect(`/programs/${slug}?payerror=free`);
  const maxInst = Math.max(1, Math.min(4, Number(prog.max_installments ?? 1)));
  // Chosen plan: number of installments (1 = full). The amount due now is the
  // remaining balance divided across the remaining installments, rounded.
  const plan = Math.max(1, Math.min(maxInst, Number(planRaw) || 1));
  const already = Number(enr.amount_paid_kes ?? 0);
  const remaining = Math.max(0, price - already);
  if (remaining <= 0) redirect("/mentee/programs?paid=already");
  // Per-installment amount (last installment clears any rounding remainder).
  const perInstallment = plan <= 1 ? remaining : Math.ceil(price / plan);
  const payNow = Math.min(remaining, perInstallment);
  const newPaid = already + payNow;
  const nowFull = newPaid >= price;
  // 1) Record the (simulated) payment in the ledger.
  await supabase.from("payments").insert({
    mentee_id: user.id, mentor_id: (prog.created_by as string) ?? null, program_slug: slug,
    amount_kes: payNow, kind: nowFull && plan <= 1 ? "full" : "installment", provider: "simulated",
  });
  // 2) Update the enrollment running total + plan.
  await supabase.from("enrollments").update({
    amount_paid_kes: newPaid, payment_plan: plan, fully_paid: nowFull,
  }).eq("id", enr.id as string);
  // 3) On FULL payment, release the split exactly once (guarded by payout_released).
  if (nowFull && !enr.payout_released) {
    const { data: setRow } = await supabase.from("app_settings").select("commission_pct, admin_balance_kes").eq("id", 1).maybeSingle();
    const pct = Math.max(0, Math.min(100, Number(setRow?.commission_pct ?? 15)));
    const adminCut = Math.round((price * pct) / 100);
    const mentorShare = price - adminCut;
    // Admin balance accrues the commission.
    await supabase.from("app_settings").update({ admin_balance_kes: Number(setRow?.admin_balance_kes ?? 0) + adminCut }).eq("id", 1);
    // Mentor wallet accrues their share.
    if (prog.created_by) {
      const { data: mp } = await supabase.from("profiles").select("wallet_balance_kes").eq("id", prog.created_by as string).maybeSingle();
      await supabase.from("profiles").update({ wallet_balance_kes: Number(mp?.wallet_balance_kes ?? 0) + mentorShare }).eq("id", prog.created_by as string);
    }
    await supabase.from("enrollments").update({ payout_released: true }).eq("id", enr.id as string);
  }
  revalidatePath(`/programs/${slug}`);
  revalidatePath("/mentee/programs");
  revalidatePath("/mentee");
  revalidatePath("/mentor/earnings");
  redirect(nowFull ? "/mentee/programs?paid=full" : "/mentee/programs?paid=installment");
}

// ---------- Mentor: payout phone + withdrawal requests ----------
export async function savePayoutPhoneAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const phone = String(formData.get("payout_phone") ?? "").trim();
  await supabase.from("profiles").update({ payout_phone: phone || null }).eq("id", user.id);
  revalidatePath("/mentor/earnings");
  redirect("/mentor/earnings?saved=phone");
}

export async function requestWithdrawalAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: prof } = await supabase.from("profiles").select("wallet_balance_kes, payout_phone").eq("id", user.id).maybeSingle();
  const balance = Number(prof?.wallet_balance_kes ?? 0);
  const phone = (prof?.payout_phone as string | null) ?? null;
  if (!phone) redirect("/mentor/earnings?wderror=nophone");
  // Amount: requested amount, capped at available balance; default = full balance.
  const reqRaw = Number(String(formData.get("amount") ?? "").trim());
  const amount = reqRaw > 0 ? Math.min(reqRaw, balance) : balance;
  if (amount <= 0) redirect("/mentor/earnings?wderror=nobalance");
  // Hold the funds: move out of the wallet into a pending withdrawal (so it cannot be double-requested).
  await supabase.from("withdrawals").insert({ mentor_id: user.id, amount_kes: amount, phone, status: "pending" });
  await supabase.from("profiles").update({ wallet_balance_kes: balance - amount }).eq("id", user.id);
  revalidatePath("/mentor/earnings");
  revalidatePath("/admin/withdrawals");
  redirect("/mentor/earnings?wd=requested");
}

// ---------- Admin: mark a withdrawal as paid ----------
// Auto-payout-ready: when a real gateway (M-Pesa B2C) is wired in, swap the
// manual mark-paid for a gateway disbursement call here.
export async function markWithdrawalPaidAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (prof?.role !== "admin") redirect("/admin/withdrawals");
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/withdrawals");
  await supabase.from("withdrawals").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", id).eq("status", "pending");
  revalidatePath("/admin/withdrawals");
  redirect("/admin/withdrawals?paid=1");
}

// ---------- Mentee: apply for mentorship ----------
export async function applyMentorshipAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const mentorId = String(formData.get("mentor_id") ?? "").trim();
  const redirectTo = String(formData.get("redirect") ?? "/mentors");
  if (!user) redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  if (!mentorId) redirect(`${redirectTo}?applyerror=1`);
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const confirmed = formData.getAll("confirmed_requirements").map((v) => String(v)).filter(Boolean);
  const { data: existing } = await supabase.from("applications").select("id").eq("mentee_id", user.id).eq("mentor_id", mentorId).maybeSingle();
  if (!existing) {
    const { error } = await supabase.from("applications").insert({
      mentee_id: user.id,
      mentor_id: mentorId,
      note: String(formData.get("note") ?? "").trim() || null,
      mentee_phone: phone || null,
      mentee_email: email || null,
      confirmed_requirements: confirmed,
    });
    if (error) { revalidatePath(redirectTo); redirect(`${redirectTo}?applyerror=1`); }
  } else {
    await supabase.from("applications").update({
      mentee_phone: phone || null, mentee_email: email || null, confirmed_requirements: confirmed,
    }).eq("id", existing.id as string);
  }
  // Notify the MENTOR that a mentee has applied to them (best-effort, env-gated).
  try {
    const applicant = await getUserContact(supabase, user.id);
    const mentor = await getUserContact(supabase, mentorId);
    await sendNotificationEmail({
      to: mentor.email,
      subject: `New mentorship application from ${applicant.name}`,
      html:
        `<p>Hi ${mentor.name},</p>` +
        `<p>A mentee has applied to work with you and is awaiting your review.</p>` +
        `<p><strong>Mentee:</strong> ${applicant.name}` +
        (applicant.email ? ` (${applicant.email})` : ``) +
        (email ? `<br/><strong>Contact email:</strong> ${email}` : ``) +
        (phone ? `<br/><strong>Phone:</strong> ${phone}` : ``) +
        `</p>` +
        `<p>Log in to review and approve this application: ` +
        `<a href="https://mentorbay.vercel.app/mentor/applications">Your applications</a></p>`,
    });
  } catch {
    // best-effort; never block the application on notification failure
  }
  revalidatePath(redirectTo);
  revalidatePath("/mentee/my-mentor");
  redirect(`${redirectTo}?applied=1`);
}

// ---------- Mentee: register / unregister for an event ----------
export async function registerEventAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const slug = String(formData.get("slug") ?? "");
  const redirectTo = String(formData.get("redirect") ?? `/events/${slug}`);
  if (!user) redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  if (!slug) return;
  const action = String(formData.get("action") ?? "register");
  if (action === "unregister") {
    await supabase.from("event_registrations").delete().eq("user_id", user.id).eq("event_slug", slug);
  } else {
    await supabase.from("event_registrations").upsert({ user_id: user.id, event_slug: slug }, { onConflict: "user_id,event_slug" });
    // Email a confirmation with the event link (best-effort, env-gated).
    const who = await getUserContact(supabase, user.id);
    const { data: ev } = await supabase.from("events").select("title, date_label, time_label, location, format").eq("slug", slug).maybeSingle();
    const title = (ev?.title as string) ?? "the event";
    const whenLine = `${ev?.date_label ?? ""}${ev?.time_label ? " at " + ev.time_label : ""}`.trim();
    const whereLine = (ev?.format as string) === "Online" ? "Online event" : (ev?.location as string) || "";
    await sendNotificationEmail({ to: who.email, subject: `You're registered: ${title}`,
      html: `<p>Hi ${who.name},</p>` +
            `<p>You're registered for <strong>${title}</strong>. We've saved your spot.</p>` +
            `<p><strong>When:</strong> ${whenLine || "To be announced"}<br/>` +
            `<strong>Where:</strong> ${whereLine || "To be announced"}</p>` +
            `<p><a href="https://mentorbay.vercel.app/events/${slug}">View the event page</a> - you can also manage or cancel your registration there.</p>` +
            `<p>See you there!</p>` });
    // Notify the event owner that someone registered (best-effort, env-gated).
    try {
      const { data: evOwner } = await supabase.from("events").select("created_by").eq("slug", slug).maybeSingle();
      if (evOwner?.created_by) {
        const owner = await getUserContact(supabase, evOwner.created_by as string);
        await sendNotificationEmail({ to: owner.email,
          subject: `New registration for "${title}"`,
          html: `<p>Hi ${owner.name},</p><p><strong>${who.name}</strong>` +
            (who.email ? ` (${who.email})` : ``) +
            ` just registered for your event <strong>${title}</strong>.</p>` +
            `<p><a href="https://mentorbay.vercel.app/events/${slug}">View the event page</a></p>` });
      }
    } catch { /* best-effort */ }
  }
  revalidatePath(`/events/${slug}`);
}

// ---------- Mentee: submit a review for a mentor ----------
export async function submitReviewAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const mentorSlug = String(formData.get("mentor_slug") ?? "");
  const redirectTo = String(formData.get("redirect") ?? (mentorSlug ? `/mentors/${mentorSlug}` : "/mentors"));
  if (!user) redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  const rating = Math.max(1, Math.min(5, Number(formData.get("rating") ?? 5)));
  const body = String(formData.get("body") ?? "").trim();
  if (!body) redirect(`${redirectTo}?review=empty`);
  const who = await getUserContact(supabase, user.id);
  const { error } = await supabase.from("reviews").insert({
    mentor_slug: mentorSlug || null,
    author_id: user.id,
    author_name: who.name,
    rating,
    body,
    status: "visible",
  });
  revalidatePath(redirectTo);
  redirect(`${redirectTo}?review=${error ? "error" : "thanks"}`);
}

// ---------- Admin: feature / unfeature a review as a success story ----------
export async function featureReviewAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") ?? "");
  const featured = String(formData.get("featured") ?? "") === "true";
  if (!id) return;
  await supabase.from("reviews").update({ featured }).eq("id", id);
  revalidatePath("/admin/moderation");
  revalidatePath("/success-stories");
  revalidatePath("/");
}

// ---------- Mentee: book a session with a connected mentor ----------
export async function bookSessionAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/mentee/sessions");
  const mentorId = String(formData.get("mentor_id") ?? "").trim();
  const topic = String(formData.get("topic") ?? "").trim();
  const when = String(formData.get("scheduled_at") ?? "");
  if (!mentorId || !topic || !when) redirect("/mentee/sessions?error=missing");
  // Only allow booking with a mentor the mentee is actually connected to (accepted).
  const { data: conn } = await supabase.from("applications").select("id").eq("mentee_id", user.id).eq("mentor_id", mentorId).eq("status", "accepted").maybeSingle();
  if (!conn) redirect("/mentee/sessions?error=notconnected");
  const { error } = await supabase.from("sessions").insert({
    mentor_id: mentorId, mentee_id: user.id, topic,
    mode: String(formData.get("mode") ?? "Google Meet"),
    scheduled_at: new Date(when).toISOString(), status: "upcoming",
    approval_status: "pending",
  });
  if (error) redirect("/mentee/sessions?error=save");
  // Notify the mentor that a session was requested (best-effort, env-gated).
  try {
    const mentee = await getUserContact(supabase, user.id);
    const mentor = await getUserContact(supabase, mentorId);
    await sendNotificationEmail({ to: mentor.email,
      subject: `New session request from ${mentee.name}: "${topic}"`,
      html: `<p>Hi ${mentor.name},</p><p><strong>${mentee.name}</strong> has requested a session with you: <strong>${topic}</strong>.</p>` +
        `<p>Log in to confirm or decline this session request.</p>` +
        `<p><a href="https://mentorbay.vercel.app/mentor/sessions">View your sessions</a></p>` });
  } catch { /* best-effort */ }
  revalidatePath("/mentee/sessions");
  revalidatePath("/mentee");
  redirect("/mentee/sessions?booked=1");
}

// ---------- Mentor: confirm a session a mentee requested ----------
export async function mentorConfirmSessionAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const { data: sess } = await supabase.from("sessions")
    .update({ approval_status: "approved", decline_reason: null })
    .eq("id", id).eq("mentor_id", user.id)
    .select("topic, mentee_id").maybeSingle();
  if (sess?.mentee_id) {
    const mentee = await getUserContact(supabase, sess.mentee_id as string);
    const topic = (sess.topic as string) ?? "your session";
    await sendNotificationEmail({ to: mentee.email,
      subject: `Your session "${topic}" is confirmed`,
      html: `<p>Hi ${mentee.name},</p><p>Good news - your mentor confirmed your session <strong>${topic}</strong>. It now appears under Upcoming.</p><p><a href="https://mentorbay.vercel.app/mentee/sessions">View your sessions</a></p>` });
  }
  revalidatePath("/mentor/sessions");
  revalidatePath("/mentor");
  revalidatePath("/mentee/sessions");
  redirect("/mentor/sessions?confirmed=1");
}

// ---------- Mentor: decline a session (not available) with a reason ----------
export async function mentorDeclineSessionAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  if (!id) return;
  if (!reason) redirect("/mentor/sessions?error=reason");
  const { data: sess } = await supabase.from("sessions")
    .update({ approval_status: "rejected", decline_reason: reason })
    .eq("id", id).eq("mentor_id", user.id)
    .select("topic, mentee_id").maybeSingle();
  if (sess?.mentee_id) {
    const mentee = await getUserContact(supabase, sess.mentee_id as string);
    const topic = (sess.topic as string) ?? "your session";
    await sendNotificationEmail({ to: mentee.email,
      subject: `Update on your session request "${topic}"`,
      html: `<p>Hi ${mentee.name},</p><p>Your mentor is not available for <strong>${topic}</strong> at the requested time.</p><p><strong>Note from your mentor:</strong> ${reason}</p><p>You can pick another time from your sessions page.</p><p><a href="https://mentorbay.vercel.app/mentee/sessions">Book another time</a></p>` });
  }
  revalidatePath("/mentor/sessions");
  revalidatePath("/mentor");
  revalidatePath("/mentee/sessions");
  redirect("/mentor/sessions?declined=1");
}

// ---------- Mentor: approve / decline a program enrollment request ----------
async function ownsEnrollmentProgram(supabase: ServerClient, enrollmentId: string, mentorId: string): Promise<{ ok: boolean; menteeId: string | null; slug: string | null }> {
  const { data: enr } = await supabase.from("enrollments").select("program_slug, user_id").eq("id", enrollmentId).maybeSingle();
  if (!enr) return { ok: false, menteeId: null, slug: null };
  const { data: prog } = await supabase.from("programs").select("slug").eq("slug", enr.program_slug as string).eq("created_by", mentorId).maybeSingle();
  return { ok: !!prog, menteeId: (enr.user_id as string) ?? null, slug: (enr.program_slug as string) ?? null };
}

export async function mentorApproveEnrollmentAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const owns = await ownsEnrollmentProgram(supabase, id, user.id);
  if (!owns.ok) redirect("/mentor/programs?error=notyours");
  await supabase.from("enrollments").update({ status: "active" }).eq("id", id);
  if (owns.menteeId && owns.slug) {
    const mentee = await getUserContact(supabase, owns.menteeId);
    const { data: prog } = await supabase.from("programs").select("title").eq("slug", owns.slug).maybeSingle();
    const title = (prog?.title as string) ?? "the program";
    await sendNotificationEmail({ to: mentee.email,
      subject: `You're in! Enrollment approved for "${title}"`,
      html: `<p>Hi ${mentee.name},</p><p>Your enrollment in <strong>${title}</strong> has been approved. It now appears under My Programs and you can start learning.</p><p><a href="https://mentorbay.vercel.app/mentee/programs">Go to My Programs</a></p>` });
  }
  revalidatePath("/mentor/programs");
  revalidatePath("/mentor");
  revalidatePath("/mentee/programs");
  revalidatePath("/mentee");
  redirect("/mentor/programs?enrollapproved=1");
}

export async function mentorDeclineEnrollmentAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  if (!id) return;
  const owns = await ownsEnrollmentProgram(supabase, id, user.id);
  if (!owns.ok) redirect("/mentor/programs?error=notyours");
  await supabase.from("enrollments").update({ status: "rejected", decline_reason: reason || null }).eq("id", id);
  if (owns.menteeId && owns.slug) {
    const mentee = await getUserContact(supabase, owns.menteeId);
    const { data: prog } = await supabase.from("programs").select("title").eq("slug", owns.slug).maybeSingle();
    const title = (prog?.title as string) ?? "the program";
    const note = reason ? `<p><strong>Note from the mentor:</strong> ${reason}</p>` : "";
    await sendNotificationEmail({ to: mentee.email,
      subject: `Update on your enrollment request for "${title}"`,
      html: `<p>Hi ${mentee.name},</p><p>Your request to enrol in <strong>${title}</strong> was not approved at this time.</p>${note}<p>You can browse other programs that may be a better fit.</p><p><a href="https://mentorbay.vercel.app/programs">Browse programs</a></p>` });
  }
  revalidatePath("/mentor/programs");
  revalidatePath("/mentor");
  revalidatePath("/mentee/programs");
  redirect("/mentor/programs?enrolldeclined=1");
}

// ---------- Send a direct message to a connected mentor/mentee ----------
export async function sendMessageAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const recipientId = String(formData.get("recipient_id") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const redirectTo = String(formData.get("redirect") ?? "/mentee/messages");
  if (!recipientId || !body) redirect(`${redirectTo}?with=${recipientId}`);
  const since = new Date(Date.now() - 8000).toISOString();
  const { data: dup } = await supabase.from("messages")
    .select("id").eq("sender_id", user.id).eq("recipient_id", recipientId).eq("body", body)
    .gte("created_at", since).maybeSingle();
  if (!dup) {
    await supabase.from("messages").insert({ sender_id: user.id, recipient_id: recipientId, body }); // Guard against accidental double-submit
  }
  revalidatePath(redirectTo);
  redirect(`${redirectTo}?with=${recipientId}`);
}

// ---------- Mentee: update program progress ----------
export async function setProgressAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const slug = String(formData.get("slug") ?? "");
  const pct = Math.max(0, Math.min(100, Number(formData.get("progress") ?? 0)));
  if (!slug) return;
  await supabase.from("enrollments").update({ progress: pct, status: pct >= 100 ? "completed" : "active" }).eq("user_id", user.id).eq("program_slug", slug);
  revalidatePath(`/programs/${slug}`);
  revalidatePath("/mentee/programs");
  revalidatePath("/mentee");
}

// ---------- Mentee: toggle a curriculum lesson complete (auto-updates progress) ----------
export async function toggleLessonAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const slug = String(formData.get("slug") ?? "");
  const key = String(formData.get("lesson_key") ?? "");
  const total = Math.max(1, Number(formData.get("total_lessons") ?? 1));
  if (!slug || !key) return;
  const { data: row } = await supabase.from("enrollments").select("completed_lessons").eq("user_id", user.id).eq("program_slug", slug).maybeSingle();
  const current: string[] = (row?.completed_lessons as string[] | null) ?? [];
  const set = new Set(current);
  if (set.has(key)) set.delete(key); else set.add(key);
  const completed = Array.from(set);
  const pct = Math.min(100, Math.round((completed.length / total) * 100));
  await supabase.from("enrollments").update({
    completed_lessons: completed,
    progress: pct,
    status: pct >= 100 ? "completed" : "active",
  }).eq("user_id", user.id).eq("program_slug", slug);
  revalidatePath(`/programs/${slug}`);
  revalidatePath("/mentee/programs");
  revalidatePath("/mentee");
}

// ---------- Mentee: review/rate a program ----------
export async function submitProgramReviewAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const slug = String(formData.get("program_slug") ?? "");
  const redirectTo = `/programs/${slug}`;
  if (!user) redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  const rating = Math.max(1, Math.min(5, Number(formData.get("rating") ?? 5)));
  const body = String(formData.get("body") ?? "").trim();
  if (!slug || !body) redirect(`${redirectTo}?preview=&review=empty`);
  // Only enrolled mentees can review a program.
  const { data: enr } = await supabase.from("enrollments").select("id").eq("user_id", user.id).eq("program_slug", slug).maybeSingle();
  if (!enr) redirect(`${redirectTo}?review=notenrolled`);
  const who = await getUserContact(supabase, user.id);
  const { error } = await supabase.from("reviews").insert({
    program_slug: slug, author_id: user.id, author_name: who.name, rating, body, status: "visible",
  });
  revalidatePath(redirectTo);
  redirect(`${redirectTo}?review=${error ? "error" : "thanks"}`);
}

// ---------- Mentee: confirm course finished -> grant certificate ----------
export async function confirmCompletionAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const slug = String(formData.get("slug") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/mentee/certificates");
  if (!slug) return;
  // Mentee REQUESTS completion; the certificate is only issued after the mentor approves.
  await supabase.from("enrollments").update({
    progress: 100, completion_status: "pending", completion_decline_reason: null,
  }).eq("user_id", user.id).eq("program_slug", slug);
  // Notify the program owner (mentor) that a completion needs review.
  const { data: prog } = await supabase.from("programs").select("title, created_by").eq("slug", slug).maybeSingle();
  if (prog?.created_by) {
    const mentor = await getUserContact(supabase, prog.created_by as string);
    const me = await getUserContact(supabase, user.id);
    const title = (prog.title as string) ?? "a program";
    await sendNotificationEmail({ to: mentor.email,
      subject: `${me.name} is requesting completion sign-off for "${title}"`,
      html: `<p>Hi ${mentor.name},</p><p><strong>${me.name}</strong> has marked <strong>${title}</strong> as finished and is requesting your approval to issue their certificate.</p><p><a href="https://mentorbay.vercel.app/mentor/programs">Review completion requests</a></p>` });
  }
  revalidatePath("/mentee/certificates");
  revalidatePath("/mentee/programs");
  revalidatePath("/mentor/programs");
  revalidatePath(`/programs/${slug}`);
  redirect(`${redirectTo}?requested=1`);
}

// ---------- Mentor: approve a completion request -> issue certificate ----------
export async function mentorApproveCompletionAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const owns = await ownsEnrollmentProgram(supabase, id, user.id);
  if (!owns.ok) redirect("/mentor/programs?error=notyours");
  await supabase.from("enrollments").update({
    status: "completed", certificate_issued: true, completion_status: "approved",
    completion_decline_reason: null, completed_at: new Date().toISOString(),
  }).eq("id", id);
  if (owns.menteeId && owns.slug) {
    const mentee = await getUserContact(supabase, owns.menteeId);
    const { data: prog } = await supabase.from("programs").select("title").eq("slug", owns.slug).maybeSingle();
    const title = (prog?.title as string) ?? "the program";
    await sendNotificationEmail({ to: mentee.email,
      subject: `Your certificate for "${title}" is ready`,
      html: `<p>Hi ${mentee.name},</p><p>Your mentor confirmed you completed <strong>${title}</strong>. Your certificate has been issued - you can view and print it now.</p><p><a href="https://mentorbay.vercel.app/mentee/certificates">View your certificate</a></p>` });
  }
  revalidatePath("/mentor/programs");
  revalidatePath("/mentee/certificates");
  revalidatePath("/mentee/programs");
  redirect("/mentor/programs?completionapproved=1");
}

// ---------- Mentor: decline a completion request (with reason) ----------
export async function mentorDeclineCompletionAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  if (!id) return;
  const owns = await ownsEnrollmentProgram(supabase, id, user.id);
  if (!owns.ok) redirect("/mentor/programs?error=notyours");
  await supabase.from("enrollments").update({
    completion_status: "rejected", completion_decline_reason: reason || null, certificate_issued: false,
  }).eq("id", id);
  if (owns.menteeId && owns.slug) {
    const mentee = await getUserContact(supabase, owns.menteeId);
    const { data: prog } = await supabase.from("programs").select("title").eq("slug", owns.slug).maybeSingle();
    const title = (prog?.title as string) ?? "the program";
    const note = reason ? `<p><strong>Note from your mentor:</strong> ${reason}</p>` : "";
    await sendNotificationEmail({ to: mentee.email,
      subject: `Update on your completion request for "${title}"`,
      html: `<p>Hi ${mentee.name},</p><p>Your mentor reviewed your completion of <strong>${title}</strong> and it isn&apos;t signed off yet.</p>${note}<p>Once you&apos;ve addressed the note, you can request completion again.</p><p><a href="https://mentorbay.vercel.app/mentee/certificates">View your programs</a></p>` });
  }
  revalidatePath("/mentor/programs");
  revalidatePath("/mentee/certificates");
  revalidatePath("/mentee/programs");
  redirect("/mentor/programs?completiondeclined=1");
}


// ---------- Mentee: pay for a program via M-Pesa (Daraja STK Push) ----------
// This does NOT move any money or grant access. It computes the amount due for
// the chosen installment plan, records a PENDING payment_intent, and asks
// Safaricom to prompt the mentee's phone for their PIN. Safaricom later calls
// our /api/mpesa/callback route, which is where the payment is actually applied
// (ledger row + enrollment total + commission split).
export async function startMpesaProgramPaymentAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const slug = String(formData.get("slug") ?? "").trim();
  const planRaw = String(formData.get("plan") ?? "1");
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  if (!slug) redirect("/mentee/programs");

  if (!mpesaConfigured()) redirect(`/mentee/programs?payerror=mpesa_unconfigured`);
  const phone = normalizeMpesaPhone(phoneRaw);
  if (!phone) redirect(`/programs/${slug}?payerror=badphone`);

  const { data: enr } = await supabase.from("enrollments")
    .select("id, status, amount_paid_kes, fully_paid")
    .eq("user_id", user.id).eq("program_slug", slug).maybeSingle();
  if (!enr) redirect(`/programs/${slug}?payerror=notenrolled`);
  if (enr.status === "pending") redirect(`/programs/${slug}?payerror=notapproved`);
  if (enr.fully_paid) redirect("/mentee/programs?paid=already");

  const { data: prog } = await supabase.from("programs").select("price_kes, max_installments, created_by, title").eq("slug", slug).maybeSingle();
  const price = Number(prog?.price_kes ?? 0);
  if (!prog || price <= 0) redirect(`/programs/${slug}?payerror=free`);
  const maxInst = Math.max(1, Math.min(4, Number(prog.max_installments ?? 1)));
  const plan = Math.max(1, Math.min(maxInst, Number(planRaw) || 1));
  const already = Number(enr.amount_paid_kes ?? 0);
  const remaining = Math.max(0, price - already);
  if (remaining <= 0) redirect("/mentee/programs?paid=already");
  const perInstallment = plan <= 1 ? remaining : Math.ceil(price / plan);
  const payNow = Math.min(remaining, perInstallment);

  const { data: intent, error: intentErr } = await supabase.from("payment_intents").insert({
    mentee_id: user.id,
    mentor_id: (prog.created_by as string) ?? null,
    program_slug: slug,
    amount_kes: payNow,
    plan,
    phone,
    provider: "mpesa",
    status: "pending",
  }).select("id").maybeSingle();
  if (intentErr || !intent) redirect(`/programs/${slug}?payerror=intent`);

  const res = await stkPush({
    phone,
    amount: payNow,
    accountRef: slug,
    description: `MentorBay ${(prog.title as string) ?? "program"}`.slice(0, 60),
  });

  if (!res.ok || !res.checkoutRequestId) {
    await supabase.from("payment_intents").update({ status: "failed", result_desc: res.error ?? "stk_failed" }).eq("id", intent.id as string);
    redirect(`/programs/${slug}?payerror=stk`);
  }

  await supabase.from("payment_intents").update({
    merchant_request_id: res.merchantRequestId ?? null,
    checkout_request_id: res.checkoutRequestId ?? null,
    updated_at: new Date().toISOString(),
  }).eq("id", intent.id as string);

  revalidatePath("/mentee/programs");
  redirect(`/mentee/programs?mpesa=pending&intent=${intent.id}`);
}


// ---------- Mentee: poll an M-Pesa payment intent's status (for waiting UI) ----------
// Returns the current status of one of the caller's own payment intents so the
// waiting screen can show pending / success / failed. RLS ensures a mentee only
// reads their own intents.
export async function getPaymentIntentStatus(intentId: string): Promise<{ status: string; receipt: string | null; desc: string | null } | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !intentId) return null;
  const { data } = await supabase.from("payment_intents")
    .select("status, mpesa_receipt, result_desc")
    .eq("id", intentId).eq("mentee_id", user.id).maybeSingle();
  if (!data) return null;
  return { status: (data.status as string) ?? "pending", receipt: (data.mpesa_receipt as string | null) ?? null, desc: (data.result_desc as string | null) ?? null };
}


// ---------- Mentee: pay for a PAID event via M-Pesa (Daraja STK Push) ----------
// Mirrors startMpesaProgramPaymentAction but for events. Records a pending
// payment_intent (kind 'event'); the /api/mpesa/callback confirms it, marks the
// event_registration paid, and applies the commission split. Free events keep
// using registerEventAction.
export async function startMpesaEventPaymentAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const slug = String(formData.get("slug") ?? "").trim();
  const redirectTo = String(formData.get("redirect") ?? `/events/${slug}`);
  if (!user) redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  if (!slug) redirect("/events");

  if (!mpesaConfigured()) redirect(`${redirectTo}?payerror=mpesa_unconfigured`);
  const phone = normalizeMpesaPhone(String(formData.get("phone") ?? "").trim());
  if (!phone) redirect(`${redirectTo}?payerror=badphone`);

  const { data: ev } = await supabase.from("events").select("title, is_paid, price_kes, created_by").eq("slug", slug).maybeSingle();
  const price = Math.max(0, Math.round(Number(ev?.price_kes ?? 0)));
  if (!ev || ev.is_paid !== true || price <= 0) redirect(`${redirectTo}?payerror=free`);

  // Already registered? Nothing to pay.
  const { data: existing } = await supabase.from("event_registrations").select("id, paid").eq("user_id", user.id).eq("event_slug", slug).maybeSingle();
  if (existing?.paid) redirect(`${redirectTo}?paid=already`);

  const { data: intent, error: intentErr } = await supabase.from("payment_intents").insert({
    mentee_id: user.id,
    mentor_id: (ev.created_by as string) ?? null,
    event_slug: slug,
    amount_kes: price,
    plan: 1,
    phone,
    provider: "mpesa",
    kind: "event",
    status: "pending",
  }).select("id").maybeSingle();
  if (intentErr || !intent) redirect(`${redirectTo}?payerror=intent`);

  const res = await stkPush({
    phone,
    amount: price,
    accountRef: slug,
    description: `MentorBay ${(ev.title as string) ?? "event"}`.slice(0, 60),
  });

  if (!res.ok || !res.checkoutRequestId) {
    await supabase.from("payment_intents").update({ status: "failed", result_desc: res.error ?? "stk_failed" }).eq("id", intent.id as string);
    redirect(`${redirectTo}?payerror=stk`);
  }

  await supabase.from("payment_intents").update({
    merchant_request_id: res.merchantRequestId ?? null,
    checkout_request_id: res.checkoutRequestId ?? null,
    updated_at: new Date().toISOString(),
  }).eq("id", intent.id as string);

  revalidatePath(`/events/${slug}`);
  redirect(`${redirectTo}?mpesa=pending&intent=${intent.id}`);
}
