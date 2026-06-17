# MentorBay - Next.js + Supabase Migration Plan

This guide takes the approved HTML design (in this repo) and turns it into the real production app: **Next.js + TypeScript + Tailwind CSS** on the frontend, **Supabase** (Postgres + Auth + Storage + Realtime) on the backend, deployed on **Vercel**.

It's written to be followed step by step. You don't have to do it all at once - work through the phases in order.

---

## 0. What we're building on

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Supabase
  - **Auth** - email/password + Google
  - **Postgres** - all app data
  - **Storage** - images (mentor photos, program covers)
  - **Realtime** - live messages
- **Hosting:** Vercel (frontend) + Supabase (backend)
- **Good news:** every page already uses Tailwind, so the styling carries over almost unchanged. The main work is structure (components + routes) and data (replace the demo arrays with Supabase queries).

---

## 1. Project setup (Phase 0)

```bash
# 1. Create the Next.js app
npx create-next-app@latest mentorbay-app --typescript --tailwind --eslint --app --src-dir

cd mentorbay-app

# 2. Install Supabase
npm install @supabase/supabase-js @supabase/ssr
```

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Bring over the design tokens
Copy the brand colours from the `tailwind.config` block at the top of any HTML page into `tailwind.config.ts`:
```ts
// tailwind.config.ts
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT:'#0B2A4A', 700:'#103a63', 600:'#16487a', 50:'#eef3f9' },
        teal: { DEFAULT:'#1FA2BE', 600:'#178098', 400:'#3bb8d1', 50:'#e9f7fa' },
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui'] },
      boxShadow: { card: '0 4px 20px -6px rgba(11,42,74,0.12)' },
    },
  },
};
```
Remove the Tailwind CDN `<script>` - in Next.js, Tailwind is compiled at build time.

---

## 2. Suggested folder structure

```
src/
├── app/
│   ├── (public)/            # marketing pages (no auth)
│   │   ├── page.tsx                # Home  (was index.html)
│   │   ├── mentors/page.tsx        # Browse Mentors
│   │   ├── mentors/[id]/page.tsx   # Mentor Profile
│   │   ├── programs/page.tsx
│   │   ├── programs/[id]/page.tsx
│   │   ├── events/page.tsx
│   │   ├── events/[id]/page.tsx
│   │   ├── success-stories/page.tsx
│   │   └── resources/page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── onboarding/mentee|mentor/page.tsx
│   ├── (mentee)/mentee/...         # mentee dashboard routes
│   ├── (mentor)/mentor/...         # mentor dashboard routes
│   └── (admin)/admin/...           # admin routes
├── components/
│   ├── PublicNav.tsx   PublicFooter.tsx
│   ├── DashboardSidebar.tsx   Topbar.tsx
│   ├── MentorCard.tsx   ProgramCard.tsx   EventCard.tsx ...
│   └── Logo.tsx
├── lib/
│   ├── supabase/client.ts   # browser client
│   └── supabase/server.ts   # server client
└── types/database.ts        # generated Supabase types
```

**Key idea:** the header, footer, and sidebar are repeated in every HTML file today. In Next.js you build them **once** as components and reuse them via layouts (`layout.tsx`). That removes all the duplication.

---

## 3. Supabase database schema (Phase 3)

Run this in the Supabase SQL editor. (Simplified - extend as needed.)

```sql
-- Roles
create type user_role as enum ('mentee','mentor','admin');
create type mentor_status as enum ('pending','approved','rejected');
create type program_status as enum ('draft','published');

-- 1. Profiles (1:1 with auth.users)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role user_role not null default 'mentee',
  full_name text,
  avatar_url text,
  bio text,
  country text,
  city text,
  created_at timestamptz default now()
);

-- 2. Mentor profiles
create table mentor_profiles (
  id uuid primary key references profiles on delete cascade,
  title text,
  expertise text[],
  years_experience int,
  languages text[],
  availability text,
  rating numeric default 0,
  status mentor_status default 'pending'
);

-- 3. Programs
create table programs (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid references profiles,
  title text not null,
  description text,
  category text,
  level text,
  weeks int,
  lessons int,
  capacity int,
  is_free boolean default true,
  cover_url text,
  status program_status default 'draft',
  created_at timestamptz default now()
);

-- 4. Enrollments
create table enrollments (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references programs,
  mentee_id uuid references profiles,
  progress int default 0,
  status text default 'active',
  started_at timestamptz default now()
);

-- 5. Mentorship applications
create table applications (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid references profiles,
  mentee_id uuid references profiles,
  program_id uuid references programs,
  message text,
  status text default 'pending',
  created_at timestamptz default now()
);

-- 6. Sessions
create table sessions (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid references profiles,
  mentee_id uuid references profiles,
  title text,
  scheduled_at timestamptz,
  platform text,
  join_url text,
  notes text,
  status text default 'scheduled'
);

-- 7. Events + registrations
create table events (
  id uuid primary key default gen_random_uuid(),
  host_id uuid references profiles,
  title text, description text, category text,
  type text, location text,
  starts_at timestamptz, capacity int,
  cover_url text, status text default 'published'
);
create table event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events,
  user_id uuid references profiles,
  ticket_code text,
  attended boolean default false
);

-- 8. Reviews, articles, certificates, goals, skills
create table reviews (id uuid primary key default gen_random_uuid(), mentor_id uuid references profiles, mentee_id uuid references profiles, rating int, body text, created_at timestamptz default now());
create table articles (id uuid primary key default gen_random_uuid(), author_id uuid references profiles, title text, body text, cover_url text, status text default 'draft', views int default 0, created_at timestamptz default now());
create table certificates (id uuid primary key default gen_random_uuid(), enrollment_id uuid references enrollments, mentee_id uuid references profiles, program_id uuid references programs, issued_at timestamptz default now());
create table goals (id uuid primary key default gen_random_uuid(), mentee_id uuid references profiles, title text, progress int default 0);

-- 9. Messages
create table conversations (id uuid primary key default gen_random_uuid(), a uuid references profiles, b uuid references profiles);
create table messages (id uuid primary key default gen_random_uuid(), conversation_id uuid references conversations, sender_id uuid references profiles, body text, created_at timestamptz default now());

-- 10. Moderation
create table content_flags (id uuid primary key default gen_random_uuid(), content_type text, content_id uuid, reason text, status text default 'pending', created_at timestamptz default now());
```

After creating tables, generate TypeScript types:
```bash
npx supabase gen types typescript --project-id <id> > src/types/database.ts
```

---

## 4. Auth + onboarding (Phase 4)

1. In Supabase → Authentication → Providers, enable **Email** and **Google**.
2. Add a trigger so every new auth user gets a `profiles` row:
```sql
create function handle_new_user() returns trigger as $$
begin
  insert into profiles (id, full_name) values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function handle_new_user();
```
3. **Sign Up page** sets the role (mentee/mentor) - write it to `profiles.role`. Mentor sign-ups also create a `mentor_profiles` row with `status='pending'` (this is exactly what the Admin → Mentor Approvals screen acts on).
4. **Onboarding** writes interests/goals (mentee) or the application (mentor).
5. Protect dashboard routes with middleware that checks the session and role.

---

## 5. Storage - migrate the images (Phase 3)

1. Supabase → Storage → create a **public** bucket called `mentorbay`.
2. Upload the contents of this repo's `/images` folder into it.
3. Replace relative paths (`images/xxx.jpg`) with the Supabase public URL, or store the path in the DB (`avatar_url`, `cover_url`) and build the URL with `supabase.storage.from('mentorbay').getPublicUrl(path)`.

---

## 6. Replacing demo data with live queries (Phase 5)

Every dashboard/list page has a clearly-marked demo array (e.g. `const MENTORS = [...]`). Each becomes a Supabase query. Example - Browse Mentors:

```tsx
// src/app/(public)/mentors/page.tsx  (Server Component)
import { createClient } from '@/lib/supabase/server';
import MentorCard from '@/components/MentorCard';

export default async function MentorsPage() {
  const supabase = createClient();
  const { data: mentors } = await supabase
    .from('mentor_profiles')
    .select('*, profiles(full_name, avatar_url, city, country)')
    .eq('status', 'approved');

  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {mentors?.map((m) => <MentorCard key={m.id} mentor={m} />)}
    </div>
  );
}
```

The HTML/Tailwind inside `MentorCard` is copied straight from the `cardHTML()` template in `mentors.html` - just swap the template literals for `{props}`.

**Pattern for the whole app:** demo array → Supabase `select`; `onClick` handlers (accept/decline, enroll, register, save settings) → Supabase `insert`/`update`; the filter logic you already wrote can move to query `.eq()/.ilike()` filters or stay client-side.

---

## 7. Row Level Security (do this before launch)

Enable RLS on every table and add policies. Examples:
```sql
alter table profiles enable row level security;
create policy "profiles are viewable by everyone" on profiles for select using (true);
create policy "users update own profile" on profiles for update using (auth.uid() = id);

alter table programs enable row level security;
create policy "published programs are public" on programs for select using (status = 'published' or mentor_id = auth.uid());
create policy "mentors manage own programs" on programs for all using (mentor_id = auth.uid());
```
Admin actions (approvals, moderation) run through a service role or an `is_admin()` check.

---

## 8. Realtime messages (Phase 6)

The mentee/mentor message pages become live with Supabase Realtime:
```ts
supabase.channel('messages')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' },
    (payload) => appendMessage(payload.new))
  .subscribe();
```

---

## 9. Deploy (Phase 7)

1. Push the Next.js app to a GitHub repo (can be this one, or a new `mentorbay-app`).
2. Import it into **Vercel**, add the two `NEXT_PUBLIC_SUPABASE_*` env vars.
3. Vercel auto-deploys on every push to `main`.

---

## 10. Recommended order (so it's never overwhelming)

1. **Phase 0** - scaffold Next.js, port Tailwind config, build `Logo`, `PublicNav`, `PublicFooter`.
2. **Phase 1** - convert the public pages (static first, demo data inline) so you see them in Next.js.
3. **Phase 3** - create the Supabase project, run the schema, seed a few rows, upload images.
4. **Phase 4** - auth + onboarding + route protection.
5. **Phase 5** - wire public pages, then dashboards, to live queries one screen at a time.
6. **Phase 6** - realtime messages, certificates, file uploads.
7. **Phase 7** - RLS hardening + deploy.

> Tip for pacing yourself: get **one** full vertical slice working end to end first - e.g. Browse Mentors reading real mentors from Supabase - before converting everything. Once that pattern clicks, the rest is repetition.

---

## Paid programs (later)

Everything is `is_free = true` for launch. When you're ready to charge, add a payments provider (e.g. Paystack or Stripe), a `payments` table, set `programs.is_free = false` with a `price_cents`, and flip the "Enable paid programs" toggle that's already designed on the Admin Settings page.

---

*MentorBay - Connect · Grow · Succeed. Designed and documented for production. Made in Nairobi, Kenya.*
