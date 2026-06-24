-- Migration 29: mentee enrollment now requires mentor approval.
-- New enrollments are created with status 'pending' (see enrollProgramAction);
-- the mentor approves -> 'active', or declines -> 'rejected' (with an optional note).

-- 1. Optional note the mentor leaves when declining an enrollment (emailed to the mentee).
alter table public.enrollments add column if not exists decline_reason text;

-- 2. Allow a mentor to UPDATE enrollment rows for programs they own.
--    (A SELECT policy already exists; UPDATE is required for approve/decline to work under RLS.)
drop policy if exists "Mentor manages own program enrollments" on public.enrollments;
create policy "Mentor manages own program enrollments" on public.enrollments for update
  using (
    exists (
      select 1 from public.programs p
      where p.slug = enrollments.program_slug and p.created_by = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.programs p
      where p.slug = enrollments.program_slug and p.created_by = auth.uid()
    )
  );

-- Note: the enrollments.status column keeps its 'active' default at the DB level,
-- but the app explicitly inserts 'pending' on new enrollments. Existing rows are
-- left as-is (already-approved/active mentees are not retroactively reset).
