import { useState, useEffect } from "react";
import { ShieldCheck, Lock, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in as admin
  useEffect(() => {
    const checkExistingAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (profile?.role === 'admin') {
          navigate({ to: "/admin" });
        }
      }
    };
    checkExistingAuth();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 1. Sign in with Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        // 2. Check if user has 'admin' role in profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError || profile?.role !== 'admin') {
          // If not admin, sign out immediately
          await supabase.auth.signOut();
          throw new Error("Akses ditolak. Anda bukan Administrator.");
        }

        // 3. Success
        navigate({ to: "/admin" });
      }
    } catch (err: any) {
      setError(err.message || "Gagal masuk ke Admin Panel.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px]"
      >
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-white shadow-xl shadow-sky-500/10 border border-slate-100 flex items-center justify-center mb-4">
            <img src="/gif_logo/icon.png" alt="Sembuhin" className="h-10 w-10 object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Panel</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Masuk untuk mengelola sistem Sembuhin</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[32px] p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 border-b-4 border-b-sky-500">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
                Email Admin
              </label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sembuhin.id"
                  className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-sky-500 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
                Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-sky-500 transition-all outline-none"
                />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-sky-500 transition-colors" />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-rose-500 bg-rose-50 p-3.5 rounded-2xl border border-rose-100"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p className="text-xs font-bold leading-tight">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              disabled={isLoading}
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span>Masuk Sekarang</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info */}
        <div className="mt-8 flex items-center justify-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <ShieldCheck className="h-3 w-3" />
          <span>Secure Admin Access — Sembuhin &copy; 2026</span>
        </div>
      </motion.div>
    </div>
  );
}
