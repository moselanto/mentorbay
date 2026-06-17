-- MentorBay - Supabase schema (Phase 5: first live slice - public mentor directory)
-- HOW TO RUN: Supabase dashboard -> SQL Editor -> New query -> paste this -> Run.
-- Safe to re-run (it drops the tables first).
--
-- NOTE: These self-contained `mentors` and `programs` tables power the PUBLIC
-- directory so we can seed and read live data right now, without auth users.
-- When we add Supabase Auth (next phase), mentors will link to a `profiles`
-- table tied to auth.users - see ../../MIGRATION.md for that full schema.

drop table if exists programs cascade;
drop table if exists mentors cascade;

create table mentors (
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

create table programs (
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

create policy "Public can read approved mentors"
  on mentors for select using (status = 'approved');

create policy "Public can read published programs"
  on programs for select using (status = 'published');
