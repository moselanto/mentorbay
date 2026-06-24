import { createClient } from "@/lib/supabase/server";

export type MyEnrollment = {
  slug: string; title: string; category: string; img: string; mentor: string; pct: number; status: string; declineReason?: string | null;
};

type Row = {
  program_slug: string; progress: number; status: string;
  programs: { title: string; category: string; cover_url: string | null; mentors: { name: string } | null } | null;
};

export async function getMyEnrollments(): Promise<MyEnrollment[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    // 1) The user's enrollment rows (no embed - always reliable).
    const { data: enr } = await supabase
      .from("enrollments")
      .select("program_slug, progress, status")
      .eq("user_id", user.id);
    const rows = (enr as { program_slug: string; progress: number; status: string }[] | null) ?? [];
    if (rows.length === 0) return [];
    // 2) Fetch the matching programs separately and join in JS.
    const slugs = rows.map((r) => r.program_slug);
    const { data: progs } = await supabase
      .from("programs")
      .select("slug, title, category, cover_url, mentors(name)")
      .in("slug", slugs);
    const bySlug = new Map(
      ((progs as unknown as { slug: string; title: string; category: string; cover_url: string | null; mentors: { name: string } | null }[] | null) ?? [])
        .map((p) => [p.slug, p])
    );
    return rows
      .filter((r) => bySlug.has(r.program_slug)) // skip orphaned enrollments
      .filter((r) => r.status !== "pending" && r.status !== "rejected") // only mentor-approved enrollments appear in My Programs
      .map((r) => {
        const p = bySlug.get(r.program_slug)!;
        return {
          slug: r.program_slug,
          title: p.title ?? r.program_slug,
          category: p.category ?? "",
          img: p.cover_url ?? "",
          mentor: p.mentors?.name ?? "",
          pct: r.progress,
          status: r.status,
        };
      });
  } catch {
    return [];
  }
}


/** Whether the signed-in user is enrolled in a given program. */
export async function isEnrolledInProgram(slug: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase.from("enrollments").select("id").eq("user_id", user.id).eq("program_slug", slug).maybeSingle();
    return !!data;
  } catch { return false; }
}


/** How many mentees are enrolled in a program. */
export async function countEnrollments(slug: string): Promise<number> {
  try {
    const supabase = createClient();
    const { count } = await supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("program_slug", slug);
    return count ?? 0;
  } catch { return 0; }
}


/** The signed-in mentee's progress (0-100) + status for a program, or null if not enrolled. */
export async function getProgramProgress(slug: string): Promise<{ pct: number; status: string } | null> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from("enrollments").select("progress, status").eq("user_id", user.id).eq("program_slug", slug).maybeSingle();
    if (!data) return null;
    return { pct: (data.progress as number) ?? 0, status: (data.status as string) ?? "active" };
  } catch { return null; }
}


/** Slugs of all programs the signed-in mentee is enrolled in. */
export async function getMyEnrolledSlugs(): Promise<string[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase.from("enrollments").select("program_slug").eq("user_id", user.id);
    return (data as { program_slug: string }[] | null ?? []).map((r) => r.program_slug);
  } catch { return []; }
}


/** Completed-lesson keys for the signed-in mentee on a program (empty if not enrolled). */
export async function getCompletedLessons(slug: string): Promise<string[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase.from("enrollments").select("completed_lessons").eq("user_id", user.id).eq("program_slug", slug).maybeSingle();
    return (data?.completed_lessons as string[] | null) ?? [];
  } catch { return []; }
}


export type Enrollee = { name: string; pct: number; status: string };

/** Mentees enrolled in a given program (visible to the program owner via RLS). */
export async function getProgramEnrollees(slug: string): Promise<Enrollee[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("enrollments")
      .select("progress, status, user:profiles!enrollments_user_id_fkey(full_name)")
      .eq("program_slug", slug)
      .order("created_at", { ascending: false });
    return (data as unknown as { progress: number; status: string; user: { full_name: string | null } | null }[] | null ?? [])
      .map((r) => ({ name: r.user?.full_name ?? "Mentee", pct: r.progress ?? 0, status: r.status ?? "active" }));
  } catch { return []; }
}


export type Certificate = { slug: string; title: string; mentor: string; issuedAt: string };

/** Programs the mentee has confirmed complete + had a certificate issued. */
export async function getMyCertificates(): Promise<Certificate[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data: rows } = await supabase
      .from("enrollments")
      .select("program_slug, completed_at")
      .eq("user_id", user.id).eq("certificate_issued", true).eq("completion_status", "approved");
    const list = (rows as { program_slug: string; completed_at: string | null }[] | null) ?? [];
    if (list.length === 0) return [];
    const slugs = list.map((r) => r.program_slug);
    const { data: progs } = await supabase.from("programs").select("slug, title, mentors(name)").in("slug", slugs);
    const bySlug = new Map(((progs as unknown as { slug: string; title: string; mentors: { name: string } | null }[] | null) ?? []).map((p) => [p.slug, p]));
    return list.filter((r) => bySlug.has(r.program_slug)).map((r) => {
      const p = bySlug.get(r.program_slug)!;
      return {
        slug: r.program_slug,
        title: p.title,
        mentor: p.mentors?.name ?? "MentorBay",
        issuedAt: r.completed_at ? new Date(r.completed_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "",
      };
    });
  } catch { return []; }
}

export type CompletableEnrollment = { slug: string; title: string; pct: number };

/** Enrolled programs the mentee can confirm complete (not yet certified). */
export async function getCompletableEnrollments(): Promise<CompletableEnrollment[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data: rows } = await supabase
      .from("enrollments")
      .select("program_slug, progress, certificate_issued, completion_status, status")
      .eq("user_id", user.id).eq("certificate_issued", false);
    const list = ((rows as { program_slug: string; progress: number; certificate_issued: boolean; completion_status: string | null; status: string }[] | null) ?? [])
      // Only active (mentor-approved enrollment), and not already awaiting/declined completion sign-off.
      .filter((r) => r.status !== "pending" && r.status !== "rejected")
      .filter((r) => r.completion_status !== "pending" && r.completion_status !== "approved");
    if (list.length === 0) return [];
    const slugs = list.map((r) => r.program_slug);
    const { data: progs } = await supabase.from("programs").select("slug, title").in("slug", slugs);
    const bySlug = new Map(((progs as { slug: string; title: string }[] | null) ?? []).map((p) => [p.slug, p]));
    return list.filter((r) => bySlug.has(r.program_slug)).map((r) => ({ slug: r.program_slug, title: bySlug.get(r.program_slug)!.title, pct: r.progress }));
  } catch { return []; }
}


/** Programs the mentee has REQUESTED but the mentor hasn't approved yet. */
export async function getMyPendingEnrollments(): Promise<MyEnrollment[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data: enr } = await supabase
      .from("enrollments")
      .select("program_slug, progress, status")
      .eq("user_id", user.id).eq("status", "pending");
    const rows = (enr as { program_slug: string; progress: number; status: string }[] | null) ?? [];
    if (rows.length === 0) return [];
    const slugs = rows.map((r) => r.program_slug);
    const { data: progs } = await supabase
      .from("programs")
      .select("slug, title, category, cover_url, mentors(name)")
      .in("slug", slugs);
    const bySlug = new Map(
      ((progs as unknown as { slug: string; title: string; category: string; cover_url: string | null; mentors: { name: string } | null }[] | null) ?? [])
        .map((p) => [p.slug, p])
    );
    return rows.filter((r) => bySlug.has(r.program_slug)).map((r) => {
      const p = bySlug.get(r.program_slug)!;
      return { slug: r.program_slug, title: p.title ?? r.program_slug, category: p.category ?? "", img: p.cover_url ?? "", mentor: p.mentors?.name ?? "", pct: r.progress, status: r.status };
    });
  } catch { return []; }
}


/** Programs the mentee REQUESTED but the mentor declined, with the mentor's note. */
export async function getMyDeclinedEnrollments(): Promise<MyEnrollment[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data: enr } = await supabase
      .from("enrollments")
      .select("program_slug, progress, status, decline_reason")
      .eq("user_id", user.id).eq("status", "rejected");
    const rows = (enr as { program_slug: string; progress: number; status: string; decline_reason: string | null }[] | null) ?? [];
    if (rows.length === 0) return [];
    const slugs = rows.map((r) => r.program_slug);
    const { data: progs } = await supabase
      .from("programs")
      .select("slug, title, category, cover_url, mentors(name)")
      .in("slug", slugs);
    const bySlug = new Map(
      ((progs as unknown as { slug: string; title: string; category: string; cover_url: string | null; mentors: { name: string } | null }[] | null) ?? [])
        .map((p) => [p.slug, p])
    );
    return rows.filter((r) => bySlug.has(r.program_slug)).map((r) => {
      const p = bySlug.get(r.program_slug)!;
      return { slug: r.program_slug, title: p.title ?? r.program_slug, category: p.category ?? "", img: p.cover_url ?? "", mentor: p.mentors?.name ?? "", pct: r.progress, status: r.status, declineReason: r.decline_reason ?? null };
    });
  } catch { return []; }
}


export type EnrollmentRequest = { id: string; menteeName: string; programTitle: string; programSlug: string; requestedAt: string; phone: string | null; email: string | null };

/** Pending enrollment requests across all programs owned by the signed-in mentor. */
export async function getMentorEnrollmentRequests(): Promise<EnrollmentRequest[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    // Programs owned by this mentor (created_by = user).
    const { data: progs } = await supabase.from("programs").select("slug, title").eq("created_by", user.id);
    const list = (progs as { slug: string; title: string }[] | null) ?? [];
    if (list.length === 0) return [];
    const titleBySlug = new Map(list.map((p) => [p.slug, p.title]));
    const slugs = list.map((p) => p.slug);
    const { data: enr } = await supabase
      .from("enrollments")
      .select("id, program_slug, created_at, user:profiles!enrollments_user_id_fkey(full_name)")
      .in("program_slug", slugs).eq("status", "pending")
      .order("created_at", { ascending: false });
    return (enr as unknown as { id: string; program_slug: string; created_at: string; mentee_phone: string | null; mentee_email: string | null; user: { full_name: string | null } | null }[] | null ?? [])
      .map((r) => ({
        id: r.id,
        menteeName: r.user?.full_name ?? "Mentee",
        programTitle: titleBySlug.get(r.program_slug) ?? r.program_slug,
        programSlug: r.program_slug,
        requestedAt: r.created_at ? new Date(r.created_at).toLocaleDateString("en-KE", { month: "short", day: "numeric" }) : "",
        phone: r.mentee_phone ?? null,
        email: r.mentee_email ?? null,
      }));
  } catch { return []; }
}


export type CompletionItem = { slug: string; title: string; mentor: string; reason: string | null };

/** Mentee completion requests still awaiting the mentor. */
export async function getMyPendingCompletions(): Promise<CompletionItem[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data: rows } = await supabase
      .from("enrollments")
      .select("program_slug, completion_status")
      .eq("user_id", user.id).eq("completion_status", "pending");
    const list = (rows as { program_slug: string }[] | null) ?? [];
    if (list.length === 0) return [];
    const slugs = list.map((r) => r.program_slug);
    const { data: progs } = await supabase.from("programs").select("slug, title, mentors(name)").in("slug", slugs);
    const bySlug = new Map(((progs as unknown as { slug: string; title: string; mentors: { name: string } | null }[] | null) ?? []).map((p) => [p.slug, p]));
    return list.filter((r) => bySlug.has(r.program_slug)).map((r) => { const p = bySlug.get(r.program_slug)!; return { slug: r.program_slug, title: p.title, mentor: p.mentors?.name ?? "MentorBay", reason: null }; });
  } catch { return []; }
}

/** Mentee completion requests the mentor declined, with the reason. */
export async function getMyDeclinedCompletions(): Promise<CompletionItem[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data: rows } = await supabase
      .from("enrollments")
      .select("program_slug, completion_decline_reason")
      .eq("user_id", user.id).eq("completion_status", "rejected");
    const list = (rows as { program_slug: string; completion_decline_reason: string | null }[] | null) ?? [];
    if (list.length === 0) return [];
    const slugs = list.map((r) => r.program_slug);
    const { data: progs } = await supabase.from("programs").select("slug, title, mentors(name)").in("slug", slugs);
    const bySlug = new Map(((progs as unknown as { slug: string; title: string; mentors: { name: string } | null }[] | null) ?? []).map((p) => [p.slug, p]));
    return list.filter((r) => bySlug.has(r.program_slug)).map((r) => { const p = bySlug.get(r.program_slug)!; return { slug: r.program_slug, title: p.title, mentor: p.mentors?.name ?? "MentorBay", reason: r.completion_decline_reason ?? null }; });
  } catch { return []; }
}

export type CompletionRequest = { id: string; menteeName: string; programTitle: string; programSlug: string };

/** Completion requests awaiting the signed-in mentor across programs they own. */
export async function getMentorCompletionRequests(): Promise<CompletionRequest[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data: progs } = await supabase.from("programs").select("slug, title").eq("created_by", user.id);
    const list = (progs as { slug: string; title: string }[] | null) ?? [];
    if (list.length === 0) return [];
    const titleBySlug = new Map(list.map((p) => [p.slug, p.title]));
    const slugs = list.map((p) => p.slug);
    const { data: enr } = await supabase
      .from("enrollments")
      .select("id, program_slug, user:profiles!enrollments_user_id_fkey(full_name)")
      .in("program_slug", slugs).eq("completion_status", "pending")
      .order("completed_at", { ascending: false });
    return (enr as unknown as { id: string; program_slug: string; user: { full_name: string | null } | null }[] | null ?? [])
      .map((r) => ({ id: r.id, menteeName: r.user?.full_name ?? "Mentee", programTitle: titleBySlug.get(r.program_slug) ?? r.program_slug, programSlug: r.program_slug }));
  } catch { return []; }
}


export type PaymentState = { price: number; paid: number; balance: number; fullyPaid: boolean; maxInstallments: number; approved: boolean };

/** Payment state for the signed-in mentee on a given program (null if not a paid program / not enrolled). */
export async function getMyPaymentState(slug: string): Promise<PaymentState | null> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: prog } = await supabase.from("programs").select("price_kes, max_installments, is_free").eq("slug", slug).maybeSingle();
    const price = Number(prog?.price_kes ?? 0);
    if (!prog || prog.is_free === true || price <= 0) return null;  // free programs need no payment
    const { data: enr } = await supabase.from("enrollments").select("amount_paid_kes, fully_paid, status").eq("user_id", user.id).eq("program_slug", slug).maybeSingle();
    if (!enr) return null;
    const paid = Number(enr.amount_paid_kes ?? 0);
    return {
      price, paid, balance: Math.max(0, price - paid),
      fullyPaid: !!enr.fully_paid,
      maxInstallments: Math.max(1, Math.min(4, Number(prog.max_installments ?? 1))),
      approved: enr.status !== "pending" && enr.status !== "rejected",
    };
  } catch { return null; }
}
