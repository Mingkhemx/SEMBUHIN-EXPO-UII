-- ================================================================
-- SEMBUHIN — Update Chat for Admin Interaction
-- CARA PAKAI: Copy seluruh file ini, paste di Supabase Dashboard
--             → SQL Editor → New query → Run.
-- ================================================================

-- 1. Perbarui check constraint pada sender_type untuk mendukung 'admin'
ALTER TABLE public.consultation_messages 
DROP CONSTRAINT IF EXISTS consultation_messages_sender_type_check;

ALTER TABLE public.consultation_messages 
ADD CONSTRAINT consultation_messages_sender_type_check 
CHECK (sender_type IN ('patient', 'doctor', 'admin'));

-- 2. Perbarui fungsi helper untuk mengecek partisipan (termasuk admin)
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

-- 3. Perbarui kebijakan (policies) agar admin bisa baca & kirim pesan
-- Kebijakan baca pesan (sudah menggunakan is_consultation_participant)
-- Kebijakan insert pesan (sudah menggunakan is_consultation_participant)
-- Kebijakan update pesan (sudah menggunakan is_consultation_participant)

-- 4. Perbarui fungsi mark_messages_read untuk mendukung admin
CREATE OR REPLACE FUNCTION public.mark_messages_read(p_consultation_id uuid, p_as_sender_type text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    -- Tandai pesan dari lawan bicara sebagai sudah dibaca
    UPDATE public.consultation_messages
       SET read_at = NOW()
     WHERE consultation_id = p_consultation_id
       AND sender_type <> p_as_sender_type
       AND read_at IS NULL
       AND public.is_consultation_participant(p_consultation_id);
$$;

-- 5. Berikan akses ke tabel profiles untuk pengecekan role di function security definer
-- (Biasanya sudah ada, tapi pastikan admin bisa baca profiles)
GRANT SELECT ON public.profiles TO authenticated;
