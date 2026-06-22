-- MentorBay - track which curriculum lessons a mentee completed. Run in SQL Editor.
-- Stores an array of completed lesson keys ("moduleIdx:lessonIdx") per enrollment.
alter table public.enrollments add column if not exists completed_lessons text[] not null default '{}';
