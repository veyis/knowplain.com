-- 1. Profiles Table (syncs with auth.users)
create table public.knowplain_profiles (
  id uuid references auth.users not null primary key,
  display_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.knowplain_profiles enable row level security;
create policy "Public profiles are viewable by everyone." on knowplain_profiles for select using (true);
create policy "Users can insert their own profile." on knowplain_profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on knowplain_profiles for update using (auth.uid() = id);

-- Function and trigger to auto-create profile on signup
create or replace function public.knowplain_handle_new_user()
returns trigger as $$
begin
  insert into public.knowplain_profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists knowplain_on_auth_user_created on auth.users;
create trigger knowplain_on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.knowplain_handle_new_user();

-- 2. Forum Threads
create table public.knowplain_forum_threads (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  author_id uuid references public.knowplain_profiles(id) not null,
  pillar text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.knowplain_forum_threads enable row level security;
create policy "Threads are viewable by everyone." on knowplain_forum_threads for select using (true);
create policy "Authenticated users can create threads." on knowplain_forum_threads for insert with check (auth.role() = 'authenticated');

-- 3. Forum Posts
create table public.knowplain_forum_posts (
  id uuid default gen_random_uuid() primary key,
  thread_id uuid references public.knowplain_forum_threads(id) on delete cascade not null,
  author_id uuid references public.knowplain_profiles(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.knowplain_forum_posts enable row level security;
create policy "Posts are viewable by everyone." on knowplain_forum_posts for select using (true);
create policy "Authenticated users can create posts." on knowplain_forum_posts for insert with check (auth.role() = 'authenticated');

-- 4. Search Index (Sync target for MDX content)
create table public.knowplain_search_index (
  id text primary key,
  type text not null,
  title text not null,
  href text not null,
  snippet text,
  pillar text,
  fts tsvector generated always as (to_tsvector('english', title || ' ' || coalesce(snippet, ''))) stored
);
alter table public.knowplain_search_index enable row level security;
create policy "Search index is viewable by everyone." on knowplain_search_index for select using (true);
create policy "Only service role can manage search index." on knowplain_search_index for all using (false);
