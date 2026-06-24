-- ================================================================
-- Tambah kolom user_id ke tabel doctors (jika belum ada)
-- Ini menghubungkan record dokter ke akun auth user
-- ================================================================

alter table public.doctors
  add column if not exists user_id uuid references auth.users(id);

-- Index untuk lookup cepat
create index if not exists doctors_user_id_idx on public.doctors(user_id);

-- ================================================================
-- Update RLS: dokter bisa update record-nya sendiri
-- ================================================================

drop policy if exists "Doctors can update own record" on public.doctors;
create policy "Doctors can update own record"
  on public.doctors for update
  using (auth.uid() = user_id);

-- ================================================================
-- MANUAL: Update user_id untuk dokter yang sudah ada
-- Jalankan ini untuk menghubungkan record dokter ke akun user
-- berdasarkan kecocokan email
-- ================================================================

update public.doctors d
set user_id = u.id
from auth.users u
where d.email = u.email
  and d.user_id is null;

-- ================================================================
-- SELESAI
-- Setelah ini, saat user dokter upload foto di halaman profil,
-- avatar_url di tabel doctors akan otomatis diupdate via kode frontend.
-- ================================================================
