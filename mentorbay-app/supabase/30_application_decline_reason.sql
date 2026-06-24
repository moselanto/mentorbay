-- Migration 30: mentor can leave a note when declining a mentorship application.
-- The mentee sees this note in-app on their My Mentor page (and by email).
-- The existing "Applicant or mentor" RLS policy already lets the mentee read and
-- the mentor write this row, so no new policy is required.

alter table public.applications add column if not exists decline_reason text;
