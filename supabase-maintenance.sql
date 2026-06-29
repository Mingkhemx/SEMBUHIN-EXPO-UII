-- ================================================================
-- SEMBUHIN — Maintenance Mode & System Settings
-- CARA PAKAI: Salin semua, jalankan di Supabase SQL Editor.
-- ================================================================

-- 1. Buat tabel settings
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Aktifkan RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan BACA: Semua orang bisa baca (untuk cek maintenance)
DROP POLICY IF EXISTS "Settings are readable by everyone" ON public.settings;
CREATE POLICY "Settings are readable by everyone" 
    ON public.settings FOR SELECT 
    USING (true);

-- 4. Kebijakan EDIT: Hanya Admin yang bisa ubah
DROP POLICY IF EXISTS "Settings are editable by admins only" ON public.settings;
CREATE POLICY "Settings are editable by admins only" 
    ON public.settings FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 5. Masukkan data default maintenance mode (OFF)
INSERT INTO public.settings (key, value)
VALUES ('maintenance_mode', '{"active": false, "message": "Website sedang dalam perbaikan. Kami akan segera kembali!"}')
ON CONFLICT (key) DO NOTHING;

-- 6. Trigger auto-update timestamp
CREATE OR REPLACE FUNCTION public.update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_settings_updated_at ON public.settings;
CREATE TRIGGER trigger_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_settings_updated_at();
