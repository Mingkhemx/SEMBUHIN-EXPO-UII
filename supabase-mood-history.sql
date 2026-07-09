-- ─────────────────────────────────────────────────────────────
-- Tabel: mood_history
-- Deskripsi: Menyimpan hasil deteksi mood dari kamera (Human.js + Gemini)
-- Jalankan di: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.mood_history (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood        TEXT        NOT NULL CHECK (mood IN ('happy','calm','neutral','anxious','sad','angry','tired')),
  confidence  INTEGER     NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk query per user + urut tanggal
CREATE INDEX IF NOT EXISTS mood_history_user_created_idx
  ON public.mood_history (user_id, created_at DESC);

-- ─── Row Level Security ──────────────────────────────────────
ALTER TABLE public.mood_history ENABLE ROW LEVEL SECURITY;

-- User hanya bisa lihat data sendiri
CREATE POLICY "Users can view own mood history"
  ON public.mood_history FOR SELECT
  USING (auth.uid() = user_id);

-- User hanya bisa insert data sendiri
CREATE POLICY "Users can insert own mood history"
  ON public.mood_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User bisa hapus data sendiri
CREATE POLICY "Users can delete own mood history"
  ON public.mood_history FOR DELETE
  USING (auth.uid() = user_id);
