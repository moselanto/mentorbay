-- MentorBay - program detail fields + program & session approval. Additive. Run after 07.

------------------------------------------------------------------
-- 1) Program detail fields
------------------------------------------------------------------
alter table programs add column if not exists about text;
alter table programs add column if not exists learn text[] default '{}';
alter table programs add column if not exists curriculum jsonb default '[]'::jsonb;
alter table programs add column if not exists duration_label text;  -- e.g. "1 day", "6 weeks"

------------------------------------------------------------------
-- 2) Programs now require admin approval before going public.
--    status values: pending | published | rejected | draft
--    (Public read policy already only shows status = 'published'.)
--    Admins can read & manage every program; owners manage their own (04 policy).
------------------------------------------------------------------
drop policy if exists "Admins manage programs" on programs;
create policy "Admins manage programs" on programs
  for all using (is_admin()) with check (is_admin());

------------------------------------------------------------------
-- 3) Sessions: admin approval
------------------------------------------------------------------
alter table sessions add column if not exists approval_status text not null default 'pending'; -- pending | approved | rejected

drop policy if exists "Admins manage sessions" on sessions;
create policy "Admins manage sessions" on sessions
  for all using (is_admin()) with check (is_admin());
