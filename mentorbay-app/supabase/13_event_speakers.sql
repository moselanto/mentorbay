-- MentorBay - multi-speaker lineup on events. Run in SQL Editor.
-- Adds a speakers JSON array: [{ "name": "...", "role": "..." }, ...] (up to 4).
-- The legacy single `speaker` text column is kept for backwards compatibility.
alter table public.events add column if not exists speakers jsonb not null default '[]'::jsonb;
