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
create policy "Users can view their own saved simulations." on knowplain_saved_simulations for select using (auth.uid() = user_id);
create policy "Users can insert their own saved simulations." on knowplain_saved_simulations for insert with check (auth.uid() = user_id);
create policy "Users can update their own saved simulations." on knowplain_saved_simulations for update using (auth.uid() = user_id);
create policy "Users can delete their own saved simulations." on knowplain_saved_simulations for delete using (auth.uid() = user_id);
-- 7. Forum Likes
create table public.knowplain_forum_likes (
  user_id uuid references auth.users not null,
  thread_id uuid references public.knowplain_forum_threads(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, thread_id)
);
alter table public.knowplain_forum_likes enable row level security;
create policy "Likes are viewable by everyone." on knowplain_forum_likes for select using (true);
create policy "Users can insert their own likes." on knowplain_forum_likes for insert with check (auth.uid() = user_id);
create policy "Users can delete their own likes." on knowplain_forum_likes for delete using (auth.uid() = user_id);

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
