import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, ShoppingBag, Stethoscope, User2, FileText, Activity, Heart, Shield, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SpotlightCard } from "./-SpotlightCard";
import { Pill3D } from "./-Pill3D";
import { HospitalCarousel } from "./-HospitalCarousel";
import { DoctorSection } from "./-DoctorSection";
import { BlogSection } from "./-BlogSection";
import { TestimonialSection } from "./-TestimonialSection";
import { LiveChat } from "@/components/LiveChat";

export const Route = createFileRoute("/beranda")({
  head: () => ({
    meta: [
      { title: "Sembuhin — Kesehatan Holografik dengan AI 3D" },
      { name: "description", content: "Symptom Orb 3D, marketplace obat, konsul dokter AI, Health Twin, dan resep holografik dalam satu platform." },
      { property: "og:title", content: "Sembuhin — Kesehatan Holografik dengan AI 3D" },
      { property: "og:description", content: "Pengalaman kesehatan masa depan dengan visualisasi 3D dan AI." },
    ],
  }),
  component: Index,
});

function Index() {
  const [contentIndex, setContentIndex] = useState(0);
  
  const rotationContent = [
    { topTitle: "Pendamping Setia", bottomTitle: "Fisik & Mental Anda", desc: "Platform ekosistem kesehatan holistik berskala penuh untuk mendampingi setiap keluhan fisik maupun mental Anda secara personal." },
    { topTitle: "Akses Tanpa Antre:", bottomTitle: "Konsultasi Dokter Live", desc: "Bertanya langsung ke asisten AI cerdas kami atau mulai sesi darurat dengan Dokter spesialis secara live 24/7." },
    { topTitle: "Navigasi Medis:", bottomTitle: "Cari RS Otomatis", desc: "Sistem geolokasi pintar kami akan merespons dan menemukan rumah sakit serta klinik terdekat dari lokasi Anda dalam hitungan detik." }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setContentIndex((prev) => (prev + 1) % rotationContent.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-32 pb-24">
      {/* HERO SECTION WITH VIDEO BACKGROUND */}
      <section className="relative w-screen left-1/2 right-1/2 -mx-[50vw] -mt-8 flex min-h-screen flex-col items-center justify-center pt-40 pb-24 text-center px-4 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-sky-300/30 via-blue-200/20 to-transparent blur-[100px] pointer-events-none z-[2]" />
        <div className="absolute -top-20 -right-32 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-cyan-300/25 via-sky-200/15 to-transparent blur-[90px] pointer-events-none z-[2]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-gradient-to-t from-sky-200/20 via-blue-100/10 to-transparent blur-[80px] pointer-events-none z-[2]" />

        {/* VIDEO BACKGROUND */}
        <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden" style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 75%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 75%, transparent 100%)' }}>
          <video
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto object-cover opacity-30 select-none pointer-events-none"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src="/hero-bg-medical.mp4" type="video/mp4" />
          </video>
          {/* Soft overlay to blend video with page */}
          <div className="absolute inset-0 bg-gradient-to-br from-sky-100/40 via-transparent to-blue-50/30 z-10" />
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="z-10 flex flex-col items-center max-w-4xl w-full text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 border border-sky-200 text-sky-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-10">
            <Sparkles className="h-3 w-3" /> Standard of Digital Care v4.0
          </div>

          <div className="min-h-[380px] sm:min-h-[320px] w-full flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div key={contentIndex} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.4, ease: "easeInOut" }} className="flex flex-col items-center w-full">
                <h1 className="font-display text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl text-foreground drop-shadow-xl text-center">
                  {rotationContent[contentIndex].topTitle} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-sky-400 to-blue-400 filter drop-shadow-[0_0_12px_rgba(100,180,220,0.2)] block mt-2 sm:mt-4 pb-2 leading-[1.2]">
                    {rotationContent[contentIndex].bottomTitle}
                  </span>
                </h1>
                <p className="mt-8 sm:mt-10 max-w-3xl text-lg sm:text-xl text-foreground/60 font-light leading-relaxed text-center px-4">
                  {rotationContent[contentIndex].desc}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5 w-full">
            <Link to="/twin" className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white px-10 py-4.5 text-sm font-bold shadow-lg shadow-sky-500/25 transition-all hover:scale-105 hover:shadow-sky-500/35 active:scale-95">
              Mulai Transformasi <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/konsul" className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl glass-strong hover:bg-white/80 text-foreground border border-sky-200/50 px-10 py-4.5 text-sm font-bold backdrop-blur-md transition-all hover:scale-105 hover:border-sky-300/60 active:scale-95">
              Konsultasi AI
            </Link>
          </div>

          <div className="mt-20 flex flex-wrap items-center justify-center gap-12 border-t border-border pt-10">
            {[["24/7", "AI Expert Care"], ["1 Jam", "Express Pharmacy"], ["100%", "Secure Digital Records"]].map(([v, l]) => (
              <div key={l} className="text-center">
                <div className="text-2xl font-bold text-foreground font-display mb-1">{v}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-sky-500/60 font-bold">{l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* GRADIENT DIVIDER */}
      <div className="relative w-screen left-1/2 right-1/2 -mx-[50vw] h-32 -mt-32 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-200/30 via-sky-100/15 to-transparent" />
      </div>

      {/* FEATURE BENTO GRID */}
      <section className="px-4 max-w-7xl mx-auto relative">
        <div className="absolute -top-40 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-sky-200/30 via-blue-100/20 to-transparent blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-20 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-cyan-200/25 via-sky-100/15 to-transparent blur-[70px] pointer-events-none" />

        <div className="relative z-10 mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 border border-sky-200 text-sky-600 text-xs font-bold uppercase tracking-widest mb-4">Ekosistem Kesehatan Smart</div>
          <h2 className="font-display text-4xl font-bold sm:text-5xl text-foreground tracking-tight">Empat Pilar <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-sky-400">Sembuhin</span></h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">Semua kebutuhan kesehatan kamu terintegrasi dalam satu portal holografik bertenaga AI dengan desain futuristik.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
          <SpotlightCard to="/twin" className="md:col-span-2" glowColor="#7cb8d8">
            <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-sky-300/8 blur-[100px] rounded-full group-hover:bg-sky-300/12 transition-all duration-700 pointer-events-none" />
            <div className="relative z-10 flex justify-between items-start mb-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 transition-all duration-500 group-hover:bg-sky-200 group-hover:text-sky-700 ring-1 ring-sky-200/50 group-hover:ring-sky-300/50"><User2 className="h-8 w-8" /></div>
              <div className="rounded-full bg-gradient-to-r from-sky-500 to-sky-400 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-md animate-pulse">Biometrik AI</div>
            </div>
            <div className="relative z-10 mt-auto">
              <h3 className="font-display text-3xl font-bold text-foreground mb-3 transition-colors group-hover:text-sky-600">Health Twin 3D</h3>
              <p className="text-muted-foreground max-w-lg text-lg leading-relaxed">Visualisasi organ tubuh real-time berdasarkan data biometrik Anda yang terhubung langsung dengan rekam medis pusat.</p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-600 transition-colors group-hover:text-sky-500">Akses Health Twin <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" /></div>
            </div>
            <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-30 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          </SpotlightCard>

          <SpotlightCard to="/konsul" glowColor="#7cb8d8">
            <div className="relative z-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 transition-all duration-500 group-hover:bg-sky-200 group-hover:text-sky-700 ring-1 ring-sky-200/50 group-hover:ring-sky-300/50 mb-6"><Stethoscope className="h-6 w-6" /></div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-2 group-hover:text-sky-600">Dokter AI 24/7</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Diagnosis awal & konsultasi instan dengan AI medis.</p>
            </div>
            <div className="relative z-10 mt-8 flex items-center justify-between">
               <span className="text-xs font-semibold uppercase tracking-wider text-sky-500/60 group-hover:text-sky-600 transition-colors">Virtual Care</span>
               <ArrowRight className="h-5 w-5 text-sky-500 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </SpotlightCard>

          <SpotlightCard to="/marketplace" glowColor="#7ec8a0">
            <div className="relative z-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 transition-all duration-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 ring-1 ring-emerald-200/50 group-hover:ring-emerald-300/50 mb-6"><ShoppingBag className="h-6 w-6" /></div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-2 group-hover:text-emerald-600">Apotek Digital</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Obat terverifikasi BPOM, dikirim cepat via drone.</p>
            </div>
            <div className="relative z-10 mt-8 flex items-center justify-between">
               <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500/60 group-hover:text-emerald-600 transition-colors">Farmasi</span>
               <ArrowRight className="h-5 w-5 text-emerald-500 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </SpotlightCard>

          <SpotlightCard to="/resep" className="md:col-span-2 flex-row" glowColor="#b8a0d8">
            <div className="absolute left-0 bottom-0 w-64 h-64 bg-purple-300/8 blur-[80px] rounded-full group-hover:bg-purple-300/12 transition-all duration-700 pointer-events-none" />
            <div className="flex flex-col md:flex-row items-center justify-between w-full h-full">
              <div className="relative z-10 flex-1 pr-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-purple-500 transition-all duration-500 group-hover:bg-purple-100 group-hover:text-purple-600 ring-1 ring-purple-200/50 group-hover:ring-purple-300/50 mb-8"><FileText className="h-8 w-8" /></div>
                <h3 className="font-display text-3xl font-bold text-foreground mb-3 transition-colors group-hover:text-purple-600">Resep Holografik</h3>
                <p className="text-muted-foreground text-lg leading-relaxed mb-6 max-w-lg">Manajemen resep digital interaktif. Lihat visualisasi 3D struktur molekul dari obat yang akan Anda konsumsi.</p>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-purple-500 transition-colors group-hover:text-purple-600">Akses Resep <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" /></div>
              </div>
              <div className="relative z-10 hidden md:flex w-56 h-56 items-center justify-center mt-8 md:mt-0 opacity-90 group-hover:opacity-100 transition-all duration-700 pointer-events-none perspective-[1200px]">
                 <Pill3D />
              </div>
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* GRADIENT DIVIDER BEFORE TRUST */}
      <div className="relative w-screen left-1/2 right-1/2 -mx-[50vw] h-0 pointer-events-none z-0">
        <div className="absolute top-[-100px] left-0 right-0 h-[200px] bg-gradient-to-b from-transparent via-sky-100/25 to-transparent" />
        <div className="absolute left-1/4 top-[-100px] w-[600px] h-[200px] rounded-full bg-cyan-200/20 blur-[80px]" />
      </div>

      {/* TRUST SECTION */}
      <section className="px-4 py-12 relative">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-gradient-to-r from-sky-200/20 via-blue-100/15 to-sky-200/20 blur-[70px]" />
        </div>
        <div className="group max-w-6xl mx-auto glass-strong rounded-[3rem] p-12 border border-sky-100/40 shadow-lg relative overflow-hidden transition-all duration-700 hover:border-sky-200/60"
          onMouseMove={(e) => { const rect = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`); e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`); }}>
          <div className="pointer-events-none absolute -inset-px transition-opacity duration-500 opacity-0 group-hover:opacity-100 z-0" style={{ background: `radial-gradient(circle 800px at var(--x) var(--y), rgba(100, 180, 220, 0.08), transparent 40%)` }} />
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: `linear-gradient(rgba(100, 180, 220, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(100, 180, 220, 0.3) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-300/6 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-300/6 blur-[120px] pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden"><div className="w-full h-32 bg-gradient-to-b from-transparent via-sky-300/[0.02] to-transparent -translate-y-full animate-[scanline_10s_linear_infinite]" /></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-md">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 border border-sky-200 text-sky-600 text-[10px] font-bold uppercase tracking-widest mb-6">Verified Partners</div>
              <h2 className="font-display text-4xl font-bold text-foreground mb-4 tracking-tight">Dipercayai oleh Jaringan <span className="text-sky-600">Medis Terkemuka</span></h2>
              <p className="text-muted-foreground text-lg leading-relaxed">Kami bekerja sama dengan rumah sakit dan laboratorium terbaik untuk memastikan akurasi diagnosis Anda.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 p-4">
              {[
                { name: "BioLife", icon: <Activity className="w-10 h-10 text-sky-500" /> },
                { name: "MedCore", icon: <Heart className="w-10 h-10 text-sky-600" /> },
                { name: "ApexHealth", icon: <Shield className="w-10 h-10 text-emerald-500" /> },
                { name: "VitalLab", icon: <Stethoscope className="w-10 h-10 text-purple-400" /> },
                { name: "GlobalSafe", icon: <Shield className="w-10 h-10 text-sky-400" /> },
                { name: "BioGen", icon: <Brain className="w-10 h-10 text-sky-500" /> }
              ].map(partner => (
                <div key={partner.name} className="group/logo flex flex-col items-center justify-center grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer">
                  <div className="relative mb-2">{partner.icon}<div className="absolute -inset-4 bg-sky-300/15 blur-xl opacity-0 group-hover/logo:opacity-100 transition-opacity pointer-events-none" /></div>
                  <span className="text-[10px] uppercase tracking-widest text-foreground/40 group-hover/logo:text-foreground/80 transition-colors font-bold">{partner.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOSPITALS SECTION */}
      <section className="px-4 max-w-7xl mx-auto mt-24 relative">
        <div className="absolute -top-32 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-sky-200/30 via-blue-100/15 to-transparent blur-[90px] pointer-events-none" />
        <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-cyan-200/25 via-sky-100/10 to-transparent blur-[80px] pointer-events-none" />
        <div className="relative z-10 mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 border border-sky-200 text-sky-600 text-xs font-bold uppercase tracking-widest mb-4">SEMBUHIN GRID</div>
          <h2 className="font-display text-3xl font-bold sm:text-5xl text-foreground tracking-tight">Cari Fasilitas <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-sky-400">Medis Terdekat</span></h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">Temukan rumah sakit dengan fasilitas teknologi robotik dan AI tercanggih di sekitar Anda untuk penanganan cepat dan presisi.</p>
        </div>
        <HospitalCarousel />
      </section>

      {/* DOCTOR SECTION */}
      <DoctorSection />

      {/* TESTIMONIALS */}
      <TestimonialSection />

      {/* BLOG & EDUCATION */}
      <BlogSection />

      {/* LIVE CHAT */}
      <LiveChat />
    </div>
  );
}
