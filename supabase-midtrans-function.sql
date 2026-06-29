-- ================================================================
-- Cara deploy Midtrans via Supabase Edge Function
-- Jalankan perintah ini di terminal (bukan SQL Editor)
-- ================================================================

-- 1. Install Supabase CLI jika belum ada:
--    npm install -g supabase

-- 2. Login ke Supabase:
--    supabase login

-- 3. Link project:
--    supabase link --project-ref ialaexpnnhjtkfkooqgm

-- 4. Buat edge function:
--    supabase functions new midtrans-token

-- 5. Isi file supabase/functions/midtrans-token/index.ts dengan kode di bawah

-- 6. Set secret:
--    supabase secrets set MIDTRANS_SERVER_KEY=YOUR_MIDTRANS_SERVER_KEY
--    supabase secrets set MIDTRANS_ENV=sandbox

-- 7. Deploy:
--    supabase functions deploy midtrans-token

-- ================================================================
-- ISI FILE: supabase/functions/midtrans-token/index.ts
-- ================================================================
-- (Lihat file supabase/functions/midtrans-token/index.ts yang dibuat otomatis)
