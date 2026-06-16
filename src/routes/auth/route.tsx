import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  Shield,
  Heart,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  Phone,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/auth')({
  head: () => ({
    meta: [
      { title: 'Login / Register — Sembuhin' },
      { name: 'description', content: 'Masuk atau daftar akun Sembuhin untuk akses layanan kesehatan lengkap.' },
    ],
  }),
  component: AuthPage,
})

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

/* ─── Component ──────────────────────────────────────────────────── */
function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Form fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPhone, setRegisterPhone] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerConfirm, setRegisterConfirm] = useState('')

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode)
    setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (mode === 'login') {
      if (!loginEmail || !loginPassword) {
        setError('Email dan password harus diisi')
        return
      }
    } else {
      if (!registerName || !registerEmail || !registerPhone || !registerPassword || !registerConfirm) {
        setError('Semua field harus diisi')
        return
      }
      if (registerPassword !== registerConfirm) {
        setError('Password dan konfirmasi tidak cocok')
        return
      }
      if (registerPassword.length < 8) {
        setError('Password minimal 8 karakter')
        return
      }
      if (!agreeTerms) {
        setError('Anda harus menyetujui Syarat & Ketentuan')
        return
      }
    }

    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      navigate({ to: '/beranda' })
    }, 1500)
  }

  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-5xl">
        <div className="rounded-3xl bg-white shadow-2xl shadow-slate-200/60 overflow-hidden grid lg:grid-cols-2 min-h-[640px]">

          {/* ── Left Panel: Branding ─────────────────────────── */}
          <div className="hidden lg:flex flex-col justify-between p-0 text-white relative overflow-hidden">
            {/* Video Background */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/video/register-login.mp4" type="video/mp4" />
            </video>
            
            {/* Dark Overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-900/60 via-blue-900/50 to-indigo-900/60" />

            <div className="relative z-10 p-10">
              {/* Logo */}
              <div className="flex items-center gap-3 mb-12">
                <img 
                  src="/gif_logo/icon.png" 
                  alt="Sembuhin Icon" 
                  className="h-12 w-12 object-contain"
                />
                <div>
                  <p className="text-lg font-bold">Sembuhin</p>
                  <p className="text-[10px] text-sky-200">Kesehatan & Kesejahteraan</p>
                </div>
              </div>

              {/* Welcome text */}
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-3xl font-bold leading-tight mb-4">
                  {mode === 'login' ? 'Selamat Datang Kembali!' : 'Mulai Perjalanan Sehat Anda'}
                </h2>
                <p className="text-sky-100 leading-relaxed">
                  {mode === 'login'
                    ? 'Masuk ke akun Anda untuk melanjutkan konsultasi, melihat rekam medis, dan mengakses semua fitur kesehatan.'
                    : 'Daftar untuk mendapatkan akses ke layanan kesehatan terlengkap: screening, CBT, konsultasi dokter, dan lainnya.'}
                </p>
              </motion.div>
            </div>

            {/* Feature highlights */}
            <div className="relative z-10 p-10 space-y-3">
              {[
                { icon: Stethoscope, text: 'Konsultasi dokter 24/7' },
                { icon: Shield, text: 'Data terenkripsi & aman' },
                { icon: CheckCircle2, text: 'Screening kesehatan AI' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                    <Icon className="h-4 w-4 text-sky-200" />
                  </div>
                  <span className="text-sm text-sky-100">{text}</span>
                </div>
              ))}
            </div>

            {/* Professional Info Card */}
            <div className="relative z-10 mx-10 mb-10 p-5 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-md shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Keamanan Terjamin</p>
                    <p className="text-[11px] text-sky-100">Semua data Anda dienkripsi dan aman</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                    <Stethoscope className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Akses Mudah</p>
                    <p className="text-[11px] text-sky-100">Konsultasi dan layanan kesehatan kapan saja</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Layanan Lengkap</p>
                    <p className="text-[11px] text-sky-100">Semua kebutuhan kesehatan dalam satu platform</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Panel: Form ────────────────────────────── */}
          <div className="flex flex-col justify-center p-6 sm:p-10">
            {/* Logo Center */}
            <div className="flex flex-col items-center justify-center gap-3 mb-8">
              <img 
                src="/gif_logo/logo.png" 
                alt="Sembuhin Logo" 
                className="h-16 w-16 object-contain"
              />
              <p className="text-xl font-bold text-slate-800">Sembuhin</p>
            </div>

            {/* Mode Toggle */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 mb-8">
              <button
                onClick={() => switchMode('login')}
                className={cn(
                  'flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200',
                  mode === 'login' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                )}
              >
                Login
              </button>
              <button
                onClick={() => switchMode('register')}
                className={cn(
                  'flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200',
                  mode === 'register' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                )}
              >
                Register
              </button>
            </div>

            {/* Form */}
            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                initial={{ opacity: 0, x: mode === 'login' ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === 'login' ? 10 : -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="mb-2">
                  <h3 className="text-xl font-bold text-slate-900">
                    {mode === 'login' ? 'Masuk ke Akun Anda' : 'Buat Akun Baru'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {mode === 'login' ? 'Masukkan email dan password untuk melanjutkan' : 'Lengkapi data di bawah untuk mendaftar'}
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                {/* Register: Name */}
                {mode === 'register' && (
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1.5 block">Nama Lengkap</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        placeholder="Nama lengkap Anda"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={mode === 'login' ? loginEmail : registerEmail}
                      onChange={(e) => mode === 'login' ? setLoginEmail(e.target.value) : setRegisterEmail(e.target.value)}
                      placeholder="email@contoh.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Register: Phone */}
                {mode === 'register' && (
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1.5 block">Nomor Telepon</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        value={registerPhone}
                        onChange={(e) => setRegisterPhone(e.target.value)}
                        placeholder="08xxxxxxxxxx"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-600">Password</label>
                    {mode === 'login' && (
                      <button type="button" className="text-xs text-sky-600 hover:text-sky-700 font-medium">
                        Lupa password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={mode === 'login' ? loginPassword : registerPassword}
                      onChange={(e) => mode === 'login' ? setLoginPassword(e.target.value) : setRegisterPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Register: Confirm Password */}
                {mode === 'register' && (
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1.5 block">Konfirmasi Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={registerConfirm}
                        onChange={(e) => setRegisterConfirm(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 focus:bg-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {registerPassword && registerConfirm && registerPassword === registerConfirm && (
                      <p className="flex items-center gap-1 text-[10px] text-emerald-600 mt-1">
                        <CheckCircle2 className="h-3 w-3" /> Password cocok
                      </p>
                    )}
                  </div>
                )}

                {/* Login: Remember me */}
                {mode === 'login' && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500/30" />
                    <span className="text-xs text-slate-600">Ingat saya selama 30 hari</span>
                  </label>
                )}

                {/* Register: Terms */}
                {mode === 'register' && (
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="h-4 w-4 mt-0.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500/30"
                    />
                    <span className="text-xs text-slate-600 leading-relaxed">
                      Saya menyetujui{' '}
                      <span className="text-sky-600 font-medium hover:underline cursor-pointer">Syarat & Ketentuan</span>
                      {' '}dan{' '}
                      <span className="text-sky-600 font-medium hover:underline cursor-pointer">Kebijakan Privasi</span>
                      {' '}Sembuhin.
                    </span>
                  </label>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition-all duration-200',
                    'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg shadow-sky-600/25 hover:shadow-xl hover:shadow-sky-600/30',
                    'disabled:opacity-60 disabled:cursor-not-allowed'
                  )}
                >
                  {isLoading ? (
                    <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : mode === 'login' ? 'Masuk' : 'Daftar Sekarang'}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 py-2">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs text-slate-400">atau</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                    <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Google
                  </button>
                  <button className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                    Apple
                  </button>
                </div>

                {/* Switch mode link */}
                <p className="text-center text-xs text-slate-500 mt-4">
                  {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
                  <button
                    type="button"
                    onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                    className="text-sky-600 font-semibold hover:text-sky-700 hover:underline"
                  >
                    {mode === 'login' ? 'Daftar sekarang' : 'Login di sini'}
                  </button>
                </p>
              </motion.form>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 Sembuhin. Data Anda dilindungi enkripsi end-to-end.
        </p>
      </div>
    </div>
  )
}
