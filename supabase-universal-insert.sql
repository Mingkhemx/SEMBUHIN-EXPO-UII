-- ─────────────────────────────────────────────────────────────────────────────
-- UNIVERSAL INSERT - Works with ANY payment_orders structure
-- ─────────────────────────────────────────────────────────────────────────────

-- First, let's just insert data with ONLY the columns we're 100% sure exist
-- We know: id, user_id exist (from FK constraint seen in error)
-- We'll try: amount, created_at (most common)

-- Get a user first
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found. Cannot insert data.';
  END IF;
  
  -- Try inserting with minimal columns
  -- If this fails, the error will tell us which column is missing
  BEGIN
    INSERT INTO payment_orders (user_id, amount, created_at)
    VALUES (v_user_id, 99000, NOW() - INTERVAL '6 days');
    RAISE NOTICE 'Insert with (user_id, amount, created_at) SUCCESS ✓';
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'Error with (user_id, amount, created_at): %', SQLERRM;
  END;
END $$;

-- Check what was inserted
SELECT * FROM payment_orders ORDER BY created_at DESC LIMIT 1;

