-- BOOTSTRAP for a FRESH Supabase project. Running this against a database that already
-- has these tables fails with 42P07 ("relation already exists") — that is expected, not
-- a bug. To add something to an existing project, use a file in supabase/migrations/.

-- 1. Profiles Table (syncs with auth.users)
create table public.knowplain_profiles (
  id uuid references auth.users not null primary key,
  display_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.knowplain_profiles enable row level security;
create policy "Profiles are publicly readable" on knowplain_profiles for select to anon, authenticated using (true);
create policy "Users can insert their own profile" on knowplain_profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "Users can update their own profile" on knowplain_profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Trigger-only helpers live outside the Data API's exposed public schema.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- Function and trigger to auto-create profile on signup
create or replace function private.knowplain_handle_new_user()
returns trigger as $$
begin
  insert into public.knowplain_profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer set search_path = '';

revoke all on function private.knowplain_handle_new_user() from public, anon, authenticated;

drop trigger if exists knowplain_on_auth_user_created on auth.users;
create trigger knowplain_on_auth_user_created
  after insert on auth.users
  for each row execute procedure private.knowplain_handle_new_user();

-- 2. Forum Threads
create table public.knowplain_forum_threads (
  id uuid default gen_random_uuid() primary key,
  title text not null check (char_length(btrim(title)) between 3 and 160),
  author_id uuid references public.knowplain_profiles(id) not null,
  pillar text,
  status text not null default 'pending' check (status in ('pending','published','hidden','locked')),
  moderated_at timestamp with time zone,
  moderation_note text check (moderation_note is null or char_length(moderation_note) <= 500),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.knowplain_forum_threads enable row level security;
create index knowplain_forum_threads_author_id_idx on public.knowplain_forum_threads (author_id);
create policy "Published threads and own submissions are readable" on knowplain_forum_threads for select to anon, authenticated using (status in ('published','locked') or (select auth.uid()) = author_id);
create policy "Users can create their own threads" on knowplain_forum_threads for insert to authenticated with check ((select auth.uid()) = author_id);

-- 3. Forum Posts
create table public.knowplain_forum_posts (
  id uuid default gen_random_uuid() primary key,
  thread_id uuid references public.knowplain_forum_threads(id) on delete cascade not null,
  author_id uuid references public.knowplain_profiles(id) not null,
  content text not null check (char_length(btrim(content)) between 1 and 10000),
  status text not null default 'pending' check (status in ('pending','published','hidden')),
  moderated_at timestamp with time zone,
  moderation_note text check (moderation_note is null or char_length(moderation_note) <= 500),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.knowplain_forum_posts enable row level security;
create index knowplain_forum_posts_author_id_idx on public.knowplain_forum_posts (author_id);
create index knowplain_forum_posts_thread_id_idx on public.knowplain_forum_posts (thread_id);
create policy "Published posts and own submissions are readable" on knowplain_forum_posts for select to anon, authenticated using (status = 'published' or (select auth.uid()) = author_id);
create policy "Users can create their own posts" on knowplain_forum_posts for insert to authenticated with check ((select auth.uid()) = author_id);

-- 4. Search Index (Sync target for MDX content)
create table public.knowplain_search_index (
  id text primary key,
  type text not null,
  title text not null,
  href text not null,
  snippet text,
  pillar text,
  aliases text[] not null default '{}',
  keywords text[] not null default '{}',
  body text not null default '',
  fts tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(array_to_string(aliases, ' '), '')), 'A') ||
    setweight(to_tsvector('english', coalesce(array_to_string(keywords, ' '), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(snippet, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(body, '')), 'D')
  ) stored
);
create index knowplain_search_index_fts_idx on public.knowplain_search_index using gin (fts);
create index knowplain_search_index_type_pillar_idx on public.knowplain_search_index (type, pillar);
alter table public.knowplain_search_index enable row level security;
create policy "Search index is viewable by everyone." on knowplain_search_index for select using (true);
create policy "Only service role can manage search index." on knowplain_search_index for all using (false);

create function public.knowplain_search(search_query text, result_limit integer default 30)
returns table (id text, type text, title text, href text, snippet text, pillar text, rank real)
language sql stable security invoker set search_path = ''
as $$
  select document.id, document.type, document.title, document.href, document.snippet,
    document.pillar,
    ts_rank_cd(document.fts, websearch_to_tsquery('english', search_query)) as rank
  from public.knowplain_search_index as document
  where char_length(btrim(search_query)) between 1 and 200
    and document.fts @@ websearch_to_tsquery('english', search_query)
  order by rank desc, document.title asc
  limit least(greatest(result_limit, 1), 100);
$$;
revoke execute on function public.knowplain_search(text, integer) from public;
grant execute on function public.knowplain_search(text, integer) to anon, authenticated;

-- 5. Videos (Synced from YouTube)
create table public.knowplain_videos (
  id text primary key,
  title text not null,
  description text,
  transcript text,
  published_at timestamp with time zone not null,
  thumbnail_url text
);
alter table public.knowplain_videos enable row level security;
create policy "Videos are viewable by everyone." on knowplain_videos for select using (true);
create policy "Only service role can manage videos." on knowplain_videos for all using (false);

-- 6. Saved Simulations
create table public.knowplain_saved_simulations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  balance numeric not null,
  withdrawal numeric not null,
  growth numeric not null,
  inflation numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.knowplain_saved_simulations enable row level security;
create policy "Users can view their own saved simulations" on knowplain_saved_simulations for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert their own saved simulations" on knowplain_saved_simulations for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their own saved simulations" on knowplain_saved_simulations for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete their own saved simulations" on knowplain_saved_simulations for delete to authenticated using ((select auth.uid()) = user_id);

-- 6b. Explicitly saved retirement checkups. The browser-only draft is never written here
-- automatically; insertion requires a separate signed-in user action.
create table public.knowplain_saved_checkups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 48),
  input jsonb not null check (jsonb_typeof(input) = 'object' and octet_length(input::text) <= 4096),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
create index knowplain_saved_checkups_user_created_idx on public.knowplain_saved_checkups (user_id, created_at desc);
alter table public.knowplain_saved_checkups enable row level security;
create policy "Users can read their own saved checkups" on knowplain_saved_checkups for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert their own saved checkups" on knowplain_saved_checkups for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their own saved checkups" on knowplain_saved_checkups for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete their own saved checkups" on knowplain_saved_checkups for delete to authenticated using ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.knowplain_saved_checkups to authenticated;
grant all on public.knowplain_saved_checkups to service_role;
-- 7. Forum Likes
create table public.knowplain_forum_likes (
  user_id uuid references auth.users not null,
  thread_id uuid references public.knowplain_forum_threads(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, thread_id)
);
alter table public.knowplain_forum_likes enable row level security;
create policy "Likes are publicly readable" on knowplain_forum_likes for select to anon, authenticated using (true);
create policy "Users can insert their own likes" on knowplain_forum_likes for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can delete their own likes" on knowplain_forum_likes for delete to authenticated using ((select auth.uid()) = user_id);

create table public.knowplain_forum_reports (
  id uuid primary key default gen_random_uuid(), reporter_id uuid not null references auth.users(id) on delete cascade,
  thread_id uuid references public.knowplain_forum_threads(id) on delete cascade,
  post_id uuid references public.knowplain_forum_posts(id) on delete cascade,
  reason text not null check (reason in ('spam','harassment','dangerous-advice','privacy','other')),
  details text not null default '' check (char_length(details) <= 1000),
  status text not null default 'open' check (status in ('open','reviewed','actioned','dismissed')),
  created_at timestamptz not null default timezone('utc'::text, now()), resolved_at timestamptz,
  check ((thread_id is not null)::integer + (post_id is not null)::integer = 1)
);
create unique index knowplain_forum_reports_reporter_thread_idx on public.knowplain_forum_reports (reporter_id, thread_id) where thread_id is not null;
create unique index knowplain_forum_reports_reporter_post_idx on public.knowplain_forum_reports (reporter_id, post_id) where post_id is not null;
create index knowplain_forum_reports_open_idx on public.knowplain_forum_reports (status, created_at) where status = 'open';
alter table public.knowplain_forum_reports enable row level security;
create policy "Users can submit their own reports" on knowplain_forum_reports for insert to authenticated with check ((select auth.uid()) = reporter_id);
revoke all on table public.knowplain_forum_reports from anon, authenticated;
grant insert on table public.knowplain_forum_reports to authenticated;
grant all on table public.knowplain_forum_reports to service_role;

-- Atomic thread + first-post creation. The caller never supplies author_id.
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
    raise exception 'Thread title must be between 3 and 160 characters' using errcode = '22023';
  end if;
  if char_length(clean_content) < 1 or char_length(clean_content) > 10000 then
    raise exception 'Post content must be between 1 and 10000 characters' using errcode = '22023';
  end if;
  if clean_pillar is not null and clean_pillar not in ('retirement', 'money-psychology', 'decision-tools') then
    raise exception 'Invalid forum pillar' using errcode = '22023';
  end if;
  if (select count(*) from public.knowplain_forum_threads where author_id = caller_id and created_at > now() - interval '1 hour') >= 3 then
    raise exception 'Thread rate limit reached. Try again later.';
  end if;

  insert into public.knowplain_forum_threads (title, pillar, author_id, status)
  values (clean_title, clean_pillar, caller_id, 'pending')
  returning id into new_thread_id;

  insert into public.knowplain_forum_posts (thread_id, content, author_id, status)
  values (new_thread_id, clean_content, caller_id, 'pending');

  return new_thread_id;
end;
$$;

revoke execute on function public.knowplain_create_forum_thread(text, text, text) from public;
revoke execute on function public.knowplain_create_forum_thread(text, text, text) from anon;
grant execute on function public.knowplain_create_forum_thread(text, text, text) to authenticated;

create function public.knowplain_create_forum_post(target_thread_id uuid, post_content text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare caller_id uuid := auth.uid(); created_post_id uuid;
begin
  if caller_id is null then raise exception 'Authentication required'; end if;
  if char_length(btrim(post_content)) not between 1 and 10000 then raise exception 'Post must be between 1 and 10000 characters'; end if;
  if not exists (select 1 from public.knowplain_forum_threads where id = target_thread_id and (status = 'published' or (status = 'pending' and author_id = caller_id))) then raise exception 'Thread is unavailable'; end if;
  if (select count(*) from public.knowplain_forum_posts where author_id = caller_id and created_at > now() - interval '1 hour') >= 10 then raise exception 'Reply rate limit reached. Try again later.'; end if;
  insert into public.knowplain_forum_posts (thread_id, author_id, content, status)
  values (target_thread_id, caller_id, btrim(post_content), 'pending') returning id into created_post_id;
  return created_post_id;
end;
$$;
revoke execute on function public.knowplain_create_forum_post(uuid, text) from public, anon;
grant execute on function public.knowplain_create_forum_post(uuid, text) to authenticated;

-- 8. Leads (email capture from the checkup and checklists)
-- Write-only from the client: anyone may insert, nobody may read back. Lead
-- emails are only readable with the service role. `notes` stores the checkup's
-- generic summary sentence — never the user's balances, income, or debt.
create table public.knowplain_leads (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  source text not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (email, source)
);
alter table public.knowplain_leads enable row level security;
create policy "Anyone can submit a lead." on knowplain_leads for insert with check (true);
create policy "Leads are not publicly readable." on knowplain_leads for select using (false);
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
