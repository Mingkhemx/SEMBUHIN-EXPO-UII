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
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  
  -- Pharmacy Order Details
  pharmacy_order_id UUID REFERENCES marketplace_orders(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ─── Indexes untuk Performance ───
CREATE INDEX idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX idx_payment_orders_status ON payment_orders(payment_status);
CREATE INDEX idx_payment_orders_type ON payment_orders(order_type);
CREATE INDEX idx_payment_orders_created_at ON payment_orders(created_at);
CREATE INDEX idx_payment_orders_midtrans_order_id ON payment_orders(midtrans_order_id);
CREATE UNIQUE INDEX idx_payment_orders_transaction_id ON payment_orders(transaction_id) WHERE transaction_id IS NOT NULL;

-- ─── RLS (Row Level Security) ───
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON payment_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON payment_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all orders" ON payment_orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can update orders" ON payment_orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- Subscriptions Table (untuk Premium Membership)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Subscription Type
  plan_type VARCHAR(50) NOT NULL CHECK (plan_type IN ('basic', 'pro', 'premium')),
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'expired')),
  
  -- Billing
  amount DECIMAL(15, 2) NOT NULL,
  billing_cycle VARCHAR(50) NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  
  -- Dates
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  next_billing_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Payment
  auto_renew BOOLEAN DEFAULT true,
  payment_method VARCHAR(100),
  
  -- Metadata
  features JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all subscriptions" ON subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- Marketplace Orders Table (untuk Pharmacy)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS marketplace_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Order Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  
  -- Order Items & Amount
  total_amount DECIMAL(15, 2) NOT NULL,
  shipping_cost DECIMAL(15, 2) DEFAULT 0,
  discount_amount DECIMAL(15, 2) DEFAULT 0,
  
  -- Shipping Address
  shipping_address JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_marketplace_orders_user_id ON marketplace_orders(user_id);
CREATE INDEX idx_marketplace_orders_status ON marketplace_orders(status);
CREATE INDEX idx_marketplace_orders_created_at ON marketplace_orders(created_at);

ALTER TABLE marketplace_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON marketplace_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all orders" ON marketplace_orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- Marketplace Order Items Table
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS marketplace_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES marketplace_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  
  -- Item Details
  product_name VARCHAR(255),
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(15, 2) NOT NULL,
  subtotal DECIMAL(15, 2) NOT NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_marketplace_order_items_order_id ON marketplace_order_items(order_id);
CREATE INDEX idx_marketplace_order_items_product_id ON marketplace_order_items(product_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Triggers untuk Update Timestamps
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payment_orders_updated_at BEFORE UPDATE ON payment_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_orders_updated_at BEFORE UPDATE ON marketplace_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- Seed Data untuk Testing (OPTIONAL - uncomment untuk test)
-- ─────────────────────────────────────────────────────────────────────────────

-- INSERT INTO payment_orders (user_id, order_type, amount, payment_status, paid_at, created_at)
-- VALUES 
--   ('user-id-1', 'premium', 99000, 'paid', now(), now()),
--   ('user-id-2', 'pharmacy', 150000, 'paid', now() - INTERVAL '1 day', now() - INTERVAL '1 day'),
--   ('user-id-3', 'premium', 199000, 'paid', now() - INTERVAL '2 days', now() - INTERVAL '2 days'),
--   ('user-id-4', 'pharmacy', 250000, 'paid', now() - INTERVAL '3 days', now() - INTERVAL '3 days');
