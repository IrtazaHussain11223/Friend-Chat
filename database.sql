create extension if not exists pgcrypto;

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  room_id text not null default 'general' check (char_length(room_id) between 1 and 40),
  username text not null check (char_length(username) between 1 and 32),
  text text not null check (char_length(text) between 1 and 1000),
  created_at timestamptz not null default now()
);

alter table public.messages
  add column if not exists room_id text not null default 'general';

create index if not exists messages_created_at_idx
  on public.messages (created_at desc);

create index if not exists messages_room_created_at_idx
  on public.messages (room_id, created_at desc);

alter table public.messages enable row level security;

-- The app writes through the Supabase service role key from Next.js API routes.
-- No public browser access is needed for this private shared-code chat.
