-- Marketplace Table: Products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    price BIGINT NOT NULL,
    stock INTEGER DEFAULT 0,
    emoji TEXT DEFAULT '💊',
    rating DECIMAL(2,1) DEFAULT 4.5,
    status TEXT DEFAULT 'tersedia' CHECK (status IN ('tersedia', 'habis')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace Table: Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_name TEXT,
    items JSONB NOT NULL, -- [{product_id, name, quantity, price}]
    total_amount BIGINT NOT NULL,
    status TEXT DEFAULT 'Menunggu' CHECK (status IN ('Menunggu', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policies for Products
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Policies for Orders
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view and manage all orders" ON public.orders FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Seed Initial Products
INSERT INTO public.products (name, description, category, price, stock, emoji, rating)
VALUES 
('Paracetamol 500mg', 'Pereda demam & nyeri ringan', 'Obat', 12000, 500, '💊', 4.8),
('Vitamin C 1000mg', 'Tingkatkan imun harian', 'Vitamin', 85000, 300, '🍊', 4.9),
('Vitamin C 1000mg', 'Tingkatkan imun harian', 'Suplemen', 85000, 150, '🍊', 4.9),
('Masker N95', '3-ply earloop berkualitas', 'Alat Kesehatan', 35000, 8, '😷', 4.8),
('Hand Sanitizer 500ml', 'Anti bakteri pocket size', 'Kebersihan', 18000, 200, '🧴', 4.5),
('Tensimeter Digital', 'Monitor tekanan darah otomatis', 'Alat Kesehatan', 285000, 45, '🩺', 4.9),
('Omeprazole 20mg', 'Atasi maag & asam lambung', 'Obat', 45000, 5, '🌿', 4.7),
('Minyak Kayu Putih', 'Hangatkan tubuh & redakan kembung', 'Herbal', 22000, 120, '🍃', 4.8);
