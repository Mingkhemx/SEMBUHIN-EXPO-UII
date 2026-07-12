-- ─────────────────────────────────────────────────────────────────────────────
-- ULTRA SIMPLE - Just show what exists
-- ─────────────────────────────────────────────────────────────────────────────

-- STEP 1: Check if payment_orders table exists
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payment_orders';

-- STEP 2: Show ACTUAL columns in payment_orders
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'payment_orders'
ORDER BY ordinal_position;

-- STEP 3: Show sample data (first 5 rows)
SELECT * FROM payment_orders LIMIT 5;

-- STEP 4: Count rows
SELECT COUNT(*) as total_rows FROM payment_orders;

