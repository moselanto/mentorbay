-- MentorBay - app tables (additive migration). Run in Supabase SQL Editor.
-- Adds enrollments, sessions, applications + extra profile fields, and lets
-- mentors create their own programs. Safe to run after 01/02/03.

-- 1) Extra profile fields used by the Settings pages
alter table profiles add column if not exists headline text;
alter table profiles add column if not exists bio text;
alter table profiles add column if not exists title text;
alter table profiles add column if not exists location text;
alter table profiles add column if not exists languages text;
alter table profiles add column if not exists accepting_mentees boolean default true;

-- 2) Admin helper for RLS
create or replace function public.is_admin() returns boolean as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$ language sql security definer stable;

-- 3) Let mentors create/own programs
alter table programs add column if not exists created_by uuid references public.profiles(id);
alter table programs alter column mentor_slug drop not null;
drop policy if exists "Mentors manage own programs" on programs;
create policy "Mentors manage own programs" on programs
  for all using (auth.uid() = created_by) with check (auth.uid() = created_by);

-- 4) Enrollments (a mentee enrolled in a program)
create table if not exists enrollments (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  program_slug text not null references public.programs(slug) on delete cascade,
  progress     int not null default 0,
  status       text not null default 'active',  -- active | completed
  created_at   timestamptz default now(),
  unique (user_id, program_slug)
);
alter table enrollments enable row level security;
drop policy if exists "Own enrollments" on enrollments;
create policy "Own enrollments" on enrollments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Admin read enrollments" on enrollments;
create policy "Admin read enrollments" on enrollments for select using (is_admin());

-- 5) Sessions (a mentorship session between mentor + mentee)
create table if not exists sessions (
  id           uuid primary key default gen_random_uuid(),
  mentor_id    uuid references public.profiles(id) on delete set null,
  mentee_id    uuid not null references public.profiles(id) on delete cascade,
  topic        text not null,
  mode         text default 'Google Meet',
  scheduled_at timestamptz not null,
  status       text not null default 'upcoming',  -- upcoming | past | cancelled
  created_at   timestamptz default now()
);
alter table sessions enable row level security;
drop policy if exists "Participant sessions" on sessions;
create policy "Participant sessions" on sessions
  for all using (auth.uid() = mentee_id or auth.uid() = mentor_id)
  with check (auth.uid() = mentee_id or auth.uid() = mentor_id);
drop policy if exists "Admin read sessions" on sessions;
create policy "Admin read sessions" on sessions for select using (is_admin());

-- 6) Applications (a mentee applies to a mentor)
create table if not exists applications (
  id          uuid primary key default gen_random_uuid(),
  mentee_id   uuid not null references public.profiles(id) on delete cascade,
  mentor_id   uuid references public.profiles(id) on delete set null,
  note        text,
  status      text not null default 'pending',  -- pending | accepted | declined
  created_at  timestamptz default now()
);
alter table applications enable row level security;
drop policy if exists "Applicant or mentor" on applications;
create policy "Applicant or mentor" on applications
  for all using (auth.uid() = mentee_id or auth.uid() = mentor_id)
  with check (auth.uid() = mentee_id or auth.uid() = mentor_id);
drop policy if exists "Admin read applications" on applications;
create policy "Admin read applications" on applications for select using (is_admin());
