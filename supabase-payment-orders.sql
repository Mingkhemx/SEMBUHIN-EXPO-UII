-- ─────────────────────────────────────────────────────────────────────────────
-- Payment Orders Table - untuk tracking semua transaksi (Premium & Pharmacy)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Order Details
  order_type VARCHAR(50) NOT NULL CHECK (order_type IN ('premium', 'pharmacy')),
  description TEXT,
  amount DECIMAL(15, 2) NOT NULL,
  
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

-- ─── Indexes untuk Performance ───
CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_payment_orders_type ON payment_orders(order_type);
CREATE INDEX IF NOT EXISTS idx_payment_orders_created_at ON payment_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_orders_midtrans_order_id ON payment_orders(midtrans_order_id);

-- ─── RLS (Row Level Security) ───
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own orders
DROP POLICY IF EXISTS "Users can view own orders" ON payment_orders;
CREATE POLICY "Users can view own orders" ON payment_orders
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own orders
DROP POLICY IF EXISTS "Users can insert own orders" ON payment_orders;
CREATE POLICY "Users can insert own orders" ON payment_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow admin to view all orders
DROP POLICY IF EXISTS "Admin can view all orders" ON payment_orders;
CREATE POLICY "Admin can view all orders" ON payment_orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow admin to update orders
DROP POLICY IF EXISTS "Admin can update orders" ON payment_orders;
CREATE POLICY "Admin can update orders" ON payment_orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- Trigger untuk Update Timestamps
-- ─────────────────────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS update_payment_orders_updated_at ON payment_orders;

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
