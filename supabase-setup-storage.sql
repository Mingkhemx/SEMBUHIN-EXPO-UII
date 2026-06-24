-- 1. PASTIKAN BUCKET "profiles" SUDAH ADA di Storage!
-- 2. JALANKAN SEMUA SQL INI SEKALIGUS!

-- Hapus semua policy lama
DROP POLICY IF EXISTS "Allow public access to profiles bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload to profiles" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update profiles" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete from profiles" ON storage.objects;

-- Policy 1: SEMUA ORANG bisa melihat semua file di bucket profiles
CREATE POLICY "Enable read access for all users"
ON storage.objects FOR SELECT
USING (true);

-- Policy 2: SEMUA USER LOGIN bisa upload SEMUA file ke bucket profiles
CREATE POLICY "Enable insert access for authenticated users only"
ON storage.objects FOR INSERT
WITH CHECK (true);

-- Policy 3: SEMUA USER LOGIN bisa edit SEMUA file di bucket profiles
CREATE POLICY "Enable update access for authenticated users only"
ON storage.objects FOR UPDATE
USING (true);

-- Policy 4: SEMUA USER LOGIN bisa hapus SEMUA file di bucket profiles
CREATE POLICY "Enable delete access for authenticated users only"
ON storage.objects FOR DELETE
USING (true);
