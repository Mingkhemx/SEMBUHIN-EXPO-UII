-- Tabel payment_orders untuk mencatat semua transaksi pembayaran
-- Cara Pakai: Copy-paste seluruh file ini ke SQL Editor di Supabase Dashboard

-- Step 1: Drop tabel jika ada (clean slate)
DROP TABLE IF EXISTS payment_orders CASCADE;

-- Step 2: Buat tabel payment_orders
CREATE TABLE payment_orders (
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

-- Step 3: Buat indeks
CREATE INDEX idx_payment_orders_order_id ON payment_orders(order_id);
CREATE INDEX idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX idx_payment_orders_status ON payment_orders(status);
CREATE INDEX idx_payment_orders_order_type ON payment_orders(order_type);
CREATE INDEX idx_payment_orders_created_at ON payment_orders(created_at DESC);

-- Step 4: Enable Row Level Security
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;

-- Step 5: Buat policies
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

-- Selesai! 🎉
-- Sekarang tabel payment_orders siap digunakan untuk tracking pembayaran
