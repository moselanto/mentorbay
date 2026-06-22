-- MentorBay - remove duplicate mentorship applications and prevent new ones.
-- Run in the Supabase SQL Editor.

-- 1) Delete duplicate applications, keeping the earliest row per (mentee, mentor).
delete from public.applications a
using public.applications b
where a.mentee_id = b.mentee_id
  and a.mentor_id is not distinct from b.mentor_id
  and a.mentor_id is not null
  and a.ctid > b.ctid;

-- 2) Prevent future duplicates: one application per mentee per mentor.
do $$ begin
  alter table public.applications
    add constraint applications_mentee_mentor_unique unique (mentee_id, mentor_id);
exception when duplicate_table or duplicate_object then null; end $$;
