create extension if not exists pgcrypto;

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  username text not null check (char_length(username) between 1 and 32),
  text text not null check (char_length(text) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists messages_created_at_idx
  on public.messages (created_at desc);

alter table public.messages enable row level security;

-- The app writes through the Supabase service role key from Next.js API routes.
-- No public browser access is needed for this private shared-code chat.
