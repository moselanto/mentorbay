-- MentorBay - add a Requirements list to programs. Additive. Run after 09.
alter table programs add column if not exists requirements text[] default '{}';
