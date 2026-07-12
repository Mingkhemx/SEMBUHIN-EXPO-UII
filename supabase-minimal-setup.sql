-- ─────────────────────────────────────────────────────────────────────────────
-- MINIMAL SETUP - Work with existing payment_orders structure
-- ─────────────────────────────────────────────────────────────────────────────

-- STEP 1: Create analytics_summary table (simple version)
CREATE TABLE IF NOT EXISTS analytics_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_revenue DECIMAL(15, 2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable realtime
ALTER TABLE analytics_summary REPLICA IDENTITY FULL;

-- STEP 2: Create simple refresh function (no order_type dependency)
DROP FUNCTION IF EXISTS refresh_analytics_simple();

CREATE OR REPLACE FUNCTION refresh_analytics_simple()
RETURNS void AS $$
DECLARE
  v_date DATE;
  v_result RECORD;
BEGIN
  v_date := CURRENT_DATE;
  
  -- Calculate metrics from whatever payment_orders structure exists
  SELECT 
    COUNT(*) as total_count,
    COALESCE(SUM(amount), 0) as total_rev
  INTO v_result
  FROM payment_orders
  WHERE payment_status = 'paid'
    AND DATE(created_at AT TIME ZONE 'Asia/Jakarta') = v_date;
  
  INSERT INTO analytics_summary (date, total_orders, total_revenue, updated_at)
  VALUES (v_date, v_result.total_count, v_result.total_rev, now())
  ON CONFLICT (date) DO UPDATE SET
    total_orders = v_result.total_count,
    total_revenue = v_result.total_rev,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- STEP 3: Create simple trigger
DROP TRIGGER IF EXISTS trigger_analytics_simple ON payment_orders;
DROP FUNCTION IF EXISTS trigger_analytics_simple_func();

CREATE OR REPLACE FUNCTION trigger_analytics_simple_func()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'paid' THEN
    PERFORM refresh_analytics_simple();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_analytics_simple
  AFTER INSERT OR UPDATE ON payment_orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_analytics_simple_func();

-- STEP 4: Populate last 30 days
INSERT INTO analytics_summary (date, total_orders, total_revenue, updated_at)
SELECT 
  DATE(created_at AT TIME ZONE 'Asia/Jakarta') as date,
  COUNT(*) as total_orders,
  COALESCE(SUM(amount), 0) as total_revenue,
  now()
FROM payment_orders
WHERE payment_status = 'paid'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at AT TIME ZONE 'Asia/Jakarta')
ON CONFLICT (date) DO UPDATE SET
  total_orders = EXCLUDED.total_orders,
  total_revenue = EXCLUDED.total_revenue,
  updated_at = now();

-- STEP 5: Insert test data (simple - no order_type needed)
INSERT INTO payment_orders (user_id, amount, payment_status, created_at, paid_at)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  99000,
  'paid',
  NOW() - INTERVAL '6 days',
  NOW() - INTERVAL '6 days'
WHERE (SELECT COUNT(*) FROM auth.users) > 0;

INSERT INTO payment_orders (user_id, amount, payment_status, created_at, paid_at)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  150000,
  'paid',
  NOW() - INTERVAL '6 days',
  NOW() - INTERVAL '6 days'
WHERE (SELECT COUNT(*) FROM auth.users) > 0;

INSERT INTO payment_orders (user_id, amount, payment_status, created_at, paid_at)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  299000,
  'paid',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
WHERE (SELECT COUNT(*) FROM auth.users) > 0;

INSERT INTO payment_orders (user_id, amount, payment_status, created_at, paid_at)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  250000,
  'paid',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
WHERE (SELECT COUNT(*) FROM auth.users) > 0;

INSERT INTO payment_orders (user_id, amount, payment_status, created_at, paid_at)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  500000,
  'paid',
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '4 days'
WHERE (SELECT COUNT(*) FROM auth.users) > 0;

INSERT INTO payment_orders (user_id, amount, payment_status, created_at, paid_at)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  350000,
  'paid',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
WHERE (SELECT COUNT(*) FROM auth.users) > 0;

INSERT INTO payment_orders (user_id, amount, payment_status, created_at, paid_at)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  99000,
  'paid',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
WHERE (SELECT COUNT(*) FROM auth.users) > 0;

INSERT INTO payment_orders (user_id, amount, payment_status, created_at, paid_at)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  200000,
  'paid',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
WHERE (SELECT COUNT(*) FROM auth.users) > 0;

INSERT INTO payment_orders (user_id, amount, payment_status, created_at, paid_at)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  99000,
  'paid',
  NOW() - INTERVAL '1 days',
  NOW() - INTERVAL '1 days'
WHERE (SELECT COUNT(*) FROM auth.users) > 0;

INSERT INTO payment_orders (user_id, amount, payment_status, created_at, paid_at)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  350000,
  'paid',
  NOW(),
  NOW()
WHERE (SELECT COUNT(*) FROM auth.users) > 0;

-- STEP 6: Refresh analytics with new data
SELECT refresh_analytics_simple();

-- STEP 7: Verify
SELECT COUNT(*) as total_orders FROM payment_orders;
SELECT SUM(total_revenue) as total_revenue FROM analytics_summary;
SELECT * FROM analytics_summary ORDER BY date DESC LIMIT 10;

