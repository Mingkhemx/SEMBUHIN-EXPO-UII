-- Tabel riwayat scan kulit per user
create table if not exists public.skin_scans (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  condition   text not null,
  confidence  integer not null,
  severity    text not null check (severity in ('ringan', 'sedang', 'perlu-perhatian')),
  description text,
  recommendation text,
  characteristics text[],
  ai_source   text default 'mock',
  thumbnail   text,
  created_at  timestamptz default now() not null
);

-- Index untuk query per user
create index if not exists skin_scans_user_id_idx on public.skin_scans(user_id);
create index if not exists skin_scans_created_at_idx on public.skin_scans(created_at desc);

-- RLS: user hanya bisa lihat & insert data miliknya sendiri
alter table public.skin_scans enable row level security;

create policy "Users can view own scans"
  on public.skin_scans for select
  using (auth.uid() = user_id);

create policy "Users can insert own scans"
  on public.skin_scans for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own scans"
  on public.skin_scans for delete
  using (auth.uid() = user_id);
