-- MentorBay - mark messages read for unread counts. Run in SQL Editor.
alter table public.messages add column if not exists read_at timestamptz;
create index if not exists messages_recipient_unread_idx on public.messages (recipient_id) where read_at is null;
