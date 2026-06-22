-- Run this in your Supabase SQL editor

-- X Accounts table
create table x_accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  label text not null,
  x_handle text not null,
  ai_provider text not null default 'openai',
  ai_api_key text not null,
  ai_model text not null default 'gpt-4o-mini',
  created_at timestamptz default now()
);

-- Voice profiles table
create table voice_profiles (
  id uuid default gen_random_uuid() primary key,
  account_id uuid references x_accounts(id) on delete cascade not null unique,
  tone text,
  topics text,
  example_tweets text,
  avoid text,
  reference_accounts text,
  updated_at timestamptz default now()
);

-- Posts table
create table posts (
  id uuid default gen_random_uuid() primary key,
  account_id uuid references x_accounts(id) on delete cascade not null,
  content text not null,
  status text not null default 'draft', -- draft | scheduled | posted | failed
  post_type text not null default 'tweet', -- tweet | reply
  reply_to_url text,
  reply_to_text text,
  scheduled_at timestamptz,
  posted_at timestamptz,
  likes integer default 0,
  replies integer default 0,
  reposts integer default 0,
  impressions integer default 0,
  created_at timestamptz default now()
);

-- RLS Policies
alter table x_accounts enable row level security;
alter table voice_profiles enable row level security;
alter table posts enable row level security;

-- Users can only see their own accounts
create policy "Users own accounts" on x_accounts
  for all using (auth.uid() = user_id);

-- Voice profiles inherit account ownership
create policy "Users own voice profiles" on voice_profiles
  for all using (
    account_id in (select id from x_accounts where user_id = auth.uid())
  );

-- Posts inherit account ownership
create policy "Users own posts" on posts
  for all using (
    account_id in (select id from x_accounts where user_id = auth.uid())
  );
