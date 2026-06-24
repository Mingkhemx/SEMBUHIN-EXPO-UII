-- ================================================================
-- Storage: Bucket profiles (PUBLIC — untuk foto profil user)
-- Paste & Run di Supabase SQL Editor
-- ================================================================

-- 1. Buat bucket PUBLIC
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profiles',
  'profiles',
  true,          -- PUBLIC: URL bisa diakses langsung
  2097152,       -- max 2MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 2097152;

-- 2. RLS Policies
drop policy if exists "Anyone can view profile photos" on storage.objects;
create policy "Anyone can view profile photos"
  on storage.objects for select
  using (bucket_id = 'profiles');

drop policy if exists "Users can upload own avatar" on storage.objects;
create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'profiles'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can update own avatar" on storage.objects;
create policy "Users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'profiles'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can delete own avatar" on storage.objects;
create policy "Users can delete own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'profiles'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ================================================================
-- SELESAI
-- ================================================================
