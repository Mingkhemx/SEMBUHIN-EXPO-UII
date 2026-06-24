-- ================================================================
-- Tabel: community_posts & community_post_likes
-- ================================================================

create table if not exists public.community_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  author_name text not null,
  author_avatar text,
  author_role text default 'patient',
  category text not null,
  title text not null,
  content text not null,
  likes_count integer default 0,
  comments_count integer default 0,
  views_count integer default 0,
  ai_verified boolean default false,
  doctor_reply boolean default false,
  created_at timestamptz default now() not null
);

create table if not exists public.community_post_likes (
  post_id uuid references public.community_posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  primary key (post_id, user_id)
);

create table if not exists public.community_post_saves (
  post_id uuid references public.community_posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  primary key (post_id, user_id)
);

-- ================================================================
-- Indexes
-- ================================================================
create index if not exists community_posts_created_at_idx on public.community_posts(created_at desc);
create index if not exists community_posts_category_idx on public.community_posts(category);

-- ================================================================
-- RLS
-- ================================================================
alter table public.community_posts enable row level security;
alter table public.community_post_likes enable row level security;
alter table public.community_post_saves enable row level security;

-- Posts
drop policy if exists "Anyone can read posts" on public.community_posts;
create policy "Anyone can read posts" on public.community_posts for select using (true);

drop policy if exists "Users can insert posts" on public.community_posts;
create policy "Users can insert posts" on public.community_posts for insert with check (auth.uid() = user_id);

drop policy if exists "Anyone can update post stats" on public.community_posts;
create policy "Anyone can update post stats" on public.community_posts for update using (true);

-- Likes
drop policy if exists "Anyone can read likes" on public.community_post_likes;
create policy "Anyone can read likes" on public.community_post_likes for select using (true);

drop policy if exists "Users can insert likes" on public.community_post_likes;
create policy "Users can insert likes" on public.community_post_likes for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own likes" on public.community_post_likes;
create policy "Users can delete own likes" on public.community_post_likes for delete using (auth.uid() = user_id);

-- Saves
drop policy if exists "Users can read own saves" on public.community_post_saves;
create policy "Users can read own saves" on public.community_post_saves for select using (auth.uid() = user_id);

drop policy if exists "Users can insert saves" on public.community_post_saves;
create policy "Users can insert saves" on public.community_post_saves for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own saves" on public.community_post_saves;
create policy "Users can delete own saves" on public.community_post_saves for delete using (auth.uid() = user_id);

-- Comments
create table if not exists public.community_post_comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.community_posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  author_name text not null,
  author_avatar text,
  author_role text default 'patient',
  content text not null,
  created_at timestamptz default now() not null
);

alter table public.community_post_comments enable row level security;

drop policy if exists "Anyone can read comments" on public.community_post_comments;
create policy "Anyone can read comments" on public.community_post_comments for select using (true);

drop policy if exists "Users can insert comments" on public.community_post_comments;
create policy "Users can insert comments" on public.community_post_comments for insert with check (auth.uid() = user_id);

-- ================================================================
-- SELESAI — Paste & Run di Supabase SQL Editor
-- ================================================================
