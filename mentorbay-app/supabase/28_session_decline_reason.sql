-- Migration 28: mentee->mentor session confirmation flow
-- Adds a column for the mentor's "not available" note, and makes new bookings
-- start as pending so they don't appear as confirmed/upcoming until the mentor accepts.

-- 1. Reason the mentor gives when declining a session request (shown to the mentee).
alter table public.sessions add column if not exists decline_reason text;

-- 2. New mentee bookings should default to pending (awaiting mentor confirmation).
--    Mentor-scheduled sessions still go through the admin approval path.
alter table public.sessions alter column approval_status set default 'pending';

-- 3. Backfill: any existing row with no approval_status becomes 'pending'
--    so it surfaces in the new "Awaiting confirmation" / "Pending requests" lists
--    rather than silently being treated as confirmed.
update public.sessions set approval_status = 'pending' where approval_status is null;
