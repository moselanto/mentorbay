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
