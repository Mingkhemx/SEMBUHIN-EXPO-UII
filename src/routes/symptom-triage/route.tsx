import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Stethoscope,
  ShieldCheck,
  Loader2,
  Info,
  Phone,
  Clock,
  ChevronDown,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/symptom-triage')({
  head: () => ({
    meta: [
      { title: 'Cek Gejala — Sembuhin' },
      {
        name: 'description',
        content: 'Masukkan gejala Anda, dapatkan klasifikasi urgensi dan rekomendasi tindakan yang tepat.',
      },
    ],
  }),
  component: SymptomTriagePage,
})

/* ─── Types ──────────────────────────────────────────────────────── */
type UrgencyLevel = 'emergency' | 'urgent' | 'moderate' | 'mild' | null

interface TriageResult {
  urgency: UrgencyLevel
  confidence: number
  symptoms: string[]
  recommendation: string
  nextSteps: string[]
}

/* ─── Constants ──────────────────────────────────────────────────── */
const URGENCY = {
  emergency: {
    bg: 'bg-red-600',
    light: 'bg-red-50 text-red-800 border-red-200',
    dot: 'bg-red-600',
    icon: XCircle,
    label: 'Darurat',
    desc: 'Segera ke IGD atau hubungi 119',
  },
  urgent: {
    bg: 'bg-amber-500',
    light: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    icon: AlertTriangle,
    label: 'Perlu Dokter',
    desc: 'Konsultasi dokter dalam 24 jam',
  },
  moderate: {
    bg: 'bg-sky-500',
    light: 'bg-sky-50 text-sky-800 border-sky-200',
    dot: 'bg-sky-500',
    icon: Stethoscope,
    label: 'Perlu Pantauan',
    desc: 'Monitor gejala, konsultasi jika memburuk',
  },
  mild: {
    bg: 'bg-emerald-500',
    light: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
    label: 'Perawatan Mandiri',
    desc: 'Istirahat dan jaga kondisi di rumah',
  },
} as const

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

/* ─── Component ──────────────────────────────────────────────────── */
function SymptomTriagePage() {
  const [input, setInput] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<TriageResult | null>(null)
  const [showUrgencyInfo, setShowUrgencyInfo] = useState(false)

  const analyze = () => {
    if (!input.trim()) return

    setAnalyzing(true)
    setResult(null)
    setTimeout(() => {
      setResult(mockResult([input.trim()]))
      setAnalyzing(false)
    }, 2200)
  }

  const reset = () => {
    setInput('')
    setResult(null)
  }

  return (
    <div className="relative z-10 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-14">

        {/* ── Hero ──────────────────────────────────────────────── */}
        <motion.header
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-100/80 border border-sky-200/60 px-4 py-1.5 mb-5">
            <Stethoscope className="h-3.5 w-3.5 text-sky-600" />
            <span className="text-xs font-semibold text-sky-700 tracking-wide uppercase">Pemeriksaan Gejala</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
            Cek Tingkat Urgensi<br className="hidden sm:block" /> Kesehatan Anda
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-500 leading-relaxed max-w-lg">
            Ceritakan keluhan yang Anda rasakan. Sistem kami akan membantu mengklasifikasikan tingkat urgensi dan memberikan langkah penanganan yang sesuai.
          </p>

          {/* Trust Badges */}
          <div className="flex items-center gap-5 mt-6">
            {[
              { icon: ShieldCheck, label: 'Data Terenkripsi' },
              { icon: Clock, label: 'Tersedia 24/7' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 rounded-full bg-white/70 border border-slate-200/60 px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm">
                <Icon className="h-3.5 w-3.5 text-sky-500" />
                {label}
              </div>
            ))}
          </div>
        </motion.header>

        {/* ── Emergency Banner ──────────────────────────────────── */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.15 }}
          className="rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 text-white px-5 py-4 shadow-lg shadow-slate-800/15 flex items-center gap-4"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/20 border border-red-500/20">
            <Phone className="h-5 w-5 text-red-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Kondisi Darurat?</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Jika mengalami sesak napas berat, nyeri dada hebat, atau pingsan — segera hubungi layanan darurat.
            </p>
          </div>
          <a href="tel:119" className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 px-4 py-2.5 text-xs font-semibold text-white transition-colors shadow-md shadow-red-600/20">
            <Phone className="h-3.5 w-3.5" />
            Hubungi 119
          </a>
        </motion.div>

        {/* ── Main Grid ─────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-5 gap-8">

          {/* ── Left: Input ──────────────────────────────────────── */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 space-y-6"
          >
            {/* Input Card */}
            <div className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 overflow-hidden">
              <div className="p-6 sm:p-8">
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Apa keluhan Anda?
                </label>
                <p className="text-xs text-slate-400 mb-4">Ceritakan gejala yang Anda rasakan sedetail mungkin</p>

                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Contoh: Demam sejak kemarin malam, disertai sakit kepala dan badan lemas..."
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 focus:bg-white transition-all resize-none"
                />

                {/* CTA */}
                <button
                  onClick={analyze}
                  disabled={analyzing || !input.trim()}
                  className={cn(
                    'mt-6 w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all duration-200',
                    'bg-sky-600 text-white hover:bg-sky-700 shadow-md shadow-sky-600/20',
                    'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none'
                  )}
                >
                  {analyzing ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Memeriksa gejala...</>
                  ) : (
                    <><Search className="h-4 w-4" /> Periksa Gejala</>
                  )}
                </button>
              </div>
            </div>

            {/* ── Loading ─────────────────────────────────────── */}
            <AnimatePresence mode="wait">
              {analyzing && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 p-8"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center">
                      <div className="h-6 w-6 rounded-full border-2 border-slate-200 border-t-sky-500 animate-spin" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Memeriksa gejala Anda</p>
                      <p className="text-sm text-slate-500 mt-0.5">Mencocokkan dengan database medis...</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Result ─────────────────────────────────────── */}
              {result && !analyzing && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="space-y-5"
                >
                  {/* Urgency Header */}
                  <div className={cn('rounded-2xl border overflow-hidden shadow-md', URGENCY[result.urgency!].light)}>
                    <div className="p-6 sm:p-7">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md', URGENCY[result.urgency!].bg)}>
                            {(() => { const Icon = URGENCY[result.urgency!].icon; return <Icon className="h-6 w-6" /> })()}
                          </div>
                          <div>
                            <p className="text-lg font-bold">{URGENCY[result.urgency!].label}</p>
                            <p className="text-sm opacity-80 mt-0.5">{URGENCY[result.urgency!].desc}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs opacity-60 font-medium">Akurasi</p>
                          <p className="text-xl font-bold">{result.confidence}%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detail Card */}
                  <div className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 overflow-hidden">
                    {/* Symptoms */}
                    <div className="p-6 border-b border-slate-100">
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Gejala yang diperiksa</p>
                      <div className="flex flex-wrap gap-2">
                        {result.symptoms.map((s, i) => (
                          <span key={i} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className="p-6 border-b border-slate-100">
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Saran</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{result.recommendation}</p>
                    </div>

                    {/* Next Steps */}
                    <div className="p-6">
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">Langkah yang disarankan</p>
                      <div className="space-y-3">
                        {result.nextSteps.map((step, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600 text-xs font-bold mt-0.5">
                              {i + 1}
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={reset}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                      >
                        <Search className="h-4 w-4" />
                        Periksa Gejala Lain
                      </button>
                      {result.urgency === 'emergency' && (
                        <a href="tel:119" className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-colors shadow-md shadow-red-600/20">
                          <Phone className="h-4 w-4" />
                          Hubungi 119
                        </a>
                      )}
                      {(result.urgency === 'urgent' || result.urgency === 'moderate') && (
                        <button className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700 transition-colors shadow-md shadow-sky-600/20">
                          <Stethoscope className="h-4 w-4" />
                          Buat Janji Dokter
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="flex gap-3 rounded-xl bg-white/80 border border-slate-200/80 p-4 shadow-sm">
                    <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Hasil pemeriksaan ini bersifat informatif dan bukan pengganti diagnosis medis profesional. Selalu konsultasikan kondisi Anda dengan dokter.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Right: Sidebar ───────────────────────────────────── */}
          <motion.aside
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-4"
          >
            {/* How It Works */}
            <div className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 p-5">
              <p className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                Cara Kerja
              </p>
              <div className="space-y-4">
                {[
                  { n: '1', t: 'Ceritakan keluhan', d: 'Tulis atau pilih gejala yang Anda rasakan' },
                  { n: '2', t: 'Sistem memeriksa', d: 'Gejala dicocokkan dengan basis data medis' },
                  { n: '3', t: 'Dapatkan hasil', d: 'Klasifikasi urgensi dan langkah selanjutnya' },
                ].map((s) => (
                  <div key={s.n} className="flex gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 text-xs font-bold border border-sky-100">
                      {s.n}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{s.t}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Urgency Levels */}
            <div className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 overflow-hidden">
              <button
                onClick={() => setShowUrgencyInfo(!showUrgencyInfo)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4.5 w-4.5 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-800">Tingkat Urgensi</span>
                </div>
                <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform duration-200', showUrgencyInfo && 'rotate-180')} />
              </button>

              <AnimatePresence>
                {showUrgencyInfo && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-2">
                      {Object.entries(URGENCY).map(([key, cfg]) => {
                        const Icon = cfg.icon
                        return (
                          <div key={key} className={cn('flex items-center gap-3 rounded-xl border px-3.5 py-2.5', cfg.light)}>
                            <Icon className="h-4 w-4 shrink-0" />
                            <div>
                              <p className="text-xs font-bold">{cfg.label}</p>
                              <p className="text-xs opacity-70">{cfg.desc}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  )
}
/* ─── Mock Result ─────────────────────────────────────────────────── */
function mockResult(symptoms: string[]): TriageResult {
  const text = symptoms.join(' ').toLowerCase()

  if (text.includes('nyeri dada') || text.includes('sesak') || text.includes('pingsan')) {
    return {
      urgency: 'emergency',
      confidence: 94,
      symptoms,
      recommendation:
        'Gejala yang Anda alami menunjukkan tanda kondisi darurat yang memerlukan penanganan medis segera. Jangan menunda untuk mendapatkan pertolongan.',
      nextSteps: [
        'Segera hubungi ambulans (119) atau minta seseorang mengantar ke IGD terdekat',
        'Jangan mengemudi sendiri ke rumah sakit',
        'Tetap tenang dan hindari aktivitas berat sambil menunggu bantuan',
        'Siapkan dokumen identitas dan kartu asuransi jika ada',
      ],
    }
  }

  if (text.includes('demam') || text.includes('muntah') || text.includes('mual')) {
    return {
      urgency: 'urgent',
      confidence: 87,
      symptoms,
      recommendation:
        'Gejala Anda memerlukan evaluasi dokter dalam 24 jam untuk memastikan tidak ada komplikasi serius dan mendapatkan penanganan yang tepat.',
      nextSteps: [
        'Buat janji temu dengan dokter umum dalam 24 jam',
        'Monitor suhu tubuh setiap 4 jam dan catat perkembangannya',
        'Pastikan hidrasi cukup dengan minum air putih minimal 2 liter per hari',
        'Hindari makanan berat dan istirahat yang cukup',
      ],
    }
  }

  if (text.includes('sakit kepala') || text.includes('batuk') || text.includes('pilek')) {
    return {
      urgency: 'moderate',
      confidence: 82,
      symptoms,
      recommendation:
        'Gejala Anda tergolong ringan hingga sedang. Monitor perkembangan gejala dan konsultasi dengan dokter jika tidak membaik dalam 3–5 hari.',
      nextSteps: [
        'Istirahat yang cukup dan hindari aktivitas berat',
        'Konsumsi makanan bergizi dan minum air hangat',
        'Monitor gejala setiap hari, catat jika ada perubahan',
        'Konsultasi dokter jika gejala memburuk atau tidak membaik dalam 5 hari',
      ],
    }
  }

  return {
    urgency: 'mild',
    confidence: 78,
    symptoms,
    recommendation:
      'Gejala Anda tergolong ringan dan dapat ditangani dengan perawatan mandiri di rumah. Tetap jaga kesehatan dan monitor perkembangan gejala.',
    nextSteps: [
      'Istirahat yang cukup dan tidur 7–8 jam per malam',
      'Konsumsi makanan bergizi seimbang dan minum air putih yang cukup',
      'Lakukan aktivitas fisik ringan seperti jalan santai',
      'Hubungi dokter jika gejala tidak membaik dalam 7 hari atau memburuk',
    ],
  }
}
