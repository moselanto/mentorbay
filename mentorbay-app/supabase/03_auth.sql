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
