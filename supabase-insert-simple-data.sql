-- ─────────────────────────────────────────────────────────────────────────────
-- SIMPLE TEST DATA INSERT
-- Jalankan ini setelah supabase-fix-payment-orders.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- First, get a valid user_id from auth.users
-- If table is empty, create test data with known UUID

-- Method 1: Insert with ANY existing user (if you have users)
-- Uncomment jika sudah ada users di database

/*
INSERT INTO payment_orders (
  user_id,
  order_type,
  amount,
  payment_status,
  plan_type,
  billing_cycle,
  description,
  created_at,
  paid_at
) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'premium', 99000, 'paid', 'premium_monthly', 'monthly', 'Premium Order 1', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
('550e8400-e29b-41d4-a716-446655440001', 'premium', 299000, 'paid', 'premium_yearly', 'yearly', 'Premium Order 2', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
('550e8400-e29b-41d4-a716-446655440002', 'pharmacy', 150000, 'paid', NULL, NULL, 'Pharmacy Order 1', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
('550e8400-e29b-41d4-a716-446655440003', 'pharmacy', 75000, 'paid', NULL, NULL, 'Pharmacy Order 2', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
('550e8400-e29b-41d4-a716-446655440004', 'premium', 99000, 'paid', 'premium_monthly', 'monthly', 'Premium Order 3', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('550e8400-e29b-41d4-a716-446655440005', 'pharmacy', 250000, 'paid', NULL, NULL, 'Pharmacy Order 3', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('550e8400-e29b-41d4-a716-446655440006', 'pharmacy', 100000, 'paid', NULL, NULL, 'Pharmacy Order 4', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('550e8400-e29b-41d4-a716-446655440007', 'premium', 299000, 'paid', 'premium_yearly', 'yearly', 'Premium Order 4', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
('550e8400-e29b-41d4-a716-446655440008', 'premium', 99000, 'paid', 'premium_monthly', 'monthly', 'Premium Order 5', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
('550e8400-e29b-41d4-a716-446655440009', 'premium', 99000, 'paid', 'premium_monthly', 'monthly', 'Premium Order 6', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
('550e8400-e29b-41d4-a716-446655440010', 'pharmacy', 500000, 'paid', NULL, NULL, 'Pharmacy Order 5', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
('550e8400-e29b-41d4-a716-446655440011', 'pharmacy', 180000, 'paid', NULL, NULL, 'Pharmacy Order 6', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
('550e8400-e29b-41d4-a716-446655440012', 'premium', 99000, 'paid', 'premium_monthly', 'monthly', 'Premium Order 7', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('550e8400-e29b-41d4-a716-446655440013', 'pharmacy', 125000, 'paid', NULL, NULL, 'Pharmacy Order 7', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('550e8400-e29b-41d4-a716-446655440014', 'premium', 299000, 'paid', 'premium_yearly', 'yearly', 'Premium Order 8', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440015', 'premium', 99000, 'paid', 'premium_monthly', 'monthly', 'Premium Order 9', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440016', 'premium', 99000, 'paid', 'premium_monthly', 'monthly', 'Premium Order 10', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440017', 'pharmacy', 200000, 'paid', NULL, NULL, 'Pharmacy Order 8', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440018', 'premium', 99000, 'paid', 'premium_monthly', 'monthly', 'Premium Order 11', NOW() - INTERVAL '1 days', NOW() - INTERVAL '1 days'),
('550e8400-e29b-41d4-a716-446655440019', 'pharmacy', 95000, 'paid', NULL, NULL, 'Pharmacy Order 9', NOW() - INTERVAL '1 days', NOW() - INTERVAL '1 days'),
('550e8400-e29b-41d4-a716-446655440020', 'premium', 299000, 'paid', 'premium_yearly', 'yearly', 'Premium Order 12', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440021', 'premium', 99000, 'paid', 'premium_monthly', 'monthly', 'Premium Order 13', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440022', 'pharmacy', 350000, 'paid', NULL, NULL, 'Pharmacy Order 10', NOW(), NOW());

*/

-- Method 2: Get FIRST user from auth.users (RECOMMENDED - Gunakan ini!)
-- Ini adalah yang paling aman karena pakai user yang sudah ada

INSERT INTO payment_orders (
  user_id,
  order_type,
  amount,
  payment_status,
  plan_type,
  billing_cycle,
  description,
  created_at,
  paid_at
) 
SELECT 
  (SELECT id FROM auth.users LIMIT 1) as user_id,
  'premium'::VARCHAR,
  99000::DECIMAL,
  'paid'::VARCHAR,
  'premium_monthly'::VARCHAR,
  'monthly'::VARCHAR,
  'Premium Order 1'::TEXT,
  (NOW() - INTERVAL '6 days')::TIMESTAMP WITH TIME ZONE,
  (NOW() - INTERVAL '6 days')::TIMESTAMP WITH TIME ZONE
WHERE (SELECT COUNT(*) FROM auth.users) > 0

UNION ALL

SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'premium',
  299000,
  'paid',
  'premium_yearly',
  'yearly',
  'Premium Order 2',
  (NOW() - INTERVAL '6 days')::TIMESTAMP WITH TIME ZONE,
  (NOW() - INTERVAL '6 days')::TIMESTAMP WITH TIME ZONE
WHERE (SELECT COUNT(*) FROM auth.users) > 0

UNION ALL

SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'pharmacy',
  150000,
  'paid',
  NULL,
  NULL,
  'Pharmacy Order 1',
  (NOW() - INTERVAL '6 days')::TIMESTAMP WITH TIME ZONE,
  (NOW() - INTERVAL '6 days')::TIMESTAMP WITH TIME ZONE
WHERE (SELECT COUNT(*) FROM auth.users) > 0

UNION ALL

SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'pharmacy',
  75000,
  'paid',
  NULL,
  NULL,
  'Pharmacy Order 2',
  (NOW() - INTERVAL '6 days')::TIMESTAMP WITH TIME ZONE,
  (NOW() - INTERVAL '6 days')::TIMESTAMP WITH TIME ZONE
WHERE (SELECT COUNT(*) FROM auth.users) > 0

UNION ALL

SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'premium',
  99000,
  'paid',
  'premium_monthly',
  'monthly',
  'Premium Order 3',
  (NOW() - INTERVAL '5 days')::TIMESTAMP WITH TIME ZONE,
  (NOW() - INTERVAL '5 days')::TIMESTAMP WITH TIME ZONE
WHERE (SELECT COUNT(*) FROM auth.users) > 0

UNION ALL

SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'pharmacy',
  250000,
  'paid',
  NULL,
  NULL,
  'Pharmacy Order 3',
  (NOW() - INTERVAL '5 days')::TIMESTAMP WITH TIME ZONE,
  (NOW() - INTERVAL '5 days')::TIMESTAMP WITH TIME ZONE
WHERE (SELECT COUNT(*) FROM auth.users) > 0

UNION ALL

SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'pharmacy',
  100000,
  'paid',
  NULL,
  NULL,
  'Pharmacy Order 4',
  (NOW() - INTERVAL '5 days')::TIMESTAMP WITH TIME ZONE,
  (NOW() - INTERVAL '5 days')::TIMESTAMP WITH TIME ZONE
WHERE (SELECT COUNT(*) FROM auth.users) > 0

UNION ALL

SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'premium',
  299000,
  'paid',
  'premium_yearly',
  'yearly',
  'Premium Order 4',
  (NOW() - INTERVAL '4 days')::TIMESTAMP WITH TIME ZONE,
  (NOW() - INTERVAL '4 days')::TIMESTAMP WITH TIME ZONE
WHERE (SELECT COUNT(*) FROM auth.users) > 0

UNION ALL

SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'premium',
  99000,
  'paid',
  'premium_monthly',
  'monthly',
  'Premium Order 5',
  (NOW() - INTERVAL '4 days')::TIMESTAMP WITH TIME ZONE,
  (NOW() - INTERVAL '4 days')::TIMESTAMP WITH TIME ZONE
WHERE (SELECT COUNT(*) FROM auth.users) > 0

UNION ALL

SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'pharmacy',
  500000,
  'paid',
  NULL,
  NULL,
  'Pharmacy Order 5',
  (NOW() - INTERVAL '4 days')::TIMESTAMP WITH TIME ZONE,
  (NOW() - INTERVAL '4 days')::TIMESTAMP WITH TIME ZONE
WHERE (SELECT COUNT(*) FROM auth.users) > 0

UNION ALL

SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'premium',
  99000,
  'paid',
  'premium_monthly',
  'monthly',
  'Premium Order 6',
  (NOW() - INTERVAL '3 days')::TIMESTAMP WITH TIME ZONE,
  (NOW() - INTERVAL '3 days')::TIMESTAMP WITH TIME ZONE
WHERE (SELECT COUNT(*) FROM auth.users) > 0

UNION ALL

SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'pharmacy',
  350000,
  'paid',
  NULL,
  NULL,
  'Pharmacy Order 6',
  (NOW() - INTERVAL '2 days')::TIMESTAMP WITH TIME ZONE,
  (NOW() - INTERVAL '2 days')::TIMESTAMP WITH TIME ZONE
WHERE (SELECT COUNT(*) FROM auth.users) > 0

UNION ALL

SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'premium',
  99000,
  'paid',
  'premium_monthly',
  'monthly',
  'Premium Order 7',
  NOW()::TIMESTAMP WITH TIME ZONE,
  NOW()::TIMESTAMP WITH TIME ZONE
WHERE (SELECT COUNT(*) FROM auth.users) > 0;

-- ─── Verify Insert ───
SELECT COUNT(*) as total_orders FROM payment_orders WHERE payment_status = 'paid';

SELECT 
  order_type,
  COUNT(*) as count,
  SUM(amount) as total
FROM payment_orders
WHERE payment_status = 'paid'
GROUP BY order_type;

SELECT 'Setup complete! ✅' as status;

