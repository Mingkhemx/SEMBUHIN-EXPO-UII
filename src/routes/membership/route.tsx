import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Check, Loader2, ArrowRight,
  ScanLine, Heart, Brain, Zap, Stethoscope, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { title: "Premium — Sembuhin" },
      { name: "description", content: "Akses penuh ke semua fitur AI kesehatan Sembuhin." },
    ],
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

function FaqItem({ faq, index, open, onToggle }: {
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
        <span className={cn(
          "text-[15px] font-medium transition-colors",
          open ? "text-slate-900" : "text-slate-700 group-hover:text-slate-900"
        )}>
          {faq.q}
        </span>
        <span className={cn(
          "flex-shrink-0 h-6 w-6 rounded-full border flex items-center justify-center transition-all duration-200",
          open
            ? "border-slate-900 bg-slate-900 text-white rotate-180"
            : "border-slate-200 text-slate-400 group-hover:border-slate-400"
        )}>
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
  const { user, isPremium, upgradeToPremium } = useAuth();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const monthlyPrice = 49000;
  const yearlyMonthly = Math.round(monthlyPrice * 0.75);
  const yearlyTotal = yearlyMonthly * 12;
  const price = billing === "monthly" ? monthlyPrice : yearlyMonthly;
  const fmt = (n: number) => new Intl.NumberFormat("id-ID").format(n);
  const savings = monthlyPrice * 12 - yearlyTotal;

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
    return () => { try { document.body.removeChild(el); } catch {} };
  }, []);

  const handleUpgrade = async () => {
    if (!user) { navigate({ to: "/auth" }); return; }
    setIsProcessing(true);
    try {
      const res = await fetch("https://sembuhin-expo-uii-production.up.railway.app/api/payment/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || "Pengguna Sembuhin",
          amount: billing === "monthly" ? monthlyPrice : yearlyTotal,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat transaksi");
      if (data.is_mock) {
        toast.success("Pembayaran berhasil!");
        upgradeToPremium();
        setIsProcessing(false);
        return;
      }
      if ((window as any).snap) {
        (window as any).snap.pay(data.token, {
          onSuccess: () => { toast.success("Selamat datang di Sembuhin Premium!"); upgradeToPremium(); setIsProcessing(false); },
          onPending: () => { toast.info("Menunggu konfirmasi pembayaran..."); setIsProcessing(false); },
          onError: () => { toast.error("Pembayaran gagal."); setIsProcessing(false); },
          onClose: () => { setIsProcessing(false); },
        });
      } else {
        throw new Error("Midtrans belum siap. Refresh halaman.");
      }
    } catch (err: any) {
      toast.error(err.message || "Koneksi gagal");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="px-4 pt-10 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-5xl mx-auto"
        >
          {/* Hero card */}
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(145deg, oklch(0.17 0.04 250), oklch(0.13 0.05 260))",
              minHeight: "480px",
            }}
          >
            {/* ── Decorative blobs ── */}
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-violet-500/8 blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-sky-400/5 blur-3xl pointer-events-none" />

            {/* ── Grid lines overlay (subtle) ── */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.04]"
              style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            />

            {/* ── Floating feature pills ── */}
            <div className="absolute top-8 right-8 flex flex-col gap-2 hidden md:flex">
              {[
                { icon: ScanLine, label: "Dermatologi AI" },
                { icon: Heart,    label: "Cek Jantung"    },
                { icon: Brain,    label: "Mental Health"  },
              ].map(({ icon: Icon, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-2.5 bg-white/5 border border-white/8 backdrop-blur-sm rounded-xl px-3.5 py-2"
                >
                  <span className="h-6 w-6 rounded-lg bg-sky-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-3.5 w-3.5 text-sky-400" />
                  </span>
                  <span className="text-[12px] font-medium text-white/70">{label}</span>
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </motion.div>
              ))}
            </div>

            {/* ── Stat chips bottom-right ── */}
            <div className="absolute bottom-8 right-8 flex gap-2 hidden md:flex">
              <div className="bg-white/5 border border-white/8 rounded-xl px-3.5 py-2.5 text-center">
                <p className="text-[18px] font-bold text-white leading-none">50K+</p>
                <p className="text-[10px] text-white/40 mt-0.5">Pengguna</p>
              </div>
              <div className="bg-white/5 border border-white/8 rounded-xl px-3.5 py-2.5 text-center">
                <p className="text-[18px] font-bold text-white leading-none">4.9</p>
                <p className="text-[10px] text-white/40 mt-0.5">Rating</p>
              </div>
              <div className="bg-white/5 border border-white/8 rounded-xl px-3.5 py-2.5 text-center">
                <p className="text-[18px] font-bold text-white leading-none">6</p>
                <p className="text-[10px] text-white/40 mt-0.5">Fitur AI</p>
              </div>
            </div>

            {/* ── Main content ── */}
            <div className="relative flex flex-col items-center justify-center text-center px-8 py-20 md:py-24">
              {/* Eyebrow pill */}
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8
                bg-white/8 border border-white/10 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400" />
                </span>
                <span className="text-[11px] font-semibold text-white/60 tracking-widest uppercase">
                  Sembuhin Premium
                </span>
              </div>

              <h1 className="text-[2.75rem] sm:text-[3.5rem] font-bold leading-[1.05] tracking-tight text-white mb-5 max-w-2xl">
                Satu langganan untuk<br />
                <span className="text-white/35">semua kebutuhan</span><br />
                kesehatanmu.
              </h1>

              <p className="text-[16px] text-white/45 leading-relaxed max-w-md mx-auto mb-10">
                AI medis, cek jantung, scan kulit, mental health — semuanya dalam
                satu platform. Mulai dari&nbsp;
                <span className="font-semibold text-white/70">Rp 49.000/bulan</span>.
              </p>

              {/* Billing toggle */}
              <div className="inline-flex items-center bg-white/8 border border-white/10 rounded-xl p-1 gap-1">
                {(["monthly", "yearly"] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => setBilling(b)}
                    className={cn(
                      "relative px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200 flex items-center gap-2.5",
                      billing === b
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-white/50 hover:text-white/70"
                    )}
                  >
                    {b === "monthly" ? "Bulanan" : "Tahunan"}
                    {b === "yearly" && (
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors",
                        billing === "yearly"
                          ? "bg-emerald-500 text-white"
                          : "bg-emerald-500/20 text-emerald-400"
                      )}>
                        Hemat 25%
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
              <p className="text-[13px] text-slate-400">
                Untuk memulai. Tidak perlu kartu kredit.
              </p>
            </div>

            <div className="space-y-3.5 flex-1 mb-8">
              {FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={cn(
                    "h-[18px] w-[18px] rounded-full flex items-center justify-center flex-shrink-0",
                    f.free
                      ? "bg-emerald-100"
                      : "border border-slate-200"
                  )}>
                    {f.free
                      ? <Check className="h-2.5 w-2.5 text-emerald-600 stroke-[3]" />
                      : <span className="h-1 w-1 rounded-full bg-slate-300" />
                    }
                  </span>
                  <span className={cn(
                    "text-sm",
                    f.free ? "text-slate-800 font-medium" : "text-slate-350 text-slate-400"
                  )}>
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
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-[0.06]
              bg-sky-400 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full opacity-[0.05]
              bg-violet-400 blur-3xl pointer-events-none" />

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

            <div className="relative">
              {isPremium ? (
                <div className="w-full rounded-xl bg-emerald-500/10 border border-emerald-500/20 py-3.5 text-[13px] font-semibold text-emerald-400 text-center">
                  ✓ Aktif — Kamu sudah Premium
                </div>
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={isProcessing}
                  className="group w-full rounded-xl bg-white py-3.5 text-[13px] font-bold text-slate-900
                    hover:bg-slate-50 transition-all duration-200 flex items-center justify-center gap-2
                    disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_1px_3px_rgba(0,0,0,0.15)]"
                >
                  {isProcessing ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Memproses...</>
                  ) : (
                    <>
                      {user ? "Upgrade ke Premium" : "Mulai Sekarang"}
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              )}
              <p className="text-center text-[11px] text-slate-600 mt-3.5 leading-relaxed">
                Garansi uang kembali 7 hari &nbsp;·&nbsp; Batalkan kapan saja
              </p>
            </div>
          </motion.div>

        </div>
      </section>





    </div>
  );
}
