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
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { toast } from "sonner";

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

function MembershipPage() {
  const navigate = useNavigate();
  const { user, isPremium, upgradeToPremium } = useAuth();
  const { language, t } = useLanguage();

  const FEATURES = [
    {
      free: false,
      icon: <ScanLine className="h-5 w-5" />,
      title: t("nav.dermatology"),
      desc: language === "id" ? "Scan kulit & dapatkan pre-screening dari AI" : "Skin scan & get AI pre-screening",
    },
    {
      free: false,
      icon: <HeartPulse className="h-5 w-5" />,
      title: t("nav.heart_check"),
      desc: language === "id" ? "Pantau detak jantung langsung dari kamera" : "Monitor heart rate directly from camera",
    },
    {
      free: false,
      icon: <Smile className="h-5 w-5" />,
      title: t("nav.mood_check"),
      desc: language === "id" ? "Analisis ekspresi wajah untuk kondisi emosional" : "Facial expression analysis for emotional state",
    },
    {
      free: false,
      icon: <MessageCircle className="h-5 w-5" />,
      title: t("nav.chatbot_ai") + " Unlimited",
      desc: language === "id" ? "Konsultasi tanpa batas, tanpa reset harian" : "Unlimited consultation, no daily reset",
    },
    {
      free: false,
      icon: <AlertTriangle className="h-5 w-5" />,
      title: t("nav.symptom_triage"),
      desc: language === "id" ? "Klasifikasi urgensi gejala secara otomatis" : "Automatically classify symptom urgency",
    },
    {
      free: true,
      icon: <UserPlus className="h-5 w-5" />,
      title: t("nav.consultation"),
      desc: language === "id" ? "Buat janji dengan dokter spesialis" : "Make an appointment with a specialist",
    },
    {
      free: false,
      icon: <Brain className="h-5 w-5" />,
      title: t("nav.mental_health"),
      desc: language === "id" ? "Terapi mandiri berbasis AI & psikolog" : "AI-based self-therapy & psychologist",
    },
    {
      free: false,
      icon: <Zap className="h-5 w-5" />,
      title: "Priority Support 24/7",
      desc: language === "id" ? "Respons cepat dari tim medis kami" : "Fast response from our medical team",
    },
  ];

  const TESTIMONIALS = [
    {
      name: "Anisa Rahma",
      role: language === "id" ? "Pengguna Premium · 8 bulan" : "Premium User · 8 months",
      avatar: "https://i.pravatar.cc/100?img=47",
      rating: 5,
      text: language === "id" ? "Fitur cek jantung real-time benar-benar membantu saya memantau kondisi setelah operasi. Sangat worth it!" : "Real-time heart check feature really helped me monitor my condition after surgery. Very worth it!",
    },
    {
      name: "Bima Ardiansyah",
      role: language === "id" ? "Pengguna Premium · 5 bulan" : "Premium User · 5 months",
      avatar: "https://i.pravatar.cc/100?img=12",
      rating: 5,
      text: language === "id" ? "Chatbot AI-nya sangat membantu, bisa konsultasi kapan saja tanpa khawatir batasan. Pelayanannya top!" : "The AI Chatbot is very helpful, can consult anytime without worrying about limits. Top service!",
    },
    {
      name: "Dewi Kartika",
      role: language === "id" ? "Pengguna Premium · 1 tahun" : "Premium User · 1 year",
      avatar: "https://i.pravatar.cc/100?img=32",
      rating: 5,
      text: language === "id" ? "Dermatologi AI scan akurat, hemat waktu ke klinik untuk masalah kulit ringan. Sangat direkomendasikan!" : "Dermatology AI scan is accurate, saves time going to the clinic for mild skin issues. Highly recommended!",
    },
  ];

  const FAQS = [
    {
      q: language === "id" ? "Apakah saya bisa membatalkan kapan saja?" : "Can I cancel anytime?",
      a: language === "id" ? "Ya, Anda dapat membatalkan langganan kapan saja tanpa biaya tambahan. Akses premium tetap aktif hingga akhir periode tagihan." : "Yes, you can cancel your subscription at any time without extra cost. Premium access remains active until the end of the billing period.",
    },
    {
      q: language === "id" ? "Metode pembayaran apa yang tersedia?" : "What payment methods are available?",
      a: language === "id" ? "Kami menerima transfer bank, kartu kredit/debit, GoPay, OVO, Dana, dan ShopeePay." : "We accept bank transfers, credit/debit cards, GoPay, OVO, Dana, and ShopeePay.",
    },
    {
      q: language === "id" ? "Apakah ada jaminan uang kembali?" : "Is there a money-back guarantee?",
      a: language === "id" ? "Ya! Kami memberikan garansi 7 hari uang kembali jika Anda tidak puas dengan layanan premium kami." : "Yes! We provide a 7-day money-back guarantee if you are not satisfied with our premium service.",
    },
  ];
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const monthlyPrice = 49000;
  const yearlyPrice = Math.round(monthlyPrice * 12 * 0.75);
  const displayPrice = billing === "monthly" ? monthlyPrice : Math.round(yearlyPrice / 12);
  const finalPrice = billing === "monthly" ? monthlyPrice : yearlyPrice;

  const formatRp = (n: number) => new Intl.NumberFormat("id-ID").format(n);

  useEffect(() => {
    // Load Midtrans Snap Script dynamically based on Client Key or Env
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "";
    const envConfig = import.meta.env.VITE_MIDTRANS_ENV || "";
    
    let isProduction;
    if (envConfig) {
      isProduction = envConfig.toLowerCase() === "production";
    } else {
      isProduction = clientKey.startsWith("Mid-client-");
    }
    
    const snapScriptUrl = isProduction 
      ? "https://app.midtrans.com/snap/snap.js" 
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    
    console.log(`💳 Loading Midtrans Snap: ${isProduction ? 'Production' : 'Sandbox'} (Env: ${envConfig})`);
    
    let scriptTag = document.createElement("script");
    scriptTag.src = snapScriptUrl;
    scriptTag.setAttribute("data-client-key", clientKey);
    scriptTag.async = true;
    
    document.body.appendChild(scriptTag);
    
    return () => {
      document.body.removeChild(scriptTag);
    };
  }, []);

  const handleUpgrade = async () => {
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }

    setIsProcessing(true);

    try {
      // Prioritaskan Backend Lokal (Flask) yang sudah dikonfigurasi
      // Jika ingin simulasi murni tanpa API, bisa langsung panggil upgradeToPremium()
      const response = await fetch("http://localhost:5001/api/payment/membership", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || "Pengguna Sembuhin",
          amount: finalPrice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal membuat transaksi");
      }

      // Jika backend mengirim is_mock (karena key belum di-set), langsung sukses
      if (data.is_mock) {
        toast.success("Mode Demo: Pembayaran Berhasil!");
        upgradeToPremium();
        setIsProcessing(false);
        return;
      }

      // Buka popup Snap Midtrans
      if ((window as any).snap) {
        (window as any).snap.pay(data.token, {
          onSuccess: () => {
            toast.success("Pembayaran Berhasil! Selamat datang di Premium Sembuhin. 🎉");
            upgradeToPremium();
            setIsProcessing(false);
          },
          onPending: () => {
            toast.info("Menunggu konfirmasi pembayaran...");
            setIsProcessing(false);
          },
          onError: () => {
            toast.error("Pembayaran gagal. Silakan coba lagi.");
            setIsProcessing(false);
          },
          onClose: () => {
            toast.info("Pembayaran dibatalkan.");
            setIsProcessing(false);
          },
        });
      } else {
        throw new Error("Midtrans Snap belum siap. Silakan refresh halaman.");
      }
    } catch (error: any) {
      console.error(error);
      // FALLBACK: Jika API error (misal internet mati), tawarkan Mode Simulator
      toast.error(error.message || "Terjadi kesalahan koneksi");
      
      // Tawarkan simulator untuk kemudahan testing
      if (confirm("Koneksi gagal. Ingin mencoba 'Simulator Pembayaran' (Langsung Sukses) untuk testing?")) {
        setIsProcessing(true);
        setTimeout(() => {
          toast.success("Simulator: Pembayaran Berhasil! (Hanya untuk Testing)");
          upgradeToPremium();
          setIsProcessing(false);
        }, 1500);
      } else {
        setIsProcessing(false);
      }
    }
  };

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
            {t("membership.hero_badge")}
          </span>
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
        </motion.div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
          {t("membership.hero_title")}
          <br />
          <span className="bg-gradient-to-r from-sky-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
            {t("membership.hero_title_accent")}
          </span>
        </h1>
        <p className="text-base text-slate-600 max-w-xl mx-auto mb-8">
          {t("membership.hero_desc")}
        </p>

        {/* Trust stats */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
          {[
            {
              icon: <BadgeCheck className="h-4 w-4 text-sky-500" />,
              label: t("membership.users_count"),
            },
            { icon: <Shield className="h-4 w-4 text-emerald-500" />, label: t("membership.secure") },
            { icon: <Activity className="h-4 w-4 text-rose-500" />, label: t("membership.uptime") },
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
            {t("membership.monthly")}
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
            {t("membership.yearly")}
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
      <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto px-4 mb-20 items-stretch">
        {/* FREE CARD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative flex flex-col rounded-[2rem] bg-white border border-slate-200 p-8 sm:p-10 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300"
        >
          <div className="mb-8">
            <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">
              {t("membership.free_title")}
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Free</h2>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-5xl font-black text-slate-900 tracking-tight">Rp 0</span>
              <span className="text-slate-500 font-medium">{t("membership.per_month")}</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              {language === "id" ? "Akses dasar untuk memulai perjalanan sehatmu. Selamanya gratis." : "Basic access to start your healthy journey. Forever free."}
            </p>
          </div>

          <div className="h-[1px] w-full bg-slate-100 mb-8" />

          <ul className="space-y-4 flex-1 mb-10">
            {FEATURES.map((f, i) => (
              <li key={i} className="flex items-start gap-3">
                {f.free ? (
                  <div className="mt-0.5 rounded-full bg-emerald-100 p-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                ) : (
                  <div className="mt-0.5 rounded-full bg-slate-100 p-1">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                )}
                <div className="flex flex-col">
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      f.free ? "text-slate-800" : "text-slate-400",
                    )}
                  >
                    {f.title}
                  </span>
                  {f.free && <span className="text-[11px] text-slate-500 mt-0.5">{f.desc}</span>}
                </div>
              </li>
            ))}
          </ul>

          <button
            disabled
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 text-sm font-bold text-slate-400 cursor-not-allowed transition-colors"
          >
            {t("membership.current_plan")}
          </button>
        </motion.div>

        {/* PREMIUM CARD — Elegant Solid Dark */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="relative flex flex-col rounded-[2rem] bg-slate-900 border-2 border-sky-500 p-8 sm:p-10 shadow-xl"
        >
          {/* "Paling Populer" floating badge */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
            <div className="flex items-center gap-1.5 bg-sky-500 px-4 py-1.5 rounded-full shadow-md text-white">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {t("membership.popular")}
              </span>
            </div>
          </div>

          <div className="relative z-10 mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-block px-3 py-1 rounded-full bg-sky-500/20 text-[11px] font-bold text-sky-400 uppercase tracking-widest">
                Eksklusif
              </span>
              <Crown className="h-6 w-6 text-sky-400" />
            </div>
            
            <h2 className="text-3xl font-extrabold text-white mb-2">{t("membership.premium_title")}</h2>
            
            <div className="flex items-baseline gap-1 mb-3">
              <AnimatePresence mode="wait">
                <motion.span
                  key={displayPrice}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="text-5xl font-black text-white tracking-tight"
                >
                  Rp {formatRp(displayPrice)}
                </motion.span>
              </AnimatePresence>
              <span className="text-slate-400 font-medium">{t("membership.per_month")}</span>
            </div>
            
            <p className="text-sm text-slate-400 leading-relaxed min-h-[40px]">
              {billing === "yearly" ? (
                <>
                  {language === "id" ? "Ditagih" : "Billed"} Rp {formatRp(yearlyPrice)}{t("membership.per_year")}. <br/>
                  <span className="text-emerald-400 font-semibold">{t("membership.save")} Rp {formatRp(monthlyPrice * 12 - yearlyPrice)}!</span>
                </>
              ) : (
                language === "id" ? "Buka semua potensi AI medis tanpa batas harian." : "Unlock all medical AI potential without daily limits."
              )}
            </p>
          </div>

          <div className="h-[1px] w-full bg-slate-800 mb-8 relative z-10" />

          <ul className="space-y-4 flex-1 mb-10 relative z-10">
            {FEATURES.map((f, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-start gap-3"
              >
                <div className="mt-0.5 rounded-full bg-sky-500/20 p-1">
                  <CheckCircle2 className="h-4 w-4 text-sky-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-100">{f.title}</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">{f.desc}</span>
                </div>
              </motion.li>
            ))}
            
            <motion.li
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-start gap-3 pt-2"
            >
              <div className="mt-0.5 rounded-full bg-amber-500/20 p-1">
                <Infinity className="h-4 w-4 text-amber-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-amber-400">Akses Tanpa Batas</span>
                <span className="text-[11px] text-amber-400/70 mt-0.5">Prioritas server tertinggi</span>
              </div>
            </motion.li>
          </ul>

          <div className="relative z-10">
            {isPremium ? (
              <button
                disabled
                className="w-full rounded-xl bg-emerald-500/10 border border-emerald-500/20 py-4 text-sm font-bold text-emerald-400"
              >
                ✓ Kamu Sudah Premium!
              </button>
            ) : (
              <motion.button
                onClick={handleUpgrade}
                disabled={isProcessing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-xl bg-sky-500 py-4 text-sm font-bold text-white hover:bg-sky-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{t("common.loading")}</span>
                  </>
                ) : (
                  <>
                    <Rocket className="h-5 w-5" />
                    <span>{user ? t("membership.upgrade_btn") : t("membership.login_upgrade")}</span>
                  </>
                )}
              </motion.button>
            )}
            <p className="mt-4 text-center text-[10px] text-slate-500 uppercase tracking-widest">
              Garansi Uang Kembali 7 Hari
            </p>
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
                onClick={handleUpgrade}
                disabled={isProcessing}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-8 py-4 text-sm font-extrabold text-white shadow-lg shadow-sky-500/30 hover:bg-sky-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {user ? "Upgrade ke Premium" : "Mulai Sekarang — Gratis"}
                  </>
                )}
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
