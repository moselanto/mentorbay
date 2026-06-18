-- RUN THIS to fix sign-up returning a 500 ("Database error saving new user").
--
-- Cause: the new-user trigger cast the role to the user_role enum without a
-- guaranteed search_path. The trigger runs as Supabase's auth admin role, whose
-- search_path does NOT include public, so the unqualified ::user_role cast failed.
--
-- Fix: recreate the function with an explicit search_path and a fully-qualified
-- type. Safe to run on an existing project (idempotent).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'mentee')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
