-- Data API privileges are explicit and intentionally separate from RLS.
-- Grants answer "may this role attempt the operation?"; policies answer
-- "which rows may the caller affect?". Both layers are required.
revoke all on table public.knowplain_profiles from anon, authenticated;
revoke all on table public.knowplain_forum_threads from anon, authenticated;
revoke all on table public.knowplain_forum_posts from anon, authenticated;
revoke all on table public.knowplain_forum_likes from anon, authenticated;
revoke all on table public.knowplain_search_index from anon, authenticated;
revoke all on table public.knowplain_videos from anon, authenticated;
revoke all on table public.knowplain_saved_simulations from anon, authenticated;
revoke all on table public.knowplain_saved_checkups from anon, authenticated;
revoke all on table public.knowplain_leads from anon, authenticated;

grant select on table public.knowplain_profiles to anon, authenticated;
grant insert, update on table public.knowplain_profiles to authenticated;

grant select on table public.knowplain_forum_threads to anon, authenticated;
grant insert on table public.knowplain_forum_threads to authenticated;
grant select on table public.knowplain_forum_posts to anon, authenticated;
grant insert on table public.knowplain_forum_posts to authenticated;
grant select on table public.knowplain_forum_likes to anon, authenticated;
grant insert, delete on table public.knowplain_forum_likes to authenticated;

grant select on table public.knowplain_search_index to anon, authenticated;
grant select on table public.knowplain_videos to anon, authenticated;

grant select, insert, update, delete
  on table public.knowplain_saved_simulations to authenticated;
grant select, insert, update, delete
  on table public.knowplain_saved_checkups to authenticated;

grant insert on table public.knowplain_leads to anon, authenticated;

grant all on table public.knowplain_profiles to service_role;
grant all on table public.knowplain_forum_threads to service_role;
grant all on table public.knowplain_forum_posts to service_role;
grant all on table public.knowplain_forum_likes to service_role;
grant all on table public.knowplain_search_index to service_role;
grant all on table public.knowplain_videos to service_role;
grant all on table public.knowplain_saved_simulations to service_role;
grant all on table public.knowplain_saved_checkups to service_role;
grant all on table public.knowplain_leads to service_role;
