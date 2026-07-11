-- Adds the knowplain_leads table to an EXISTING database.
-- Run this instead of schema.sql if the project is already provisioned
-- (schema.sql is the bootstrap for a fresh project and will error with
--  42P07 "relation already exists" on one that isn't).
--
-- Safe to run more than once.

-- Write-only from the client: anyone may insert, nobody may read back. Lead emails are
-- only readable with the service role. `notes` stores the checkup's generic summary
-- sentence — never the user's balances, income, or debt.
create table if not exists public.knowplain_leads (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  source text not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (email, source)
);

alter table public.knowplain_leads enable row level security;

drop policy if exists "Anyone can submit a lead." on public.knowplain_leads;
create policy "Anyone can submit a lead." on public.knowplain_leads
  for insert with check (true);

drop policy if exists "Leads are not publicly readable." on public.knowplain_leads;
create policy "Leads are not publicly readable." on public.knowplain_leads
  for select using (false);
