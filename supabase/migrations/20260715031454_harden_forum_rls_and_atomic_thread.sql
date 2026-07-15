-- Harden ownership checks and make thread + first-post creation atomic.
--
-- Supabase exposes public-schema tables through the Data API. RLS is therefore the
-- authorization boundary, not a convenience check in the Next.js action.

-- New writes must contain useful bounded content. NOT VALID preserves deployability
-- if a pre-existing project contains legacy rows; PostgreSQL still enforces these
-- constraints for every new or updated row. Validate them after legacy cleanup.
alter table public.knowplain_forum_threads
  add constraint knowplain_forum_threads_title_length
  check (char_length(btrim(title)) between 3 and 160) not valid;

alter table public.knowplain_forum_posts
  add constraint knowplain_forum_posts_content_length
  check (char_length(btrim(content)) between 1 and 10000) not valid;

create index if not exists knowplain_forum_threads_author_id_idx
  on public.knowplain_forum_threads (author_id);

create index if not exists knowplain_forum_posts_author_id_idx
  on public.knowplain_forum_posts (author_id);

create index if not exists knowplain_forum_posts_thread_id_idx
  on public.knowplain_forum_posts (thread_id);

drop policy if exists "Public profiles are viewable by everyone." on public.knowplain_profiles;
drop policy if exists "Users can insert their own profile." on public.knowplain_profiles;
drop policy if exists "Users can update own profile." on public.knowplain_profiles;

create policy "Profiles are publicly readable"
  on public.knowplain_profiles for select
  to anon, authenticated
  using (true);

create policy "Users can insert their own profile"
  on public.knowplain_profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.knowplain_profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Threads are viewable by everyone." on public.knowplain_forum_threads;
drop policy if exists "Authenticated users can create threads." on public.knowplain_forum_threads;

create policy "Threads are publicly readable"
  on public.knowplain_forum_threads for select
  to anon, authenticated
  using (true);

create policy "Users can create their own threads"
  on public.knowplain_forum_threads for insert
  to authenticated
  with check ((select auth.uid()) = author_id);

drop policy if exists "Posts are viewable by everyone." on public.knowplain_forum_posts;
drop policy if exists "Authenticated users can create posts." on public.knowplain_forum_posts;

create policy "Posts are publicly readable"
  on public.knowplain_forum_posts for select
  to anon, authenticated
  using (true);

create policy "Users can create their own posts"
  on public.knowplain_forum_posts for insert
  to authenticated
  with check ((select auth.uid()) = author_id);

drop policy if exists "Users can view their own saved simulations." on public.knowplain_saved_simulations;
drop policy if exists "Users can insert their own saved simulations." on public.knowplain_saved_simulations;
drop policy if exists "Users can update their own saved simulations." on public.knowplain_saved_simulations;
drop policy if exists "Users can delete their own saved simulations." on public.knowplain_saved_simulations;

create policy "Users can view their own saved simulations"
  on public.knowplain_saved_simulations for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own saved simulations"
  on public.knowplain_saved_simulations for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own saved simulations"
  on public.knowplain_saved_simulations for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own saved simulations"
  on public.knowplain_saved_simulations for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Likes are viewable by everyone." on public.knowplain_forum_likes;
drop policy if exists "Users can insert their own likes." on public.knowplain_forum_likes;
drop policy if exists "Users can delete their own likes." on public.knowplain_forum_likes;

create policy "Likes are publicly readable"
  on public.knowplain_forum_likes for select
  to anon, authenticated
  using (true);

create policy "Users can insert their own likes"
  on public.knowplain_forum_likes for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own likes"
  on public.knowplain_forum_likes for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- PostgREST exposes public functions as RPCs. SECURITY DEFINER is intentional here:
-- the function performs two writes as one transaction, derives ownership from auth.uid(),
-- uses an empty search path, schema-qualifies every relation, and is executable only by
-- the authenticated role. No caller-supplied author id crosses the boundary.
create or replace function public.knowplain_create_forum_thread(
  thread_title text,
  thread_content text,
  thread_pillar text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  new_thread_id uuid;
  clean_title text := btrim(thread_title);
  clean_content text := btrim(thread_content);
  clean_pillar text := nullif(btrim(thread_pillar), '');
begin
  if caller_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if char_length(clean_title) < 3 or char_length(clean_title) > 160 then
    raise exception 'Thread title must be between 3 and 160 characters'
      using errcode = '22023';
  end if;

  if char_length(clean_content) < 1 or char_length(clean_content) > 10000 then
    raise exception 'Post content must be between 1 and 10000 characters'
      using errcode = '22023';
  end if;

  if clean_pillar is not null and clean_pillar not in (
    'retirement', 'money-psychology', 'decision-tools'
  ) then
    raise exception 'Invalid forum pillar' using errcode = '22023';
  end if;

  insert into public.knowplain_forum_threads (title, pillar, author_id)
  values (clean_title, clean_pillar, caller_id)
  returning id into new_thread_id;

  insert into public.knowplain_forum_posts (thread_id, content, author_id)
  values (new_thread_id, clean_content, caller_id);

  return new_thread_id;
end;
$$;

revoke execute on function public.knowplain_create_forum_thread(text, text, text) from public;
revoke execute on function public.knowplain_create_forum_thread(text, text, text) from anon;
grant execute on function public.knowplain_create_forum_thread(text, text, text) to authenticated;
