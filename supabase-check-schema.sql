-- ─────────────────────────────────────────────────────────────────────────────
-- CHECK EXISTING SCHEMA
-- Jalankan ini untuk lihat struktur payment_orders yang sebenarnya ada
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Check if payment_orders table exists
SELECT 'payment_orders' as table_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'payment_orders'
  ) THEN 'EXISTS' ELSE 'NOT FOUND' END as status;

-- 2. Get ALL columns in payment_orders
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'payment_orders'
ORDER BY ordinal_position;

-- 3. Get table constraints
SELECT 
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public' AND table_name = 'payment_orders';

-- 4. Check existing data
SELECT COUNT(*) as total_rows FROM payment_orders;

-- 5. Show sample row
SELECT * FROM payment_orders LIMIT 1;

