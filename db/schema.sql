create extension if not exists pgcrypto;

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text,
  role text not null default 'investor',
  password_hash text,
  created_at timestamptz not null default now()
);

create table if not exists funds (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  currency text not null default 'EUR',
  target_amount numeric(18,2) not null,
  min_commitment numeric(18,2) not null default 1000,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  address text,
  chain text default 'offchain',
  created_at timestamptz not null default now()
);

create table if not exists commitments (
  id uuid primary key default gen_random_uuid(),
  fund_id uuid not null references funds(id) on delete cascade,
  user_id uuid not null references app_users(id) on delete cascade,
  amount numeric(18,2) not null check (amount > 0),
  status text not null default 'reserved',
  created_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  commitment_id uuid references commitments(id) on delete set null,
  user_id uuid references app_users(id) on delete set null,
  fund_id uuid references funds(id) on delete set null,
  tx_type text not null,
  amount numeric(18,2) not null check (amount >= 0),
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_commitments_user on commitments(user_id);
create index if not exists idx_commitments_fund on commitments(fund_id);
create index if not exists idx_transactions_user on transactions(user_id);
create index if not exists idx_transactions_fund on transactions(fund_id);
