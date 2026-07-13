import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Check,
  Loader2,
  ArrowRight,
  ScanLine,
  Heart,
  Brain,
  Zap,
  Stethoscope,
  Shield,
  Microscope,
  Pill,
  Home,
  ChevronDown,
  Star,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";


export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { title: "Premium — Sembuhin" },
      { name: "description", content: "Akses penuh ke semua fitur AI kesehatan Sembuhin." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    status: (search.status as string) || undefined,
  }),
  component: MembershipPage,
});

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: ScanLine,
    title: "Dermatologi AI Scan",
    desc: "Pre-screening kondisi kulit berbasis AI sebelum ke dermatologis",
    free: false,
  },
  {
    icon: Heart,
    title: "Cek Jantung Real-time",
    desc: "Pantau detak jantung langsung dari kamera smartphone",
    free: false,
  },
  {
    icon: Brain,
    title: "Mental Health Care",
    desc: "Screening PHQ-9, CBT interaktif, dan video call AI therapist",
    free: false,
  },
  {
    icon: Zap,
    title: "Chatbot AI Unlimited",
    desc: "Konsultasi tanpa batas harian dengan Dr. Sembuhin AI",
    free: false,
  },
  {
    icon: Stethoscope,
    title: "Konsultasi Dokter",
    desc: "Buat janji dengan dokter spesialis",
    free: true,
  },
  {
    icon: Shield,
    title: "Priority Support 24/7",
    desc: "Respons prioritas dari tim medis kami",
    free: false,
  },
];

// ─── Subcomponents ────────────────────────────────────────────────────────────

function FaqItem({
  faq,
  index,
  open,
  onToggle,
}: {
  faq: { q: string; a: string };
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-6 py-5 text-left group"
      >
        <span
          className={cn(
            "text-[15px] font-medium transition-colors",
            open ? "text-slate-900" : "text-slate-700 group-hover:text-slate-900",
          )}
        >
          {faq.q}
        </span>
        <span
          className={cn(
            "flex-shrink-0 h-6 w-6 rounded-full border flex items-center justify-center transition-all duration-200",
            open
              ? "border-slate-900 bg-slate-900 text-white rotate-180"
              : "border-slate-200 text-slate-400 group-hover:border-slate-400",
          )}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key={index}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-slate-500 leading-relaxed">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function MembershipPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { user, isPremium, upgradeToPremium } = useAuth();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  // Show success page if ?status=success or after payment
  const [isSuccess, setIsSuccess] = useState(search.status === "success" || isPremium);

  const monthlyPrice = 49000;
  const yearlyMonthly = Math.round(monthlyPrice * 0.75);
  const yearlyTotal = yearlyMonthly * 12;
  const price = billing === "monthly" ? monthlyPrice : yearlyMonthly;
  const fmt = (n: number) => new Intl.NumberFormat("id-ID").format(n);
  const savings = monthlyPrice * 12 - yearlyTotal;

  // Stats display (statis untuk marketing page)
  const stats = { total: "50K+", konsultasi: "30K+", lab: "5K+", resep: "15K+" };

  useEffect(() => {
    // Handle Midtrans redirect callback: ?status=success
    if (search.status === "success") {
      upgradeToPremium();
      setIsSuccess(true);
    }
  }, [search.status]);

  useEffect(() => {
    const key = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "";
    const isSandbox = (import.meta.env.VITE_MIDTRANS_ENV || "sandbox") !== "production";
    const src = isSandbox
      ? "https://app.sandbox.midtrans.com/snap/snap.js"
      : "https://app.midtrans.com/snap/snap.js";
    const el = document.createElement("script");
    el.src = src;
    el.setAttribute("data-client-key", key);
    el.async = true;
    document.body.appendChild(el);
    return () => {
      try {
        document.body.removeChild(el);
      } catch {}
    };
  }, []);

  const handleUpgrade = async () => {
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    setIsProcessing(true);
    try {
      console.log("🔵 [Midtrans] Starting payment...");
      
      // Panggil backend langsung (Vercel/Railway)
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://sembuhin-expo-uii-production.up.railway.app";
      
      console.log("🌐 Calling:", `${backendUrl}/api/payment/membership`);
      
      const response = await fetch(`${backendUrl}/api/payment/membership`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || "Pengguna Sembuhin",
          amount: billing === "monthly" ? monthlyPrice : yearlyTotal,
        }),
      });

      const data = await response.json();
      console.log("📨 Backend response:", data);

      if (!response.ok || !data?.token) {
        throw new Error(data?.error || "Gagal membuat token pembayaran");
      }

      // Buka Midtrans Snap
      if ((window as any).snap) {
        console.log("🎯 Opening Midtrans Snap...");
        (window as any).snap.pay(data.token, {
          onSuccess: () => {
            console.log("✅ Payment successful!");
            upgradeToPremium();
            setIsSuccess(true);
            toast.success("Selamat datang di Sembuhin Premium! 🎉");
          },
          onPending: () => {
            console.log("⏳ Payment pending...");
            toast.info("Menunggu konfirmasi pembayaran...");
          },
          onError: () => {
            console.error("❌ Payment error");
            toast.error("Pembayaran gagal. Silakan coba lagi.");
          },
          onClose: () => {
            console.log("🚪 Midtrans popup closed");
            setIsProcessing(false);
          },
        });
      } else if (data?.redirect_url) {
        console.log("🔄 Redirect ke:", data.redirect_url);
        window.location.href = data.redirect_url;
      } else {
        throw new Error("Midtrans snap.js tidak ter-load");
      }
    } catch (err: any) {
      console.error("❌ Error:", err.message);
      toast.error(err.message || "Koneksi gagal. Coba lagi.");
      setIsProcessing(false);
    }
  };

  // ─── SUCCESS PAGE ────────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-lg w-full"
        >
          {/* Success icon with animation */}
          <div className="relative mb-8 flex justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              className="w-28 h-28 rounded-full bg-emerald-100 flex items-center justify-center shadow-lg"
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
              >
                <Check className="w-14 h-14 text-emerald-600 stroke-[2.5]" />
              </motion.div>
            </motion.div>
            {/* Floating stars */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.15 }}
                className={cn(
                  "absolute",
                  i === 0 && "-top-1 right-16",
                  i === 1 && "top-6 right-6",
                  i === 2 && "-top-3 left-16",
                )}
              >
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              </motion.div>
            ))}
          </div>

          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-center space-y-3 mb-8"
          >
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Pembelian Berhasil! 🎉
            </h1>
            <p className="text-slate-600 text-base leading-relaxed">
              Selamat! Kamu sekarang sudah menjadi anggota{" "}
              <span className="font-bold text-sky-600">Sembuhin Premium</span>. Nikmati semua
              fitur AI kesehatan tanpa batas.
            </p>
          </motion.div>

          {/* Payment Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-lg"
          >
            <div className="space-y-5">
              {/* Card Info */}
              <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
                <div className="h-10 w-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Metode Pembayaran</p>
                  <p className="text-sm font-bold text-slate-900">Mastercard</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
              </div>

              {/* Payment Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Paket Premium</span>
                  <span className="font-semibold text-slate-900">Bulanan</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Harga</span>
                  <span className="font-semibold text-slate-900">Rp {fmt(price)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Biaya Transaksi</span>
                  <span className="font-semibold text-emerald-600">GRATIS</span>
                </div>
                
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="text-2xl font-black text-sky-600">Rp {fmt(price)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature chips */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="grid grid-cols-2 gap-3 mb-8"
          >
            {[
              { icon: Brain, label: "Mental Health Care" },
              { icon: ScanLine, label: "Dermatologi AI Scan" },
              { icon: Zap, label: "Chatbot AI Unlimited" },
              { icon: Heart, label: "Cek Jantung Real-time" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 bg-sky-50 border border-sky-100 rounded-xl px-3 py-3 text-left"
              >
                <Icon className="w-4 h-4 text-sky-600 flex-shrink-0" />
                <span className="text-xs font-semibold text-slate-700 leading-snug">{label}</span>
              </div>
            ))}
          </motion.div>

          {/* Back to home button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="space-y-3"
          >
            <Link
              to="/beranda"
              className="inline-flex items-center justify-center gap-2.5 w-full px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 rounded-xl transition-all duration-200 shadow-lg shadow-sky-500/30 hover:scale-[1.01] active:scale-[0.98]"
            >
              <Home className="w-5 h-5" />
              Kembali ke Beranda
            </Link>
            <Link
              to="/konsul"
              className="inline-flex items-center justify-center gap-2.5 w-full px-8 py-4 text-base font-semibold text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-xl transition-all duration-200 border border-sky-200"
            >
              Coba Konsultasi AI Sekarang
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75 }}
            className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-slate-200 text-xs text-slate-500"
          >
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span>Aman & Terenkripsi</span>
            </div>
            <div className="w-0.5 h-4 bg-slate-300/50" />
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Garansi 7 Hari</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="px-4 pt-28 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="max-w-5xl mx-auto"
        >
          {/* Hero card */}
          <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: 200 }}>
            {/* Background image */}
            <img
              src="/images/payment.jpg"
              alt="Sembuhin Premium"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Dark overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/60 to-slate-900/30" />

            {/* Floating stat chips — desktop only */}
            <div className="absolute top-5 right-5 flex-col gap-2 hidden md:flex">
              {[
                {
                  icon: Stethoscope,
                  label: "Konsultasi",
                  value: stats.konsultasi,
                  color: "text-sky-400",
                },
                { icon: Microscope, label: "Lab", value: stats.lab, color: "text-violet-400" },
                { icon: Pill, label: "Resep", value: stats.resep, color: "text-emerald-400" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 bg-white/10 border border-white/15 backdrop-blur-sm rounded-xl px-3 py-1.5"
                >
                  <Icon className={cn("h-3.5 w-3.5 flex-shrink-0", color)} />
                  <span className="text-[12px] font-medium text-white/70">{label}</span>
                  <span className={cn("ml-auto text-[13px] font-bold", color)}>{value}</span>
                </div>
              ))}
            </div>

            {/* Main content */}
            <div className="relative px-7 py-8 md:py-10 max-w-lg">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400" />
                </span>
                <span className="text-[11px] font-bold text-white/60 tracking-widest uppercase">
                  Sembuhin Premium
                </span>
              </div>

              <h1 className="text-[1.9rem] sm:text-[2.4rem] font-bold text-white leading-[1.1] tracking-tight mb-2.5">
                Satu langganan untuk
                <br />
                <span className="text-white/40">semua kebutuhan</span>
                <br />
                kesehatanmu.
              </h1>
              <p className="text-[13px] text-white/50 leading-relaxed mb-5 max-w-sm">
                AI medis, cek jantung, scan kulit, mental health — mulai dari&nbsp;
                <span className="font-semibold text-white/75">Rp 49.000/bulan</span>.
              </p>

              {/* Stat chips row */}
              <div className="flex items-center gap-2 flex-wrap mb-3">
                {[
                  { label: "Total", value: stats.total, dot: "bg-sky-400" },
                  { label: "Konsultasi", value: stats.konsultasi, dot: "bg-emerald-400" },
                  { label: "Resep", value: stats.resep, dot: "bg-violet-400" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center gap-1.5 bg-white/8 border border-white/10 rounded-lg px-2.5 py-1"
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
                    <span className="text-[12px] font-bold text-white/80">{s.value}</span>
                    <span className="text-[11px] text-white/40">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Billing toggle */}
              <div className="inline-flex items-center bg-black/30 border border-white/20 backdrop-blur-sm rounded-full p-1 gap-0.5">
                {(["monthly", "yearly"] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => setBilling(b)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all flex items-center gap-1.5",
                      billing === b
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-white/60 hover:text-white/80",
                    )}
                  >
                    {b === "monthly" ? "Bulanan" : "Tahunan"}
                    {b === "yearly" && (
                      <span
                        className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                          billing === "yearly"
                            ? "bg-emerald-500 text-white"
                            : "bg-white/15 text-emerald-300",
                        )}
                      >
                        -25%
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── PRICING CARDS ────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 pb-32">
        <div className="grid md:grid-cols-2 gap-5 items-stretch">
          {/* FREE CARD */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative bg-white border border-slate-200 rounded-3xl p-8 flex flex-col"
          >
            <div className="mb-8">
              <p className="text-[11px] font-bold text-slate-400 tracking-[0.15em] uppercase mb-4">
                Gratis
              </p>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-[2.75rem] font-bold text-slate-900 leading-none tracking-tight">
                  Rp 0
                </span>
                <span className="text-sm text-slate-400 mb-1.5">/bulan</span>
              </div>
              <p className="text-[13px] text-slate-400">Untuk memulai. Tidak perlu kartu kredit.</p>
            </div>

            <div className="space-y-3.5 flex-1 mb-8">
              {FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "h-[18px] w-[18px] rounded-full flex items-center justify-center flex-shrink-0",
                      f.free ? "bg-emerald-100" : "border border-slate-200",
                    )}
                  >
                    {f.free ? (
                      <Check className="h-2.5 w-2.5 text-emerald-600 stroke-[3]" />
                    ) : (
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                    )}
                  </span>
                  <span
                    className={cn(
                      "text-sm",
                      f.free ? "text-slate-800 font-medium" : "text-slate-350 text-slate-400",
                    )}
                  >
                    {f.title}
                  </span>
                </div>
              ))}
            </div>

            <button
              disabled
              className="w-full rounded-xl border border-slate-200 py-3.5 text-[13px] font-semibold text-slate-400 cursor-not-allowed"
            >
              Plan Saat Ini
            </button>
          </motion.div>

          {/* PREMIUM CARD */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="relative rounded-3xl p-8 flex flex-col overflow-hidden"
            style={{
              background: "linear-gradient(145deg, oklch(0.17 0.04 250), oklch(0.13 0.05 260))",
            }}
          >
            {/* Subtle glow orbs */}
            <div
              className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-[0.06]
              bg-sky-400 blur-3xl pointer-events-none"
            />
            <div
              className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full opacity-[0.05]
              bg-violet-400 blur-3xl pointer-events-none"
            />

            <div className="relative mb-8">
              <div className="flex items-start justify-between mb-4">
                <p className="text-[11px] font-bold text-sky-400 tracking-[0.15em] uppercase">
                  Premium
                </p>
                {billing === "yearly" && (
                  <span className="text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                    Hemat Rp {fmt(savings)}/tahun
                  </span>
                )}
              </div>

              <div className="flex items-end gap-2 mb-1">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={price}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="text-[2.75rem] font-bold text-white leading-none tracking-tight"
                  >
                    Rp {fmt(price)}
                  </motion.span>
                </AnimatePresence>
                <span className="text-sm text-slate-500 mb-1.5">/bulan</span>
              </div>

              <AnimatePresence mode="wait">
                {billing === "yearly" ? (
                  <motion.p
                    key="yearly-sub"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[12px] text-slate-500"
                  >
                    Ditagih Rp {fmt(yearlyTotal)}/tahun
                  </motion.p>
                ) : (
                  <motion.p
                    key="monthly-sub"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[12px] text-transparent select-none"
                  >
                    &nbsp;
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="relative space-y-3.5 flex-1 mb-8">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <span className="h-[18px] w-[18px] rounded-full bg-sky-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-2.5 w-2.5 text-sky-400 stroke-[3]" />
                    </span>
                    <div>
                      <p className="text-[13px] font-medium text-white leading-snug">{f.title}</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment Card Container - Simplified */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative mb-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
              
              <div className="relative z-10 space-y-3">
                {/* Price Summary */}
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-white/70 text-sm">Harga</span>
                  <span className="font-semibold text-white">Rp {fmt(price)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-white/70 text-sm">Biaya</span>
                  <span className="font-semibold text-emerald-300">GRATIS</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/20">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-xl font-black text-white">Rp {fmt(price)}</span>
                </div>
              </div>
            </motion.div>

            <div className="relative">
              {isPremium ? (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full rounded-2xl bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-emerald-500/5 border border-emerald-500/30 py-4 px-5 text-center backdrop-blur-sm"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[12px] font-bold text-emerald-400 uppercase tracking-wider">Status Aktif</span>
                  </div>
                  <p className="text-[14px] font-bold text-emerald-100">✓ Kamu sudah Sembuhin Premium</p>
                  <p className="text-[11px] text-emerald-300/70 mt-1">Nikmati semua fitur AI kesehatan tanpa batas</p>
                </motion.div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpgrade}
                  disabled={isProcessing}
                  className="group w-full rounded-2xl bg-gradient-to-r from-white to-slate-50 py-4 px-6 text-[13px] font-bold text-slate-900
                    hover:shadow-2xl hover:shadow-white/30 transition-all duration-300 flex items-center justify-center gap-3
                    disabled:opacity-50 disabled:cursor-not-allowed shadow-xl border border-white/50
                    relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-400/0 via-sky-400/10 to-sky-400/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin relative z-10" />
                      <span className="relative z-10">Memproses Pembayaran...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl relative z-10">💳</span>
                      <span className="relative z-10">{user ? "Upgrade ke Premium" : "Mulai Sekarang"}</span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 relative z-10" />
                    </>
                  )}
                </motion.button>
              )}
              <div className="flex items-center justify-center gap-4 mt-4 text-[11px] text-slate-500/80">
                <div className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-emerald-500" />
                  <span>100% Aman & Terenkripsi</span>
                </div>
                <div className="w-0.5 h-3 bg-slate-300/30" />
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Garansi 7 Hari</span>
                </div>
              </div>
              <p className="text-center text-[11px] text-slate-600/70 mt-3 leading-relaxed font-medium">
                Batalkan kapan saja tanpa pertanyaan · Tidak ada komitmen jangka panjang
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
