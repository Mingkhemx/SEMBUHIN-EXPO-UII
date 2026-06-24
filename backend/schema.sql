-- Sembuhin Database Schema
-- Cara Pakai: Copy-paste seluruh file ini ke SQL Editor di Supabase!

-- Langkah 1: Buat tabel pendaftaran dokter
CREATE TABLE IF NOT EXISTS doctor_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    -- Data Diri
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    nik TEXT NOT NULL,
    birth_date DATE NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('Laki-laki', 'Perempuan')),
    address TEXT NOT NULL,
    -- Profesional
    specialty TEXT NOT NULL,
    license_number TEXT NOT NULL, -- STR
    sip TEXT NOT NULL, -- Surat Izin Praktik
    practice_location TEXT NOT NULL, -- Tempat praktik utama
    practice_address TEXT,
    experience_years INTEGER,
    cv TEXT, -- Link/file CV
    -- Dokumen Upload
    ktp_url TEXT, -- KTP
    str_url TEXT, -- STR
    sip_url TEXT, -- SIP
    diploma_url TEXT, -- Ijazah
    cv_url TEXT, -- CV
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Langkah 2: Buat indeks agar pencarian cepat
CREATE INDEX IF NOT EXISTS idx_reg_status ON doctor_registrations(status);
CREATE INDEX IF NOT EXISTS idx_reg_date ON doctor_registrations(created_at DESC);

-- Langkah 3: Atur kebijakan keamanan (bisa diubah nanti)
ALTER TABLE doctor_registrations ENABLE ROW LEVEL SECURITY;

-- Izinkan siapa saja untuk mendaftar
CREATE POLICY "Siapa saja bisa daftar"
    ON doctor_registrations
    FOR INSERT
    WITH CHECK (true);

-- Izinkan semua orang melihat data (untuk development, ganti nanti di production!)
CREATE POLICY "Semua bisa lihat"
    ON doctor_registrations
    FOR SELECT
    USING (true);

-- Izinkan authenticated user untuk update
CREATE POLICY "Authenticated bisa update"
    ON doctor_registrations
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Langkah 4: Trigger auto update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_updated_at
    BEFORE UPDATE ON doctor_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Selesai! 🎉

