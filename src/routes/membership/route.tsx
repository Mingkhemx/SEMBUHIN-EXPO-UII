import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Crown,
  ScanLine,
  HeartPulse,
  Smile,
  MessageCircle,
  AlertTriangle,
  Zap,
  Lock,
  UserPlus,
  Star,
  Shield,
  Sparkles,
  Brain,
  Activity,
  ChevronDown,
  ChevronUp,
  Infinity,
  BadgeCheck,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { title: "Membership Premium — Sembuhin" },
      {
        name: "description",
        content: "Dapatkan akses penuh ke semua fitur AI premium Sembuhin.",
      },
    ],
  }),
  component: MembershipPage,
});

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    free: false,
    icon: <ScanLine className="h-5 w-5" />,
    title: "Dermatologi AI Scan",
    desc: "Scan kulit & dapatkan pre-screening dari AI",
  },
  {
    free: false,
    icon: <HeartPulse className="h-5 w-5" />,
    title: "Cek Jantung Real-time",
    desc: "Pantau detak jantung langsung dari kamera",
  },
  {
    free: false,
    icon: <Smile className="h-5 w-5" />,
    title: "Mood Check AI",
    desc: "Analisis ekspresi wajah untuk kondisi emosional",
  },
  {
    free: false,
    icon: <MessageCircle className="h-5 w-5" />,
    title: "Chatbot AI Unlimited",
    desc: "Konsultasi tanpa batas, tanpa reset harian",
  },
  {
    free: false,
    icon: <AlertTriangle className="h-5 w-5" />,
    title: "AI Symptom Triage",
    desc: "Klasifikasi urgensi gejala secara otomatis",
  },
  {
    free: true,
    icon: <UserPlus className="h-5 w-5" />,
    title: "Konsultasi Dokter",
    desc: "Buat janji dengan dokter spesialis",
  },
  {
    free: false,
    icon: <Brain className="h-5 w-5" />,
    title: "Mental Health Modul CBT",
    desc: "Terapi mandiri berbasis AI & psikolog",
  },
  {
    free: false,
    icon: <Zap className="h-5 w-5" />,
    title: "Priority Support 24/7",
    desc: "Respons cepat dari tim medis kami",
  },
];

const TESTIMONIALS = [
  {
    name: "Anisa Rahma",
    role: "Pengguna Premium · 8 bulan",
    avatar: "https://i.pravatar.cc/100?img=47",
    rating: 5,
    text: "Fitur cek jantung real-time benar-benar membantu saya memantau kondisi setelah operasi. Sangat worth it!",
  },
  {
    name: "Bima Ardiansyah",
    role: "Pengguna Premium · 5 bulan",
    avatar: "https://i.pravatar.cc/100?img=12",
    rating: 5,
    text: "Chatbot AI-nya sangat membantu, bisa konsultasi kapan saja tanpa khawatir batasan. Pelayanannya top!",
  },
  {
    name: "Dewi Kartika",
    role: "Pengguna Premium · 1 tahun",
    avatar: "https://i.pravatar.cc/100?img=32",
    rating: 5,
    text: "Dermatologi AI scan akurat, hemat waktu ke klinik untuk masalah kulit ringan. Sangat direkomendasikan!",
  },
];

const FAQS = [
  {
    q: "Apakah saya bisa membatalkan kapan saja?",
    a: "Ya, Anda dapat membatalkan langganan kapan saja tanpa biaya tambahan. Akses premium tetap aktif hingga akhir periode tagihan.",
  },
  {
    q: "Metode pembayaran apa yang tersedia?",
    a: "Kami menerima transfer bank, kartu kredit/debit, GoPay, OVO, Dana, dan ShopeePay.",
  },
  {
    q: "Apakah ada jaminan uang kembali?",
    a: "Ya! Kami memberikan garansi 7 hari uang kembali jika Anda tidak puas dengan layanan premium kami.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

function MembershipPage() {
  const navigate = useNavigate();
  const { user, isPremium, upgradeToPremium } = useAuth();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const monthlyPrice = 49000;
  const yearlyPrice = Math.round(monthlyPrice * 12 * 0.75);
  const displayPrice = billing === "monthly" ? monthlyPrice : Math.round(yearlyPrice / 12);

  const formatRp = (n: number) => new Intl.NumberFormat("id-ID").format(n);

  return (
    <div className="relative min-h-screen pb-24">
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center pt-6 pb-14 px-4"
      >
        {/* Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200/80 px-5 py-2 mb-6 shadow-sm"
        >
          <Crown className="h-4 w-4 text-amber-500" />
          <span className="text-xs font-bold text-amber-700 tracking-widest uppercase">
            Premium Benefits
          </span>
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
        </motion.div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
          Tingkatkan Perjalanan
          <br />
          <span className="bg-gradient-to-r from-sky-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
            Kesehatanmu
          </span>
        </h1>
        <p className="text-base text-slate-600 max-w-xl mx-auto mb-8">
          Akses penuh ke semua fitur AI premium, konsultasi dokter, dan layanan eksklusif Sembuhin —
          tanpa batas.
        </p>

        {/* Trust stats */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
          {[
            {
              icon: <BadgeCheck className="h-4 w-4 text-sky-500" />,
              label: "50.000+ Pengguna Aktif",
            },
            { icon: <Shield className="h-4 w-4 text-emerald-500" />, label: "Terenkripsi & Aman" },
            { icon: <Activity className="h-4 w-4 text-rose-500" />, label: "99.9% Uptime" },
          ].map((s) => (
            <span
              key={s.label}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600"
            >
              {s.icon}
              {s.label}
            </span>
          ))}
        </div>

        {/* Billing toggle */}
        <div className="inline-flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm gap-1">
          <button
            onClick={() => setBilling("monthly")}
            className={cn(
              "px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200",
              billing === "monthly"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/30"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            Bulanan
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={cn(
              "px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2",
              billing === "yearly"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/30"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            Tahunan
            <span
              className={cn(
                "text-[10px] font-extrabold px-1.5 py-0.5 rounded-md",
                billing === "yearly" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700",
              )}
            >
              -25%
            </span>
          </button>
        </div>
      </motion.div>

      {/* ── PRICING CARDS ────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2 max-w-5xl mx-auto px-4 mb-20">
        {/* FREE CARD */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl bg-white border border-slate-200 p-8 shadow-lg shadow-slate-100/60 flex flex-col"
        >
          <div className="mb-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Gratis
            </span>
            <h2 className="text-2xl font-extrabold text-slate-800 mt-1 mb-3">Free</h2>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-slate-900">Rp 0</span>
              <span className="text-slate-400 font-medium">/bulan</span>
            </div>
            <p className="mt-2 text-sm text-slate-500">Untuk pengguna baru, selamanya gratis</p>
          </div>

          <ul className="space-y-3.5 flex-1 mb-8">
            {FEATURES.map((f, i) => (
              <li key={i} className="flex items-center gap-3">
                {f.free ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                ) : (
                  <Lock className="h-5 w-5 text-slate-300 flex-shrink-0" />
                )}
                <span
                  className={cn(
                    "text-sm",
                    f.free ? "text-slate-700 font-medium" : "text-slate-400",
                  )}
                >
                  {f.title}
                </span>
              </li>
            ))}
          </ul>

          <button
            disabled
            className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 py-3.5 text-sm font-bold text-slate-400 cursor-not-allowed"
          >
            Plan Saat Ini
          </button>
        </motion.div>

        {/* PREMIUM CARD — dark luxury */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="relative"
        >
          {/* Glow behind card */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-sky-400 via-cyan-500 to-indigo-600 blur-2xl opacity-30 scale-105 -z-10" />

          {/* "Paling Populer" badge */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-400 px-5 py-2 rounded-full shadow-lg shadow-amber-400/40"
            >
              <Rocket className="h-3.5 w-3.5 text-white" />
              <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                Paling Populer
              </span>
            </motion.div>
          </div>

          {/* Card body — dark */}
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950 p-8 h-full flex flex-col overflow-hidden relative">
            {/* Subtle shimmer overlay */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse at 30% 0%, rgba(56,189,248,0.6) 0%, transparent 60%), radial-gradient(ellipse at 80% 90%, rgba(99,102,241,0.5) 0%, transparent 60%)",
              }}
            />

            {/* Floating orbs */}
            <motion.div
              animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-8 right-8 h-32 w-32 rounded-full bg-sky-400/10 blur-2xl pointer-events-none"
            />
            <motion.div
              animate={{ x: [0, -15, 0], y: [0, 20, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-12 left-8 h-24 w-24 rounded-full bg-indigo-400/10 blur-2xl pointer-events-none"
            />

            {/* Header */}
            <div className="relative mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">
                  Eksklusif
                </span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-2xl font-extrabold text-white">Premium</h2>
                <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 shadow-lg shadow-amber-500/40">
                  <Crown className="h-4 w-4 text-white" />
                </div>
              </div>

              <div className="flex items-baseline gap-1">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={displayPrice}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="text-4xl font-extrabold text-white"
                  >
                    Rp {formatRp(displayPrice)}
                  </motion.span>
                </AnimatePresence>
                <span className="text-sky-300/70 font-medium">/bulan</span>
              </div>

              {billing === "yearly" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 text-xs text-emerald-400 font-semibold"
                >
                  Hemat Rp {formatRp(monthlyPrice * 12 - yearlyPrice)}/tahun 🎉
                </motion.p>
              )}
              <p className="mt-1.5 text-sm text-sky-200/60">
                {billing === "yearly"
                  ? `Ditagih Rp ${formatRp(yearlyPrice)}/tahun`
                  : "Semua fitur, tanpa batas!"}
              </p>
            </div>

            {/* Feature list */}
            <ul className="space-y-3 flex-1 relative mb-8">
              {FEATURES.map((f, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <div className="h-5 w-5 rounded-full bg-sky-400/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-sky-400" />
                  </div>
                  <span className="text-sm text-white/85 font-medium">{f.title}</span>
                </motion.li>
              ))}
              {/* Extra premium perks */}
              <motion.li
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-3"
              >
                <div className="h-5 w-5 rounded-full bg-amber-400/20 flex items-center justify-center flex-shrink-0">
                  <Infinity className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <span className="text-sm text-amber-300 font-semibold">
                  Akses Seumur Hidup (jika tahunan)
                </span>
              </motion.li>
            </ul>

            {/* CTA Button */}
            <div className="relative">
              {isPremium ? (
                <button
                  disabled
                  className="w-full rounded-2xl bg-emerald-500/20 border border-emerald-500/30 py-4 text-sm font-bold text-emerald-400"
                >
                  ✓ Kamu Sudah Premium! 🎉
                </button>
              ) : user ? (
                <motion.button
                  onClick={upgradeToPremium}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 py-4 text-sm font-extrabold text-white shadow-xl shadow-cyan-500/40 transition-all duration-200"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="relative flex items-center justify-center gap-2">
                    <Rocket className="h-4 w-4" />
                    Upgrade Sekarang
                  </span>
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => navigate({ to: "/auth" })}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 py-4 text-sm font-extrabold text-white shadow-xl shadow-cyan-500/40 transition-all duration-200"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="relative flex items-center justify-center gap-2">
                    <Crown className="h-4 w-4" />
                    Login & Upgrade Sekarang
                  </span>
                </motion.button>
              )}

              <p className="mt-3 text-center text-[11px] text-sky-300/50">
                Garansi uang kembali 7 hari · Batalkan kapan saja
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-5xl mx-auto px-4 mb-20"
      >
        <div className="text-center mb-10">
          <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Dipercaya Ribuan Pengguna</h2>
          <p className="text-sm text-slate-500">Apa kata mereka tentang Sembuhin Premium</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md shadow-slate-100/60"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="h-9 w-9 rounded-full object-cover border-2 border-sky-100"
                />
                <div>
                  <p className="text-sm font-bold text-slate-800">{t.name}</p>
                  <p className="text-[11px] text-slate-400">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="max-w-2xl mx-auto px-4 mb-20"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Pertanyaan Umum</h2>
          <p className="text-sm text-slate-500">Semua yang perlu Anda tahu tentang Premium</p>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm font-bold text-slate-800">{faq.q}</span>
                {openFaq === i ? (
                  <ChevronUp className="h-4 w-4 text-sky-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                )}
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── BOTTOM CTA ───────────────────────────────────────────────── */}
      {!isPremium && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-2xl mx-auto px-4 text-center"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950 p-10 shadow-2xl shadow-sky-900/30">
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse at 50% 0%, rgba(56,189,248,0.8) 0%, transparent 60%)",
              }}
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-0 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full bg-sky-400 blur-3xl pointer-events-none"
            />
            <div className="relative">
              <Crown className="h-10 w-10 text-amber-400 mx-auto mb-4" />
              <h3 className="text-2xl font-extrabold text-white mb-2">
                Mulai Perjalanan Premium Anda
              </h3>
              <p className="text-sm text-sky-200/60 mb-6">
                Bergabunglah dengan 50.000+ pengguna yang sudah merasakan manfaat Sembuhin Premium
              </p>
              <motion.button
                onClick={() => (user ? upgradeToPremium() : navigate({ to: "/auth" }))}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 px-8 py-4 text-sm font-extrabold text-white shadow-xl shadow-cyan-500/40"
              >
                <Sparkles className="h-4 w-4" />
                {user ? "Upgrade ke Premium" : "Mulai Sekarang — Gratis"}
              </motion.button>
              <p className="mt-3 text-[11px] text-sky-300/40">
                Tidak ada kartu kredit yang diperlukan
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
