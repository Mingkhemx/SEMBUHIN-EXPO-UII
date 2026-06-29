import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, ShoppingBag, Stethoscope, User2, FileText, Activity, Heart, Shield, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SpotlightCard } from "./-SpotlightCard";
import { HospitalCarousel } from "./-HospitalCarousel";
import { DoctorSection } from "./-DoctorSection";
import { BlogSection } from "./-BlogSection";
import { TestimonialSection } from "./-TestimonialSection";
import { LiveChat } from "@/components/LiveChat";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();
  const [contentIndex, setContentIndex] = useState(0);
  
  const rotationContent = t("home.hero_rotation") as any[] || [
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
              {t("home.start_btn")} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/konsul" className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl glass-strong hover:bg-white/80 text-foreground border border-sky-200/50 px-10 py-4.5 text-sm font-bold backdrop-blur-md transition-all hover:scale-105 hover:border-sky-300/60 active:scale-95">
              {t("home.ai_btn")}
            </Link>
          </div>

          <div className="mt-20 flex flex-wrap items-center justify-center gap-12 border-t border-border pt-10">
            {[[t("home.stats.ai_care"), "24/7"], [t("home.stats.pharmacy"), "1 Jam"], [t("home.stats.records"), "100%"]].map(([l, v]) => (
              <div key={l} className="text-center">
                <div className="text-2xl font-bold text-foreground font-display mb-1">{v}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-sky-500/60 font-bold">{l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* FEATURE BENTO GRID */}
      <section className="px-4 max-w-7xl mx-auto relative">
        <div className="relative z-10 mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 border border-sky-200 text-sky-600 text-xs font-bold uppercase tracking-widest mb-4">{t("home.pilar_badge")}</div>
          <h2 className="font-display text-4xl font-bold sm:text-5xl text-foreground tracking-tight">{t("home.pilar_title")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-sky-400">Sembuhin</span></h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">{t("home.pilar_desc")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
          {/* Konsultasi Dokter */}
          <SpotlightCard to="/dokter" className="md:col-span-2" glowColor="#7cb8d8">
            <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-sky-300/8 blur-[100px] rounded-full group-hover:bg-sky-300/12 transition-all duration-700 pointer-events-none" />
            <div className="flex flex-col md:flex-row items-center justify-between w-full h-full gap-6">
              <div className="flex-1">
                <h3 className="font-display text-3xl font-bold text-foreground mb-3 transition-colors group-hover:text-sky-600">{t("home.cards.consultation")}</h3>
                <p className="text-muted-foreground max-w-lg text-lg leading-relaxed">{t("home.cards.consultation_desc")}</p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-600 transition-colors group-hover:text-sky-500">{t("home.cards.consultation_btn")} <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" /></div>
              </div>
              <div className="w-full md:w-1/3">
                <img src="/images/konsul-dokter.png" alt="Konsultasi Dokter" className="w-full h-32 md:h-40 object-contain" />
              </div>
            </div>
          </SpotlightCard>

          {/* Cek Jantung */}
          <SpotlightCard to="/cek-jantung" glowColor="#f87171">
            <div className="flex flex-col h-full">
              <img src="/images/cek-jantung.png" alt="Cek Jantung" className="w-full h-16 object-contain mb-4" />
              <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-rose-600">{t("home.cards.heart")}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-auto">{t("home.cards.heart_desc")}</p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-500/70 group-hover:text-rose-600 transition-colors">Heart Care</span>
                <ArrowRight className="h-4 w-4 text-rose-500 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </SpotlightCard>

          {/* AI Symptom Triage */}
          <SpotlightCard to="/symptom-triage" glowColor="#fbbf24">
            <div className="flex flex-col h-full">
              <img src="/images/ai-sympton-triage.png" alt="AI Symptom Triage" className="w-full h-16 object-contain mb-4" />
              <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-amber-600">{t("home.cards.triage")}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-auto">{t("home.cards.triage_desc")}</p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-500/70 group-hover:text-amber-600 transition-colors">Symptom Check</span>
                <ArrowRight className="h-4 w-4 text-amber-500 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </SpotlightCard>

          {/* Mental Health Care */}
          <SpotlightCard to="/mental-health" className="md:col-span-2 flex-row" glowColor="#a78bfa">
            <div className="absolute left-0 bottom-0 w-64 h-64 bg-violet-300/8 blur-[80px] rounded-full group-hover:bg-violet-300/12 transition-all duration-700 pointer-events-none" />
            <div className="flex flex-col md:flex-row-reverse items-center justify-between w-full h-full gap-6">
              <div className="flex-1">
                <h3 className="font-display text-3xl font-bold text-foreground mb-3 transition-colors group-hover:text-violet-600">{t("home.cards.mental")}</h3>
                <p className="text-muted-foreground text-lg leading-relaxed mb-6 max-w-lg">{t("home.cards.mental_desc")}</p>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 transition-colors group-hover:text-violet-500">{t("home.cards.mental_btn")} <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" /></div>
              </div>
              <div className="w-full md:w-1/3">
                <img src="/images/mental-heart.png" alt="Mental Health Care" className="w-full h-32 md:h-40 object-contain" />
              </div>
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* DOCTOR REGISTRATION SECTION */}
      <section className="px-4 max-w-7xl mx-auto mt-24 relative">
        <div className="relative z-10 mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 border border-sky-200 text-sky-600 text-xs font-bold uppercase tracking-widest mb-4">{t("home.doctor_badge")}</div>
          <h2 className="font-display text-3xl font-bold sm:text-5xl text-foreground tracking-tight">{t("home.doctor_title")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-sky-400">{t("home.doctor_title_accent")}</span></h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">{t("home.doctor_desc")}</p>
        </div>
        <HospitalCarousel />
      </section>

      {/* TRUST SECTION */}
      <section className="px-4 py-12 relative">
        <div className="group max-w-6xl mx-auto glass-strong rounded-[3rem] p-12 border border-sky-100/40 shadow-lg relative overflow-hidden transition-all duration-700 hover:border-sky-200/60"
          onMouseMove={(e) => { const rect = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`); e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`); }}>
          <div className="pointer-events-none absolute -inset-px transition-opacity duration-500 opacity-0 group-hover:opacity-100 z-0" style={{ background: `radial-gradient(circle 800px at var(--x) var(--y), rgba(100, 180, 220, 0.08), transparent 40%)` }} />
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: `linear-gradient(rgba(100, 180, 220, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(100, 180, 220, 0.3) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden"><div className="w-full h-32 bg-gradient-to-b from-transparent via-sky-300/[0.02] to-transparent -translate-y-full animate-[scanline_10s_linear_infinite]" /></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-md">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 border border-sky-200 text-sky-600 text-[10px] font-bold uppercase tracking-widest mb-6">{t("home.partner_badge")}</div>
              <h2 className="font-display text-4xl font-bold text-foreground mb-4 tracking-tight">{t("home.partner_title")} <span className="text-sky-600">{t("home.partner_title_accent")}</span></h2>
              <p className="text-muted-foreground text-lg leading-relaxed">{t("home.partner_desc")}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 p-4">
              {[
                { name: "RS1", icon: "/images/rs1.png" },
                { name: "RS2", icon: "/images/rs2.png" },
                { name: "RS3", icon: "/images/rs3.png" },
                { name: "RS4", icon: "/images/rs4.png" },
                { name: "RS5", icon: "/images/rs5.png" },
                { name: "RS6", icon: "/images/rs6.png" }
              ].map(partner => (
                <div key={partner.name} className="group/logo flex items-center justify-center opacity-70 hover:opacity-100 transition-all duration-500 cursor-pointer">
                  <img src={partner.icon} alt={partner.name} className="w-32 h-28 object-contain" />
                </div>
              ))}
            </div>
          </div>
        </div>
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
