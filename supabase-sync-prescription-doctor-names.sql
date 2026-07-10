-- ================================================================
-- SYNC DOCTOR NAMES DIRECTLY INTO PRESCRIPTIONS TABLE
-- Solution: Store doctor name + specialty in prescription saat dibuat
-- ================================================================

-- 1. ADD doctor_name + doctor_specialty columns to prescriptions
alter table public.prescriptions
  add column if not exists doctor_name text,
  add column if not exists doctor_specialty text;

-- 2. UPDATE existing prescriptions dengan doctor info
-- This will get doctor name dari doctors -> user_id -> profiles
update public.prescriptions p
set 
  doctor_name = coalesce(pr.full_name, 'Dokter Anda'),
  doctor_specialty = 'Umum'
from public.doctors d
left join public.profiles pr on d.user_id = pr.id
where p.doctor_id = d.id
  and p.doctor_name is null;

-- 3. Verify hasil update
select id, doctor_id, doctor_name, doctor_specialty 
from public.prescriptions 
limit 10;

-- ================================================================
-- AFTER THIS:
-- - Prescription table now has doctor_name + doctor_specialty stored
-- - Frontend can read directly without need for joins
-- - Doctor info akan auto-populate saat dokter membuat resep
-- ================================================================
