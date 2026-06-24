-- ================================================================
-- SEMBUHIN — Tabel Konsultasi Dokter & Chat Realtime
-- CARA PAKAI: Copy seluruh file ini, paste di Supabase Dashboard
--             → SQL Editor → New query → Run.
-- Aman dijalankan berulang kali (pakai IF NOT EXISTS).
-- ================================================================

-- ────────────────────────────────────────────────────────────────
-- A. Tambah kolom user_id ke tabel doctors
--    Agar dokter yang login bisa lihat konsultasi & chat miliknya.
-- ────────────────────────────────────────────────────────────────
alter table public.doctors
  add column if not exists user_id uuid references auth.users(id) on delete set null;

-- Index unik agar 1 akun auth = maksimal 1 profil dokter
create unique index if not exists doctors_user_id_key
  on public.doctors (user_id);

-- ────────────────────────────────────────────────────────────────
-- B. Tabel consultations (janji temu + status pembayaran & konsultasi)
-- ────────────────────────────────────────────────────────────────
create table if not exists public.consultations (
    id                   uuid default gen_random_uuid() primary key,
    -- Relasi
    doctor_id            uuid references public.doctors(id) on delete set null,
    patient_id           uuid references auth.users(id) on delete cascade,
    -- Snapshot data pasien (agar tetap ada walau user dihapus)
    patient_name         text not null,
    patient_phone        text not null,
    patient_email        text,
    -- Snapshot data dokter
    doctor_name          text not null,
    doctor_specialty     text,
    doctor_hospital      text,
    doctor_avatar_url    text,
    -- Jadwal
    appointment_date     date not null,
    appointment_time     text not null,
    consultation_type    text not null default 'Chat'
                         check (consultation_type in ('Chat', 'Voice Call', 'Video Call')),
    -- Keluhan
    complaint            text,
    -- Biaya (disimpan sebagai angka bulat dalam Rupiah)
    price                integer not null default 0,
    service_fee          integer not null default 0,
    total                integer not null default 0,
    -- Pembayaran
    payment_status       text not null default 'unpaid'
                         check (payment_status in ('unpaid', 'paid', 'failed', 'refunded')),
    payment_method       text,
    paid_at              timestamptz,
    -- Status konsultasi
    consultation_status  text not null default 'scheduled'
                         check (consultation_status in ('scheduled', 'in_progress', 'completed', 'cancelled')),
    -- Timestamps
    created_at           timestamptz not null default now(),
    updated_at           timestamptz not null default now()
);

-- Index untuk performa query
create index if not exists idx_consultations_doctor    on public.consultations (doctor_id);
create index if not exists idx_consultations_patient   on public.consultations (patient_id);
create index if not exists idx_consultations_date      on public.consultations (appointment_date);
create index if not exists idx_consultations_status    on public.consultations (consultation_status);
create index if not exists idx_consultations_payment   on public.consultations (payment_status);

-- ────────────────────────────────────────────────────────────────
-- C. Tabel consultation_messages (chat realtime dokter ↔ pasien)
-- ────────────────────────────────────────────────────────────────
create table if not exists public.consultation_messages (
    id                uuid default gen_random_uuid() primary key,
    consultation_id   uuid not null references public.consultations(id) on delete cascade,
    sender_id         uuid not null references auth.users(id) on delete cascade,
    sender_type       text not null check (sender_type in ('patient', 'doctor')),
    message_text      text not null,
    read_at           timestamptz,
    created_at        timestamptz not null default now()
);

create index if not exists idx_messages_consultation on public.consultation_messages (consultation_id);
create index if not exists idx_messages_created      on public.consultation_messages (created_at);

-- ────────────────────────────────────────────────────────────────
-- D. Trigger auto-update updated_at di consultations
-- ────────────────────────────────────────────────────────────────
create or replace function public.update_consultation_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists trigger_consultation_updated_at on public.consultations;
create trigger trigger_consultation_updated_at
    before update on public.consultations
    for each row
    execute function public.update_consultation_updated_at();

-- ────────────────────────────────────────────────────────────────
-- E. Row Level Security (RLS)
-- ────────────────────────────────────────────────────────────────

-- === consultations ===
alter table public.consultations enable row level security;

-- Helper: cek apakah user yang login adalah dokter dari konsultasi ini
-- (dipakai berulang di policy).
create or replace function public.is_consultation_doctor(c uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.consultations con
        join public.doctors d on d.id = con.doctor_id
        where con.id = c
          and d.user_id = auth.uid()
    );
$$;

-- Pasien BACA konsultasi miliknya sendiri
drop policy if exists "Patients read own consultations" on public.consultations;
create policy "Patients read own consultations"
    on public.consultations for select
    using (patient_id = auth.uid());

-- Dokter BACA konsultasi miliknya (via user_id di tabel doctors)
drop policy if exists "Doctors read own consultations" on public.consultations;
create policy "Doctors read own consultations"
    on public.consultations for select
    using (public.is_consultation_doctor(id));

-- Pasien INSERT konsultasi (untuk dirinya sendiri)
drop policy if exists "Patients insert own consultations" on public.consultations;
create policy "Patients insert own consultations"
    on public.consultations for insert
    with check (patient_id = auth.uid());

-- Pasien UPDATE konsultasi miliknya (mis. cancel)
drop policy if exists "Patients update own consultations" on public.consultations;
create policy "Patients update own consultations"
    on public.consultations for update
    using (patient_id = auth.uid())
    with check (patient_id = auth.uid());

-- Dokter UPDATE konsultasi miliknya (ubah status, dll)
drop policy if exists "Doctors update own consultations" on public.consultations;
create policy "Doctors update own consultations"
    on public.consultations for update
    using (public.is_consultation_doctor(id))
    with check (public.is_consultation_doctor(id));

-- === consultation_messages ===
alter table public.consultation_messages enable row level security;

-- Helper: cek apakah user yang login adalah peserta konsultasi
-- (pasien pemilik ATAU dokter penanggung jawab)
create or replace function public.is_consultation_participant(c uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
    select exists (
        select 1 from public.consultations con
        where con.id = c
          and (con.patient_id = auth.uid() or public.is_consultation_doctor(c))
    );
$$;

-- Peserta BACA pesan
drop policy if exists "Participants read messages" on public.consultation_messages;
create policy "Participants read messages"
    on public.consultation_messages for select
    using (public.is_consultation_participant(consultation_id));

-- Peserta INSERT pesan (sender harus user yang login)
drop policy if exists "Participants insert messages" on public.consultation_messages;
create policy "Participants insert messages"
    on public.consultation_messages for insert
    with check (
        sender_id = auth.uid()
        and public.is_consultation_participant(consultation_id)
    );

-- Peserta UPDATE pesan (mis. tandai read_at)
drop policy if exists "Participants update messages" on public.consultation_messages;
create policy "Participants update messages"
    on public.consultation_messages for update
    using (public.is_consultation_participant(consultation_id));

-- ────────────────────────────────────────────────────────────────
-- F. RPC: tandai pesan sebagai sudah dibaca
--    Dipanggil frontend: supabase.rpc('mark_messages_read', {...})
-- ────────────────────────────────────────────────────────────────
create or replace function public.mark_messages_read(p_consultation_id uuid, p_as_sender_type text)
returns void
language sql
security definer
set search_path = public
as $$
    -- Tandai pesan dari lawan bicara sebagai sudah dibaca
    update public.consultation_messages
       set read_at = now()
     where consultation_id = p_consultation_id
       and sender_type <> p_as_sender_type
       and read_at is null
       and public.is_consultation_participant(p_consultation_id);
$$;

-- ────────────────────────────────────────────────────────────────
-- G. Aktifkan Realtime untuk kedua tabel
--    (Supabase perlu ini supaya .channel('postgres_changes') jalan)
-- ────────────────────────────────────────────────────────────────
alter publication supabase_realtime add table public.consultations;
alter publication supabase_realtime add table public.consultation_messages;

-- ================================================================
-- SELESAI 🎉
-- Setelah Run berhasil, jalankan juga langkah berikut di dashboard:
-- 1. Authentication → Users → buat akun untuk dokter (email/password)
-- 2. Saat approve dokter di panel admin, isi user_id dengan ID user dokter
--    (atau admin jalankan SQL: update doctors set user_id='...' where email='...';)
-- ================================================================
