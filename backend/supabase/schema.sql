create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  company text not null,
  employee_id text not null,
  session_id text default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  user_email text not null,
  user_name text default '',
  company text default '',
  employee_id text default '',
  title text not null default 'New conversation',
  preview text default '',
  message_count integer not null default 0,
  status text not null default 'active',
  started_at timestamptz not null default timezone('utc', now()),
  last_message_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists chats (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  user_email text not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  expires_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists email_rate_limits (
  key text primary key,
  points integer not null default 1,
  expire timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists new_prompts (
  prompt text primary key,
  count integer not null default 1
);

create index if not exists idx_users_email on users (email);
create index if not exists idx_conversations_user_email on conversations (user_email);
create index if not exists idx_conversations_expires_at on conversations (expires_at);
create index if not exists idx_chats_session_id on chats (session_id);
create index if not exists idx_chats_created_at on chats (created_at);

drop trigger if exists trg_users_updated_at on users;
create trigger trg_users_updated_at
before update on users
for each row
execute function set_updated_at();

drop trigger if exists trg_conversations_updated_at on conversations;
create trigger trg_conversations_updated_at
before update on conversations
for each row
execute function set_updated_at();

drop trigger if exists trg_chats_updated_at on chats;
create trigger trg_chats_updated_at
before update on chats
for each row
execute function set_updated_at();

drop trigger if exists trg_email_rate_limits_updated_at on email_rate_limits;
create trigger trg_email_rate_limits_updated_at
before update on email_rate_limits
for each row
execute function set_updated_at();
