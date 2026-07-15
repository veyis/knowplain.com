-- Explicitly consented, owner-only retirement checkup scenarios.
-- The default checkup remains local-only; rows exist only after the signed-in user
-- presses the separate "save to my account" control.
create table public.knowplain_saved_checkups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 48),
  input jsonb not null check (
    jsonb_typeof(input) = 'object'
    and octet_length(input::text) <= 4096
  ),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index knowplain_saved_checkups_user_created_idx
  on public.knowplain_saved_checkups (user_id, created_at desc);

alter table public.knowplain_saved_checkups enable row level security;

create policy "Users can read their own saved checkups"
  on public.knowplain_saved_checkups for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own saved checkups"
  on public.knowplain_saved_checkups for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own saved checkups"
  on public.knowplain_saved_checkups for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own saved checkups"
  on public.knowplain_saved_checkups for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.knowplain_saved_checkups to authenticated;
grant all on public.knowplain_saved_checkups to service_role;
