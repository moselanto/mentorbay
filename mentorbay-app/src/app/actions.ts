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
    speaker: parseSpeakers(formData.get("speakers"))[0]?.name ?? String(formData.get("speaker") ?? ""),
    speakers: parseSpeakers(formData.get("speakers")),
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
    const { error } = await supabase.from("enrollments").upsert({ user_id: user.id, program_slug: slug }, { onConflict: "user_id,program_slug" });
    if (error) {
      // Most common cause: the program isn't a real published row (FK violation).
      redirect(`/programs/${slug}?enrollerror=1`);
    }
  }
  revalidatePath(`/programs/${slug}`);
  revalidatePath("/mentee/programs");
  revalidatePath("/mentee");
}

// ---------- Mentee: apply for mentorship ----------
export async function applyMentorshipAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const mentorId = String(formData.get("mentor_id") ?? "").trim();
  const redirectTo = String(formData.get("redirect") ?? "/mentors");
  if (!user) redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  if (!mentorId) redirect(`${redirectTo}?applyerror=1`);
  const { data: existing } = await supabase.from("applications").select("id").eq("mentee_id", user.id).eq("mentor_id", mentorId).maybeSingle();
  if (!existing) {
    const { error } = await supabase.from("applications").insert({
      mentee_id: user.id,
      mentor_id: mentorId,
      note: String(formData.get("note") ?? "").trim() || null,
    });
    if (error) { revalidatePath(redirectTo); redirect(`${redirectTo}?applyerror=1`); }
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
    const { data: ev } = await supabase.from("events").select("title, date_label, time_label, location").eq("slug", slug).maybeSingle();
    const title = (ev?.title as string) ?? "the event";
    await sendNotificationEmail({ to: who.email, subject: `You're registered: ${title}`,
      html: `<p>Hi ${who.name},</p><p>You're registered for <strong>${title}</strong>.</p>` +
            `<p>${ev?.date_label ?? ""} ${ev?.time_label ? "at " + ev.time_label : ""}<br/>${ev?.location ?? ""}</p>` +
            `<p><a href="https://mentorbay.vercel.app/events/${slug}">View the event page</a></p>` });
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
  });
  if (error) redirect("/mentee/sessions?error=save");
  revalidatePath("/mentee/sessions");
  revalidatePath("/mentee");
  redirect("/mentee/sessions?booked=1");
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
