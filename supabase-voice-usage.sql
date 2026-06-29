-- voice_usage table to track daily limits for Voice Mode
create table if not exists public.voice_usage (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    usage_date date not null default current_date,
    count integer default 0,
    unique(user_id, usage_date)
);

-- Enable Row Level Security (RLS)
alter table public.voice_usage enable row level security;

-- Policy: Users can view their own voice usage
create policy "Users can view their own voice usage"
    on public.voice_usage for select
    using (auth.uid() = user_id);

-- Policy: System can manage all usage records (backend bypasses RLS with service role)
create policy "System can manage all usage"
    on public.voice_usage for all
    using (true)
    with check (true);
