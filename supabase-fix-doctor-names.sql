-- ================================================================
-- FIX DOCTOR NAMES IN PRESCRIPTIONS
-- Ensure doctors table has proper connection to profiles
-- ================================================================

-- 1. CHECK doctors table structure
-- Make sure doctors has user_id that references profiles
alter table public.doctors
  add column if not exists user_id uuid references public.profiles(id) on delete set null;

-- 2. ENSURE doctors and profiles are linked properly
-- If you have doctor registrations with auth users, sync user_id:
-- (This is manual - check your existing data first)

-- 3. GRANT permissions for reading
grant select on public.doctors to authenticated;
grant select on public.profiles to authenticated;

-- 4. Create indexes for faster queries
create index if not exists doctors_user_id_idx on public.doctors(user_id);
create index if not exists profiles_id_idx on public.profiles(id);

-- 5. Refresh schema cache
notify pgrst, 'reload schema';

-- ================================================================
-- DONE
-- ================================================================
-- 
-- MANUAL STEPS NEEDED:
-- 1. Go to Supabase SQL Editor
-- 2. Run this script
-- 3. Check your 'doctors' table to see if user_id is populated
-- 4. If user_id is NULL for all doctors, you need to:
--    - Get doctor user IDs from doctor_registrations or auth.users
--    - Update doctors table: UPDATE doctors SET user_id = ... WHERE id = ...
-- 5. Verify by running:
--    SELECT d.id, d.user_id, p.full_name FROM doctors d 
--    LEFT JOIN profiles p ON d.user_id = p.id;
-- ================================================================
