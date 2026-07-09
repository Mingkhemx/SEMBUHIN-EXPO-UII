-- ================================================================
-- FIX PRESCRIPTIONS - COMPLETE SETUP
-- Pastikan schema, RLS, dan data dummy untuk testing
-- ================================================================

-- ── 1. ADD DIAGNOSIS COLUMN IF NOT EXISTS ──────────────────────
alter table public.prescriptions
  add column if not exists diagnosis text;

-- ── 2. FIX RLS POLICIES ────────────────────────────────────────
-- Drop existing policies
drop policy if exists "Doctors can manage own prescriptions" on public.prescriptions;
drop policy if exists "Patients can view own prescriptions" on public.prescriptions;

-- Create comprehensive policies
-- Policy 1: Doctors can insert their own prescriptions
create policy "Doctors can insert prescriptions"
  on public.prescriptions
  for insert
  to authenticated
  with check (
    doctor_id in (
      select id from public.doctors where user_id = auth.uid()
    )
  );

-- Policy 2: Doctors can view their own prescriptions
create policy "Doctors can view own prescriptions"
  on public.prescriptions
  for select
  to authenticated
  using (
    doctor_id in (
      select id from public.doctors where user_id = auth.uid()
    )
  );

-- Policy 3: Doctors can update their own prescriptions
create policy "Doctors can update own prescriptions"
  on public.prescriptions
  for update
  to authenticated
  using (
    doctor_id in (
      select id from public.doctors where user_id = auth.uid()
    )
  );

-- Policy 4: Patients can view their own prescriptions
create policy "Patients can view own prescriptions"
  on public.prescriptions
  for select
  to authenticated
  using (patient_id = auth.uid());

-- ── 3. VERIFY TABLE STRUCTURE ──────────────────────────────────
-- Check columns exist
do $$
begin
  -- Ensure all needed columns exist
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'prescriptions' 
    and column_name = 'diagnosis'
  ) then
    alter table public.prescriptions add column diagnosis text;
  end if;
end $$;

-- ── 4. GRANT PERMISSIONS ───────────────────────────────────────
grant select, insert, update on public.prescriptions to authenticated;

-- ── 5. REFRESH SCHEMA CACHE ────────────────────────────────────
notify pgrst, 'reload schema';

-- ================================================================
-- DONE - Prescriptions table ready
-- ================================================================
