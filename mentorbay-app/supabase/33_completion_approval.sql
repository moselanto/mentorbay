-- Migration 33: program completion now requires mentor approval before the
-- certificate is issued.
--   completion_status: null  -> not requested yet
--                      'pending'  -> mentee requested, awaiting mentor
--                      'approved' -> mentor confirmed; certificate_issued is set true
--                      'rejected' -> mentor declined (see completion_decline_reason)
-- The mentor UPDATE RLS policy on enrollments (migration 29) already lets a
-- mentor update enrollment rows for programs they own, so no new policy is needed.

alter table public.enrollments add column if not exists completion_status text;
alter table public.enrollments add column if not exists completion_decline_reason text;
