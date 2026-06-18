"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
    learn, curriculum, duration_label: durationLabel || null,
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
  await supabase.from("programs").update({ status: decision === "approved" ? "published" : "rejected" }).eq("id", id);
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
  await supabase.from("sessions").update({ approval_status: status }).eq("id", id);
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
  await supabase.from("events").update({ approval_status: status }).eq("id", id);
  revalidatePath("/admin/approvals");
  revalidatePath("/events");
  revalidatePath("/mentor/events");
}
