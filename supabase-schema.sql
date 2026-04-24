-- =============================================================================
-- MASSTORTS247 — PHASE 3 DATABASE SCHEMA
-- =============================================================================
-- Run this in the Supabase SQL Editor (dashboard → SQL → New query → paste → Run)
-- =============================================================================

-- USERS TABLE — mirrors Clerk users, keyed by clerk_user_id
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique not null,
  email text not null,
  first_name text,
  last_name text,
  firm_name text,
  job_title text,
  tier text not null default 'T1' check (tier in ('T1', 'T2', 'T3')),
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_clerk_user_id_idx on public.users(clerk_user_id);
create index if not exists users_email_idx on public.users(email);

-- SUBSCRIPTIONS TABLE — tracks Stripe subscriptions per user
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  stripe_subscription_id text unique,
  tier text not null check (tier in ('T1', 'T2', 'T3')),
  status text not null default 'active' check (status in ('active', 'trialing', 'past_due', 'canceled', 'incomplete')),
  billing_period text not null default 'monthly' check (billing_period in ('monthly', 'annual')),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
create index if not exists subscriptions_stripe_id_idx on public.subscriptions(stripe_subscription_id);

-- WATCHLISTS TABLE — torts a user is watching
create table if not exists public.watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  tort_slug text not null,
  created_at timestamptz not null default now(),
  unique(user_id, tort_slug)
);

create index if not exists watchlists_user_id_idx on public.watchlists(user_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
-- Clerk JWT provides user identity via the `sub` claim (the Clerk user ID).
-- We read it with auth.jwt() ->> 'sub' and compare to users.clerk_user_id.

alter table public.users enable row level security;
alter table public.subscriptions enable row level security;
alter table public.watchlists enable row level security;

-- USERS: a user can read/update only their own row
create policy "users_self_select" on public.users
  for select using (clerk_user_id = auth.jwt() ->> 'sub');

create policy "users_self_update" on public.users
  for update using (clerk_user_id = auth.jwt() ->> 'sub');

-- SUBSCRIPTIONS: a user can read only their own
create policy "subscriptions_self_select" on public.subscriptions
  for select using (
    user_id in (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
  );

-- WATCHLISTS: a user can do everything with their own
create policy "watchlists_self_select" on public.watchlists
  for select using (
    user_id in (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
  );

create policy "watchlists_self_insert" on public.watchlists
  for insert with check (
    user_id in (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
  );

create policy "watchlists_self_delete" on public.watchlists
  for delete using (
    user_id in (select id from public.users where clerk_user_id = auth.jwt() ->> 'sub')
  );

-- Note: INSERT/UPDATE on users and subscriptions is done via service_role key
-- from the webhook handler, which bypasses RLS. That's intentional.

-- =============================================================================
-- UPDATED_AT TRIGGER
-- =============================================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists users_updated_at on public.users;
create trigger users_updated_at before update on public.users
  for each row execute function public.set_updated_at();

drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();
