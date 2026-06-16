import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  Camera,
  X,
  Loader2,
  CheckCircle2,
  Info,
  ScanLine,
  Clock,
  Smile,
  Frown,
  Meh,
  Heart,
  Brain,
  Sparkles,
  RotateCcw,
  Search,
  ChevronRight,
  BookOpen,
  Music,
  Wind,
  Users,
  Sun,
  AlertTriangle,
  Stethoscope,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/mood-check')({
  head: () => ({
    meta: [
      { title: 'Mood Check — Sembuhin' },
      { name: 'description', content: 'Cek mood Anda via kamera. AI menganalisis ekspresi wajah untuk mengetahui kondisi emosional Anda.' },
    ],
  }),
  component: MoodCheckPage,
})

/* ─── Types ──────────────────────────────────────────────────────── */
type ViewMode = 'camera' | 'result' | 'history' | 'activities'
type MoodLevel = 'happy' | 'calm' | 'neutral' | 'anxious' | 'sad' | 'angry' | 'tired'

interface MoodDetection {
  emotion: string
  pct: number
  icon: typeof Smile
  color: string
  description: string
}

interface MoodResult {
  primaryMood: MoodLevel
  confidence: number
  description: string
  recommendation: string
  activities: { title: string; desc: string; icon: typeof Brain; duration: string }[]
  detections: MoodDetection[]
}

/* ─── Constants ──────────────────────────────────────────────────── */
const MOOD_EMOTIONS: MoodDetection[] = [
  { emotion: 'Senang', pct: 38, icon: Smile, color: 'text-emerald-600', description: 'Ekspresi positif terdeteksi' },
  { emotion: 'Tenang', pct: 25, icon: Meh, color: 'text-sky-600', description: 'Wajah rileks dan stabil' },
  { emotion: 'Netral', pct: 18, icon: Meh, color: 'text-slate-500', description: 'Tanpa ekspresi dominan' },
  { emotion: 'Cemas', pct: 10, icon: AlertTriangle, color: 'text-amber-600', description: 'Tanda ketegangan ringan' },
  { emotion: 'Sedih', pct: 5, icon: Frown, color: 'text-indigo-600', description: 'Indikasi kesedihan minimal' },
  { emotion: 'Marah', pct: 3, icon: Frown, color: 'text-red-600', description: 'Tidak terdeteksi signifikan' },
  { emotion: 'Lelah', pct: 1, icon: Meh, color: 'text-violet-600', description: 'Minimal tanda kelelahan' },
]

const MOCK_RESULT: MoodResult = {
  primaryMood: 'happy',
  confidence: 82,
  description: 'Anda terlihat dalam kondisi emosional yang baik! Ekspresi wajah menunjukkan kebahagiaan dan ketenangan. Pertahankan suasana positif ini.',
  recommendation: 'Mood Anda sedang bagus. Manfaatkan energi positif ini untuk aktivitas yang produktif atau bersosialisasi dengan orang terdekat.',
  activities: [
    { title: 'Jalan Kaki 15 Menit', desc: 'Pertahankan mood positif dengan aktivitas ringan di luar ruangan', icon: Sun, duration: '15 min' },
    { title: 'Journaling Syukur', desc: 'Tulis 3 hal yang Anda syukuri hari ini', icon: BookOpen, duration: '10 min' },
    { title: 'Musik Favorit', desc: 'Dengarkan playlist yang membuat Anda bahagia', icon: Music, duration: '20 min' },
    { title: 'Hubungi Teman', desc: 'Ceritakan kabar baik Anda ke orang terdekat', icon: Users, duration: '15 min' },
  ],
  detections: MOOD_EMOTIONS,
}

const MOOD_CONFIG: Record<MoodLevel, { label: string; color: string; bgColor: string; emoji: string }> = {
  happy: { label: 'Senang', color: 'text-emerald-700', bgColor: 'bg-emerald-50 border-emerald-200', emoji: '😊' },
  calm: { label: 'Tenang', color: 'text-sky-700', bgColor: 'bg-sky-50 border-sky-200', emoji: '😌' },
  neutral: { label: 'Netral', color: 'text-slate-700', bgColor: 'bg-slate-50 border-slate-200', emoji: '😐' },
  anxious: { label: 'Cemas', color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200', emoji: '😰' },
  sad: { label: 'Sedih', color: 'text-indigo-700', bgColor: 'bg-indigo-50 border-indigo-200', emoji: '😢' },
  angry: { label: 'Marah', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200', emoji: '😠' },
  tired: { label: 'Lelah', color: 'text-violet-700', bgColor: 'bg-violet-50 border-violet-200', emoji: '😫' },
}

const PAST_MOODS = [
  { date: '11 Feb 2026', mood: 'happy' as MoodLevel, confidence: 82 },
  { date: '9 Feb 2026', mood: 'calm' as MoodLevel, confidence: 75 },
  { date: '7 Feb 2026', mood: 'anxious' as MoodLevel, confidence: 68 },
  { date: '5 Feb 2026', mood: 'happy' as MoodLevel, confidence: 88 },
  { date: '3 Feb 2026', mood: 'tired' as MoodLevel, confidence: 71 },
]

const RECOMMENDED_ACTIVITIES = [
  { category: 'Jika Cemas', activities: [{ title: 'Pernapasan 4-7-8', desc: 'Teknik napas untuk menenangkan', icon: Wind, duration: '5 min' }, { title: 'Grounding 5-4-3-2-1', desc: 'Fokus ke panca indera', icon: Brain, duration: '3 min' }] },
  { category: 'Jika Sedih', activities: [{ title: 'Jalan di Alam', desc: 'Kontak dengan alam meningkatkan mood', icon: Sun, duration: '20 min' }, { title: 'Hubungi Orang Terdekat', desc: 'Berbagi cerita meringankan beban', icon: Users, duration: '15 min' }] },
  { category: 'Jika Lelah', activities: [{ title: 'Power Nap', desc: 'Tidur singkat untuk recharge', icon: Heart, duration: '20 min' }, { title: 'Stretching Ringan', desc: 'Regangkan otot untuk energi', icon: Sparkles, duration: '10 min' }] },
]

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

/* ─── Component ──────────────────────────────────────────────────── */
function MoodCheckPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('camera')
  const [cameraActive, setCameraActive] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [liveDetections, setLiveDetections] = useState<MoodDetection[]>([])
  const [moodResult, setMoodResult] = useState<MoodResult | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
      setCameraActive(true)
      startLiveDetection()
    } catch {
      setCameraActive(true)
      startLiveDetection()
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setCameraActive(false)
    setScanProgress(0)
    setLiveDetections([])
  }

  const startLiveDetection = () => {
    let step = 0
    const interval = setInterval(() => {
      step++
      const revealed = MOOD_EMOTIONS.slice(0, Math.min(step, MOOD_EMOTIONS.length)).map((e) => ({
        ...e,
        pct: Math.max(1, Math.min(99, e.pct + Math.floor(Math.random() * 7) - 3)),
      }))
      revealed.sort((a, b) => b.pct - a.pct)
      setLiveDetections(revealed)
      setScanProgress(Math.min(step * 12, 100))
      if (step >= 10) clearInterval(interval)
    }, 800)
  }

  const captureMood = () => {
    stopCamera()
    setMoodResult(MOCK_RESULT)
    setViewMode('result')
  }

  const resetAll = () => {
    setViewMode('camera')
    setCameraActive(false)
    setScanProgress(0)
    setLiveDetections([])
    setMoodResult(null)
    stopCamera()
  }

  return (
    <div className="relative z-10 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-14">

        {/* ── Hero ──────────────────────────────────────────────── */}
        <motion.header variants={fadeIn} initial="hidden" animate="visible" className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-100/80 border border-cyan-200/60 px-4 py-1.5 mb-5">
            <Smile className="h-3.5 w-3.5 text-cyan-600" />
            <span className="text-xs font-semibold text-cyan-700 tracking-wide uppercase">Mood Check</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
            Cek Mood Via Kamera
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-500 leading-relaxed max-w-lg">
            AI menganalisis ekspresi wajah Anda untuk mengetahui kondisi emosional. Dapatkan rekomendasi aktivitas yang sesuai dengan mood Anda.
          </p>
        </motion.header>

        {/* ── Navigation ───────────────────────────────────────── */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100/80 p-1 w-fit">
          {[
            { key: 'camera', label: 'Cek Mood', icon: Camera },
            { key: 'history', label: 'Riwayat Mood', icon: Clock },
            { key: 'activities', label: 'Aktivitas', icon: BookOpen },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { if (key === 'camera') resetAll(); else setViewMode(key as ViewMode) }}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200',
                viewMode === key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* ═══════════════════ CAMERA ═══════════════════ */}
        {viewMode === 'camera' && (
          <motion.div key="camera" variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
            {!cameraActive ? (
              /* ── Start Camera CTA ── */
              <div className="space-y-6">
                <div className="rounded-2xl bg-gradient-to-br from-cyan-600 via-sky-700 to-blue-800 p-8 sm:p-12 text-center shadow-2xl">
                  <div className="flex flex-col items-center gap-5">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping" />
                      <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white/15 border-2 border-white/30 backdrop-blur-sm">
                        <Smile className="h-12 w-12 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Siap Cek Mood?</h3>
                      <p className="text-sm text-cyan-100 mt-1 max-w-sm mx-auto">
                        Tatap kamera depan Anda. AI akan membaca ekspresi wajah untuk menganalisis kondisi emosional.
                      </p>
                    </div>
                    <button
                      onClick={startCamera}
                      className="flex items-center gap-2 rounded-xl bg-white text-cyan-700 px-8 py-4 text-base font-bold hover:bg-cyan-50 shadow-lg transition-all hover:scale-105"
                    >
                      <Camera className="h-5 w-5" />
                      Nyalakan Kamera
                    </button>
                    <button
                      onClick={() => { setMoodResult(MOCK_RESULT); setViewMode('result') }}
                      className="text-xs text-cyan-200 hover:text-white transition-colors underline"
                    >
                      Atau coba demo tanpa kamera
                    </button>
                  </div>
                </div>

                {/* Tips */}
                <div className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 p-6">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Info className="h-4 w-4 text-slate-400" />
                    Tips Mood Check
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {[
                      { icon: Smile, title: 'Wajah Natural', desc: 'Jangan dipaksakan, tunjukkan ekspresi alami Anda' },
                      { icon: Sun, title: 'Cahaya Merata', desc: 'Pastikan wajah terkena cahaya cukup dari depan' },
                      { icon: Camera, title: 'Kamera Depan', desc: 'Gunakan kamera depan untuk hasil terbaik' },
                    ].map((tip) => {
                      const Icon = tip.icon
                      return (
                        <div key={tip.title} className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                          <Icon className="h-5 w-5 text-cyan-600 mb-2" />
                          <p className="text-xs font-bold text-slate-800">{tip.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{tip.desc}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* ── Live Camera View ── */
              <div className="space-y-0">
                {/* Camera Feed */}
                <div className="relative rounded-t-2xl overflow-hidden bg-slate-900 shadow-2xl" style={{ aspectRatio: '4/3' }}>
                  <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />

                  {/* Simulated camera bg */}
                  {!streamRef.current && (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 flex items-center justify-center">
                      <div className="text-center">
                        <div className="relative mx-auto mb-4">
                          <div className="h-24 w-24 rounded-full border-2 border-dashed border-cyan-400/50 flex items-center justify-center">
                            <Smile className="h-12 w-12 text-cyan-400/60" />
                          </div>
                        </div>
                        <p className="text-sm text-slate-400">Kamera depan aktif</p>
                        <p className="text-xs text-slate-500 mt-1">Tatap kamera dengan ekspresi natural</p>
                      </div>
                    </div>
                  )}

                  {/* Face tracking overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <motion.div
                      animate={{ scale: [1, 1.03, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-48 h-60 rounded-[50%] border-2 border-cyan-400/60"
                      style={{ boxShadow: '0 0 30px rgba(6, 182, 212, 0.15), inset 0 0 30px rgba(6, 182, 212, 0.05)' }}
                    />
                  </div>

                  {/* Scanning line */}
                  <motion.div
                    animate={{ top: ['10%', '90%', '10%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="absolute left-0 right-0 h-0.5 pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.7), transparent)',
                      boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)',
                    }}
                  />

                  {/* Top bar */}
                  <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)' }}>
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-bold text-white">LIVE</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-white/70">Mood Scan</span>
                      <div className="w-20 h-1.5 rounded-full bg-white/20 overflow-hidden">
                        <motion.div animate={{ width: `${scanProgress}%` }} className="h-full rounded-full bg-cyan-400" />
                      </div>
                      <span className="text-xs font-mono text-white/70">{scanProgress}%</span>
                    </div>
                  </div>

                  {/* Camera controls */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
                    <button onClick={stopCamera} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all border border-white/20">
                      <X className="h-5 w-5" />
                    </button>
                    <button onClick={captureMood} className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500 text-white hover:bg-cyan-600 shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 border-4 border-white/30">
                      <Smile className="h-7 w-7" />
                    </button>
                    <div className="h-12 w-12" /> {/* Spacer for balance */}
                  </div>
                </div>

                {/* ── AI Mood Analysis Card ── */}
                <div className="rounded-b-2xl bg-white border border-t-0 border-white/60 shadow-xl shadow-slate-200/60 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-cyan-600" />
                      <h3 className="text-sm font-bold text-slate-800">Analisis Mood Real-time</h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                      <span className="text-[10px] font-semibold text-cyan-600">Membaca ekspresi...</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2 min-h-[200px]">
                    {liveDetections.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mb-2" />
                        <p className="text-xs text-slate-400">Menganalisis ekspresi wajah...</p>
                      </div>
                    )}
                    <AnimatePresence>
                      {liveDetections.map((det, i) => {
                        const Icon = det.icon
                        return (
                          <motion.div
                            key={det.emotion}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={cn(
                              'flex items-center gap-3 p-3 rounded-xl border',
                              i === 0 ? 'bg-cyan-50 border-cyan-200 shadow-sm' : 'bg-slate-50 border-slate-100'
                            )}
                          >
                            {/* Percentage Circle */}
                            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                              <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
                                <circle cx="24" cy="24" r="20" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                                <motion.circle
                                  cx="24" cy="24" r="20" fill="none"
                                  stroke={i === 0 ? '#06b6d4' : '#94a3b8'}
                                  strokeWidth="4" strokeLinecap="round"
                                  strokeDasharray={`${2 * Math.PI * 20}`}
                                  initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                                  animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - det.pct / 100) }}
                                  transition={{ duration: 0.6 }}
                                />
                              </svg>
                              <span className={cn('absolute text-xs font-bold', i === 0 ? 'text-cyan-700' : 'text-slate-500')}>{det.pct}%</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Icon className={cn('h-4 w-4', i === 0 ? det.color : 'text-slate-400')} />
                                <p className={cn('text-sm font-bold', i === 0 ? 'text-slate-800' : 'text-slate-600')}>{det.emotion}</p>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">{det.description}</p>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>

                  {scanProgress >= 100 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 py-4 border-t border-slate-100 flex gap-3">
                      <button onClick={stopCamera} className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                        Stop
                      </button>
                      <button onClick={captureMood} className="flex-1 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-cyan-700 transition-colors shadow-md shadow-cyan-600/20">
                        <Sparkles className="h-4 w-4 inline mr-1.5" /> Lihat Hasil Mood
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ═══════════════════ RESULT ═══════════════════ */}
        {viewMode === 'result' && moodResult && (
          <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Mood Card */}
            <div className={cn('rounded-2xl border overflow-hidden shadow-lg', MOOD_CONFIG[moodResult.primaryMood].bgColor)}>
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-5">
                  <div className="text-6xl">{MOOD_CONFIG[moodResult.primaryMood].emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={cn('text-lg font-bold', MOOD_CONFIG[moodResult.primaryMood].color)}>
                        Mood: {MOOD_CONFIG[moodResult.primaryMood].label}
                      </p>
                      <span className="text-xs text-slate-500">• Akurasi {moodResult.confidence}%</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{moodResult.description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Confidence */}
            <div className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-800">Tingkat Keyakinan AI</p>
                <p className="text-lg font-bold text-slate-900">{moodResult.confidence}%</p>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${moodResult.confidence}%` }} transition={{ duration: 1, delay: 0.3 }} className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-500" />
              </div>
            </div>

            {/* Emotions Breakdown */}
            <div className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 p-6">
              <p className="text-sm font-semibold text-slate-800 mb-4">Detail Emosi yang Terdeteksi</p>
              <div className="space-y-2">
                {moodResult.detections.map((det, i) => {
                  const Icon = det.icon
                  return (
                    <div key={det.emotion} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <Icon className={cn('h-4 w-4 shrink-0', det.color)} />
                      <span className="text-sm font-medium text-slate-700 w-20">{det.emotion}</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${det.pct}%` }} transition={{ duration: 0.6, delay: i * 0.1 }} className={cn('h-full rounded-full', i === 0 ? 'bg-cyan-500' : 'bg-slate-400')} />
                      </div>
                      <span className="text-xs font-bold text-slate-600 w-10 text-right">{det.pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recommendation */}
            <div className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 p-6">
              <p className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-500" />
                Rekomendasi
              </p>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">{moodResult.recommendation}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {moodResult.activities.map((act) => {
                  const Icon = act.icon
                  return (
                    <div key={act.title} className="flex items-start gap-3 p-3 rounded-xl bg-cyan-50 border border-cyan-100">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-cyan-200">
                        <Icon className="h-4 w-4 text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{act.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{act.desc}</p>
                        <p className="text-[10px] text-cyan-600 font-semibold mt-1">{act.duration}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={resetAll} className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm">
                <RotateCcw className="h-4 w-4" /> Cek Ulang
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white hover:bg-cyan-700 shadow-md shadow-cyan-600/20">
                <Stethoscope className="h-4 w-4" /> Konsultasi Mental Health
              </button>
            </div>

            <div className="flex gap-3 rounded-xl bg-white/80 border border-slate-200/80 p-4 shadow-sm">
              <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 leading-relaxed">
                Mood check bersifat indikatif dan bukan pengganti evaluasi psikologis profesional. Jika Anda mengalami perubahan mood yang signifikan atau berkepanjangan, konsultasikan dengan profesional kesehatan mental.
              </p>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════ HISTORY ═══════════════════ */}
        {viewMode === 'history' && (
          <motion.div key="history" variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-800">Riwayat Mood</h2>
            <div className="space-y-3">
              {PAST_MOODS.map((entry, i) => {
                const conf = MOOD_CONFIG[entry.mood]
                return (
                  <div key={i} className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 p-5 flex items-center gap-4">
                    <div className="text-3xl">{conf.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn('text-sm font-bold', conf.color)}>{conf.label}</span>
                        <span className="text-[10px] text-slate-400">Akurasi {entry.confidence}%</span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1"><Clock className="h-3 w-3" /> {entry.date}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* ═══════════════════ ACTIVITIES ═══════════════════ */}
        {viewMode === 'activities' && (
          <motion.div key="activities" variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-800">Aktivitas Berdasarkan Mood</h2>
            <div className="space-y-6">
              {RECOMMENDED_ACTIVITIES.map((section) => (
                <div key={section.category}>
                  <h3 className="text-sm font-bold text-slate-700 mb-3">{section.category}</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {section.activities.map((act) => {
                      const Icon = act.icon
                      return (
                        <div key={act.title} className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 p-5 hover:shadow-xl transition-all cursor-pointer group">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 border border-cyan-100">
                              <Icon className="h-5 w-5 text-cyan-600" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-800 group-hover:text-cyan-700 transition-colors">{act.title}</h4>
                              <p className="text-xs text-slate-500 mt-0.5">{act.desc}</p>
                              <p className="text-[10px] text-cyan-600 font-semibold mt-2">{act.duration}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
