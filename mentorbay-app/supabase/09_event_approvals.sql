-- MentorBay - events now require admin approval (like programs). Additive. Run after 08.

-- 1) Add approval status to events.
alter table events add column if not exists approval_status text not null default 'pending'; -- pending | approved | rejected

-- 2) Keep all EXISTING/seeded events public (approve them once).
update events set approval_status = 'approved' where approval_status = 'pending';

-- 3) Public visitors only see published + approved events.
drop policy if exists "Public can read published events" on events;
drop policy if exists "Public can read approved events" on events;
create policy "Public can read approved events" on events
  for select using (status = 'published' and approval_status = 'approved');

-- 4) Admins can read & manage every event; owners already manage their own (06 policy).
drop policy if exists "Admins manage events" on events;
create policy "Admins manage events" on events
  for all using (is_admin()) with check (is_admin());
