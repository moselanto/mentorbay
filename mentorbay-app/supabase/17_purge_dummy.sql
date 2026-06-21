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
