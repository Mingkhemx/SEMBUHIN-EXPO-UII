-- ================================================================
-- STEP 1: Tabel doctor_registrations
-- ================================================================

create table if not exists public.doctor_registrations (
  id              uuid default gen_random_uuid() primary key,
  name            text not null,
  email           text not null,
  phone           text not null,
  specialty       text not null,
  license_number  text not null,
  hospital        text not null,
  experience_years text,
  status          text not null default 'pending'
                  check (status in ('pending', 'approved', 'rejected')),
  notes           text,
  reviewed_at     timestamptz,
  reviewed_by     uuid references auth.users(id),
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null
);

create index if not exists doctor_registrations_status_idx
  on public.doctor_registrations(status);

create index if not exists doctor_registrations_created_at_idx
  on public.doctor_registrations(created_at desc);

create index if not exists doctor_registrations_email_idx
  on public.doctor_registrations(email);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists doctor_registrations_updated_at on public.doctor_registrations;
create trigger doctor_registrations_updated_at
  before update on public.doctor_registrations
  for each row execute procedure public.handle_updated_at();

-- RLS doctor_registrations
alter table public.doctor_registrations enable row level security;

drop policy if exists "Anyone can register as doctor" on public.doctor_registrations;
create policy "Anyone can register as doctor"
  on public.doctor_registrations for insert
  with check (true);

drop policy if exists "Authenticated users can view registrations" on public.doctor_registrations;
create policy "Authenticated users can view registrations"
  on public.doctor_registrations for select
  using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can update registrations" on public.doctor_registrations;
create policy "Authenticated users can update registrations"
  on public.doctor_registrations for update
  using (auth.role() = 'authenticated');

-- ================================================================
-- STEP 2: Tabel doctors (dokter yang sudah diapprove)
-- Jika tabel sudah ada, tambahkan kolom yang kurang saja
-- ================================================================

create table if not exists public.doctors (
  id              uuid default gen_random_uuid() primary key,
  registration_id uuid,
  name            text not null,
  email           text not null,
  phone           text,
  specialty       text not null,
  license_number  text not null,
  hospital        text,
  experience_years text,
  avatar_url      text,
  rating          numeric(3,2) default 0,
  total_patients  integer default 0,
  is_active       boolean default true,
  joined_at       timestamptz default now() not null
);

-- Tambahkan kolom yang mungkin belum ada di tabel lama
alter table public.doctors add column if not exists registration_id uuid;
alter table public.doctors add column if not exists phone text;
alter table public.doctors add column if not exists license_number text;
alter table public.doctors add column if not exists hospital text;
alter table public.doctors add column if not exists experience_years text;
alter table public.doctors add column if not exists avatar_url text;
alter table public.doctors add column if not exists rating numeric(3,2) default 0;
alter table public.doctors add column if not exists total_patients integer default 0;
alter table public.doctors add column if not exists is_active boolean default true;
alter table public.doctors add column if not exists joined_at timestamptz default now();

create index if not exists doctors_specialty_idx on public.doctors(specialty);
create index if not exists doctors_is_active_idx on public.doctors(is_active);

-- RLS doctors
alter table public.doctors enable row level security;

drop policy if exists "Anyone can view active doctors" on public.doctors;
create policy "Anyone can view active doctors"
  on public.doctors for select
  using (is_active = true);

drop policy if exists "Authenticated can manage doctors" on public.doctors;
create policy "Authenticated can manage doctors"
  on public.doctors for all
  using (auth.role() = 'authenticated');

-- ================================================================
-- SELESAI
-- ================================================================
