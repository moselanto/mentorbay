-- MentorBay - FULL idempotent setup script.
-- Run this ONCE in the Supabase SQL Editor. Safe to re-run.
-- It creates the schema and applies every migration in dependency order.
-- (Dummy/sample seed data is intentionally excluded.)


-- ============================================================
-- schema.sql
-- ============================================================
-- MentorBay - Supabase schema (Phase 5: first live slice - public mentor directory)
-- HOW TO RUN: Supabase dashboard -> SQL Editor -> New query -> paste this -> Run.
-- Safe to re-run (uses create table if not exists; does NOT drop data).
--
-- NOTE: These self-contained `mentors` and `programs` tables power the PUBLIC
-- directory so we can seed and read live data right now, without auth users.
-- When we add Supabase Auth (next phase), mentors will link to a `profiles`
-- table tied to auth.users - see ../../MIGRATION.md for that full schema.


create table if not exists mentors (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  name         text not null,
  role         text not null,
  industry     text not null,
  country      text not null,
  city         text not null,
  available    boolean not null default true,
  languages    text[] not null default '{}',
  experience   int not null default 0,
  rating       numeric(2,1) not null default 0,
  reviews      int not null default 0,
  mentees      int not null default 0,
  skills       text[] not null default '{}',
  avatar_url   text,
  status       text not null default 'approved',  -- pending | approved | rejected
  created_at   timestamptz default now()
);

create table if not exists programs (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  category     text,
  level        text,
  weeks        int,
  lessons      int,
  mentor_slug  text references mentors(slug) on delete set null,
  rating       numeric(2,1) default 0,
  enrolled     int default 0,
  badge        text,
  is_free      boolean default true,
  cover_url    text,
  description  text,
  status       text not null default 'published', -- draft | published
  created_at   timestamptz default now()
);

-- Row Level Security: anyone (even logged-out visitors using the anon key) may
-- READ approved mentors and published programs. No insert/update/delete policy
-- means writes are blocked for the public - exactly what we want for a directory.
alter table mentors  enable row level security;
alter table programs enable row level security;

drop policy if exists "Public can read approved mentors" on mentors;
create policy "Public can read approved mentors"
  on mentors for select using (status = 'approved');

drop policy if exists "Public can read published programs" on programs;
create policy "Public can read published programs"
  on programs for select using (status = 'published');


-- ============================================================
-- 02_events.sql
-- ============================================================
-- MentorBay - events table (additive migration). Run in Supabase SQL Editor.
-- This does NOT touch your existing mentors/programs data.


create table if not exists events (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  when_status  text not null default 'upcoming', -- 'upcoming' | 'past'
  category     text,
  format       text,                              -- 'Online' | 'In-person'
  mon          text,
  day          text,
  date_label   text,
  time_label   text,
  location     text,
  speaker      text,
  face         text,
  img          text,
  going        int default 0,
  featured     boolean default false,
  status       text not null default 'published',
  created_at   timestamptz default now()
);

alter table events enable row level security;
drop policy if exists "Public can read published events" on events;
create policy "Public can read published events"
  on events for select using (status = 'published');

insert into events (slug, title, when_status, category, format, mon, day, date_label, time_label, location, speaker, face, img, going, featured) values
('future-of-work','Future of Work Conference 2026','upcoming','Business','In-person','JUN','25','Jun 25, 2026','9:00 AM','Sarit Centre, Nairobi','Sarah Mwangi','/images/sd79aj8r0vdw5tawj8zpnn76dn88tdme.jpg','/images/sd7fbrdmwf1ba8zryhj7mxhy6188vaw2.jpg',120,true),
('women-in-tech','Women in Tech Summit','upcoming','Technology','Online','JUL','10','Jul 10, 2026','9:00 AM','Online (Zoom)','Lillian Anyango','/images/sd728rcfrx0j7wrnhaa2zh0ya188vf7q.jpg','/images/sd79w96bc0dmwb9qd0rg1h4ek988tdaq.jpg',80,false),
('startup-growth','Startup Growth Masterclass','upcoming','Business','In-person','JUL','30','Jul 30, 2026','2:00 PM','iHub, Mombasa','John Kamau','/images/sd7fd2ygetvv1t14epgbhnf31s88vgsk.jpg','/images/sd7cw7fxc5jdak3bhrek7g334188tm52.jpg',60,false),
('digital-marketing-live','Digital Marketing Bootcamp Live','upcoming','Marketing','Online','AUG','08','Aug 8, 2026','10:00 AM','Online (Google Meet)','David Ochieng','/images/sd75vfdt7nphcmkepenfdabf9188vzec.jpg','/images/sd7f8shp9xrg8xvwefbhc1peyx88tt44.jpg',95,false),
('personal-finance-clinic','Personal Finance Clinic','upcoming','Finance','Online','AUG','15','Aug 15, 2026','11:00 AM','Online (Zoom)','Grace Wairimu','/images/sd73mtg2fv8ezekjw91j55w0xs88tmdj.jpg','/images/sd7etkz00sjcxwh28x3znyxh6s88vj12.jpg',70,false),
('leadership-forum','Leadership Forum Nairobi','upcoming','Leadership','In-person','AUG','22','Aug 22, 2026','9:30 AM','KICC, Nairobi','Jane Wanjiku','/images/sd7erhqwt022qcj3zh7r9nt7a188tncb.jpg','/images/sd7cxyvmncgt75zcbvkjs66p7s88tgjf.jpg',110,false),
('tech-careers-fair','Tech Careers Fair 2026','past','Technology','In-person','MAY','20','May 20, 2026','9:00 AM','USIU, Nairobi','John Kamau','/images/sd7fd2ygetvv1t14epgbhnf31s88vgsk.jpg','/images/sd79w96bc0dmwb9qd0rg1h4ek988tdaq.jpg',340,false),
('design-thinking','Design Thinking Workshop','past','Business','Online','APR','18','Apr 18, 2026','2:00 PM','Online','Kevin Mwangi','/images/sd75by8ns0j4qabn92ryzmvjp988v394.jpg','/images/sd7f8shp9xrg8xvwefbhc1peyx88tt44.jpg',150,false);


-- ============================================================
-- 03_auth.sql
-- ============================================================
-- MentorBay - auth + profiles (additive migration). Run in Supabase SQL Editor.
-- Adds a profiles table tied to auth.users and a trigger that creates a profile
-- row on every new sign-up (copying name + role from the signup metadata).

do $$ begin
  create type user_role as enum ('mentee', 'mentor', 'admin');
exception when duplicate_object then null; end $$;

create table if not exists profiles (
  id          uuid primary key references auth.users on delete cascade,
  role        user_role not null default 'mentee',
  full_name   text,
  avatar_url  text,
  country     text,
  onboarded   boolean not null default false,
  created_at  timestamptz default now()
);

alter table profiles enable row level security;

drop policy if exists "Profiles are readable by everyone" on profiles;
create policy "Profiles are readable by everyone" on profiles for select using (true);

drop policy if exists "Users manage their own profile" on profiles;
create policy "Users manage their own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Create a profile for each new auth user.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'mentee')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- 04_app_tables.sql
-- ============================================================
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


-- ============================================================
-- 06_approvals_reviews_avatars.sql
-- ============================================================
-- MentorBay - approvals, reviews, suspension, avatars, mentor-owned events.
-- Additive + idempotent. Run in Supabase SQL Editor after 05.

------------------------------------------------------------------
-- 1) Approval + suspension on profiles
------------------------------------------------------------------
alter table profiles add column if not exists approval_status text not null default 'pending'; -- pending | approved | rejected
alter table profiles add column if not exists suspended boolean not null default false;

-- Don't lock out anyone who signed up before this change.
update profiles set approval_status = 'approved' where approval_status = 'pending';

-- Admins can manage every profile (approve / reject / suspend).
drop policy if exists "Admins manage all profiles" on profiles;
create policy "Admins manage all profiles" on profiles
  for all using (is_admin()) with check (is_admin());

------------------------------------------------------------------
-- 2) New mentors start 'pending'; mentees auto-approved.
------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.user_role := coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'mentee');
begin
  insert into public.profiles (id, full_name, role, approval_status)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    r,
    case when r = 'mentor' then 'pending' else 'approved' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

------------------------------------------------------------------
-- 3) Reviews
------------------------------------------------------------------
create table if not exists reviews (
  id          uuid primary key default gen_random_uuid(),
  mentor_slug text references public.mentors(slug) on delete cascade,
  author_id   uuid references public.profiles(id) on delete set null,
  author_name text,
  rating      int not null default 5,
  body        text not null,
  status      text not null default 'visible', -- visible | removed
  created_at  timestamptz default now()
);
alter table reviews enable row level security;

drop policy if exists "Public can read visible reviews" on reviews;
create policy "Public can read visible reviews" on reviews
  for select using (status = 'visible' or is_admin());

drop policy if exists "Signed-in users can write reviews" on reviews;
create policy "Signed-in users can write reviews" on reviews
  for insert with check (auth.uid() = author_id);

drop policy if exists "Admins manage reviews" on reviews;
create policy "Admins manage reviews" on reviews
  for all using (is_admin()) with check (is_admin());

------------------------------------------------------------------
-- 4) Mentor-owned events (approved mentors can create events)
------------------------------------------------------------------
-- Allow a mentor to schedule a session before a mentee is linked.
alter table sessions alter column mentee_id drop not null;

alter table events add column if not exists created_by uuid references public.profiles(id);

drop policy if exists "Mentors manage own events" on events;
create policy "Mentors manage own events" on events
  for all using (auth.uid() = created_by) with check (auth.uid() = created_by);

------------------------------------------------------------------
-- 5) Avatars storage bucket (public read; users manage their own folder)
------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Avatar images are publicly readable" on storage.objects;
create policy "Avatar images are publicly readable" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "Users upload their own avatar" on storage.objects;
create policy "Users upload their own avatar" on storage.objects
  for insert with check (bucket_id = 'avatars' and (auth.uid())::text = (storage.foldername(name))[1]);

drop policy if exists "Users update their own avatar" on storage.objects;
create policy "Users update their own avatar" on storage.objects
  for update using (bucket_id = 'avatars' and (auth.uid())::text = (storage.foldername(name))[1]);


-- ============================================================
-- 08_program_details_approvals.sql
-- ============================================================
-- MentorBay - program detail fields + program & session approval. Additive. Run after 07.

------------------------------------------------------------------
-- 1) Program detail fields
------------------------------------------------------------------
alter table programs add column if not exists about text;
alter table programs add column if not exists learn text[] default '{}';
alter table programs add column if not exists curriculum jsonb default '[]'::jsonb;
alter table programs add column if not exists duration_label text;  -- e.g. "1 day", "6 weeks"

------------------------------------------------------------------
-- 2) Programs now require admin approval before going public.
--    status values: pending | published | rejected | draft
--    (Public read policy already only shows status = 'published'.)
--    Admins can read & manage every program; owners manage their own (04 policy).
------------------------------------------------------------------
drop policy if exists "Admins manage programs" on programs;
create policy "Admins manage programs" on programs
  for all using (is_admin()) with check (is_admin());

------------------------------------------------------------------
-- 3) Sessions: admin approval
------------------------------------------------------------------
alter table sessions add column if not exists approval_status text not null default 'pending'; -- pending | approved | rejected

drop policy if exists "Admins manage sessions" on sessions;
create policy "Admins manage sessions" on sessions
  for all using (is_admin()) with check (is_admin());


-- ============================================================
-- 09_event_approvals.sql
-- ============================================================
-- MentorBay - events now require admin approval (like programs). Additive. Run after 08.

-- 1) Add approval status to events.
alter table events add column if not exists approval_status text not null default 'pending'; -- pending | approved | rejected

-- 2) Keep all EXISTING/seeded events public (approve them once).
update events set approval_status = 'approved' where approval_status = 'pending';

-- 3) Public visitors only see published + approved events.
drop policy if exists "Public can read published events" on events;
drop policy if exists "Public can read approved events" on events;
create policy "Public can read approved events" on events
  for select using (status = 'published' and approval_status = 'approved');

-- 4) Admins can read & manage every event; owners already manage their own (06 policy).
drop policy if exists "Admins manage events" on events;
create policy "Admins manage events" on events
  for all using (is_admin()) with check (is_admin());


-- ============================================================
-- 10_program_requirements.sql
-- ============================================================
-- MentorBay - add a Requirements list to programs. Additive. Run after 09.
alter table programs add column if not exists requirements text[] default '{}';


-- ============================================================
-- 11_settings_email.sql
-- ============================================================
-- MentorBay - platform settings + user email for notifications. Run in SQL Editor.

-- 1) Store each user's email on their profile so we can notify them.
alter table public.profiles add column if not exists email text;

-- Backfill existing profiles from auth.users.
update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id and (p.email is null or p.email = '');

-- 2) Update signup trigger to also capture email (keeps approval logic).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.user_role := coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'mentee');
begin
  insert into public.profiles (id, full_name, email, role, approval_status)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    r,
    case when r = 'mentor' then 'pending' else 'approved' end
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- 3) Single-row platform settings (platform name + support email).
create table if not exists public.app_settings (
  id            int primary key default 1,
  platform_name text not null default 'MentorBay',
  support_email text,
  updated_at    timestamptz default now(),
  constraint app_settings_single_row check (id = 1)
);
insert into public.app_settings (id) values (1) on conflict (id) do nothing;

alter table public.app_settings enable row level security;

drop policy if exists "settings readable by everyone" on public.app_settings;
create policy "settings readable by everyone" on public.app_settings for select using (true);

drop policy if exists "settings updatable by admins" on public.app_settings;
create policy "settings updatable by admins" on public.app_settings for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));


-- ============================================================
-- 12_articles_meeting_url.sql
-- ============================================================
-- MentorBay - mentor articles + session meeting links. Run in SQL Editor.

-- 1) Session meeting link (Google Meet / Zoom URL).
alter table public.sessions add column if not exists meeting_url text;

-- 2) Articles authored by mentors (admin-approved before public, like programs).
create table if not exists public.articles (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  excerpt     text,
  body        text,
  cover_url   text,
  author_id   uuid references public.profiles(id) on delete cascade,
  status      text not null default 'draft',          -- draft | published
  approval_status text not null default 'pending',     -- pending | approved | rejected
  views       int not null default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.articles enable row level security;

-- Public can read articles that are published AND approved.
drop policy if exists "articles public read" on public.articles;
create policy "articles public read" on public.articles for select
  using (status = 'published' and approval_status = 'approved');

-- Authors can read/insert/update/delete their own articles.
drop policy if exists "articles author manage" on public.articles;
create policy "articles author manage" on public.articles for all
  using (auth.uid() = author_id) with check (auth.uid() = author_id);

-- Admins can read + moderate every article.
drop policy if exists "articles admin read" on public.articles;
create policy "articles admin read" on public.articles for select using (public.is_admin());
drop policy if exists "articles admin update" on public.articles;
create policy "articles admin update" on public.articles for update using (public.is_admin()) with check (public.is_admin());


-- ============================================================
-- 13_event_speakers.sql
-- ============================================================
-- MentorBay - multi-speaker lineup on events. Run in SQL Editor.
-- Adds a speakers JSON array: [{ "name": "...", "role": "..." }, ...] (up to 4).
-- The legacy single `speaker` text column is kept for backwards compatibility.
alter table public.events add column if not exists speakers jsonb not null default '[]'::jsonb;


-- ============================================================
-- 14_registrations_reviews.sql
-- ============================================================
-- MentorBay - event registrations + mentee review submission. Run in SQL Editor.

-- 1) Event registrations (one row per user per event).
create table if not exists public.event_registrations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  event_slug  text not null references public.events(slug) on delete cascade,
  created_at  timestamptz default now(),
  unique (user_id, event_slug)
);
alter table public.event_registrations enable row level security;
drop policy if exists "Own registrations" on public.event_registrations;
create policy "Own registrations" on public.event_registrations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Admin read registrations" on public.event_registrations;
create policy "Admin read registrations" on public.event_registrations for select using (public.is_admin());

-- 2) Let signed-in users add their own reviews (author_id must be themselves).
drop policy if exists "Users add own reviews" on public.reviews;
create policy "Users add own reviews" on public.reviews
  for insert with check (auth.uid() = author_id);
-- Public can already read visible reviews; ensure that policy exists.
drop policy if exists "Reviews public read" on public.reviews;
create policy "Reviews public read" on public.reviews for select using (status = 'visible');


-- ============================================================
-- 15_mentor_sync_goals.sql
-- ============================================================
-- MentorBay - sync real mentor profiles into the public mentors table,
-- add mentee goals/interests, and remove dummy seed data. Run in SQL Editor.

-- 1) Mentee goals + interests (text arrays).
alter table public.profiles add column if not exists interests text[] not null default '{}';
alter table public.profiles add column if not exists goals text[] not null default '{}';

-- Make sure mentors table can be keyed back to a profile.
alter table public.mentors add column if not exists profile_id uuid references public.profiles(id) on delete cascade;
alter table public.mentors add column if not exists profile_id_unique uuid;
do $$ begin
  alter table public.mentors add constraint mentors_profile_id_key unique (profile_id);
exception when duplicate_table or duplicate_object then null; end $$;

-- Helper: build a URL-safe slug from a name + id suffix.
create or replace function public.mentor_slug(p_name text, p_id uuid)
returns text language sql immutable as $$
  select coalesce(nullif(regexp_replace(lower(p_name), '[^a-z0-9]+', '-', 'g'), ''), 'mentor')
         || '-' || substr(p_id::text, 1, 6)
$$;

-- 2) Upsert an approved mentor profile into the public mentors table.
create or replace function public.sync_mentor_from_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role = 'mentor' and new.approval_status = 'approved' and coalesce(new.suspended, false) = false then
    insert into public.mentors (profile_id, slug, name, role, industry, country, city,
      available, languages, experience, rating, reviews, mentees, skills, avatar_url, status)
    values (
      new.id,
      public.mentor_slug(coalesce(new.full_name, 'mentor'), new.id),
      coalesce(new.full_name, 'Mentor'),
      coalesce(new.title, 'Mentor'),
      coalesce(nullif(split_part(coalesce(new.title,''), ' ', 1), ''), 'Professional'),
      coalesce(split_part(coalesce(new.location,'Kenya'), ',', 2), 'Kenya'),
      coalesce(nullif(split_part(coalesce(new.location,'Nairobi'), ',', 1), ''), 'Nairobi'),
      coalesce(new.accepting_mentees, true),
      case when new.languages is null or new.languages = '' then '{}'::text[]
           else string_to_array(replace(new.languages, ', ', ','), ',') end,
      0, 0, 0, 0,
      coalesce(new.interests, '{}'::text[]),
      new.avatar_url,
      'approved'
    )
    on conflict (profile_id) do update set
      name = excluded.name, role = excluded.role, country = excluded.country, city = excluded.city,
      available = excluded.available, languages = excluded.languages, skills = excluded.skills,
      avatar_url = excluded.avatar_url, status = 'approved';
  else
    -- Not an approved active mentor: remove any public mentor row.
    delete from public.mentors where profile_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_profile_mentor_sync on public.profiles;
create trigger on_profile_mentor_sync
  after insert or update on public.profiles
  for each row execute function public.sync_mentor_from_profile();

-- 3) Remove dummy seed rows (those with no linked profile / no owner).
delete from public.mentors where profile_id is null;
delete from public.programs where created_by is null;
delete from public.events where created_by is null;

-- 4) Backfill: sync all currently-approved mentor profiles.
update public.profiles set approval_status = approval_status
  where role = 'mentor' and approval_status = 'approved';


-- ============================================================
-- 16_stories_ratings.sql
-- ============================================================
-- MentorBay - success stories (featured reviews) + live mentor rating. Run in SQL Editor.

-- 1) Mark a review as a featured success story.
alter table public.reviews add column if not exists featured boolean not null default false;

-- 2) Recompute a mentor's rating + review count from visible reviews.
create or replace function public.recompute_mentor_rating(p_slug text)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.mentors m
  set rating = coalesce((select round(avg(r.rating)::numeric, 1) from public.reviews r where r.mentor_slug = p_slug and r.status = 'visible'), 0),
      reviews = coalesce((select count(*) from public.reviews r where r.mentor_slug = p_slug and r.status = 'visible'), 0)
  where m.slug = p_slug;
end;
$$;

-- 3) Auto-recompute whenever a review changes.
create or replace function public.on_review_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.recompute_mentor_rating(coalesce(new.mentor_slug, old.mentor_slug));
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_review_change on public.reviews;
create trigger trg_review_change
  after insert or update or delete on public.reviews
  for each row execute function public.on_review_change();


-- ============================================================
-- 17_purge_dummy.sql
-- ============================================================
-- MentorBay - remove dummy/seed content not attached to any real account.
-- Safe to re-run. Run in the Supabase SQL Editor.

-- Mentors that are not linked to a real profile (seed rows).
delete from public.mentors where profile_id is null;

-- Programs / events with no owner (seed rows).
delete from public.programs where created_by is null;
delete from public.events   where created_by is null;

-- Reviews whose mentor_slug no longer points at a real mentor (orphaned seed reviews).
delete from public.reviews r
where r.mentor_slug is not null
  and not exists (select 1 from public.mentors m where m.slug = r.mentor_slug);

-- Note: demo "success stories" were front-end-only sample data (no DB rows);
-- the public pages now read real featured reviews, so nothing to delete there.


-- ============================================================
-- 18_dedupe_applications.sql
-- ============================================================
-- MentorBay - remove duplicate mentorship applications and prevent new ones.
-- Run in the Supabase SQL Editor.

-- 1) Delete duplicate applications, keeping the earliest row per (mentee, mentor).
delete from public.applications a
using public.applications b
where a.mentee_id = b.mentee_id
  and a.mentor_id is not distinct from b.mentor_id
  and a.mentor_id is not null
  and a.ctid > b.ctid;

-- 2) Prevent future duplicates: one application per mentee per mentor.
do $$ begin
  alter table public.applications
    add constraint applications_mentee_mentor_unique unique (mentee_id, mentor_id);
exception when duplicate_table or duplicate_object then null; end $$;


-- ============================================================
-- 19_messages.sql
-- ============================================================
-- MentorBay - direct messages between connected mentor and mentee. Run in SQL Editor.
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  sender_id   uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  body        text not null,
  created_at  timestamptz default now()
);
create index if not exists messages_pair_idx on public.messages (sender_id, recipient_id, created_at);

alter table public.messages enable row level security;

-- A user can read messages they sent or received.
drop policy if exists "Own messages read" on public.messages;
create policy "Own messages read" on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

-- A user can send a message only as themselves, and only to someone they have an
-- ACCEPTED mentorship connection with (either direction).
drop policy if exists "Send to connections" on public.messages;
create policy "Send to connections" on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.applications a
      where a.status = 'accepted'
        and (
          (a.mentee_id = auth.uid() and a.mentor_id = recipient_id)
          or (a.mentor_id = auth.uid() and a.mentee_id = recipient_id)
        )
    )
  );


-- ============================================================
-- 20_lesson_progress.sql
-- ============================================================
-- MentorBay - track which curriculum lessons a mentee completed. Run in SQL Editor.
-- Stores an array of completed lesson keys ("moduleIdx:lessonIdx") per enrollment.
alter table public.enrollments add column if not exists completed_lessons text[] not null default '{}';


-- ============================================================
-- 21_message_read.sql
-- ============================================================
-- MentorBay - mark messages read for unread counts. Run in SQL Editor.
alter table public.messages add column if not exists read_at timestamptz;
create index if not exists messages_recipient_unread_idx on public.messages (recipient_id) where read_at is null;


-- ============================================================
-- 22_mentor_visibility.sql
-- ============================================================
-- MentorBay - let mentors see who enrolled in their programs. Run in SQL Editor.
drop policy if exists "Mentor reads own program enrollments" on public.enrollments;
create policy "Mentor reads own program enrollments" on public.enrollments for select
  using (
    exists (
      select 1 from public.programs p
      where p.slug = enrollments.program_slug and p.created_by = auth.uid()
    )
  );


-- ============================================================
-- 23_event_owner_registrations.sql
-- ============================================================
-- MentorBay - let an event's creator (mentor) see who registered. Run in SQL Editor.
drop policy if exists "Event owner reads registrations" on public.event_registrations;
create policy "Event owner reads registrations" on public.event_registrations for select
  using (
    exists (
      select 1 from public.events e
      where e.slug = event_registrations.event_slug and e.created_by = auth.uid()
    )
  );


-- ============================================================
-- 24_program_reviews.sql
-- ============================================================
-- MentorBay - allow reviews to target a program (rating programs). Run in SQL Editor.
alter table public.reviews add column if not exists program_slug text references public.programs(slug) on delete cascade;

-- Recompute a program's rating from its visible reviews.
create or replace function public.recompute_program_rating(p_slug text)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.programs pr
  set rating = coalesce((select round(avg(r.rating)::numeric, 1) from public.reviews r where r.program_slug = p_slug and r.status = 'visible'), 0)
  where pr.slug = p_slug;
end;
$$;

create or replace function public.on_program_review_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(new.program_slug, old.program_slug) is not null then
    perform public.recompute_program_rating(coalesce(new.program_slug, old.program_slug));
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_program_review_change on public.reviews;
create trigger trg_program_review_change
  after insert or update or delete on public.reviews
  for each row execute function public.on_program_review_change();


-- ============================================================
-- 25_backfill_program_mentor_slug.sql
-- ============================================================
-- MentorBay - link existing mentor-created programs to the mentor's public slug.
-- Without mentor_slug, the programs->mentors join returns null, so the program
-- shows "by MentorBay" with no avatar. Run in the Supabase SQL Editor.
update public.programs p
set mentor_slug = m.slug
from public.mentors m
where m.profile_id = p.created_by
  and (p.mentor_slug is null or p.mentor_slug = '');

-- Recompute mentor program ratings is unaffected; nothing else needed.

-- ============================================================
-- 26_mentor_experience.sql
-- ============================================================
-- MentorBay - let mentors set their years of experience. Run in SQL Editor.
alter table public.profiles add column if not exists experience_years int not null default 0;

-- Update the mentor sync trigger to carry experience_years into mentors.experience.
create or replace function public.sync_mentor_from_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role = 'mentor' and new.approval_status = 'approved' and coalesce(new.suspended, false) = false then
    insert into public.mentors (profile_id, slug, name, role, industry, country, city,
      available, languages, experience, rating, reviews, mentees, skills, avatar_url, status)
    values (
      new.id,
      public.mentor_slug(coalesce(new.full_name, 'mentor'), new.id),
      coalesce(new.full_name, 'Mentor'),
      coalesce(new.title, 'Mentor'),
      coalesce(nullif(split_part(coalesce(new.title,''), ' ', 1), ''), 'Professional'),
      coalesce(split_part(coalesce(new.location,'Kenya'), ',', 2), 'Kenya'),
      coalesce(nullif(split_part(coalesce(new.location,'Nairobi'), ',', 1), ''), 'Nairobi'),
      coalesce(new.accepting_mentees, true),
      case when new.languages is null or new.languages = '' then '{}'::text[]
           else string_to_array(replace(new.languages, ', ', ','), ',') end,
      coalesce(new.experience_years, 0), 0, 0, 0,
      coalesce(new.interests, '{}'::text[]),
      new.avatar_url,
      'approved'
    )
    on conflict (profile_id) do update set
      name = excluded.name, role = excluded.role, country = excluded.country, city = excluded.city,
      available = excluded.available, languages = excluded.languages, skills = excluded.skills,
      experience = excluded.experience,
      avatar_url = excluded.avatar_url, status = 'approved';
  else
    delete from public.mentors where profile_id = new.id;
  end if;
  return new;
end;
$$;

-- Backfill: re-sync approved mentors so experience flows through.
update public.profiles set approval_status = approval_status
  where role = 'mentor' and approval_status = 'approved';

-- ============================================================
-- Migration 27: Certificates (folded in)
-- ============================================================
alter table sessions add column if not exists certificate_issued boolean not null default false;
alter table enrollments add column if not exists certificate_issued boolean not null default false;
alter table enrollments add column if not exists completed_at timestamptz;

-- ============================================================
-- Migration 28: Session confirmation flow (folded in)
-- ============================================================
alter table sessions add column if not exists decline_reason text;
alter table sessions alter column approval_status set default 'pending';
update sessions set approval_status = 'pending' where approval_status is null;

-- ============================================================
-- Migration 29: Enrollment approval flow (folded in)
-- ============================================================
alter table public.enrollments add column if not exists decline_reason text;

drop policy if exists "Mentor manages own program enrollments" on public.enrollments;
create policy "Mentor manages own program enrollments" on public.enrollments for update
  using (
    exists (select 1 from public.programs p where p.slug = enrollments.program_slug and p.created_by = auth.uid())
  )
  with check (
    exists (select 1 from public.programs p where p.slug = enrollments.program_slug and p.created_by = auth.uid())
  );

-- ============================================================
-- Migration 30: Application decline reason (folded in)
-- ============================================================
alter table public.applications add column if not exists decline_reason text;

-- ============================================================
-- Migration 31: Purge leftover demo mentors (folded in)
-- ============================================================
delete from public.mentors
where slug in (
  'jane-wanjiku','john-kamau','sarah-mwangi','david-ochieng','lillian-anyango',
  'mary-achieng','samuel-njoroge','brian-otieno','grace-wairimu','kevin-mwangi',
  'aisha-hassan','daniel-kiprop'
);
delete from public.mentors where profile_id is null;
delete from public.programs where created_by is null;
delete from public.events   where created_by is null;
delete from public.reviews r
where r.mentor_slug is not null
  and not exists (select 1 from public.mentors m where m.slug = r.mentor_slug);

-- ============================================================
-- Migration 32: Application contact + confirmed requirements (folded in)
-- ============================================================
alter table public.applications add column if not exists mentee_phone text;
alter table public.applications add column if not exists mentee_email text;
alter table public.applications add column if not exists confirmed_requirements text[] default '{}';

-- ============================================================
-- Migration 33: Completion approval flow (folded in)
-- ============================================================
alter table public.enrollments add column if not exists completion_status text;
alter table public.enrollments add column if not exists completion_decline_reason text;

-- ============================================================
-- Migration 34: Enrollment contact details (folded in)
-- ============================================================
alter table public.enrollments add column if not exists mentee_phone text;
alter table public.enrollments add column if not exists mentee_email text;

-- ============================================================
-- Migration 35: Payments + revenue split (folded in)
-- ============================================================
alter table public.programs add column if not exists price_kes numeric(12,2) not null default 0;
alter table public.programs add column if not exists max_installments int not null default 1;
alter table public.enrollments add column if not exists amount_paid_kes numeric(12,2) not null default 0;
alter table public.enrollments add column if not exists payment_plan int not null default 1;
alter table public.enrollments add column if not exists fully_paid boolean not null default false;
alter table public.enrollments add column if not exists payout_released boolean not null default false;
alter table public.app_settings add column if not exists commission_pct numeric(5,2) not null default 15;
alter table public.app_settings add column if not exists admin_balance_kes numeric(14,2) not null default 0;
alter table public.profiles add column if not exists wallet_balance_kes numeric(14,2) not null default 0;
alter table public.profiles add column if not exists payout_phone text;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  mentee_id uuid not null references public.profiles(id) on delete cascade,
  mentor_id uuid references public.profiles(id) on delete set null,
  program_slug text not null,
  amount_kes numeric(12,2) not null,
  kind text not null default 'installment',
  provider text not null default 'simulated',
  reference text,
  created_at timestamptz not null default now()
);
alter table public.payments enable row level security;
drop policy if exists "Mentee reads own payments" on public.payments;
create policy "Mentee reads own payments" on public.payments for select using (auth.uid() = mentee_id);
drop policy if exists "Mentor reads payments for them" on public.payments;
create policy "Mentor reads payments for them" on public.payments for select using (auth.uid() = mentor_id);
drop policy if exists "Mentee inserts own payments" on public.payments;
create policy "Mentee inserts own payments" on public.payments for insert with check (auth.uid() = mentee_id);
drop policy if exists "Admin reads all payments" on public.payments;
create policy "Admin reads all payments" on public.payments for select using (is_admin());

create table if not exists public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.profiles(id) on delete cascade,
  amount_kes numeric(14,2) not null,
  status text not null default 'requested',
  payout_phone text,
  note text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
alter table public.withdrawals enable row level security;
drop policy if exists "Mentor manages own withdrawals" on public.withdrawals;
create policy "Mentor manages own withdrawals" on public.withdrawals for all
  using (auth.uid() = mentor_id) with check (auth.uid() = mentor_id);
drop policy if exists "Admin reads withdrawals" on public.withdrawals;
create policy "Admin reads withdrawals" on public.withdrawals for select using (is_admin());
drop policy if exists "Admin updates withdrawals" on public.withdrawals;
create policy "Admin updates withdrawals" on public.withdrawals for update using (is_admin()) with check (is_admin());


-- ============================================================
-- 36_message_read_rls.sql
-- ============================================================
-- MentorBay - FIX: messages had RLS enabled with SELECT + INSERT policies but
-- NO UPDATE policy, so every "mark as read" (UPDATE messages SET read_at=...)
-- was silently blocked by RLS and the unread badge never cleared.
-- This adds an UPDATE policy letting a RECIPIENT update only their own received
-- messages (e.g. set read_at / delivered_at). Idempotent.

-- delivered_at supports the Sent -> Delivered -> Read status indicator.
alter table public.messages add column if not exists delivered_at timestamptz;

-- Recipient may update messages addressed to them (and only those).
drop policy if exists "Recipient updates own messages" on public.messages;
create policy "Recipient updates own messages" on public.messages for update
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);


-- ============================================================
-- 37_program_cohort_meeting.sql
-- ============================================================
-- MentorBay - cohort scheduling (batch start dates with reschedule / next cohort)
-- and delivery mode (Zoom / Google Meet link or a physical location) per program.
-- All idempotent.

-- Delivery mode: how the program is delivered.
--   'online'   -> a meeting link (Zoom / Google Meet) in meeting_url
--   'physical' -> an in-person venue in program_location
alter table public.programs add column if not exists meeting_type text not null default 'online';   -- online | physical
alter table public.programs add column if not exists meeting_provider text;                          -- zoom | google_meet (when online)
alter table public.programs add column if not exists meeting_url text;                               -- join link (when online)
alter table public.programs add column if not exists program_location text;                          -- venue (when physical)

-- Cohort schedule: the mentor sets a start date so mentees learn as a batch.
-- When a cohort finishes, the mentor can set the next start date (reschedule),
-- so the program runs in successive batches.
alter table public.programs add column if not exists cohort_start date;
alter table public.programs add column if not exists cohort_status text not null default 'scheduled'; -- scheduled | running | finished


-- ============================================================
-- 38_event_details.sql
-- ============================================================
-- MentorBay - the event preview renders About / What you'll gain / Agenda, but
-- these were hardcoded placeholders with no columns or form inputs. Add real
-- columns so mentors can edit them and the preview shows their actual content.
alter table public.events add column if not exists about text;
alter table public.events add column if not exists gains text[] not null default '{}';      -- "What you'll gain" bullet list
alter table public.events add column if not exists agenda jsonb not null default '[]'::jsonb; -- [{ "time": "9:00 AM", "title": "Welcome" }, ...]
