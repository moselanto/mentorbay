-- MentorBay - course completion confirmation + certificates. Run in SQL Editor.
alter table public.enrollments add column if not exists certificate_issued boolean not null default false;
alter table public.enrollments add column if not exists completed_at timestamptz;
