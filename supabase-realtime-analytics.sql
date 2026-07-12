-- ─────────────────────────────────────────────────────────────────────────────
-- REAL-TIME ANALYTICS SETUP
-- Materialized Views, Triggers, dan Functions untuk Real-time Dashboard
-- ─────────────────────────────────────────────────────────────────────────────

-- ═════════════════════════════════════════════════════════════════════════════
-- 1. ANALYTICS SUMMARY TABLE (untuk real-time updates)
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS analytics_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Daily Metrics
  date DATE NOT NULL UNIQUE,
  
  -- Revenue
  total_revenue DECIMAL(15, 2) NOT NULL DEFAULT 0,
  premium_revenue DECIMAL(15, 2) NOT NULL DEFAULT 0,
  pharmacy_revenue DECIMAL(15, 2) NOT NULL DEFAULT 0,
  
  -- Order Counts
  total_orders INTEGER NOT NULL DEFAULT 0,
  premium_orders INTEGER NOT NULL DEFAULT 0,
  pharmacy_orders INTEGER NOT NULL DEFAULT 0,
  
  -- Averages
  average_order_value DECIMAL(15, 2) NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ─── Indexes ───
CREATE INDEX IF NOT EXISTS idx_analytics_summary_date ON analytics_summary(date);

-- ─── Enable Realtime ───
ALTER TABLE analytics_summary REPLICA IDENTITY FULL;

-- ─── RLS ───
ALTER TABLE analytics_summary ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can view analytics summary" ON analytics_summary;
CREATE POLICY "Admin can view analytics summary" ON analytics_summary
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ═════════════════════════════════════════════════════════════════════════════
-- 2. FUNCTION: Calculate Daily Analytics
-- ═════════════════════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS calculate_daily_analytics(DATE);

CREATE OR REPLACE FUNCTION calculate_daily_analytics(p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  total_rev DECIMAL,
  premium_rev DECIMAL,
  pharmacy_rev DECIMAL,
  total_count INTEGER,
  premium_count INTEGER,
  pharmacy_count INTEGER,
  avg_value DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN order_type = 'premium' THEN amount END), 0)::DECIMAL as premium_rev,
    COALESCE(SUM(CASE WHEN order_type = 'pharmacy' THEN amount END), 0)::DECIMAL as pharmacy_rev,
    (COALESCE(SUM(CASE WHEN order_type = 'premium' THEN amount END), 0) + 
     COALESCE(SUM(CASE WHEN order_type = 'pharmacy' THEN amount END), 0))::DECIMAL as total_rev,
    COUNT(*)::INTEGER as total_count,
    COUNT(CASE WHEN order_type = 'premium' THEN 1 END)::INTEGER as premium_count,
    COUNT(CASE WHEN order_type = 'pharmacy' THEN 1 END)::INTEGER as pharmacy_count,
    CASE 
      WHEN COUNT(*) > 0 THEN (
        (COALESCE(SUM(CASE WHEN order_type = 'premium' THEN amount END), 0) + 
         COALESCE(SUM(CASE WHEN order_type = 'pharmacy' THEN amount END), 0)) / COUNT(*)
      )::DECIMAL
      ELSE 0
    END as avg_value
  FROM payment_orders
  WHERE 
    payment_status = 'paid'
    AND DATE(created_at AT TIME ZONE 'Asia/Jakarta') = p_date;
END;
$$ LANGUAGE plpgsql STABLE;

-- ═════════════════════════════════════════════════════════════════════════════
-- 3. FUNCTION: Update Analytics Summary
-- ═════════════════════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS refresh_analytics_summary();

CREATE OR REPLACE FUNCTION refresh_analytics_summary()
RETURNS void AS $$
DECLARE
  v_date DATE;
  v_result RECORD;
BEGIN
  -- Get the date to update (from the payment_orders table)
  v_date := CURRENT_DATE;
  
  -- Get calculated metrics
  SELECT * INTO v_result FROM calculate_daily_analytics(v_date);
  
  -- Upsert into analytics_summary
  INSERT INTO analytics_summary (
    date,
    total_revenue,
    premium_revenue,
    pharmacy_revenue,
    total_orders,
    premium_orders,
    pharmacy_orders,
    average_order_value,
    updated_at
  ) VALUES (
    v_date,
    v_result.total_rev,
    v_result.premium_rev,
    v_result.pharmacy_rev,
    v_result.total_count,
    v_result.premium_count,
    v_result.pharmacy_count,
    v_result.avg_value,
    now()
  )
  ON CONFLICT (date) DO UPDATE SET
    total_revenue = v_result.total_rev,
    premium_revenue = v_result.premium_rev,
    pharmacy_revenue = v_result.pharmacy_rev,
    total_orders = v_result.total_count,
    premium_orders = v_result.premium_count,
    pharmacy_orders = v_result.pharmacy_count,
    average_order_value = v_result.avg_value,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- ═════════════════════════════════════════════════════════════════════════════
-- 4. TRIGGER: Auto-update analytics when payment order is created/updated
-- ═════════════════════════════════════════════════════════════════════════════

DROP TRIGGER IF EXISTS trigger_payment_order_analytics ON payment_orders;

CREATE OR REPLACE FUNCTION trigger_payment_order_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Hanya trigger untuk paid orders
  IF NEW.payment_status = 'paid' THEN
    PERFORM refresh_analytics_summary();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_payment_order_analytics
  AFTER INSERT OR UPDATE ON payment_orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_payment_order_analytics();

-- ═════════════════════════════════════════════════════════════════════════════
-- 5. MATERIALIZED VIEW: Historical Analytics (Last 90 Days)
-- ═════════════════════════════════════════════════════════════════════════════

DROP MATERIALIZED VIEW IF EXISTS mv_analytics_historical CASCADE;

CREATE MATERIALIZED VIEW mv_analytics_historical AS
SELECT 
  DATE(po.created_at AT TIME ZONE 'Asia/Jakarta') as date,
  SUM(CASE WHEN po.order_type = 'premium' THEN po.amount ELSE 0 END) as premium_revenue,
  SUM(CASE WHEN po.order_type = 'pharmacy' THEN po.amount ELSE 0 END) as pharmacy_revenue,
  SUM(po.amount) as total_revenue,
  COUNT(CASE WHEN po.order_type = 'premium' THEN 1 END) as premium_orders,
  COUNT(CASE WHEN po.order_type = 'pharmacy' THEN 1 END) as pharmacy_orders,
  COUNT(*) as total_orders,
  AVG(po.amount) as average_order_value
FROM payment_orders po
WHERE 
  po.payment_status = 'paid'
  AND po.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(po.created_at AT TIME ZONE 'Asia/Jakarta')
ORDER BY date DESC;

-- ─── Index untuk MV ───
CREATE INDEX IF NOT EXISTS idx_mv_analytics_historical_date ON mv_analytics_historical(date);

-- ═════════════════════════════════════════════════════════════════════════════
-- 6. MATERIALIZED VIEW: Monthly Summary
-- ═════════════════════════════════════════════════════════════════════════════

DROP MATERIALIZED VIEW IF EXISTS mv_analytics_monthly CASCADE;

CREATE MATERIALIZED VIEW mv_analytics_monthly AS
SELECT 
  DATE_TRUNC('month', po.created_at AT TIME ZONE 'Asia/Jakarta')::DATE as month,
  SUM(CASE WHEN po.order_type = 'premium' THEN po.amount ELSE 0 END) as premium_revenue,
  SUM(CASE WHEN po.order_type = 'pharmacy' THEN po.amount ELSE 0 END) as pharmacy_revenue,
  SUM(po.amount) as total_revenue,
  COUNT(CASE WHEN po.order_type = 'premium' THEN 1 END) as premium_orders,
  COUNT(CASE WHEN po.order_type = 'pharmacy' THEN 1 END) as pharmacy_orders,
  COUNT(*) as total_orders,
  AVG(po.amount) as average_order_value
FROM payment_orders po
WHERE po.payment_status = 'paid'
GROUP BY DATE_TRUNC('month', po.created_at AT TIME ZONE 'Asia/Jakarta');

-- ─── Index untuk MV ───
CREATE INDEX IF NOT EXISTS idx_mv_analytics_monthly_month ON mv_analytics_monthly(month);

-- ═════════════════════════════════════════════════════════════════════════════
-- 7. MATERIALIZED VIEW: Category Performance
-- ═════════════════════════════════════════════════════════════════════════════

DROP MATERIALIZED VIEW IF EXISTS mv_analytics_category CASCADE;

CREATE MATERIALIZED VIEW mv_analytics_category AS
SELECT 
  po.order_type as category,
  COUNT(*) as order_count,
  SUM(po.amount) as total_revenue,
  AVG(po.amount) as average_order_value,
  MIN(po.amount) as min_order,
  MAX(po.amount) as max_order,
  COUNT(DISTINCT po.user_id) as unique_customers
FROM payment_orders po
WHERE po.payment_status = 'paid'
GROUP BY po.order_type;

-- ═════════════════════════════════════════════════════════════════════════════
-- 8. FUNCTION: Refresh All Materialized Views
-- ═════════════════════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS refresh_all_analytics_views();

CREATE OR REPLACE FUNCTION refresh_all_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_analytics_historical;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_analytics_monthly;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_analytics_category;
END;
$$ LANGUAGE plpgsql;

-- ═════════════════════════════════════════════════════════════════════════════
-- 9. INITIAL DATA - Populate analytics_summary
-- ═════════════════════════════════════════════════════════════════════════════

-- Populate untuk 30 hari terakhir
INSERT INTO analytics_summary (date, total_revenue, premium_revenue, pharmacy_revenue, total_orders, premium_orders, pharmacy_orders, average_order_value, updated_at)
SELECT 
  date,
  COALESCE(total_revenue, 0),
  COALESCE(premium_revenue, 0),
  COALESCE(pharmacy_revenue, 0),
  COALESCE(total_orders, 0),
  COALESCE(premium_orders, 0),
  COALESCE(pharmacy_orders, 0),
  COALESCE(average_order_value, 0),
  now()
FROM mv_analytics_historical
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
ON CONFLICT (date) DO UPDATE SET
  total_revenue = EXCLUDED.total_revenue,
  premium_revenue = EXCLUDED.premium_revenue,
  pharmacy_revenue = EXCLUDED.pharmacy_revenue,
  total_orders = EXCLUDED.total_orders,
  premium_orders = EXCLUDED.premium_orders,
  pharmacy_orders = EXCLUDED.pharmacy_orders,
  average_order_value = EXCLUDED.average_order_value,
  updated_at = now();

-- ═════════════════════════════════════════════════════════════════════════════
-- 10. VERIFICATION & STATS
-- ═════════════════════════════════════════════════════════════════════════════

-- Lihat analytics summary
-- SELECT * FROM analytics_summary ORDER BY date DESC LIMIT 10;

-- Lihat historical view
-- SELECT * FROM mv_analytics_historical LIMIT 10;

-- Lihat monthly summary
-- SELECT * FROM mv_analytics_monthly ORDER BY month DESC;

-- Lihat category performance
-- SELECT * FROM mv_analytics_category;

-- Test trigger dengan insert baru
-- INSERT INTO payment_orders (
--   user_id, order_type, amount, payment_status, created_at
-- ) VALUES (
--   (SELECT id FROM auth.users LIMIT 1),
--   'premium',
--   99000,
--   'paid',
--   now()
-- );

