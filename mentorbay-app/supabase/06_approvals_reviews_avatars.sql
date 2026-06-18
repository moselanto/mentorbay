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
