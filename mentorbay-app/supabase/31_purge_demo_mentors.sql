-- Migration 31: remove leftover demo/seed mentors (e.g. "Jane Wanjiku") that
-- still appear on the public site because an old seed inserted them with
-- status='approved' and no linked real account. Safe to re-run.

-- 1. Delete the known seeded demo mentors by slug (these were never real users).
delete from public.mentors
where slug in (
  'jane-wanjiku','john-kamau','sarah-mwangi','david-ochieng','lillian-anyango',
  'mary-achieng','samuel-njoroge','brian-otieno','grace-wairimu','kevin-mwangi',
  'aisha-hassan','daniel-kiprop'
);

-- 2. Belt-and-braces: any mentor with no linked real profile is seed data.
delete from public.mentors where profile_id is null;

-- 3. Remove programs/events that have no real owner (seed rows).
delete from public.programs where created_by is null;
delete from public.events   where created_by is null;

-- 4. Remove reviews whose mentor_slug no longer points at a real mentor.
delete from public.reviews r
where r.mentor_slug is not null
  and not exists (select 1 from public.mentors m where m.slug = r.mentor_slug);
