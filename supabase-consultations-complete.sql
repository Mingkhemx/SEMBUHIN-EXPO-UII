-- ================================================================
-- KONSULTASI LENGKAP: consultation_messages + update consultations
-- Paste & Run di Supabase SQL Editor
-- ================================================================

-- ── 1. Pastikan tabel consultations punya semua kolom yang dibutuhkan ──

alter table public.consultations
  add column if not exists doctor_id          uuid references public.doctors(id),
  add column if not exists patient_id         uuid references auth.users(id),
  add column if not exists patient_name       text,
  add column if not exists patient_phone      text,
  add column if not exists patient_email      text,
  add column if not exists appointment_date   date,
  add column if not exists appointment_time   text,
  add column if not exists consultation_type  text default 'Chat',
  add column if not exists complaint          text,
  add column if not exists consultation_status text default 'scheduled'
    check (consultation_status in ('scheduled','in_progress','completed','cancelled')),
  add column if not exists payment_status     text default 'paid'
    check (payment_status in ('pending','paid','refunded')),
  add column if not exists completed_at       timestamptz,
  add column if not exists notes              text,
  add column if not exists created_at         timestamptz default now(),
  add column if not exists updated_at         timestamptz default now();

-- Index
create index if not exists consultations_doctor_id_idx  on public.consultations(doctor_id);
create index if not exists consultations_patient_id_idx on public.consultations(patient_id);
create index if not exists consultations_status_idx     on public.consultations(consultation_status);
create index if not exists consultations_date_idx       on public.consultations(appointment_date desc);

-- RLS consultations
alter table public.consultations enable row level security;

drop policy if exists "Doctors can view own consultations"   on public.consultations;
drop policy if exists "Patients can view own consultations"  on public.consultations;
drop policy if exists "Doctors can update own consultations" on public.consultations;
drop policy if exists "Authenticated can insert consultations" on public.consultations;

create policy "Doctors can view own consultations"
  on public.consultations for select
  using (
    doctor_id in (
      select id from public.doctors where user_id = auth.uid()
    )
  );

create policy "Patients can view own consultations"
  on public.consultations for select
  using (patient_id = auth.uid());

create policy "Doctors can update own consultations"
  on public.consultations for update
  using (
    doctor_id in (
      select id from public.doctors where user_id = auth.uid()
    )
  );

create policy "Authenticated can insert consultations"
  on public.consultations for insert
  with check (auth.role() = 'authenticated');

-- ── 2. Tabel consultation_messages ──────────────────────────────────

create table if not exists public.consultation_messages (
  id               uuid default gen_random_uuid() primary key,
  consultation_id  uuid references public.consultations(id) on delete cascade not null,
  sender_id        uuid references auth.users(id) not null,
  sender_type      text not null check (sender_type in ('patient', 'doctor')),
  message_text     text not null,
  read_at          timestamptz,
  created_at       timestamptz default now() not null
);

create index if not exists consultation_messages_consultation_id_idx
  on public.consultation_messages(consultation_id);
create index if not exists consultation_messages_created_at_idx
  on public.consultation_messages(created_at asc);

-- RLS consultation_messages
alter table public.consultation_messages enable row level security;

drop policy if exists "Participants can view messages" on public.consultation_messages;
drop policy if exists "Participants can send messages" on public.consultation_messages;
drop policy if exists "Doctors can mark messages read" on public.consultation_messages;

create policy "Participants can view messages"
  on public.consultation_messages for select
  using (
    consultation_id in (
      select c.id from public.consultations c
      where c.patient_id = auth.uid()
        or c.doctor_id in (
          select id from public.doctors where user_id = auth.uid()
        )
    )
  );

create policy "Participants can send messages"
  on public.consultation_messages for insert
  with check (
    sender_id = auth.uid()
    and consultation_id in (
      select c.id from public.consultations c
      where c.patient_id = auth.uid()
        or c.doctor_id in (
          select id from public.doctors where user_id = auth.uid()
        )
    )
  );

create policy "Doctors can mark messages read"
  on public.consultation_messages for update
  using (
    consultation_id in (
      select c.id from public.consultations c
      where c.doctor_id in (
        select id from public.doctors where user_id = auth.uid()
      )
    )
  );

-- ── 3. RPC: mark_messages_read ────────────────────────────────────────

create or replace function public.mark_messages_read(
  p_consultation_id uuid,
  p_as_sender_type  text   -- 'doctor' atau 'patient' yang menandai sebagai sudah baca
)
returns void
language plpgsql security definer as $$
begin
  update public.consultation_messages
  set read_at = now()
  where consultation_id = p_consultation_id
    and sender_type != p_as_sender_type   -- tandai pesan dari sisi lain
    and read_at is null;
end;
$$;

-- ── 4. Auto-update updated_at pada consultations ──────────────────────

create or replace function public.handle_consultation_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  -- Jika status berubah jadi completed, set completed_at
  if new.consultation_status = 'completed' and old.consultation_status != 'completed' then
    new.completed_at = now();
    -- Tambah total_patients dokter
    update public.doctors
    set total_patients = total_patients + 1
    where id = new.doctor_id;
  end if;
  return new;
end;
$$;

drop trigger if exists consultations_updated_at on public.consultations;
create trigger consultations_updated_at
  before update on public.consultations
  for each row execute procedure public.handle_consultation_updated_at();

-- ================================================================
-- SELESAI — semua tabel konsultasi sudah siap
-- ================================================================
