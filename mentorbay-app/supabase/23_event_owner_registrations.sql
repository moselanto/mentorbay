-- MentorBay - let an event's creator (mentor) see who registered. Run in SQL Editor.
drop policy if exists "Event owner reads registrations" on public.event_registrations;
create policy "Event owner reads registrations" on public.event_registrations for select
  using (
    exists (
      select 1 from public.events e
      where e.slug = event_registrations.event_slug and e.created_by = auth.uid()
    )
  );
