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
