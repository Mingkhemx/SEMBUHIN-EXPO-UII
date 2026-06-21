import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  ArrowRight,
  LogIn,
  ScanLine,
  HeartPulse,
  Smile,
  MessageCircle,
  AlertTriangle,
  Brain,
  Zap,
  CheckCircle2,
  Shield,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const PREMIUM_FEATURES = [
  { icon: <ScanLine className="h-4 w-4" />, label: "Dermatologi AI Scan" },
  { icon: <HeartPulse className="h-4 w-4" />, label: "Cek Jantung Real-time" },
  { icon: <Smile className="h-4 w-4" />, label: "Mood Check AI" },
  { icon: <MessageCircle className="h-4 w-4" />, label: "Chatbot AI Unlimited" },
  { icon: <AlertTriangle className="h-4 w-4" />, label: "AI Symptom Triage" },
  { icon: <Brain className="h-4 w-4" />, label: "Mental Health CBT" },
  { icon: <Zap className="h-4 w-4" />, label: "Priority Support 24/7" },
];

export function PremiumGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { user, isPremium, loading, membershipLoading } = useAuth();

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading || membershipLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-slate-200 border-t-sky-500 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="relative z-10 flex items-center justify-center min-h-[70vh] px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="glass-strong rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/40 p-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-100 flex items-center justify-center">
                <LogIn className="h-10 w-10 text-sky-500" />
              </div>
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-3">Login untuk Melanjutkan</h2>
            <p className="text-sm text-slate-600 mb-8 leading-relaxed">
              Buat akun gratis atau login untuk mengakses fitur ini dan mulai perjalanan kesehatanmu.
            </p>
            <button
              onClick={() => navigate({ to: "/auth" })}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
              Login / Daftar Gratis
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-4 text-[11px] text-slate-400">
              Gratis selamanya · Tidak perlu kartu kredit
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Not premium ───────────────────────────────────────────────────────────
  if (!isPremium) {
    return (
      <div className="relative z-10 flex items-center justify-center min-h-[70vh] px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-lg"
        >
          <div className="glass-strong rounded-3xl border border-sky-100/60 shadow-xl shadow-sky-200/40 overflow-hidden">
            <div className="px-8 pt-10 pb-6 text-center border-b border-slate-200/40">
              <div className="flex items-center justify-center mb-5">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200 flex items-center justify-center shadow-lg shadow-amber-200/40">
                  <Crown className="h-10 w-10 text-amber-500" />
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3.5 py-1 mb-4">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">
                  Fitur Eksklusif Premium
                </span>
              </div>
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-3">Tingkatkan ke Premium</h2>
              <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                Fitur ini hanya untuk member Premium. Upgrade sekarang dan nikmati akses tanpa batas!
              </p>
            </div>
            <div className="px-8 py-7">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                Yang kamu dapatkan dengan Premium:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {PREMIUM_FEATURES.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-3.5 py-3 border border-slate-200/60"
                  >
                    <div className="flex-shrink-0 h-7 w-7 rounded-lg bg-sky-100 text-sky-500 flex items-center justify-center">
                      {f.icon}
                    </div>
                    <span className="text-xs text-slate-700 font-medium leading-tight">
                      {f.label}
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-2.5 bg-amber-50 rounded-xl px-3.5 py-3 border border-amber-200/60">
                  <div className="flex-shrink-0 h-7 w-7 rounded-lg bg-amber-100 text-amber-500 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="text-xs text-amber-700 font-semibold leading-tight">
                    & masih banyak lagi...
                  </span>
                </div>
              </div>
            </div>
            <div className="px-8 pb-8 pt-2 bg-slate-50 border-t border-slate-200/40">
              <div className="flex items-center justify-center gap-2 mb-5">
                <span className="text-slate-400 text-sm line-through">Rp 99.000</span>
                <span className="bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                  HEMAT 50%
                </span>
                <span className="text-slate-900 text-xl font-display font-extrabold">Rp 49.000</span>
                <span className="text-slate-500 text-sm">/bln</span>
              </div>
              <button
                onClick={() => navigate({ to: "/membership" })}
                className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 py-4 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition-all hover:scale-[1.01] active:scale-[0.98]"
              >
                <span className="flex items-center justify-center gap-2">
                  <Crown className="h-4 w-4" />
                  Lihat Plan Premium
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
              <div className="flex items-center justify-center gap-5 mt-4">
                {[
                  { icon: <Shield className="h-3.5 w-3.5" />, text: "Aman & Terenkripsi" },
                  { icon: <CheckCircle2 className="h-3.5 w-3.5" />, text: "Garansi 7 Hari" },
                ].map((b) => (
                  <span
                    key={b.text}
                    className="flex items-center gap-1.5 text-[11px] text-slate-500"
                  >
                    {b.icon}
                    {b.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
