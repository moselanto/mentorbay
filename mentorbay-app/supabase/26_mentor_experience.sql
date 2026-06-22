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
