-- ================================================================
-- FIX PROFILES RLS - Allow doctors to read patient profiles
-- ================================================================

-- Drop existing policies that might be too restrictive
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can view all profiles" on public.profiles;
drop policy if exists "Authenticated users can view profiles" on public.profiles;

-- Create comprehensive read policy for authenticated users
create policy "Authenticated users can read all profiles"
  on public.profiles
  for select
  to authenticated
  using (true);

-- Users can update own profile
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id);

-- Users can insert own profile
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

-- Grant permissions
grant select on public.profiles to authenticated;
grant update on public.profiles to authenticated;
grant insert on public.profiles to authenticated;

-- Refresh schema
notify pgrst, 'reload schema';

-- ================================================================
-- DONE - Profiles now readable by all authenticated users
-- ================================================================
