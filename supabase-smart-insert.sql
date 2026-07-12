-- ─────────────────────────────────────────────────────────────────────────────
-- SMART INSERT - Auto-detect table structure and insert accordingly
-- ─────────────────────────────────────────────────────────────────────────────

-- STEP 1: Check if order_type column exists
-- If not exist, gunakan simple insert tanpa order_type

DO $$
DECLARE
  has_order_type BOOLEAN;
  user_id UUID;
BEGIN
  -- Check column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'payment_orders'
    AND column_name = 'order_type'
  ) INTO has_order_type;

  -- Get first user
  SELECT id INTO user_id FROM auth.users LIMIT 1;

  IF user_id IS NULL THEN
    RAISE EXCEPTION 'No users found in auth.users table';
  END IF;

  -- If order_type exists, use full insert
  IF has_order_type THEN
    INSERT INTO payment_orders (user_id, order_type, amount, payment_status, created_at, paid_at)
    VALUES 
      (user_id, 'premium', 99000, 'paid', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
      (user_id, 'pharmacy', 150000, 'paid', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
      (user_id, 'premium', 299000, 'paid', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
      (user_id, 'pharmacy', 250000, 'paid', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
      (user_id, 'premium', 99000, 'paid', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
      (user_id, 'pharmacy', 500000, 'paid', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
      (user_id, 'premium', 299000, 'paid', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
      (user_id, 'pharmacy', 125000, 'paid', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
      (user_id, 'premium', 99000, 'paid', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
      (user_id, 'pharmacy', 200000, 'paid', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
      (user_id, 'premium', 99000, 'paid', NOW() - INTERVAL '1 days', NOW() - INTERVAL '1 days'),
      (user_id, 'pharmacy', 350000, 'paid', NOW(), NOW());
    RAISE NOTICE 'Inserted 12 rows with order_type';
  ELSE
    -- If order_type DOESN'T exist, insert WITHOUT order_type
    INSERT INTO payment_orders (user_id, amount, payment_status, created_at, paid_at)
    VALUES 
      (user_id, 99000, 'paid', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
      (user_id, 150000, 'paid', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
      (user_id, 299000, 'paid', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
      (user_id, 250000, 'paid', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
      (user_id, 99000, 'paid', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
      (user_id, 500000, 'paid', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
      (user_id, 299000, 'paid', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
      (user_id, 125000, 'paid', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
      (user_id, 99000, 'paid', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
      (user_id, 200000, 'paid', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
      (user_id, 99000, 'paid', NOW() - INTERVAL '1 days', NOW() - INTERVAL '1 days'),
      (user_id, 350000, 'paid', NOW(), NOW());
    RAISE NOTICE 'Inserted 12 rows WITHOUT order_type (column does not exist)';
  END IF;
END $$;

-- STEP 2: Verify insert
SELECT COUNT(*) as total_inserted FROM payment_orders;

-- STEP 3: Check what columns actually exist
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'payment_orders'
ORDER BY ordinal_position;

