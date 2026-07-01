// Safaricom Daraja (M-Pesa) helper. Wraps OAuth token retrieval and STK Push.
// All credentials come from env vars so the same code runs against the Daraja
// SANDBOX first and PRODUCTION later just by swapping the env values.
//
// Required env vars:
//   MPESA_ENV               "sandbox" | "production"  (default: sandbox)
//   MPESA_CONSUMER_KEY      Daraja app consumer key
//   MPESA_CONSUMER_SECRET   Daraja app consumer secret
//   MPESA_SHORTCODE         Business shortcode (Paybill/Till or sandbox 174379)
//   MPESA_PASSKEY           Lipa na M-Pesa Online passkey
//   MPESA_CALLBACK_URL      Public https URL Safaricom calls back (this app's route)

const SANDBOX_BASE = "https://sandbox.safaricom.co.ke";
const PRODUCTION_BASE = "https://api.safaricom.co.ke";

export function mpesaConfigured(): boolean {
  return Boolean(
    process.env.MPESA_CONSUMER_KEY &&
      process.env.MPESA_CONSUMER_SECRET &&
      process.env.MPESA_SHORTCODE &&
      process.env.MPESA_PASSKEY,
  );
}

function baseUrl(): string {
  return (process.env.MPESA_ENV || "sandbox") === "production" ? PRODUCTION_BASE : SANDBOX_BASE;
}

// Daraja timestamp format: YYYYMMDDHHmmss in East Africa time.
function darajaTimestamp(d = new Date()): string {
  // Convert to Africa/Nairobi (UTC+3) wall clock without external libs.
  const eat = new Date(d.getTime() + 3 * 60 * 60 * 1000);
  const p = (n: number, w = 2) => String(n).padStart(w, "0");
  return (
    `${eat.getUTCFullYear()}` +
    `${p(eat.getUTCMonth() + 1)}` +
    `${p(eat.getUTCDate())}` +
    `${p(eat.getUTCHours())}` +
    `${p(eat.getUTCMinutes())}` +
    `${p(eat.getUTCSeconds())}`
  );
}

// Normalize a Kenyan phone number to the 2547XXXXXXXX / 2541XXXXXXXX format
// Daraja requires. Accepts 07.., 01.., +2547.., 2547.., 7...
export function normalizeMpesaPhone(raw: string): string | null {
  const digits = (raw || "").replace(/[^0-9]/g, "");
  if (!digits) return null;
  let n = digits;
  if (n.startsWith("254")) {
    // already country-coded
  } else if (n.startsWith("0")) {
    n = "254" + n.slice(1);
  } else if (n.startsWith("7") || n.startsWith("1")) {
    n = "254" + n;
  } else if (n.startsWith("+254")) {
    n = n.slice(1);
  }
  // Final sanity: 2547XXXXXXXX or 2541XXXXXXXX => 12 digits total.
  if (!/^254(7|1)\d{8}$/.test(n)) return null;
  return n;
}

async function getAccessToken(): Promise<string | null> {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  if (!key || !secret) return null;
  const auth = Buffer.from(`${key}:${secret}`).toString("base64");
  try {
    const res = await fetch(`${baseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${auth}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access_token?: string };
    return data.access_token ?? null;
  } catch {
    return null;
  }
}

export type StkPushResult = {
  ok: boolean;
  merchantRequestId?: string;
  checkoutRequestId?: string;
  customerMessage?: string;
  error?: string;
};

// Initiate an STK Push. amount must be a whole number of KES (M-Pesa rejects
// decimals). accountRef + description are shown on the prompt / statement.
export async function stkPush(opts: {
  phone: string; // normalized 2547XXXXXXXX
  amount: number;
  accountRef: string;
  description: string;
}): Promise<StkPushResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: "auth_failed" };

  const shortcode = process.env.MPESA_SHORTCODE as string;
  const passkey = process.env.MPESA_PASSKEY as string;
  const callbackUrl = process.env.MPESA_CALLBACK_URL as string;
  if (!shortcode || !passkey || !callbackUrl) return { ok: false, error: "not_configured" };

  const timestamp = darajaTimestamp();
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
  const amount = Math.max(1, Math.round(opts.amount)); // whole KES

  const body = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: opts.phone,
    PartyB: shortcode,
    PhoneNumber: opts.phone,
    CallBackURL: callbackUrl,
    AccountReference: opts.accountRef.slice(0, 12),
    TransactionDesc: opts.description.slice(0, 64),
  };

  try {
    const res = await fetch(`${baseUrl()}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = (await res.json()) as {
      MerchantRequestID?: string;
      CheckoutRequestID?: string;
      ResponseCode?: string;
      CustomerMessage?: string;
      errorMessage?: string;
    };
    if (!res.ok || data.ResponseCode !== "0") {
      return { ok: false, error: data.errorMessage || data.CustomerMessage || "stk_failed" };
    }
    return {
      ok: true,
      merchantRequestId: data.MerchantRequestID,
      checkoutRequestId: data.CheckoutRequestID,
      customerMessage: data.CustomerMessage,
    };
  } catch {
    return { ok: false, error: "network_error" };
  }
}
