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

## 5. Smoke test the live site
- [ ] Public pages load: `/`, `/mentors`, `/programs`, `/events`.
- [ ] Sign up at `/signup`, confirm (or disable "Confirm email" in Supabase for quick tests),
      land on onboarding -> your dashboard.
- [ ] Visit another role's area (e.g. `/admin` as a mentee) - you should be redirected.
- [ ] Settings save; Create Program (as a mentor) adds a program.
- [ ] Run `seed_my_dashboard.sql` with your user id to populate sample
      enrollments/sessions/applications, then refresh the dashboard.

---

## 6. (Optional) Google sign-in
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
