-- Migration 32: richer mentorship applications.
-- Mentee provides contact details + self-certifies the mentor's program
-- requirements at apply time; the mentor sees these on the pending application
-- so they can reach out before approving.

alter table public.applications add column if not exists mentee_phone text;
alter table public.applications add column if not exists mentee_email text;
-- The requirement strings the mentee ticked (self-certified) when applying.
alter table public.applications add column if not exists confirmed_requirements text[] default '{}';
