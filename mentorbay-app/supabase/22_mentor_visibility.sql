-- MentorBay - let mentors see who enrolled in their programs. Run in SQL Editor.
drop policy if exists "Mentor reads own program enrollments" on public.enrollments;
create policy "Mentor reads own program enrollments" on public.enrollments for select
  using (
    exists (
      select 1 from public.programs p
      where p.slug = enrollments.program_slug and p.created_by = auth.uid()
    )
  );
