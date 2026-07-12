import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Stethoscope,
  User2,
  FileText,
  Activity,
  Heart,
  Shield,
  Brain,
} from "lucide-react";
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
      {
        name: "description",
        content:
          "Symptom Orb 3D, marketplace obat, konsul dokter AI, Health Twin, dan resep holografik dalam satu platform.",
      },
      { property: "og:title", content: "Sembuhin — Kesehatan Holografik dengan AI 3D" },
      {
        property: "og:description",
        content: "Pengalaman kesehatan masa depan dengan visualisasi 3D dan AI.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { t } = useLanguage();
  const [contentIndex, setContentIndex] = useState(0);

  const rotationContent = (t("home.hero_rotation") as any[]) || [
    {
      topTitle: "Pendamping Setia",
      bottomTitle: "Fisik & Mental Anda",
      desc: "Platform ekosistem kesehatan holistik berskala penuh untuk mendampingi setiap keluhan fisik maupun mental Anda secara personal.",
    },
    {
      topTitle: "Akses Tanpa Antre:",
      bottomTitle: "Konsultasi Dokter Live",
      desc: "Bertanya langsung ke asisten AI cerdas kami atau mulai sesi darurat dengan Dokter spesialis secara live 24/7.",
    },
    {
      topTitle: "Navigasi Medis:",
      bottomTitle: "Cari RS Otomatis",
      desc: "Sistem geolokasi pintar kami akan merespons dan menemukan rumah sakit serta klinik terdekat dari lokasi Anda dalam hitungan detik.",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setContentIndex((prev) => (prev + 1) % rotationContent.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-32 pb-24">
      {/* HERO SECTION - MODERN CLEAN SAAS/CORPORATE LAYOUT */}
      <section className="relative px-4 pt-16 lg:pt-24 pb-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* LEFT SIDE - TEXT CONTENT */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col justify-center space-y-8"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 w-fit px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest">
              <Shield className="w-4 h-4" />
              {t("home.standard_badge")}
            </div>

            {/* Animated Content */}
            <div className="space-y-6 min-h-[240px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={contentIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.1]">
                      {rotationContent[contentIndex].topTitle.split(" ").map((word, i) => (
                        <span key={i}>
                          {i === rotationContent[contentIndex].topTitle.split(" ").length - 1 ? (
                            <span className="text-blue-600 dark:text-blue-500">{word}</span>
                          ) : (
                            word + " "
                          )}
                        </span>
                      ))}
                    </h1>
                    <h2 className="text-3xl sm:text-4xl font-bold text-muted-foreground leading-[1.2]">
                      {rotationContent[contentIndex].bottomTitle}
                    </h2>
                  </div>

                  <p className="text-lg text-muted-foreground/80 font-normal leading-relaxed max-w-lg">
                    {rotationContent[contentIndex].desc}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                to="/twin"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors duration-200"
              >
                <span className="flex items-center gap-2.5">
                  {t("home.start_btn")}
                  <ArrowRight className="h-5 w-5" />
                </span>
              </Link>
              <Link
                to="/konsul"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 rounded-xl transition-colors duration-200"
              >
                {t("home.ai_btn")}
              </Link>
            </div>
          </motion.div>

          {/* RIGHT SIDE - CLEAN MEDIA CONTAINER */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative h-full min-h-[400px] lg:min-h-[600px] w-full rounded-[2.5rem] overflow-hidden border border-border shadow-2xl bg-slate-900"
          >
            <video
              className="absolute inset-0 w-full h-full object-cover opacity-90"
              autoPlay
              muted
              loop
              playsInline
            >
              <source src="/hero-bg-medical.mp4" type="video/mp4" />
            </video>
            
            {/* Minimal overlay for text readability at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-900/90 to-transparent" />

            {/* Clean Stats Row at bottom of media */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
              <div className="grid grid-cols-3 gap-2 sm:gap-4 p-4 rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20">
                {[
                  { stat: "24/7", label: t("home.stats.ai_care") },
                  { stat: "1 Jam", label: t("home.stats.pharmacy") },
                  { stat: "100%", label: t("home.stats.records") },
                ].map((item, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-xl sm:text-2xl font-black text-white">
                      {item.stat}
                    </div>
                    <div className="text-[10px] sm:text-xs text-white/80 font-medium mt-1 uppercase tracking-wider">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURE BENTO GRID */}
      <section className="px-4 max-w-7xl mx-auto relative">
        <div className="relative z-10 mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 border border-sky-200 text-sky-600 text-xs font-bold uppercase tracking-widest mb-4">
            {t("home.pilar_badge")}
          </div>
          <h2 className="font-display text-4xl font-bold sm:text-5xl text-foreground tracking-tight">
            {t("home.pilar_title")}{" "}
            <span className="text-sky-600">
              {t("home.brand_name")}
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">
            {t("home.pilar_desc")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
          {/* Konsultasi Dokter */}
          <SpotlightCard to="/dokter" className="md:col-span-2" glowColor="#7cb8d8">
            <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-sky-300/8 blur-[100px] rounded-full group-hover:bg-sky-300/12 transition-all duration-700 pointer-events-none" />
            <div className="flex flex-col md:flex-row items-center justify-between w-full h-full gap-6">
              <div className="flex-1">
                <h3 className="font-display text-3xl font-bold text-foreground mb-3 transition-colors group-hover:text-sky-600">
                  {t("home.cards.consultation")}
                </h3>
                <p className="text-muted-foreground max-w-lg text-lg leading-relaxed">
                  {t("home.cards.consultation_desc")}
                </p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-600 transition-colors group-hover:text-sky-500">
                  {t("home.cards.consultation_btn")}{" "}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
              <div className="w-full md:w-1/3">
                <img
                  src="/images/konsul-dokter.png"
                  alt="Konsultasi Dokter"
                  className="w-full h-32 md:h-40 object-contain"
                />
              </div>
            </div>
          </SpotlightCard>

          {/* AI Symptom Triage */}
          <SpotlightCard to="/symptom-triage" glowColor="#fbbf24">
            <div className="flex flex-col h-full">
              <img
                src="/images/ai-sympton-triage.png"
                alt="AI Symptom Triage"
                className="w-full h-16 object-contain mb-4"
              />
              <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-amber-600">
                {t("home.cards.triage")}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-auto">
                {t("home.cards.triage_desc")}
              </p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-500/70 group-hover:text-amber-600 transition-colors">
                  {t("home.cards.triage_badge")}
                </span>
                <ArrowRight className="h-4 w-4 text-amber-500 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </SpotlightCard>

          {/* Mental Health Care */}
          <SpotlightCard to="/mental-health" className="md:col-span-2 flex-row" glowColor="#a78bfa">
            <div className="absolute left-0 bottom-0 w-64 h-64 bg-violet-300/8 blur-[80px] rounded-full group-hover:bg-violet-300/12 transition-all duration-700 pointer-events-none" />
            <div className="flex flex-col md:flex-row-reverse items-center justify-between w-full h-full gap-6">
              <div className="flex-1">
                <h3 className="font-display text-3xl font-bold text-foreground mb-3 transition-colors group-hover:text-violet-600">
                  {t("home.cards.mental")}
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed mb-6 max-w-lg">
                  {t("home.cards.mental_desc")}
                </p>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 transition-colors group-hover:text-violet-500">
                  {t("home.cards.mental_btn")}{" "}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
              <div className="w-full md:w-1/3">
                <img
                  src="/images/mental-heart.png"
                  alt="Mental Health Care"
                  className="w-full h-32 md:h-40 object-contain"
                />
              </div>
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* DOCTOR REGISTRATION SECTION */}
      <section className="px-4 max-w-7xl mx-auto mt-24 relative">
        <div className="relative z-10 mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 border border-sky-200 text-sky-600 text-xs font-bold uppercase tracking-widest mb-4">
            {t("home.doctor_badge")}
          </div>
          <h2 className="font-display text-3xl font-bold sm:text-5xl text-foreground tracking-tight">
            {t("home.doctor_title")}{" "}
            <span className="text-sky-600">
              {t("home.doctor_title_accent")}
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
            {t("home.doctor_desc")}
          </p>
        </div>
        <HospitalCarousel />
      </section>

      {/* TRUST SECTION */}
      <section className="px-4 py-12 relative">
        <div
          className="group max-w-6xl mx-auto glass-strong rounded-[3rem] p-12 border border-sky-100/40 shadow-lg relative overflow-hidden transition-all duration-700 hover:border-sky-200/60"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`);
            e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
          }}
        >
          <div
            className="pointer-events-none absolute -inset-px transition-opacity duration-500 opacity-0 group-hover:opacity-100 z-0"
            style={{
              background: `radial-gradient(circle 800px at var(--x) var(--y), rgba(100, 180, 220, 0.08), transparent 40%)`,
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
            style={{
              backgroundImage: `linear-gradient(rgba(100, 180, 220, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(100, 180, 220, 0.3) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="w-full h-32 bg-gradient-to-b from-transparent via-sky-300/[0.02] to-transparent -translate-y-full animate-[scanline_10s_linear_infinite]" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-md">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 border border-sky-200 text-sky-600 text-[10px] font-bold uppercase tracking-widest mb-6">
                {t("home.partner_badge")}
              </div>
              <h2 className="font-display text-4xl font-bold text-foreground mb-4 tracking-tight">
                {t("home.partner_title")}{" "}
                <span className="text-sky-600">{t("home.partner_title_accent")}</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {t("home.partner_desc")}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 p-4">
              {[
                { name: "RS1", icon: "/images/rs1.png" },
                { name: "RS2", icon: "/images/rs2.png" },
                { name: "RS3", icon: "/images/rs3.png" },
                { name: "RS4", icon: "/images/rs4.png" },
                { name: "RS5", icon: "/images/rs5.png" },
                { name: "RS6", icon: "/images/rs6.png" },
              ].map((partner) => (
                <div
                  key={partner.name}
                  className="group/logo flex items-center justify-center opacity-70 hover:opacity-100 transition-all duration-500 cursor-pointer"
                >
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
