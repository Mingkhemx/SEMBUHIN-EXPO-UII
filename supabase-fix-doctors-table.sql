-- ================================================================
-- FIX: Perbaiki tabel doctors agar sesuai dengan kode frontend
-- Paste & Run di Supabase SQL Editor
-- ================================================================

-- Tambah semua kolom yang mungkin kurang
alter table public.doctors
  add column if not exists registration_id  uuid,
  add column if not exists name             text,
  add column if not exists email            text,
  add column if not exists phone            text,
  add column if not exists specialty        text,
  add column if not exists license_number   text,
  add column if not exists hospital         text,
  add column if not exists experience_years text,
  add column if not exists avatar_url       text,
  add column if not exists rating           numeric(3,2) default 0,
  add column if not exists total_patients   integer default 0,
  add column if not exists is_active        boolean default true,
  add column if not exists joined_at        timestamptz default now();

-- Pastikan RLS aktif
alter table public.doctors enable row level security;

-- Drop & recreate policies agar bersih
drop policy if exists "Anyone can view active doctors"   on public.doctors;
drop policy if exists "Authenticated can manage doctors" on public.doctors;
drop policy if exists "Users can view their own doctor record" on public.doctors;
drop policy if exists "Users can insert their own doctor record" on public.doctors;

create policy "Anyone can view active doctors"
  on public.doctors for select
  using (is_active = true);

create policy "Users can view their own doctor record"
  on public.doctors for select
  using (auth.uid() = user_id);

create policy "Users can insert their own doctor record"
  on public.doctors for insert
  with check (auth.uid() = user_id);

create policy "Authenticated can manage doctors"
  on public.doctors for all
  using (auth.role() = 'authenticated');

-- ================================================================
-- SELESAI
-- ================================================================
