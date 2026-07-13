-- Tabel payment_orders untuk mencatat semua transaksi pembayaran
-- Cara Pakai: Copy-paste seluruh file ini ke SQL Editor di Supabase Dashboard

-- Step 1: Buat tabel payment_orders
CREATE TABLE IF NOT EXISTS payment_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
    order_type TEXT NOT NULL DEFAULT 'membership' CHECK (order_type IN ('membership', 'pharmacy')),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Buat indeks
CREATE INDEX IF NOT EXISTS idx_payment_orders_order_id ON payment_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_payment_orders_order_type ON payment_orders(order_type);
CREATE INDEX IF NOT EXISTS idx_payment_orders_created_at ON payment_orders(created_at DESC);

-- Step 3: Enable Row Level Security
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop policies lama jika ada (untuk avoid conflict)
DROP POLICY IF EXISTS "Siapa saja bisa insert payment_orders" ON payment_orders;
DROP POLICY IF EXISTS "Admin bisa lihat semua payment_orders" ON payment_orders;
DROP POLICY IF EXISTS "User bisa lihat payment_orders sendiri" ON payment_orders;
DROP POLICY IF EXISTS "Admin bisa update payment_orders" ON payment_orders;

-- Step 5: Buat policies baru
CREATE POLICY "Siapa saja bisa insert payment_orders"
    ON payment_orders
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admin bisa lihat semua payment_orders"
    ON payment_orders
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "User bisa lihat payment_orders sendiri"
    ON payment_orders
    FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Admin bisa update payment_orders"
    ON payment_orders
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Step 6: Trigger auto update updated_at
DROP FUNCTION IF EXISTS update_payment_orders_updated_at() CASCADE;

CREATE FUNCTION update_payment_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_payment_orders_updated_at ON payment_orders;

CREATE TRIGGER trigger_update_payment_orders_updated_at
    BEFORE UPDATE ON payment_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_orders_updated_at();

-- Step 7: Enable Realtime (skip jika publication tidak ada)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE payment_orders;
    ELSE
        RAISE NOTICE 'Publication supabase_realtime does not exist, skipping realtime setup';
    END IF;
END $$;

-- Selesai! 🎉
-- Sekarang tabel payment_orders siap digunakan untuk tracking pembayaran
