-- ================================================================
-- Tabel: mental_health_screenings
-- Menyimpan riwayat hasil screening PHQ-9 & GAD-7 per user
-- ================================================================

create table if not exists public.mental_health_screenings (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users(id) on delete cascade not null,
  screening_type text not null check (screening_type in ('phq9', 'gad7')),
  answers       jsonb not null,          -- { "0": 2, "1": 1, ... }
  total_score   integer not null,
  severity      text not null,           -- minimal, mild, moderate, mod-severe, severe
  created_at    timestamptz default now() not null
);

create index if not exists mental_health_screenings_user_id_idx
  on public.mental_health_screenings(user_id);
create index if not exists mental_health_screenings_created_at_idx
  on public.mental_health_screenings(created_at desc);

-- RLS: user hanya bisa lihat & insert data miliknya sendiri
alter table public.mental_health_screenings enable row level security;

create policy "Users can view own screenings"
  on public.mental_health_screenings for select
  using (auth.uid() = user_id);

create policy "Users can insert own screenings"
  on public.mental_health_screenings for insert
  with check (auth.uid() = user_id);

-- ================================================================
-- SELESAI — Paste & Run di Supabase SQL Editor
-- ================================================================
