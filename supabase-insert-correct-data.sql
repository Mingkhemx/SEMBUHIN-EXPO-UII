-- ─────────────────────────────────────────────────────────────────────────────
-- INSERT DATA - Sesuai struktur payment_orders yang sebenarnya
-- Kolom: id, order_id, user_id, amount, status, created_at, updated_at
-- ─────────────────────────────────────────────────────────────────────────────

-- Get a user first
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found in auth.users';
  END IF;
  
  -- Insert 10 test orders sesuai struktur yang ada
  INSERT INTO payment_orders (order_id, user_id, amount, status, created_at, updated_at)
  VALUES
    ('ORDER-001', v_user_id, 99000, 'completed', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
    ('ORDER-002', v_user_id, 150000, 'completed', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
    ('ORDER-003', v_user_id, 299000, 'completed', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
    ('ORDER-004', v_user_id, 250000, 'completed', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
    ('ORDER-005', v_user_id, 99000, 'completed', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
    ('ORDER-006', v_user_id, 500000, 'completed', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
    ('ORDER-007', v_user_id, 299000, 'completed', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
    ('ORDER-008', v_user_id, 125000, 'completed', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
    ('ORDER-009', v_user_id, 99000, 'completed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    ('ORDER-010', v_user_id, 200000, 'completed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    ('ORDER-011', v_user_id, 99000, 'completed', NOW() - INTERVAL '1 days', NOW() - INTERVAL '1 days'),
    ('ORDER-012', v_user_id, 350000, 'completed', NOW(), NOW());
  
  RAISE NOTICE 'Inserted 12 orders successfully ✓';
END $$;

-- Verify insert
SELECT COUNT(*) as total_orders FROM payment_orders;
SELECT SUM(amount) as total_revenue FROM payment_orders;
SELECT * FROM payment_orders ORDER BY created_at DESC LIMIT 5;

