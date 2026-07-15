-- Trigger-only SECURITY DEFINER helpers should not be addressable through the
-- public Data API schema. Keep the browser-facing RPCs in public, but move the
-- auth signup helper behind a schema with no API-role privileges.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.knowplain_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.knowplain_profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

revoke all on function private.knowplain_handle_new_user() from public, anon, authenticated;

drop trigger if exists knowplain_on_auth_user_created on auth.users;
create trigger knowplain_on_auth_user_created
  after insert on auth.users
  for each row execute procedure private.knowplain_handle_new_user();

drop function if exists public.knowplain_handle_new_user();
