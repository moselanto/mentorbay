-- Migration 34: capture mentee contact details at program enroll time so the
-- mentor can reach out before approving the enrollment request.
alter table public.enrollments add column if not exists mentee_phone text;
alter table public.enrollments add column if not exists mentee_email text;
