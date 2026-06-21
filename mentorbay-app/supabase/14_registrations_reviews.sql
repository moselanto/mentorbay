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
