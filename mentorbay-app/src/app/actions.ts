"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ServerClient = ReturnType<typeof createClient>;

// Mentors must be approved before they can create content. Non-mentors pass.
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

// ---------- Create Program ----------
export async function createProgramAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!(await mentorApproved(supabase, user.id))) redirect("/mentor/create-program?error=pending");
  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect("/mentor/create-program?error=title");
  const publish = formData.get("intent") === "publish";
  const { error } = await supabase.from("programs").insert({
    slug: slugify(title), title,
    category: String(formData.get("category") ?? "Leadership"),
    level: String(formData.get("level") ?? "Beginner"),
    weeks: Number(formData.get("weeks") ?? 6) || 6,
    lessons: Number(formData.get("lessons") ?? 12) || 12,
    description: String(formData.get("description") ?? ""),
    status: publish ? "published" : "draft",
    created_by: user.id, rating: 0, enrolled: 0,
  });
  if (error) redirect("/mentor/create-program?error=save");
  revalidatePath("/mentor/programs");
  redirect("/mentor/programs?created=1");
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
    img: "", face: "", going: 0, featured: false,
    status: "published", created_by: user.id,
  });
  if (error) redirect("/mentor/create-event?error=save");
  revalidatePath("/mentor/events");
  redirect("/mentor/events?created=1");
}

// ---------- Create Session ----------
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
