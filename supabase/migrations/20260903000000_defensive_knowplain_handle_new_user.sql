-- Shared auth.users with VoxArena. If knowplain_profiles is missing, a
-- leftover AFTER INSERT trigger aborted every new-user write (42P01,
-- "Database error saving new user"). No-op when the table is gone.

create or replace function private.knowplain_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if to_regclass('public.knowplain_profiles') is null then
    return new;
  end if;
  insert into public.knowplain_profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

revoke all on function private.knowplain_handle_new_user() from public, anon, authenticated;
