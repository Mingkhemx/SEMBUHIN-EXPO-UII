-- ================================================================
-- SEMBUHIN — Tambah kolom user_id untuk linking dokter ↔ auth user
-- CARA PAKAI: Copy seluruh file ini, paste di Supabase Dashboard
--             → SQL Editor → New query → Run.
-- Aman dijalankan berulang kali (IF NOT EXISTS).
-- ================================================================

-- 1. Tambah user_id di tabel doctor_registrations
--    Diisi otomatis saat dokter mendaftar (jika sedang login)
alter table public.doctor_registrations
  add column if not exists user_id uuid references auth.users(id);

-- 2. Tambah user_id di tabel doctors
--    Diisi saat admin approve (di-copy dari doctor_registrations.user_id)
alter table public.doctors
  add column if not exists user_id uuid references auth.users(id);

-- 3. Index agar query by user_id cepat
create index if not exists doctor_registrations_user_id_idx
  on public.doctor_registrations(user_id);

create index if not exists doctors_user_id_idx
  on public.doctors(user_id);

-- 4. Unique constraint: satu user = satu dokter (opsional, hindari duplikasi)
--    Uncomment jika ingin enforce satu akun = satu dokter:
-- alter table public.doctors
--   add constraint doctors_user_id_unique unique (user_id);

-- ================================================================
-- SELESAI 🎉
-- Setelah ini:
--   • Pendaftaran dokter menyimpan user_id jika user sedang login
--   • Admin approve menyalin user_id ke tabel doctors
--   • User yang sudah diverifikasi mendapat role "doctor" di metadata
--   • Dokter bisa login ke /doctor panel dengan akun mereka
-- ================================================================
