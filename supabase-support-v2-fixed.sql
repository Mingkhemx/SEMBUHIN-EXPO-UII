-- ================================================================
-- SEMBUHIN — Support Chat Schema Fix (VERSI PERBAIKAN)
-- CARA PAKAI: Salin semua, hapus query lama di Supabase, lalu RUN.
-- ================================================================

-- 1. Tambahkan kolom 'type' ke tabel consultations jika belum ada
ALTER TABLE public.consultations 
ADD COLUMN IF NOT EXISTS type text DEFAULT 'doctor';

-- Tambahkan check constraint secara terpisah agar aman
DO $$ 
BEGIN 
    ALTER TABLE public.consultations ADD CONSTRAINT consultations_type_check CHECK (type IN ('doctor', 'support'));
EXCEPTION 
    WHEN duplicate_object THEN null; 
END $$;

-- 2. Ubah kolom wajib menjadi opsional (SINTAKS YANG BENAR: DROP NOT NULL)
ALTER TABLE public.consultations 
ALTER COLUMN doctor_name DROP NOT NULL,
ALTER COLUMN appointment_date DROP NOT NULL,
ALTER COLUMN appointment_time DROP NOT NULL,
ALTER COLUMN patient_phone DROP NOT NULL;

-- 3. Pastikan sender_type mendukung 'admin'
ALTER TABLE public.consultation_messages 
DROP CONSTRAINT IF EXISTS consultation_messages_sender_type_check;

ALTER TABLE public.consultation_messages 
ADD CONSTRAINT consultation_messages_sender_type_check 
CHECK (sender_type IN ('patient', 'doctor', 'admin'));

-- 4. Update Helper Function untuk menyertakan Admin
CREATE OR REPLACE FUNCTION public.is_consultation_participant(c uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.consultations con
        WHERE con.id = c
          AND (
            con.patient_id = auth.uid() 
            OR public.is_consultation_doctor(c)
            OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
          )
    );
$$;

-- 5. Kebijakan RLS Tambahan untuk Admin di tabel consultations
DROP POLICY IF EXISTS "Admins read all consultations" ON public.consultations;
CREATE POLICY "Admins read all consultations"
    ON public.consultations FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins update all consultations" ON public.consultations;
CREATE POLICY "Admins update all consultations"
    ON public.consultations FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 6. Kebijakan RLS Tambahan untuk Admin di tabel consultation_messages
DROP POLICY IF EXISTS "Admins read all messages" ON public.consultation_messages;
CREATE POLICY "Admins read all messages"
    ON public.consultation_messages FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins insert all messages" ON public.consultation_messages;
CREATE POLICY "Admins insert all messages"
    ON public.consultation_messages FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 7. Grant akses profiles ke authenticated users agar function bisa cek role
GRANT SELECT ON public.profiles TO authenticated;
