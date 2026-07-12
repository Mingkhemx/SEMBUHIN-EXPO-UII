-- ─────────────────────────────────────────────────────────────────────────────
-- INSERT TEST DATA untuk Real-time Analytics Dashboard
-- Jalankan script ini di Supabase SQL Editor untuk generate data
-- ─────────────────────────────────────────────────────────────────────────────

-- STEP 1: Pastikan ada users terlebih dahulu
-- (Ambil dari auth.users yang sudah ada)

-- STEP 2: Insert test payment orders (last 7 days)

INSERT INTO payment_orders (
  user_id,
  order_type,
  amount,
  payment_status,
  payment_method,
  plan_type,
  billing_cycle,
  description,
  created_at,
  updated_at,
  paid_at
) VALUES
-- Day 1: Multiple premium orders
(
  (SELECT id FROM auth.users WHERE role = 'user' LIMIT 1),
  'premium',
  99000,
  'paid',
  'midtrans',
  'premium_monthly',
  'monthly',
  'Premium Membership - Monthly',
  NOW() - INTERVAL '6 days',
  NOW() - INTERVAL '6 days',
  NOW() - INTERVAL '6 days'
),
(
  (SELECT id FROM auth.users WHERE role = 'user' LIMIT 1 OFFSET 1),
  'premium',
  299000,
  'paid',
  'midtrans',
  'premium_yearly',
  'yearly',
  'Premium Membership - Yearly',
  NOW() - INTERVAL '6 days' + INTERVAL '2 hours',
  NOW() - INTERVAL '6 days' + INTERVAL '2 hours',
  NOW() - INTERVAL '6 days' + INTERVAL '2 hours'
),
-- Day 1: Pharmacy orders
(
  (SELECT id FROM auth.users WHERE role = 'user' LIMIT 1 OFFSET 2),
  'pharmacy',
  150000,
  'paid',
  'midtrans',
  NULL,
  NULL,
  'Pharmacy Order - Obat-obatan',
  NOW() - INTERVAL '6 days' + INTERVAL '4 hours',
  NOW() - INTERVAL '6 days' + INTERVAL '4 hours',
  NOW() - INTERVAL '6 days' + INTERVAL '4 hours'
),
(
  (SELECT id FROM auth.users WHERE role = 'user' LIMIT 1 OFFSET 3),
  'pharmacy',
  75000,
  'paid',
  'midtrans',
  NULL,
  NULL,
  'Pharmacy Order - Vitamin',
  NOW() - INTERVAL '6 days' + INTERVAL '5 hours',
  NOW() - INTERVAL '6 days' + INTERVAL '5 hours',
  NOW() - INTERVAL '6 days' + INTERVAL '5 hours'
),

-- Day 2: Mix of orders
(
  (SELECT id FROM auth.users WHERE role = 'user' LIMIT 1 OFFSET 4),
  'premium',
  99000,
  'paid',
  'midtrans',
  'premium_monthly',
  'monthly',
  'Premium Membership - Monthly',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
),
(
  (SELECT id FROM auth.users WHERE role = 'user' LIMIT 1 OFFSET 5),
  'pharmacy',
  250000,
  'paid',
  'midtrans',
  NULL,
  NULL,
  'Pharmacy Order - Resep Dokter',
  NOW() - INTERVAL '5 days' + INTERVAL '3 hours',
  NOW() - INTERVAL '5 days' + INTERVAL '3 hours',
  NOW() - INTERVAL '5 days' + INTERVAL '3 hours'
),
(
  (SELECT id FROM auth.users WHERE role = 'user' LIMIT 1 OFFSET 6),
  'pharmacy',
  100000,
  'paid',
  'midtrans',
  NULL,
  NULL,
  'Pharmacy Order - General',
  NOW() - INTERVAL '5 days' + INTERVAL '6 hours',
  NOW() - INTERVAL '5 days' + INTERVAL '6 hours',
  NOW() - INTERVAL '5 days' + INTERVAL '6 hours'
),

-- Day 3: Heavy sales day
(
  (SELECT id FROM auth.users WHERE role = 'user' LIMIT 1 OFFSET 7),
  'premium',
  299000,
  'paid',
  'midtrans',
  'premium_yearly',
  'yearly',
  'Premium Membership - Yearly',
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '4 days'
),
(
  (SELECT id FROM auth.users WHERE role = 'user' LIMIT 1 OFFSET 8),
  'premium',
  99000,
  'paid',
  'midtrans',
  'premium_monthly',
  'monthly',
  'Premium Membership - Monthly',
  NOW() - INTERVAL '4 days' + INTERVAL '1 hours',
  NOW() - INTERVAL '4 days' + INTERVAL '1 hours',
  NOW() - INTERVAL '4 days' + INTERVAL '1 hours'
),
(
  (SELECT id FROM auth.users WHERE role = 'user' LIMIT 1 OFFSET 9),
  'premium',
  99000,
  'paid',
  'midtrans',
  'premium_monthly',
  'monthly',
  'Premium Membership - Monthly',
  NOW() - INTERVAL '4 days' + INTERVAL '2 hours',
  NOW() - INTERVAL '4 days' + INTERVAL '2 hours',
  NOW() - INTERVAL '4 days' + INTERVAL '2 hours'
),
(
  (SELECT id FROM auth.users WHERE role = 'user' LIMIT 1 OFFSET 10),
  'pharmacy',
  500000,
  'paid',
  'midtrans',
  NULL,
  NULL,
  'Pharmacy Order - Large Order',
  NOW() - INTERVAL '4 days' + INTERVAL '4 hours',
  NOW() - INTERVAL '4 days' + INTERVAL '4 hours',
  NOW() - INTERVAL '4 days' + INTERVAL '4 hours'
),
(
  (SELECT id FROM auth.users WHERE role = 'user' LIMIT 1 OFFSET 11),
  'pharmacy',
  180000,
  'paid',
  'midtrans',
  NULL,
  NULL,
  'Pharmacy Order - Obat Resep',
  NOW() - INTERVAL '4 days' + INTERVAL '5 hours',
  NOW() - INTERVAL '4 days' + INTERVAL '5 hours',
  NOW() - INTERVAL '4 days' + INTERVAL '5 hours'
),

-- Day 4: Regular sales
(
  (SELECT id FROM auth.users WHERE role = 'user' LIMIT 1 OFFSET 12),
  'premium',
  99000,
  'paid',
  'midtrans',
  'premium_monthly',
  'monthly',
  'Premium Membership - Monthly',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
),
(
  (SELECT id FROM auth.users WHERE role = 'user' LIMIT 1 OFFSET 13),
  'pharmacy',
  125000,
  'paid',
  'midtrans',
  NULL,
  NULL,
  'Pharmacy Order',
  NOW() - INTERVAL '3 days' + INTERVAL '2 hours',
  NOW() - INTERVAL '3 days' + INTERVAL '2 hours',
  NOW() - INTERVAL '3 days' + INTERVAL '2 hours'
),

-- Day 5: Premium focus day
(
  (SELECT id FROM auth.users WHERE role = 'user' LIMIT 1 OFFSET 14),
  'premium',
  299000,
  'paid',
  'midtrans',
  'premium_yearly',
  'yearly',
  'Premium Membership - Yearly',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
),
(
  (SELECT id FROM auth.users WHERE role = 'user' LIMIT 1 OFFSET 15),
  'premium',
  99000,
  'paid',
  'midtrans',
  'premium_monthly',
  'monthly',
  'Premium Membership - Monthly',
  NOW() - INTERVAL '2 days' + INTERVAL '1 hours',
  NOW() - INTERVAL '2 days' + INTERVAL '1 hours',
  NOW() - INTERVAL '2 days' + INTERVAL '1 hours'
),
(
  (SELECT id FROM auth.users WHERE role = 'user' LIMIT 1 OFFSET 16),
  'premium',
  99000,
  'paid',
  'midtrans',
  'premium_monthly',
  'monthly',
  'Premium Membership - Monthly',
  NOW() - INTERVAL '2 days' + INTERVAL '3 hours',
  NOW() - INTERVAL '2 days' + INTERVAL '3 hours',
  NOW() - INTERVAL '2 days' + INTERVAL '3 hours'
),
(
  (SELECT id FROM auth.users WHERE role = 'user' LIMIT 1 OFFSET 17),
  'pharmacy',
  200000,
  'paid',
  'midtrans',
  NULL,
  NULL,
  'Pharmacy Order - Resep',
  NOW() - INTERVAL '2 days' + INTERVAL '5 hours',
  NOW() - INTERVAL '2 days' + INTERVAL '5 hours',
  NOW() - INTERVAL '2 days' + INTERVAL '5 hours'
),

-- Day 6: Yesterday
(
  (SELECT id FROM auth.users WHERE role = 'user' LIMIT 1 OFFSET 18),
  'premium',
  99000,
  'paid',
  'midtrans',
  'premium_monthly',
  'monthly',
  'Premium Membership - Monthly',
  NOW() - INTERVAL '1 days',
  NOW() - INTERVAL '1 days',
  NOW() - INTERVAL '1 days'
),
(
  (SELECT id FROM auth.users WHERE role = 'user' LIMIT 1 OFFSET 19),
  'pharmacy',
  95000,
  'paid',
  'midtrans',
  NULL,
  NULL,
  'Pharmacy Order',
  NOW() - INTERVAL '1 days' + INTERVAL '2 hours',
  NOW() - INTERVAL '1 days' + INTERVAL '2 hours',
  NOW() - INTERVAL '1 days' + INTERVAL '2 hours'
),

-- Day 7: Today
(
  (SELECT id FROM auth.users WHERE role = 'user' LIMIT 1 OFFSET 20),
  'premium',
  299000,
  'paid',
  'midtrans',
  'premium_yearly',
  'yearly',
  'Premium Membership - Yearly',
  NOW(),
  NOW(),
  NOW()
),
(
  (SELECT id FROM auth.users WHERE role = 'user' LIMIT 1 OFFSET 21),
  'premium',
  99000,
  'paid',
  'midtrans',
  'premium_monthly',
  'monthly',
  'Premium Membership - Monthly',
  NOW() + INTERVAL '1 hours',
  NOW() + INTERVAL '1 hours',
  NOW() + INTERVAL '1 hours'
),
(
  (SELECT id FROM auth.users WHERE role = 'user' LIMIT 1 OFFSET 22),
  'pharmacy',
  350000,
  'paid',
  'midtrans',
  NULL,
  NULL,
  'Pharmacy Order - Large',
  NOW() + INTERVAL '2 hours',
  NOW() + INTERVAL '2 hours',
  NOW() + INTERVAL '2 hours'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICATION QUERIES - Run after insert
-- ─────────────────────────────────────────────────────────────────────────────

-- Check total inserted
SELECT COUNT(*) as total_orders FROM payment_orders WHERE payment_status = 'paid';

-- Check breakdown by type
SELECT 
  order_type,
  COUNT(*) as order_count,
  SUM(amount) as total_revenue,
  AVG(amount) as average_value
FROM payment_orders
WHERE payment_status = 'paid'
GROUP BY order_type;

-- Check analytics_summary (after trigger runs)
SELECT 
  date,
  total_orders,
  total_revenue,
  premium_orders,
  pharmacy_orders
FROM analytics_summary
ORDER BY date DESC
LIMIT 10;

-- Check if trigger fired (compare updated_at)
SELECT 
  DATE(created_at) as transaction_date,
  COUNT(*) as order_count,
  SUM(amount) as total_amount
FROM payment_orders
WHERE payment_status = 'paid'
GROUP BY DATE(created_at)
ORDER BY transaction_date DESC;

