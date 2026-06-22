-- MentorBay - direct messages between connected mentor and mentee. Run in SQL Editor.
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  sender_id   uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  body        text not null,
  created_at  timestamptz default now()
);
create index if not exists messages_pair_idx on public.messages (sender_id, recipient_id, created_at);

alter table public.messages enable row level security;

-- A user can read messages they sent or received.
drop policy if exists "Own messages read" on public.messages;
create policy "Own messages read" on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

-- A user can send a message only as themselves, and only to someone they have an
-- ACCEPTED mentorship connection with (either direction).
drop policy if exists "Send to connections" on public.messages;
create policy "Send to connections" on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.applications a
      where a.status = 'accepted'
        and (
          (a.mentee_id = auth.uid() and a.mentor_id = recipient_id)
          or (a.mentor_id = auth.uid() and a.mentee_id = recipient_id)
        )
    )
  );
