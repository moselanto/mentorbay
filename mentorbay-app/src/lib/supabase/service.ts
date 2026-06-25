import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role Supabase client. Bypasses RLS - use ONLY in trusted server-side
// contexts that are NOT driven by an end user's session, e.g. payment gateway
// webhooks/callbacks that must update payment_intents, the payments ledger, and
// wallet/commission balances that the mentee themselves is not allowed to touch.
//
// Requires SUPABASE_SERVICE_ROLE_KEY (server-only secret, never NEXT_PUBLIC_*).
// Returns null when not configured so callers can fail safe.
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
