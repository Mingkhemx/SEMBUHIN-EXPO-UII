<div align="center">

<img src="frontend/public/gif_logo/logo.png" alt="Sembuhin Logo" width="120" />

# **SEMBUHIN**

### *Platform Ekosistem Kesehatan Digital Terintegrasi*

**Kesehatan & Kesejahteraan Hidup Luar Biasa**

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.x-0055FF?style=flat-square&logo=framer&logoColor=white)](https://framer.com/motion)
[![TanStack Router](https://img.shields.io/badge/TanStack_Router-1.168-FF4154?style=flat-square&logo=react&logoColor=white)](https://tanstack.com/router)

---

</div>

## 📋 Tentang Proyek

**Sembuhin** adalah platform ekosistem kesehatan digital holistik yang menggabungkan layanan konsultasi dokter berbasis AI, skrining kesehatan cerdas, rekam medis mandiri, komunitas pasien, dan edukasi kesehatan dalam satu portal terintegrasi. Dirancang dengan antarmuka modern dan profesional, Sembuhin memberikan pengalaman pengguna yang intuitif untuk seluruh kebutuhan kesehatan — fisik maupun mental.

---

## ✨ Fitur Utama

### 🏥 Pelayanan Kesehatan
| Fitur | Deskripsi |
|-------|-----------|
| **Konsultasi Dokter** | Temukan & buat janji dengan dokter spesialis terpercaya |
| **AI Symptom Triage** | Input gejala, AI mengklasifikasikan urgensi: darurat, perlu dokter, atau self-care |
| **Mental Health Care** | Screening PHQ-9 & GAD-7, modul CBT interaktif, video call AI therapist |
| **Cek Jantung** | Pantau detak jantung real-time terhubung dari HP |
| **Health Twin 3D** | Avatar digital twin tubuh dengan model anatomi 3D interaktif |
| **Dermatologi AI Scan** | Live camera + analisis AI real-time untuk kondisi kulit |
| **Mood Check** | Deteksi mood via kamera depan dengan analisis ekspresi wajah |
| **Rekam Medis Mandiri** | Riwayat konsultasi, lab & resep tersimpan, ekspor PDF kapan saja |
| **Komunitas Pasien** | Forum per kondisi medis, dimoderasi dokter, klaim divalidasi AI |
| **Resep Digital** | Visualisasi 3D molekul obat & riwayat resep |

### 📚 Edukasi Kesehatan
| Fitur | Deskripsi |
|-------|-----------|
| **Artikel Kesehatan** | Kumpulan riset dan artikel medis terpercaya dari dokter & ahli |
| **Tips Hidup Sehat** | Panduan nutrisi, checklist kebiasaan harian & tantangan mingguan |
| **Video Edukasi** | Konten visual interaktif dengan YouTube embed player |

### 🔧 Fitur Platform
- 🔐 **Login / Register** — Autentikasi dengan social login (Google, Apple)
- 🌐 **Multi-bahasa** — 7 bahasa: Indonesia, English, Melayu, 中文, 日本語, 한국어, العربية
- 💬 **Live Chat** — Chat widget dengan quick replies & typing indicator
- 🎨 **Aurora Background** — Animasi blob gradient yang dinamis
- 📱 **Fully Responsive** — Optimal di desktop, tablet, dan mobile

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| **Framework** | React 19.2 + TypeScript 5.8 |
| **Build Tool** | Vite 7.3 |
| **Routing** | TanStack Router 1.168 (file-based) |
| **Styling** | Tailwind CSS 4.2 + Tailwind Merge |
| **Animation** | Framer Motion 12.x |
| **3D Rendering** | Three.js + React Three Fiber + Drei |
| **UI Components** | Radix UI primitives + shadcn/ui |
| **Icons** | Lucide React |
| **Real-time** | Socket.IO Client |
| **Forms** | React Hook Form + Zod validation |
| **Linting** | ESLint 9 + Prettier |

---

## 🚀 Memulai

### Prasyarat
- **Node.js** >= 18.x
- **npm** >= 9.x

### Instalasi

```bash
# Clone repository
git clone https://github.com/migwara/web-sehat.git
cd web-sehat/frontend

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Aplikasi akan berjalan di **`http://localhost:8080`**

### Script Lainnya

```bash
# Build untuk production
npm run build

# Preview production build
npm run preview

# Linting
npm run lint

# Format code
npm run format
```

---

## 📁 Struktur Proyek

```
frontend/src/
├── components/
│   ├── ui/               # Komponen UI dasar (shadcn/ui)
│   ├── three/            # Komponen 3D (Three.js)
│   ├── AuroraBackground   # Animasi background gradient
│   ├── FloatingHealthIcons # Ikon kesehatan melayang
│   ├── Header            # Navbar dengan language selector
│   ├── Footer            # Footer website
│   ├── LiveChat          # Widget live chat
│   └── VoiceWave         # Visualisasi gelombang suara
├── routes/
│   ├── __root.tsx         # Root layout (Header + Footer + Aurora)
│   ├── beranda/           # Halaman utama + carousel RS
│   ├── auth/              # Login / Register (fullscreen)
│   ├── symptom-triage/    # AI Symptom Triage
│   ├── mental-health/     # Mental Health Care (PHQ-9, GAD-7, CBT, VC)
│   ├── mood-check/        # Mood Check via Kamera
│   ├── dermatologi/       # Dermatologi AI Scan (Live Camera)
│   ├── cek-jantung/       # Monitor Detak Jantung
│   ├── twin/              # Health Twin 3D
│   ├── rekam-medis/       # Rekam Medis Mandiri
│   ├── komunitas-pasien/  # Forum Komunitas Pasien
│   ├── artikel/           # Artikel Kesehatan
│   ├── tips-sehat/        # Tips Hidup Sehat
│   ├── video-edukasi/     # Video Edukasi
│   ├── dokter/            # Konsultasi Dokter
│   ├── konsul/            # Chatbot AI
│   ├── resep/             # Resep Digital
│   └── marketplace/       # Apotek Digital
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── styles.css             # Global styles + Tailwind config
├── router.tsx             # Router configuration
└── routeTree.gen.ts       # Auto-generated route tree
```

---

## 🎨 Design System

| Elemen | Spesifikasi |
|--------|-------------|
| **Font** | Inter (body) + Space Grotesk (display) |
| **Primary Color** | Sky Blue (`#0ea5e9`) |
| **Animation** | Fade + Blur (prinsip halus, tidak dramatis) |
| **Cards** | White bg + subtle borders + shadow-lg |
| **Background** | Aurora gradient blobs (animated) |
| **Icons** | Lucide React (line-style) |

---

## 📄 Lisensi

Proyek ini dikembangkan untuk keperluan akademis — **Kelompok 5 PSI (Pengembangan Sistem Informasi)**.

---

<div align="center">

## 👨‍💻 Developer

<br />

<img src="https://img.shields.io/badge/Fullstack_Developer-0EA5E9?style=for-the-badge&logo=github&logoColor=white" />

### **MigwaraDev**
#### *Muhammad Rifki Apreliant*

<br />

<img src="https://img.shields.io/badge/Kelompok_5-PSI-6366F1?style=for-the-badge" />

### **PSI — Pengembangan Sistem Informasi**

<br />

---

*Dibangun dengan ❤️ menggunakan React, TypeScript, dan teknologi modern lainnya.*

**© 2026 Sembuhin — MigwaraDev × Kelompok 5 PSI**

</div>
