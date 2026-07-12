-- ─────────────────────────────────────────────────────────────────────────────
-- FIX: Payment Orders Table Setup
-- Jalankan ini jika ada error dengan payment_orders table
-- ─────────────────────────────────────────────────────────────────────────────

-- STEP 1: Check if table exists and its structure
-- SELECT EXISTS (
--   SELECT 1 FROM information_schema.tables 
--   WHERE table_schema = 'public' 
--   AND table_name = 'payment_orders'
-- );

-- STEP 2: Drop existing payment_orders if corrupt
-- (Uncomment jika benar-benar perlu, karena akan delete semua data!)
-- DROP TABLE IF EXISTS payment_orders CASCADE;

-- STEP 3: Create fresh payment_orders table
CREATE TABLE IF NOT EXISTS payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Order Details
  order_type VARCHAR(50) NOT NULL DEFAULT 'pharmacy' CHECK (order_type IN ('premium', 'pharmacy')),
  description TEXT,
  amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  
  -- Payment Status
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'cancelled')),
  payment_method VARCHAR(100),
  transaction_id VARCHAR(255),
  
  -- Midtrans Integration
  midtrans_transaction_id VARCHAR(255),
  midtrans_order_id VARCHAR(255) UNIQUE,
  
  -- Premium Subscription Details
  plan_type VARCHAR(50),
  billing_cycle VARCHAR(50),
  
  -- Pharmacy Order Details
  pharmacy_order_id VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- STEP 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_payment_orders_type ON payment_orders(order_type);
CREATE INDEX IF NOT EXISTS idx_payment_orders_created_at ON payment_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_orders_midtrans_order_id ON payment_orders(midtrans_order_id);

-- STEP 5: Enable RLS
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;

-- STEP 6: Create RLS Policies
DROP POLICY IF EXISTS "Users can view own orders" ON payment_orders;
CREATE POLICY "Users can view own orders" ON payment_orders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own orders" ON payment_orders;
CREATE POLICY "Users can insert own orders" ON payment_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can view all orders" ON payment_orders;
CREATE POLICY "Admin can view all orders" ON payment_orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can update orders" ON payment_orders;
CREATE POLICY "Admin can update orders" ON payment_orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- STEP 7: Create trigger for updated_at
DROP TRIGGER IF EXISTS update_payment_orders_updated_at ON payment_orders;
DROP FUNCTION IF EXISTS update_payment_orders_timestamp();

CREATE OR REPLACE FUNCTION update_payment_orders_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payment_orders_updated_at 
  BEFORE UPDATE ON payment_orders
  FOR EACH ROW 
  EXECUTE FUNCTION update_payment_orders_timestamp();

-- STEP 8: Create analytics_summary table
CREATE TABLE IF NOT EXISTS analytics_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE INDEX IF NOT EXISTS idx_analytics_summary_date ON analytics_summary(date);

-- Enable realtime for analytics_summary
ALTER TABLE analytics_summary REPLICA IDENTITY FULL;
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

-- STEP 9: Create functions
DROP FUNCTION IF EXISTS calculate_daily_analytics(DATE) CASCADE;

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

-- STEP 10: Create refresh function
DROP FUNCTION IF EXISTS refresh_analytics_summary();

CREATE OR REPLACE FUNCTION refresh_analytics_summary()
RETURNS void AS $$
DECLARE
  v_date DATE;
  v_result RECORD;
BEGIN
  v_date := CURRENT_DATE;
  
  SELECT * INTO v_result FROM calculate_daily_analytics(v_date);
  
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

-- STEP 11: Create trigger
DROP TRIGGER IF EXISTS trigger_payment_order_analytics ON payment_orders;

CREATE OR REPLACE FUNCTION trigger_payment_order_analytics()
RETURNS TRIGGER AS $$
BEGIN
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

-- STEP 12: Verify setup
SELECT 'Payment Orders Table' as check_name, 
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'payment_orders'
  ) THEN 'EXISTS ✅' ELSE 'MISSING ❌' END as status;

SELECT 'Analytics Summary Table' as check_name, 
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'analytics_summary'
  ) THEN 'EXISTS ✅' ELSE 'MISSING ❌' END as status;

SELECT 'Order Type Column' as check_name, 
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'payment_orders' AND column_name = 'order_type'
  ) THEN 'EXISTS ✅' ELSE 'MISSING ❌' END as status;

SELECT 'Trigger Exists' as check_name, 
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'trigger_payment_order_analytics'
  ) THEN 'EXISTS ✅' ELSE 'MISSING ❌' END as status;

