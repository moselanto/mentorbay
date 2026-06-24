import { createClient } from "@/lib/supabase/server";

export type AppSettings = { platformName: string; supportEmail: string | null; commissionPct: number; adminBalance: number };

const FALLBACK: AppSettings = { platformName: "MentorBay", supportEmail: null, commissionPct: 15, adminBalance: 0 };

// Reads the single-row platform settings. Falls back to defaults when Supabase
// isn't configured or the row is missing.
export async function getSettings(): Promise<AppSettings> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("app_settings")
      .select("platform_name, support_email, commission_pct, admin_balance_kes")
      .eq("id", 1)
      .maybeSingle();
    if (!data) return FALLBACK;
    return {
      platformName: data.platform_name ?? "MentorBay",
      supportEmail: (data.support_email as string | null) || null,
      commissionPct: Number(data.commission_pct ?? 15),
      adminBalance: Number(data.admin_balance_kes ?? 0),
    };
  } catch {
    return FALLBACK;
  }
}
