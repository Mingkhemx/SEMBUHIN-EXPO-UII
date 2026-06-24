-- ================================================================
-- Storage: Bucket doctor-documents (PRIVATE — aman untuk KTP dll)
-- Paste & Run di Supabase SQL Editor
-- ================================================================

-- 1. Buat bucket PRIVATE jika belum ada
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'doctor-documents',
  'doctor-documents',
  false,           -- PRIVATE: tidak bisa diakses via URL publik
  5242880,         -- max 5MB per file
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = false,  -- pastikan tetap private jika bucket sudah ada
  file_size_limit = 5242880;

-- ================================================================
-- 2. RLS Policies
-- ================================================================

-- Siapa saja boleh UPLOAD (calon dokter yang mendaftar)
drop policy if exists "Anyone can upload doctor documents" on storage.objects;
create policy "Anyone can upload doctor documents"
  on storage.objects for insert
  with check (bucket_id = 'doctor-documents');

-- HANYA user yang sudah login (admin) yang bisa BACA/DOWNLOAD
-- Akses via createSignedUrl di kode admin — bukan public URL
drop policy if exists "Authenticated can view doctor documents" on storage.objects;
create policy "Authenticated can view doctor documents"
  on storage.objects for select
  using (
    bucket_id = 'doctor-documents'
    and auth.role() = 'authenticated'
  );

-- Hanya admin (authenticated) yang bisa HAPUS dokumen
drop policy if exists "Authenticated can delete doctor documents" on storage.objects;
create policy "Authenticated can delete doctor documents"
  on storage.objects for delete
  using (
    bucket_id = 'doctor-documents'
    and auth.role() = 'authenticated'
  );

-- ================================================================
-- 3. Tambahkan kolom path dokumen di tabel doctor_registrations
--    (simpan path storage, bukan public URL)
-- ================================================================

alter table public.doctor_registrations
  add column if not exists ktp_path     text,
  add column if not exists str_path     text,
  add column if not exists sip_path     text,
  add column if not exists diploma_path text,
  add column if not exists cv_path      text;

-- Kolom lama (kalau ada) tidak dihapus agar tidak merusak data existing
-- Kolom baru *_path digunakan untuk signed URL

-- ================================================================
-- SELESAI
-- ================================================================
