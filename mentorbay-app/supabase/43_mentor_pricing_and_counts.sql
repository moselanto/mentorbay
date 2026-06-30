-- 43_mentor_pricing_and_counts.sql
-- Two changes, both safe and additive (existing mentors keep working unchanged):
--
-- 1) LIVE MENTEE COUNT
--    The mentors.mentees column is a static stored number that defaults to 0,
--    so real mentors show "0 mentees" on /mentors. This adds a SECURITY DEFINER
--    RPC that computes the real count from source-of-truth tables. A mentee is
--    counted once per mentor if they have an accepted application OR an active
--    enrollment in one of that mentor's programs.
--
--    Column mapping verified against 00_full_setup.sql:
--      - applications(mentee_id, mentor_id, status)  -- mentor_id -> profiles.id
--      - mentors(slug, profile_id)                   -- profile_id -> profiles.id
--      - enrollments(user_id, program_slug, status)  -- user_id is the mentee
--      - programs(slug, mentor_slug)
--
-- 2) PAID MENTORS
--    Mentors can charge a recurring rate (per week or month). Free is the default,
--    so all existing mentors stay free. Payment reuses the payment_intents flow
--    (migration 41) with kind = 'mentorship'; the M-Pesa callback gains a
--    mentorship branch. Recurring auto-billing is out of scope for now: a mentee
--    pays manually for the next period.

-- ---------------------------------------------------------------------------
-- 1) Paid-mentor columns on mentors
-- ---------------------------------------------------------------------------
alter table public.mentors add column if not exists is_paid boolean not null default false;
alter table public.mentors add column if not exists rate_kes numeric(12,2) not null default 0;
alter table public.mentors add column if not exists billing_interval text not null default 'month'
  check (billing_interval in ('week', 'month'));

-- payment_intents (migration 41/42) gains mentorship linkage. mentor_slug is the
-- mentor being paid; kind already exists from migration 42 (default 'program').
alter table public.payment_intents add column if not exists mentor_slug text;

-- payments ledger gains mentor linkage so the callback can record mentorship payments.
alter table public.payments add column if not exists mentor_slug text;

-- Optional: track active paid mentorships (a mentee's paid access window).
create table if not exists public.mentorships (
  id uuid primary key default gen_random_uuid(),
  mentor_slug text not null,
  mentee_id uuid not null references auth.users(id) on delete cascade,
  billing_interval text not null check (billing_interval in ('week', 'month')),
  amount_paid_kes numeric(12,2) not null default 0,
  payment_intent_id uuid references public.payment_intents(id) on delete set null,
  period_start timestamptz not null default now(),
  period_end timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.mentorships enable row level security;

-- Mentees see their own mentorships; mentors see mentorships pointing at them.
drop policy if exists "mentorships_select_own" on public.mentorships;
create policy "mentorships_select_own" on public.mentorships
  for select using (
    mentee_id = auth.uid()
    or exists (
      select 1 from public.mentors m
      where m.slug = mentorships.mentor_slug and m.profile_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 2) Live mentee count RPC (SECURITY DEFINER)
-- ---------------------------------------------------------------------------
-- Returns the number of DISTINCT mentees for a mentor, counting anyone who has
-- an accepted application to that mentor OR an active enrollment in one of that
-- mentor's programs. SECURITY DEFINER so it can read across RLS for a public count.
create or replace function public.public_mentor_mentee_count(p_mentor_slug text)
returns integer
language sql
security definer
set search_path = public
as $$
  select count(distinct mentee_id)::int
  from (
    -- accepted applications to this mentor
    -- applications.mentor_id is a profiles.id; mentors links to it via profile_id.
    select a.mentee_id
    from public.applications a
    join public.mentors m on m.profile_id = a.mentor_id
    where m.slug = p_mentor_slug
      and a.status = 'accepted'
    union
    -- active enrollments in this mentor's programs (enrollments.user_id is the mentee)
    select e.user_id as mentee_id
    from public.enrollments e
    join public.programs p on p.slug = e.program_slug
    where p.mentor_slug = p_mentor_slug
      and e.status = 'active'
  ) s;
$$;

grant execute on function public.public_mentor_mentee_count(text) to anon, authenticated;
