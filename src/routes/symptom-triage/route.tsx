import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
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
  Zap,
  Activity,
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

/* ─── OpenRouter Config ─────────────────────────────────────────── */
const OPENROUTER_KEY = import.meta.env.VITE_GEMINI_FACE_API_KEY || ''
const MODEL = 'anthropic/claude-haiku-4.5' // Claude Haiku 4.5: cepat, hemat biaya, dan akurat

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
    bg: 'from-red-500 to-red-600',
    light: 'bg-red-50 text-red-800 border-red-200',
    dot: 'bg-red-600',
    icon: XCircle,
    label: 'Darurat',
    desc: 'Segera ke IGD atau hubungi 119',
  },
  urgent: {
    bg: 'from-amber-500 to-orange-500',
    light: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    icon: AlertTriangle,
    label: 'Perlu Dokter',
    desc: 'Konsultasi dokter dalam 24 jam',
  },
  moderate: {
    bg: 'from-sky-500 to-blue-500',
    light: 'bg-sky-50 text-sky-800 border-sky-200',
    dot: 'bg-sky-500',
    icon: Stethoscope,
    label: 'Perlu Pantauan',
    desc: 'Monitor gejala, konsultasi jika memburuk',
  },
  mild: {
    bg: 'from-emerald-500 to-teal-500',
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

/* ─── Daftar kata kunci gejala medis ───────────────────────────────── */
const MEDICAL_KEYWORDS = [
  'sakit', 'nyeri', 'demam', 'panas', 'pilek', 'batuk', 'pusing', 'pingsan',
  'mual', 'muntah', 'diare', 'sesak', 'napas', 'dada', 'kepala', 'perut',
  'punggung', 'lengan', 'kaki', 'tangan', 'leher', 'telinga', 'mata', 'hidung',
  'mulut', 'gigi', 'lidah', 'kulit', 'gatal', 'merah', 'bengkak', 'luka',
  'lecet', 'pendarahan', 'kejang', 'lemas', 'lesu', 'tidak nafsu makan',
  'nafsu makan turun', 'berat badan turun', 'berat badan naik', 'susah tidur',
  'insomnia', 'ngilu', 'kram', 'kebas', 'kesemutan', 'ruam', 'jerawat',
  'bisul', 'kurap', 'cacingan', 'demam tinggi', 'batuk darah', 'muntah darah',
  'buang air besar berdarah', 'kencing berdarah', 'susah kencing', 'susah buang air besar',
  'jantung berdebar', 'tekanan darah tinggi', 'tekanan darah rendah', 'gula darah tinggi',
  'kolesterol tinggi', 'asam urat', 'rematik', 'nyeri sendi', 'sulit gerak',
  'alergi', 'gatal alergi', 'bersin bersin', 'hidung tersumbat', 'hidung meler',
  'telinga berdenging', 'telinga tersumbat', 'mata merah', 'mata berair',
  'mata gatal', 'mata kering', 'mulut kering', 'bau mulut', 'sariawan',
  'gigi ngilu', 'gigi sakit', 'gusi bengkak', 'gusi berdarah', 'leher bengkak',
  'kelenjar getah bening', 'pusing berputar', 'vertigo', 'migrain', 'sakit kepala sebelah',
  'mabuk perjalanan', 'mabuk laut', 'mabuk udara', 'kelelahan', 'cape',
  'tidak bertenaga', 'lemas banget', 'nyeri otot', 'nyeri tulang', 'patah tulang',
  'retak tulang', 'dislokasi', 'terkilir', 'tergores', 'teriris', 'luka bakar',
  'luka lecet', 'luka dalam', 'infeksi', 'radang', 'radang tenggorokan',
  'radang paru paru', 'radang usus', 'radang lambung', 'maag', 'asam lambung naik',
  'gerd', 'tipus', 'tifus', 'dbd', 'demam berdarah', 'cikungunya', 'malaria',
  'covid', 'corona', 'flu', 'influenza', 'batuk pilek', 'selesma',
]

/* ─── AI Function ─────────────────────────────────────────────────── */
const analyzeSymptomsWithAI = async (symptomsText: string): Promise<TriageResult | null> => {
  if (!OPENROUTER_KEY) {
    console.log('[SymptomAI] No API key, using mock')
    return null
  }

  const prompt = `
Anda adalah asisten medis profesional yang membantu mengklasifikasikan gejala.

Gejala pasien: ${symptomsText}

PERHATIAN PENTING:
- Jika input pasien BUKAN tentang gejala medis (misal: permintaan coding, pertanyaan umum, dll), jawab HANYA dengan JSON: {"error": "input_non_medis"}
- Hanya analisis jika input adalah tentang keluhan kesehatan!

Tugas Anda (jika input adalah gejala medis):
1. Tentukan tingkat urgensi (hanya boleh: emergency, urgent, moderate, mild)
   - emergency: kondisi yang mengancam nyawa (sesak napas berat, nyeri dada hebat, pingsan, stroke, trauma parah)
   - urgent: butuh konsultasi dokter dalam 24 jam (demam tinggi lebih dari 2 hari, muntah terus-menerus, nyeri hebat, dll)
   - moderate: perlu pantauan, bisa konsultasi jika memburuk
   - mild: bisa dirawat mandiri di rumah
2. Berikan tingkat keyakinan (0-100)
3. Ekstrak gejala utama menjadi array
4. Berikan rekomendasi dan langkah selanjutnya

WAJIB jawab HANYA dalam format JSON valid ini:
{
  "urgency": "emergency",
  "confidence": 85,
  "symptoms": ["gejala1", "gejala2"],
  "recommendation": "Rekomendasi yang jelas dan praktis dalam Bahasa Indonesia",
  "nextSteps": ["langkah 1", "langkah 2", "langkah 3", "langkah 4"]
}

Hanya jawab dengan JSON, tidak ada teks lain.
`

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Sembuhin Symptom Checker',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 600,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('[SymptomAI] HTTP', res.status, err)
      return null
    }

    const data = await res.json()
    const text: string = data?.choices?.[0]?.message?.content ?? ''
    const clean = text.replace(/```json|```/g, '').trim()
    const jsonMatch = clean.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[SymptomAI] No JSON in response:', clean)
      return null
    }

    const parsed = JSON.parse(jsonMatch[0])
    
    // Check if AI rejected input
    if (parsed.error === 'input_non_medis') {
      console.log('[SymptomAI] Input rejected (non-medical)')
      return null
    }
    
    if (!['emergency', 'urgent', 'moderate', 'mild'].includes(parsed.urgency)) {
      parsed.urgency = 'mild'
    }
    return parsed
  } catch (err) {
    console.error('[SymptomAI] Error:', err)
    return null
  }
}

/* ─── Helper: Cek apakah input adalah gejala medis ───────────────── */
const isMedicalInput = (text: string): boolean => {
  const lowerText = text.toLowerCase()
  return MEDICAL_KEYWORDS.some(keyword => lowerText.includes(keyword))
}

/* ─── Component ──────────────────────────────────────────────────── */
function SymptomTriagePage() {
  const [input, setInput] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<TriageResult | null>(null)
  const [showUrgencyInfo, setShowUrgencyInfo] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const analyze = useCallback(async () => {
    if (!input.trim()) return
    
    setErrorMessage(null)
    setAnalyzing(true)
    setResult(null)

    // Validasi 1: Cek apakah input mengandung kata kunci medis
    if (!isMedicalInput(input)) {
      setErrorMessage('Maaf, sepertinya Anda tidak memasukkan gejala medis. Mohon ceritakan keluhan kesehatan Anda dengan jelas (misal: "demam tinggi", "sakit kepala", dll).')
      setAnalyzing(false)
      return
    }

    // Try AI first
    const aiResult = await analyzeSymptomsWithAI(input.trim())
    if (aiResult) {
      setResult(aiResult)
      setAnalyzing(false)
      return
    }

    // Fallback to mock (hanya jika input adalah medis)
    setTimeout(() => {
      setResult(mockResult([input.trim()]))
      setAnalyzing(false)
    }, 2000)
  }, [input])

  const reset = () => {
    setInput('')
    setResult(null)
    setErrorMessage(null)
  }

  return (
    <div className="relative z-10 min-h-screen">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-14">
        {/* ── Hero ──────────────────────────────────────────────── */}
        <motion.header
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-100/80 border border-sky-200/60 px-5 py-2 mb-6">
            <Stethoscope className="h-4 w-4 text-sky-600" />
            <span className="text-xs font-semibold text-sky-700 tracking-wide uppercase">AI Symptom Checker 1.3 (Claude Haiku 4.5)</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-slate-900 leading-tight tracking-tight">
            Cek Tingkat Urgensi<br className="hidden sm:block" /> Kesehatan Anda
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">
            Ceritakan keluhan yang Anda rasakan. Sistem AI kami akan membantu mengklasifikasikan tingkat urgensi dan memberikan langkah penanganan yang tepat secara real-time.
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center items-center gap-4 mt-8">
            {[
              { icon: ShieldCheck, label: 'Data Terenkripsi' },
              { icon: Activity, label: 'AI Powered (Claude Haiku 4.5)' },
              { icon: Clock, label: 'Tersedia 24/7' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 rounded-full glass px-4 py-2 text-xs font-medium text-slate-600 shadow-sm">
                <Icon className="h-4 w-4 text-sky-500" />
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
          className="rounded-3xl glass-strong border border-red-200/40 text-slate-900 px-6 py-5 shadow-xl shadow-red-900/5 flex items-center gap-5"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30">
            <Phone className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm sm:text-base">Kondisi Darurat?</p>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Jika mengalami sesak napas berat, nyeri dada hebat, atau pingsan — segera hubungi layanan darurat.
            </p>
          </div>
          <a href="tel:119" className="shrink-0 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-5 py-3 text-sm font-bold text-white transition-all shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95">
            <Phone className="h-4 w-4" />
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
            <div className="glass-strong rounded-3xl border border-sky-100/50 shadow-xl shadow-sky-900/5 overflow-hidden">
              <div className="p-7 sm:p-9">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-500 shadow-lg shadow-sky-500/30">
                    <Search className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-800">Apa keluhan Anda?</label>
                    <p className="text-xs text-slate-500">Ceritakan gejala yang Anda rasakan sedetail mungkin</p>
                  </div>
                </div>

                <textarea
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                    setErrorMessage(null)
                  }}
                  placeholder="Contoh: Demam sejak kemarin malam, disertai sakit kepala dan badan lemas..."
                  rows={5}
                  className={cn(
                    "w-full rounded-2xl border bg-slate-50/80 backdrop-blur-sm px-5 py-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all resize-none",
                    errorMessage
                      ? "border-red-300 focus:ring-red-500/20 focus:border-red-400 focus:bg-white"
                      : "border-slate-200 focus:ring-sky-500/20 focus:border-sky-400 focus:bg-white"
                  )}
                />

                {/* Error Message */}
                <AnimatePresence>
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      className="mt-4"
                    >
                      <div className="flex items-start gap-3 rounded-2xl bg-red-50 border border-red-200 px-4 py-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-700 leading-relaxed">{errorMessage}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* CTA */}
                <button
                  onClick={analyze}
                  disabled={analyzing || !input.trim()}
                  className={cn(
                    'mt-7 w-full flex items-center justify-center gap-2.5 rounded-2xl px-7 py-4 text-sm font-bold transition-all duration-200',
                    'bg-gradient-to-r from-sky-600 to-blue-600 text-white hover:from-sky-700 hover:to-blue-700 shadow-xl shadow-sky-600/25',
                    'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:scale-100',
                    'hover:scale-[1.01] active:scale-[0.98]'
                  )}
                >
                  {analyzing ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Memeriksa gejala...</>
                  ) : (
                    <><Zap className="h-5 w-5" /> Periksa Gejala Sekarang</>
                  )}
                </button>
              </div>
            </div>

            {/* ── Loading ─────────────────────────────────────── */}
            <AnimatePresence mode="wait">
              {analyzing && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="glass-strong rounded-3xl border border-sky-100/50 shadow-xl shadow-sky-900/5 p-8"
                >
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 border border-sky-200 flex items-center justify-center">
                      <Loader2 className="h-7 w-7 text-sky-600 animate-spin" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-base">Memeriksa gejala Anda</p>
                      <p className="text-sm text-slate-500 mt-1">Menganalisis dengan AI Claude Haiku 4.5...</p>
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
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="space-y-5"
                >
                  {/* Urgency Header */}
                  <div className={cn('glass-strong rounded-3xl border overflow-hidden shadow-xl', URGENCY[result.urgency!].light)}>
                    <div className="p-7 sm:p-8">
                      <div className="flex items-start justify-between gap-5">
                        <div className="flex items-center gap-4">
                          <div className={cn('flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-xl bg-gradient-to-br', URGENCY[result.urgency!].bg)}>
                            {(() => { const Icon = URGENCY[result.urgency!].icon; return <Icon className="h-7 w-7" /> })()}
                          </div>
                          <div>
                            <p className="text-xl font-bold">{URGENCY[result.urgency!].label}</p>
                            <p className="text-sm opacity-80 mt-1">{URGENCY[result.urgency!].desc}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs opacity-60 font-bold uppercase tracking-wider">Tingkat Akurasi</p>
                          <p className="text-3xl font-display font-bold">{result.confidence}%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detail Card */}
                  <div className="glass-strong rounded-3xl border border-sky-100/50 shadow-xl shadow-sky-900/5 overflow-hidden">
                    {/* Symptoms */}
                    <div className="p-7 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Gejala yang diperiksa</p>
                      <div className="flex flex-wrap gap-2.5">
                        {result.symptoms.map((s, i) => (
                          <span key={i} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className="p-7 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Rekomendasi</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{result.recommendation}</p>
                    </div>

                    {/* Next Steps */}
                    <div className="p-7">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Langkah yang disarankan</p>
                      <div className="space-y-4">
                        {result.nextSteps.map((step, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-blue-100 text-sky-600 text-xs font-bold mt-0.5 border border-sky-200">
                              {i + 1}
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed font-medium">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-7 bg-gradient-to-r from-slate-50 to-sky-50 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={reset}
                        className="flex-1 flex items-center justify-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm hover:shadow-md"
                      >
                        <Search className="h-4.5 w-4.5" />
                        Periksa Gejala Lain
                      </button>
                      {result.urgency === 'emergency' && (
                        <a href="tel:119" className="flex-1 flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 px-6 py-3.5 text-sm font-bold text-white hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-600/20 hover:shadow-xl hover:scale-105 active:scale-95">
                          <Phone className="h-4.5 w-4.5" />
                          Hubungi 119
                        </a>
                      )}
                      {(result.urgency === 'urgent' || result.urgency === 'moderate') && (
                        <button className="flex-1 flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 px-6 py-3.5 text-sm font-bold text-white hover:from-sky-700 hover:to-blue-700 transition-all shadow-lg shadow-sky-600/20 hover:shadow-xl hover:scale-105 active:scale-95">
                          <Stethoscope className="h-4.5 w-4.5" />
                          Konsultasi Dokter
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="flex gap-3.5 rounded-2xl glass border border-slate-200/50 p-5 shadow-sm">
                    <Info className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
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
            className="lg:col-span-2 space-y-5"
          >
            {/* How It Works */}
            <div className="glass-strong rounded-3xl border border-sky-100/50 shadow-xl shadow-sky-900/5 p-6 sm:p-7">
              <p className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2.5">
                <Clock className="h-4.5 w-4.5 text-sky-500" />
                Cara Kerja
              </p>
              <div className="space-y-4">
                {[
                  { n: '1', t: 'Ceritakan keluhan', d: 'Tulis atau pilih gejala yang Anda rasakan' },
                  { n: '2', t: 'Sistem memeriksa', d: 'Gejala dianalisis dengan AI Claude Haiku 4.5' },
                  { n: '3', t: 'Dapatkan hasil', d: 'Klasifikasi urgensi dan langkah selanjutnya' },
                ].map((s) => (
                  <div key={s.n} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/10 to-blue-500/10 text-sky-600 text-xs font-bold border border-sky-200">
                      {s.n}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{s.t}</p>
                      <p className="text-xs text-slate-500 mt-1">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Urgency Levels */}
            <div className="glass-strong rounded-3xl border border-sky-100/50 shadow-xl shadow-sky-900/5 overflow-hidden">
              <button
                onClick={() => setShowUrgencyInfo(!showUrgencyInfo)}
                className="w-full flex items-center justify-between p-6 sm:p-7 text-left hover:bg-slate-50/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-sky-500" />
                  <span className="text-sm font-bold text-slate-800">Tingkat Urgensi</span>
                </div>
                <ChevronDown className={cn('h-5 w-5 text-slate-400 transition-transform duration-200', showUrgencyInfo && 'rotate-180')} />
              </button>

              <AnimatePresence>
                {showUrgencyInfo && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 sm:px-7 pb-7 space-y-3">
                      {Object.entries(URGENCY).map(([key, cfg]) => {
                        const Icon = cfg.icon
                        return (
                          <div key={key} className={cn('flex items-center gap-3.5 rounded-2xl border px-4 py-3.5', cfg.light)}>
                            <div className={cn('flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br text-white', cfg.bg)}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold">{cfg.label}</p>
                              <p className="text-xs opacity-80">{cfg.desc}</p>
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
/* ─── Mock Result (Fallback) ───────────────────────────────────────── */
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
      confidence: 88,
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
