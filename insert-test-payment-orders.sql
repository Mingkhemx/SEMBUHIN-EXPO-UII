-- =====================================================
-- INSERT TEST DATA untuk Analytics Dashboard
-- =====================================================
-- 
-- Cara pakai:
-- 1. Buka Supabase SQL Editor
-- 2. Copy-paste script ini
-- 3. Klik "Run"
-- 4. Refresh browser dashboard
-- 
-- Akan insert 12 test orders:
-- - 6 Membership orders (Rp 99,000 each = Rp 594,000)
-- - 6 Pharmacy orders (Rp 180,000 avg = Rp 1,080,000+)
-- Total: Rp 1,674,000+
-- =====================================================

-- Insert Membership orders
INSERT INTO payment_orders (order_id, user_id, amount, status, created_at, updated_at)
VALUES
  ('ORDER-MEMBERSHIP-001', '550e8400-e29b-41d4-a716-446655440000'::uuid, 99000, 'paid', NOW() - INTERVAL '5 days', NOW()),
  ('ORDER-MEMBERSHIP-002', '550e8400-e29b-41d4-a716-446655440001'::uuid, 99000, 'paid', NOW() - INTERVAL '4 days', NOW()),
  ('ORDER-MEMBERSHIP-003', '550e8400-e29b-41d4-a716-446655440002'::uuid, 99000, 'paid', NOW() - INTERVAL '3 days', NOW()),
  ('ORDER-MEMBERSHIP-004', '550e8400-e29b-41d4-a716-446655440003'::uuid, 99000, 'paid', NOW() - INTERVAL '2 days', NOW()),
  ('ORDER-MEMBERSHIP-005', '550e8400-e29b-41d4-a716-446655440004'::uuid, 99000, 'paid', NOW() - INTERVAL '1 day', NOW()),
  ('ORDER-MEMBERSHIP-006', '550e8400-e29b-41d4-a716-446655440005'::uuid, 99000, 'paid', NOW(), NOW());

-- Insert Pharmacy orders
INSERT INTO payment_orders (order_id, user_id, amount, status, created_at, updated_at)
VALUES
  ('ORDER-PHARMACY-001', '550e8400-e29b-41d4-a716-446655440010'::uuid, 150000, 'paid', NOW() - INTERVAL '5 days', NOW()),
  ('ORDER-PHARMACY-002', '550e8400-e29b-41d4-a716-446655440011'::uuid, 175000, 'paid', NOW() - INTERVAL '4 days', NOW()),
  ('ORDER-PHARMACY-003', '550e8400-e29b-41d4-a716-446655440012'::uuid, 125000, 'paid', NOW() - INTERVAL '3 days', NOW()),
  ('ORDER-PHARMACY-004', '550e8400-e29b-41d4-a716-446655440013'::uuid, 200000, 'paid', NOW() - INTERVAL '2 days', NOW()),
  ('ORDER-PHARMACY-005', '550e8400-e29b-41d4-a716-446655440014'::uuid, 180000, 'paid', NOW() - INTERVAL '1 day', NOW()),
  ('ORDER-PHARMACY-006', '550e8400-e29b-41d4-a716-446655440015'::uuid, 250000, 'paid', NOW(), NOW());

-- Verify data
SELECT 
  COUNT(*) as total_orders,
  SUM(CASE WHEN order_id LIKE '%MEMBERSHIP%' THEN 1 ELSE 0 END) as membership_count,
  SUM(CASE WHEN order_id LIKE '%PHARMACY%' THEN 1 ELSE 0 END) as pharmacy_count,
  SUM(amount) as total_revenue,
  SUM(CASE WHEN order_id LIKE '%MEMBERSHIP%' THEN amount ELSE 0 END) as membership_revenue,
  SUM(CASE WHEN order_id LIKE '%PHARMACY%' THEN amount ELSE 0 END) as pharmacy_revenue
FROM payment_orders
WHERE status = 'paid' AND created_at >= NOW() - INTERVAL '30 days';
