alter table public.knowplain_forum_threads
  add column if not exists status text not null default 'pending'
    check (status in ('pending', 'published', 'hidden', 'locked')),
  add column if not exists moderated_at timestamptz,
  add column if not exists moderation_note text
    check (moderation_note is null or char_length(moderation_note) <= 500);

alter table public.knowplain_forum_posts
  add column if not exists status text not null default 'pending'
    check (status in ('pending', 'published', 'hidden')),
  add column if not exists moderated_at timestamptz,
  add column if not exists moderation_note text
    check (moderation_note is null or char_length(moderation_note) <= 500);

-- Preserve the visibility of rows created before moderation existed.
update public.knowplain_forum_threads set status = 'published' where status = 'pending';
update public.knowplain_forum_posts set status = 'published' where status = 'pending';

drop policy if exists "Threads are publicly readable" on public.knowplain_forum_threads;
create policy "Published threads and own submissions are readable"
  on public.knowplain_forum_threads for select
  to anon, authenticated
  using (
    status in ('published', 'locked')
    or (select auth.uid()) = author_id
  );

drop policy if exists "Posts are publicly readable" on public.knowplain_forum_posts;
create policy "Published posts and own submissions are readable"
  on public.knowplain_forum_posts for select
  to anon, authenticated
  using (
    status = 'published'
    or (select auth.uid()) = author_id
  );

create table public.knowplain_forum_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  thread_id uuid references public.knowplain_forum_threads(id) on delete cascade,
  post_id uuid references public.knowplain_forum_posts(id) on delete cascade,
  reason text not null check (reason in ('spam', 'harassment', 'dangerous-advice', 'privacy', 'other')),
  details text not null default '' check (char_length(details) <= 1000),
  status text not null default 'open' check (status in ('open', 'reviewed', 'actioned', 'dismissed')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  resolved_at timestamptz,
  check ((thread_id is not null)::integer + (post_id is not null)::integer = 1)
);

create unique index knowplain_forum_reports_reporter_thread_idx
  on public.knowplain_forum_reports (reporter_id, thread_id)
  where thread_id is not null;
create unique index knowplain_forum_reports_reporter_post_idx
  on public.knowplain_forum_reports (reporter_id, post_id)
  where post_id is not null;
create index knowplain_forum_reports_open_idx
  on public.knowplain_forum_reports (status, created_at)
  where status = 'open';

alter table public.knowplain_forum_reports enable row level security;
create policy "Users can submit their own reports"
  on public.knowplain_forum_reports for insert
  to authenticated
  with check ((select auth.uid()) = reporter_id);

revoke all on table public.knowplain_forum_reports from anon, authenticated;
grant insert on table public.knowplain_forum_reports to authenticated;
grant all on table public.knowplain_forum_reports to service_role;

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
  created_thread_id uuid;
begin
  if caller_id is null then raise exception 'Authentication required'; end if;
  if char_length(btrim(thread_title)) not between 3 and 160 then raise exception 'Title must be between 3 and 160 characters'; end if;
  if char_length(btrim(thread_content)) not between 1 and 10000 then raise exception 'Post must be between 1 and 10000 characters'; end if;
  if thread_pillar is not null and thread_pillar not in ('retirement', 'money-psychology', 'decision-tools') then raise exception 'Invalid pillar'; end if;
  if (
    select count(*) from public.knowplain_forum_threads
    where author_id = caller_id and created_at > now() - interval '1 hour'
  ) >= 3 then
    raise exception 'Thread rate limit reached. Try again later.';
  end if;

  insert into public.knowplain_forum_threads (title, author_id, pillar, status)
  values (btrim(thread_title), caller_id, nullif(thread_pillar, ''), 'pending')
  returning id into created_thread_id;
  insert into public.knowplain_forum_posts (thread_id, author_id, content, status)
  values (created_thread_id, caller_id, btrim(thread_content), 'pending');
  return created_thread_id;
end;
$$;

create or replace function public.knowplain_create_forum_post(
  target_thread_id uuid,
  post_content text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  created_post_id uuid;
begin
  if caller_id is null then raise exception 'Authentication required'; end if;
  if char_length(btrim(post_content)) not between 1 and 10000 then raise exception 'Post must be between 1 and 10000 characters'; end if;
  if not exists (
    select 1 from public.knowplain_forum_threads
    where id = target_thread_id
      and (status = 'published' or (status = 'pending' and author_id = caller_id))
  ) then raise exception 'Thread is unavailable'; end if;
  if exists (
    select 1 from public.knowplain_forum_threads
    where id = target_thread_id and status = 'locked'
  ) then raise exception 'Thread is locked'; end if;
  if (
    select count(*) from public.knowplain_forum_posts
    where author_id = caller_id and created_at > now() - interval '1 hour'
  ) >= 10 then
    raise exception 'Reply rate limit reached. Try again later.';
  end if;

  insert into public.knowplain_forum_posts (thread_id, author_id, content, status)
  values (target_thread_id, caller_id, btrim(post_content), 'pending')
  returning id into created_post_id;
  return created_post_id;
end;
$$;

revoke execute on function public.knowplain_create_forum_thread(text, text, text) from public, anon;
grant execute on function public.knowplain_create_forum_thread(text, text, text) to authenticated;
revoke execute on function public.knowplain_create_forum_post(uuid, text) from public, anon;
grant execute on function public.knowplain_create_forum_post(uuid, text) to authenticated;
