-- Run against an isolated local Supabase database after all migrations.
-- The transaction is always rolled back.
begin;

do $$
declare
  missing text;
begin
  select string_agg(format('%I.%I', schemaname, tablename), ', ')
    into missing
  from pg_tables
  where schemaname = 'public'
    and tablename like 'knowplain_%'
    and not rowsecurity;
  if missing is not null then
    raise exception 'RLS is disabled on: %', missing;
  end if;
end $$;

do $$
begin
  if not has_table_privilege('anon', 'public.knowplain_profiles', 'select') then
    raise exception 'anon must be able to select public profiles';
  end if;
  if has_table_privilege('anon', 'public.knowplain_saved_checkups', 'select') then
    raise exception 'anon must not have saved-checkup select privilege';
  end if;
  if has_table_privilege('anon', 'public.knowplain_leads', 'select') then
    raise exception 'anon must never read leads';
  end if;
  if not has_table_privilege('anon', 'public.knowplain_leads', 'insert') then
    raise exception 'anon lead submission grant is missing';
  end if;
end $$;

-- Stable fake identities used only inside this rolled-back transaction.
set local session_replication_role = replica;
insert into public.knowplain_profiles (id, display_name)
values
  ('11111111-1111-4111-8111-111111111111', 'RLS owner'),
  ('22222222-2222-4222-8222-222222222222', 'RLS other');
insert into public.knowplain_saved_checkups (id, user_id, name, input)
values (
  '33333333-3333-4333-8333-333333333333',
  '11111111-1111-4111-8111-111111111111',
  'Owner scenario',
  '{"age":52,"targetRetirementAge":67,"retirementSavings":325000,"annualContribution":24000,"annualSpending":78000,"socialSecurityAnnual":32000,"pensionAnnual":0,"debtPaymentsAnnual":6000,"retireBefore65":false,"partTimePossible":true,"spendingFlexibility":"medium"}'::jsonb
);
set local session_replication_role = origin;

set local role anon;
do $$
begin
  if (select count(*) from public.knowplain_profiles) <> 2 then
    raise exception 'anon public-profile visibility failed';
  end if;
end $$;
reset role;

select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
do $$
declare
  affected integer;
begin
  if (select count(*) from public.knowplain_saved_checkups) <> 1 then
    raise exception 'owner cannot read their saved checkup';
  end if;
  update public.knowplain_profiles set display_name = 'Owner updated'
    where id = '11111111-1111-4111-8111-111111111111';
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'owner profile update failed'; end if;
  update public.knowplain_profiles set display_name = 'Illicit update'
    where id = '22222222-2222-4222-8222-222222222222';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'owner updated a non-owner profile'; end if;
end $$;
reset role;

select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;
do $$
begin
  if (select count(*) from public.knowplain_saved_checkups) <> 0 then
    raise exception 'non-owner can read another user saved checkup';
  end if;
end $$;
reset role;

rollback;
