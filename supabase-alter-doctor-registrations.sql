-- ================================================================
-- ALTER: Tambah kolom baru ke tabel doctor_registrations yang sudah ada
-- Paste & Run di Supabase SQL Editor
-- ================================================================

-- Data diri tambahan
alter table public.doctor_registrations
  add column if not exists nik              text,
  add column if not exists birth_date       date,
  add column if not exists gender           text,
  add column if not exists address          text,
  -- Data profesional tambahan
  add column if not exists sip              text,
  add column if not exists practice_location text,
  add column if not exists practice_address text,
  -- Dokumen paths (private storage — bukan URL publik)
  add column if not exists ktp_path         text,
  add column if not exists str_path         text,
  add column if not exists sip_path         text,
  add column if not exists diploma_path     text,
  add column if not exists cv_path          text;

-- Hapus NOT NULL constraint dari kolom hospital
-- (form baru pakai practice_location, hospital diisi dari sana)
alter table public.doctor_registrations
  alter column hospital drop not null;

-- Ubah experience_years jadi integer (kalau sebelumnya text)
do $$
begin
  if (select data_type from information_schema.columns
      where table_name = 'doctor_registrations'
      and column_name = 'experience_years') = 'text' then
    alter table public.doctor_registrations
      alter column experience_years type integer using (nullif(experience_years, '')::integer);
  end if;
exception when others then
  null;
end;
$$;

-- ================================================================
-- SELESAI — coba kirim pendaftaran lagi
-- ================================================================
