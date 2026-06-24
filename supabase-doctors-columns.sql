-- ================================================================
-- SEMBUHIN — Tambah kolom ke tabel doctors
-- CARA PAKAI: Copy seluruh file ini, paste di Supabase Dashboard
--             → SQL Editor → New query → Run.
-- Aman dijalankan berulang kali (IF NOT EXISTS).
-- ================================================================

-- Kolom category: untuk filter spesialisasi di halaman /dokter
alter table public.doctors
  add column if not exists category text;

-- Kolom available: jadwal praktek (contoh: "Senin – Jumat")
alter table public.doctors
  add column if not exists available text;

-- Kolom badge: label di card dokter (contoh: "Terverifikasi", "Top Rated")
alter table public.doctors
  add column if not exists badge text default 'Terverifikasi';

-- Kolom description: bio singkat dokter
alter table public.doctors
  add column if not exists description text;

-- Kolom price: biaya konsultasi dalam Rupiah (integer)
alter table public.doctors
  add column if not exists price integer default 0;

-- Index untuk filter kategori
create index if not exists doctors_category_idx on public.doctors(category);

-- ================================================================
-- SELESAI 🎉
-- Setelah ini, admin bisa mengisi field-field baru saat approve
-- dokter di panel admin.
-- ================================================================
