# Deploying MentorBay to Vercel

The Next.js app lives in the **`mentorbay-app/`** subfolder of the `moselanto/mentorbay`
repo. That one detail matters during setup (see the Root Directory step).

---

## 0. Before you start
- [ ] Code is pushed to `moselanto/mentorbay` (it is).
- [ ] You have a Supabase project.
- [ ] You've run the four SQL files in the Supabase SQL Editor, in order:
  1. `supabase/schema.sql` (mentors + programs)
  2. `supabase/02_events.sql` (events)
  3. `supabase/03_auth.sql` (profiles + signup trigger)
  4. `supabase/04_app_tables.sql` (enrollments, sessions, applications)
- [ ] (Optional) `supabase/seed.sql` for demo mentors/programs, and
      `supabase/seed_my_dashboard.sql` once you've signed up, to light up your dashboard.

---

## 1. Get your Supabase keys
In Supabase: **Project Settings -> API**. Copy:
- **Project URL** -> this is `NEXT_PUBLIC_SUPABASE_URL`
- **anon public key** -> this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`

(The anon key is safe to expose to the browser - Row Level Security protects your data.)

---

## 2. Import the project into Vercel
1. Go to https://vercel.com/new and import the **moselanto/mentorbay** repo
   (authorize GitHub if prompted).
2. **Root Directory:** click *Edit* and set it to **`mentorbay-app`**. This is required -
   the Next.js app is not at the repo root.
3. **Framework Preset:** Next.js (auto-detected once the root is set).
4. Leave Build Command / Output as defaults.

---

## 3. Add environment variables
In the Vercel import screen (or **Project -> Settings -> Environment Variables**), add:

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | your Project URL from step 1 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon public key from step 1 |

Apply them to **Production, Preview, and Development**. Then click **Deploy**.

> If you deploy first and add the vars later, hit **Redeploy** so they take effect.
> Without these vars the app still builds and runs - it just falls back to demo data
> and auth/dashboards stay inert.

---

## 4. Point Supabase Auth at your live domain
After the first deploy you'll get a URL like `https://mentorbay.vercel.app`.
In Supabase: **Authentication -> URL Configuration**:
- **Site URL:** `https://your-domain.vercel.app`
- **Redirect URLs:** add `https://your-domain.vercel.app/auth/callback`

This makes email-confirmation and password-reset links return to the live site.

---

## 5. (Optional) M-Pesa payments via Safaricom Daraja

Program payments are **env-gated**: if the M-Pesa variables below are unset, the
app hides the M-Pesa form and falls back to the simulated test button. Set them
to enable the real STK Push ("green button") flow. Start on **sandbox**, then
swap the same variables for **production** later - no code change needed.

### 5a. Environment variables
Add these in **Vercel -> Project -> Settings -> Environment Variables**. For
testing on a Preview deployment, apply them to the **Preview** scope (and to
Production when you go live).

| Name | Sandbox value | Notes |
| --- | --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase -> Settings -> API -> service_role | **Server-only secret.** Never prefix with `NEXT_PUBLIC_`. Required - the callback uses it to apply payments past RLS. |
| `MPESA_ENV` | `sandbox` | `sandbox` or `production`. |
| `MPESA_CONSUMER_KEY` | from your Daraja app | developer.safaricom.co.ke -> My Apps. |
| `MPESA_CONSUMER_SECRET` | from your Daraja app | |
| `MPESA_SHORTCODE` | `174379` | Sandbox shortcode. Production = your Paybill/Till. |
| `MPESA_PASSKEY` | sandbox passkey | Lipa na M-Pesa Online passkey from the Daraja portal. |
| `MPESA_CALLBACK_URL` | see below | Public HTTPS URL Safaricom POSTs to. |
| `NEXT_PUBLIC_ALLOW_SIMULATED_PAYMENTS` | leave unset | Set to `true` only for internal testing to show the fake-payment button. |

### 5b. Callback URL - use the stable branch alias
`MPESA_CALLBACK_URL` must point at this app's callback route:

```
https://<your-domain>/api/mpesa/callback
```

On Vercel, prefer the **stable branch alias** over a per-deployment hash URL, so
the value survives every redeploy. For the `feature/mpesa-payments` branch:

```
https://mentorbay-git-feature-mpesa-payments-<scope>.vercel.app/api/mpesa/callback
```

Do NOT use a per-deployment URL like `https://mentorbay-<random-hash>-<scope>.vercel.app`
- that changes on every push and the callback will break.

### 5c. Make the callback publicly reachable
Safaricom calls the callback server-to-server with no login session. Two
requirements:
- The URL must be reachable from the public internet - **`localhost` cannot work**,
  so M-Pesa can only be tested on a deployed Vercel URL, not local dev.
- If **Deployment Protection** (Vercel Authentication) is enabled on Preview, it
  returns a login page to outside callers and blocks the callback. Disable
  protection for Preview, or add a Protection Bypass, so `/api/mpesa/callback`
  (and `/auth/callback`) are reachable.

### 5d. How the sandbox test behaves
- In Daraja **sandbox**, the STK prompt is driven by the sandbox test MSISDN
  **`254708374149`** (enter `0708374149` / `254708374149` in the phone field) -
  you won't get a prompt on your real SIM.
- The mentee must have an **approved** enrollment in a **paid** program
  (`price_kes > 0`) before the M-Pesa form appears.
- On confirmed success the callback writes a `payments` row (`provider: mpesa`),
  bumps `enrollments.amount_paid_kes`, and on full payment releases the
  commission split once. The waiting screen flips to "Payment received".

> If the STK prompt succeeds on the phone but nothing is applied and the waiting
> screen never resolves, the usual cause is a missing `SUPABASE_SERVICE_ROLE_KEY`
> or an unreachable/protected `MPESA_CALLBACK_URL`.

### 5e. Migration
The M-Pesa flow needs the `payment_intents` table. Run migration **41** (and any
intervening migrations) in the Supabase SQL Editor before testing.

---

## 6. Smoke test the live site
- [ ] Public pages load: `/`, `/mentors`, `/programs`, `/events`.
- [ ] Sign up at `/signup`, confirm (or disable "Confirm email" in Supabase for quick tests),
      land on onboarding -> your dashboard.
- [ ] Visit another role's area (e.g. `/admin` as a mentee) - you should be redirected.
- [ ] Settings save; Create Program (as a mentor) adds a program.
- [ ] Run `seed_my_dashboard.sql` with your user id to populate sample
      enrollments/sessions/applications, then refresh the dashboard.
- [ ] (If M-Pesa enabled) On an approved, paid program: enter `254708374149`,
      tap the green "Pay with M-Pesa" button, complete the sandbox prompt, and
      confirm the waiting screen resolves to "Payment received".

---

## 7. (Optional) Google sign-in
The Google button calls Supabase OAuth. To make it work:
1. Supabase **Authentication -> Providers -> Google** -> enable, add your Google OAuth
   client id/secret.
2. Add the Supabase callback URL to your Google Cloud OAuth credentials.
Until then, email/password sign-in works on its own.

---

## Notes
- Every push to `main` triggers an automatic Vercel redeploy.
- Demo content (mentees lists, reviews, articles, admin metrics, reports) is still
  illustrative; the live-backed areas are mentors, programs, events, enrollments,
  sessions, applications, profiles, and auth.
