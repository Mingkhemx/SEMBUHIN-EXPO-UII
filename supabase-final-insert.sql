-- ─────────────────────────────────────────────────────────────────────────────
-- FINAL INSERT - Status yang benar: 'paid'
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found';
  END IF;
  
  -- Insert 12 orders dengan status 'paid'
  INSERT INTO payment_orders (order_id, user_id, amount, status, created_at, updated_at)
  VALUES
    ('ORD-20260707-001', v_user_id, 99000, 'paid', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
    ('ORD-20260707-002', v_user_id, 150000, 'paid', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
    ('ORD-20260707-003', v_user_id, 299000, 'paid', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
    ('ORD-20260707-004', v_user_id, 250000, 'paid', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
    ('ORD-20260707-005', v_user_id, 99000, 'paid', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
    ('ORD-20260707-006', v_user_id, 500000, 'paid', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
    ('ORD-20260707-007', v_user_id, 299000, 'paid', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
    ('ORD-20260707-008', v_user_id, 125000, 'paid', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
    ('ORD-20260707-009', v_user_id, 99000, 'paid', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    ('ORD-20260707-010', v_user_id, 200000, 'paid', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    ('ORD-20260707-011', v_user_id, 99000, 'paid', NOW() - INTERVAL '1 days', NOW() - INTERVAL '1 days'),
    ('ORD-20260707-012', v_user_id, 350000, 'paid', NOW(), NOW());
  
  RAISE NOTICE 'Inserted 12 orders successfully ✓';
END $$;

-- Verify
SELECT COUNT(*) as total_orders, SUM(amount) as total_revenue FROM payment_orders WHERE status = 'paid';
SELECT * FROM payment_orders WHERE status = 'paid' ORDER BY created_at DESC LIMIT 10;

