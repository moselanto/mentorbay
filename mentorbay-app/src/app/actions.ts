"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Update the signed-in user's profile from a Settings form. */
export async function updateProfileAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const str = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" && v.length > 0 ? v : null;
  };
  const patch = {
    full_name: str("full_name"),
    headline: str("headline"),
    title: str("title"),
    bio: str("bio"),
    location: str("location"),
    languages: str("languages"),
  };
  await supabase.from("profiles").update(patch).eq("id", user.id);
  revalidatePath("/mentee/settings");
  revalidatePath("/mentor/settings");
  redirect(`${formData.get("redirect") ?? "/mentee/settings"}?saved=1`);
}

/** Create a program owned by the signed-in mentor. */
export async function createProgramAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect("/mentor/create-program?error=title");

  const slug =
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) +
    "-" + Math.random().toString(36).slice(2, 6);
  const publish = formData.get("intent") === "publish";

  const { error } = await supabase.from("programs").insert({
    slug,
    title,
    category: String(formData.get("category") ?? "Leadership"),
    level: String(formData.get("level") ?? "Beginner"),
    weeks: Number(formData.get("weeks") ?? 6) || 6,
    lessons: Number(formData.get("lessons") ?? 12) || 12,
    description: String(formData.get("description") ?? ""),
    status: publish ? "published" : "draft",
    created_by: user.id,
    rating: 0,
    enrolled: 0,
  });
  if (error) redirect("/mentor/create-program?error=save");
  revalidatePath("/mentor/programs");
  redirect("/mentor/programs?created=1");
}

/** Mentor accepts or declines a mentee application. */
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
