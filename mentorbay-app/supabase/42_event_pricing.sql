-- 42_event_pricing.sql
-- Add Free/Paid support to events, mirroring the programs pricing model.
-- Free is the default so all existing events keep working unchanged.
--   is_paid    : whether the event charges an entry fee
--   price_kes  : entry fee in whole KES (only meaningful when is_paid = true)
-- Paid-event registration reuses the same M-Pesa (Daraja) STK Push flow as
-- programs via payment_intents (provider 'mpesa', kind 'event').

alter table public.events add column if not exists is_paid boolean not null default false;
alter table public.events add column if not exists price_kes numeric(12,2) not null default 0;

-- payment_intents already exists (migration 41). Allow it to reference an event
-- instead of a program for event ticket purchases. program_slug stays nullable
-- so an intent is for EITHER a program OR an event.
alter table public.payment_intents alter column program_slug drop not null;
alter table public.payment_intents add column if not exists event_slug text;
alter table public.payment_intents add column if not exists kind text not null default 'program';

-- event_registrations: record whether/what the attendee paid (mirrors enrollments).
alter table public.event_registrations add column if not exists amount_paid_kes numeric(12,2) not null default 0;
alter table public.event_registrations add column if not exists paid boolean not null default false;
alter table public.event_registrations add column if not exists payment_intent_id uuid references public.payment_intents(id) on delete set null;
