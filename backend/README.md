# Sembuhin Backend

Backend Flask untuk aplikasi Sembuhin, dengan integrasi Supabase untuk database.

## Struktur Folder

```
backend/
├── app.py              # Main Flask application
├── requirements.txt    # Dependencies
├── .env.example       # Environment variables template
├── schema.sql         # Database schema
└── tmp/              # Temporary files (auto-created)
```

## Setup

### 1. Instal Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Konfigurasi Environment

Copy `.env.example` ke `.env` dan isi dengan kredensial Supabase Anda:

```bash
cp .env.example .env
```

Edit `.env`:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
FLASK_ENV=development
```

### 3. Setup Database di Supabase

Buka SQL Editor di Supabase dan jalankan file `schema.sql` secara lengkap.

## Menjalankan Server

```bash
python app.py
```

Server akan berjalan di `http://localhost:5001`

## API Endpoints

### 1. Doctor Registration
- **POST** `/api/doctor-registration` - Submit pendaftaran dokter baru

### 2. Admin Panel
- **GET** `/api/admin/doctor-registrations` - Ambil semua pendaftaran
- **PUT** `/api/admin/doctor-registrations/<id>` - Update status pendaftaran
- **POST** `/api/admin/sql` - Eksekusi SQL query (untuk SQL Editor)

### 3. Health Check
- **GET** `/api/health` - Cek status server dan koneksi Supabase

### 4. Face Analysis (existing)
- **POST** `/analyze` - Analisis wajah dengan DeepFace

## Catatan Keamanan

⚠️ **Penting**:
1. Gunakan `SUPABASE_SERVICE_KEY` hanya di backend, JANGAN pernah expose di frontend
2. Batasi akses ke endpoint admin dengan autentikasi di produksi
3. RPC function `execute_sql` sebaiknya dibatasi di produksi
