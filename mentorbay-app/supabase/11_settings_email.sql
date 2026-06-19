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
