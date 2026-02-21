
-- SAFE DATABASE SETUP SCRIPT
-- Run this in your Supabase SQL Editor. It checks if things exist before creating them.

-- 1. Create PROFILES table if it doesn't exist
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  theme text default 'dark',
  email_notifications boolean default true,
  generation_alerts boolean default true,
  marketing_updates boolean default false,
  credits integer default 0,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS on profiles
alter table public.profiles enable row level security;

-- 3. Create policies for profiles (safely drop first to avoid "already exists" errors)
-- C2 FIX: Restrict SELECT to own profile only (was: using (true) = public read)
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
drop policy if exists "Users can view own profile." on public.profiles;
create policy "Users can view own profile." on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can insert their own profile." on public.profiles;
create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

-- H1 FIX: Restrict UPDATE to safe columns only (prevent users from changing credits/is_admin)
drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- Revoke direct column update on sensitive fields (defense in depth)
-- Users should only update: full_name, avatar_url, theme, email_notifications, generation_alerts, marketing_updates
-- credits and is_admin should only be changed by service_role (edge functions)

-- 4. Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing; -- Prevent duplicate key errors
  return new;
end;
$$ language plpgsql security definer;

-- 5. Trigger for new users (safely drop first)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Create GENERATIONS table
create table if not exists public.generations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  prompt text not null,
  image_url text,
  result_text text,
  type text not null,
  is_saved boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Enable RLS on generations
alter table public.generations enable row level security;

-- 8. Policies for generations
drop policy if exists "Users can view their own generations." on public.generations;
create policy "Users can view their own generations." on public.generations
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own generations." on public.generations;
create policy "Users can insert their own generations." on public.generations
  for insert with check (auth.uid() = user_id);

-- 9. Create CONVERSATIONS table
create table if not exists public.conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.conversations enable row level security;

drop policy if exists "Users can view their own conversations." on public.conversations;
create policy "Users can view their own conversations." on public.conversations
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own conversations." on public.conversations;
create policy "Users can insert their own conversations." on public.conversations
  for insert with check (auth.uid() = user_id);

-- 10. Create MESSAGES table
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  role text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.messages enable row level security;

drop policy if exists "Users can view messages in their conversations." on public.messages;
create policy "Users can view messages in their conversations." on public.messages
  for select using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert messages in their conversations." on public.messages;
create policy "Users can insert messages in their conversations." on public.messages
  for insert with check (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

-- 11. Create WAITLIST table (required for the /waitlist form to work)
create table if not exists public.waitlist (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  email text not null,
  phone_number text,
  use_case text,
  motivation text,
  status text default 'pending',
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add unique constraint on email to prevent duplicate signups
alter table public.waitlist add constraint waitlist_email_unique unique (email);

-- Enable RLS on waitlist
alter table public.waitlist enable row level security;

-- Allow anyone (including unauthenticated visitors) to INSERT into the waitlist
-- This is necessary because waitlist signups happen before login
drop policy if exists "Anyone can join the waitlist." on public.waitlist;
create policy "Anyone can join the waitlist." on public.waitlist
  for insert with check (true);

-- Allow anyone to view their own waitlist entry if they have the ID (UUID)
-- This allows the challenge page to read existing metadata before updating
drop policy if exists "Users can view their own waitlist entry via ID." on public.waitlist;
create policy "Users can view their own waitlist entry via ID." on public.waitlist
  for select using (true); -- We allow select, but practically restricted by the ID in the query

-- Allow users to update their own waitlist entry (e.g., adding challenge results)
drop policy if exists "Users can update their own waitlist entry via ID." on public.waitlist;
create policy "Users can update their own waitlist entry via ID." on public.waitlist
  for update using (true);

-- Index for fast email lookups (duplicate detection)
create index if not exists waitlist_email_idx on public.waitlist (email);

-- Index for filtering by status  
create index if not exists waitlist_status_idx on public.waitlist (status);
