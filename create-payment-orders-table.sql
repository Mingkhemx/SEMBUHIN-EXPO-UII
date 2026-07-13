-- Tabel payment_orders untuk mencatat semua transaksi pembayaran
-- Cara Pakai: Copy-paste seluruh file ini ke SQL Editor di Supabase Dashboard

-- Buat tabel payment_orders
CREATE TABLE IF NOT EXISTS payment_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT NOT NULL UNIQUE, -- ID unik dari Midtrans/payment gateway
    user_id TEXT NOT NULL, -- ID user yang melakukan pembayaran
    amount INTEGER NOT NULL, -- Jumlah pembayaran (dalam Rupiah)
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
    order_type TEXT NOT NULL DEFAULT 'membership' CHECK (order_type IN ('membership', 'pharmacy')),
    -- order_type: 'membership' untuk premium, 'pharmacy' untuk marketplace obat
    metadata JSONB, -- Data tambahan (item details, dll)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buat indeks untuk query yang cepat
CREATE INDEX IF NOT EXISTS idx_payment_orders_order_id ON payment_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_payment_orders_order_type ON payment_orders(order_type);
CREATE INDEX IF NOT EXISTS idx_payment_orders_created_at ON payment_orders(created_at DESC);

-- Enable Row Level Security
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;

-- Policy: Siapa saja bisa insert (untuk webhook Midtrans)
CREATE POLICY "Siapa saja bisa insert payment_orders"
    ON payment_orders
    FOR INSERT
    WITH CHECK (true);

-- Policy: Admin bisa melihat semua data
CREATE POLICY "Admin bisa lihat semua payment_orders"
    ON payment_orders
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Policy: User bisa melihat payment_orders miliknya sendiri
CREATE POLICY "User bisa lihat payment_orders sendiri"
    ON payment_orders
    FOR SELECT
    USING (auth.uid()::text = user_id);

-- Policy: Admin bisa update status
CREATE POLICY "Admin bisa update payment_orders"
    ON payment_orders
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Trigger auto update updated_at
CREATE OR REPLACE FUNCTION update_payment_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_payment_orders_updated_at
    BEFORE UPDATE ON payment_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_orders_updated_at();

-- Enable Realtime untuk analytics dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE payment_orders;

-- Selesai! 🎉
-- Sekarang tabel payment_orders siap digunakan untuk tracking pembayaran
