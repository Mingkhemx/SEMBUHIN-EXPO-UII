import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  ScanLine,
  Camera,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
  Image as ImageIcon,
  Clock,
  User,
  ShieldCheck,
  Stethoscope,
  Zap,
  Eye,
  Search,
  RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/dermatologi')({
  head: () => ({
    meta: [
      { title: 'Dermatologi AI Scan — Sembuhin' },
      { name: 'description', content: 'Foto area kulit bermasalah, AI pre-screening awal sebelum ke dermatologis.' },
    ],
  }),
  component: DermatologiPage,
})

/* ─── Types ──────────────────────────────────────────────────────── */
type ViewMode = 'upload' | 'analyzing' | 'result' | 'history' | 'conditions'
type Severity = 'ringan' | 'sedang' | 'perlu-perhatian'

interface ScanResult {
  condition: string
  confidence: number
  severity: Severity
  description: string
  recommendation: string
  characteristics: string[]
}

interface SkinCondition {
  id: string
  name: string
  description: string
  common: boolean
  severity: Severity
  icon: typeof Zap
}

interface PastScan {
  id: string
  date: string
  condition: string
  confidence: number
  severity: Severity
  thumbnail: string
}

/* ─── Mock Data ──────────────────────────────────────────────────── */
const SKIN_CONDITIONS: SkinCondition[] = [
  { id: '1', name: 'Jerawat (Acne Vulgaris)', description: 'Kondisi kulit umum akibat pori-pori tersumbat. Ditandai dengan komedo, papul, pustul, atau nodul.', common: true, severity: 'ringan', icon: AlertTriangle },
  { id: '2', name: 'Eksim (Dermatitis Atopik)', description: 'Peradangan kulit kronis yang menyebabkan gatal, kemerahan, dan kulit kering bersisik.', common: true, severity: 'sedang', icon: Zap },
  { id: '3', name: 'Psoriasis', description: 'Penyakit autoimun yang menyebabkan penumpukan sel kulit, membentuk sisik tebal berwarna perak.', common: false, severity: 'perlu-perhatian', icon: Eye },
  { id: '4', name: 'Kurap (Tinea)', description: 'Infeksi jamur pada kulit yang ditandai dengan ruam melingkar berwarna merah dan gatal.', common: true, severity: 'ringan', icon: AlertTriangle },
  { id: '5', name: 'Rosacea', description: 'Kondisi kronis yang menyebabkan kemerahan pada wajah, terlihat seperti pembuluh darah.', common: false, severity: 'sedang', icon: Eye },
  { id: '6', name: 'Kutil', description: 'Pertumbuhan kulit jinak yang disebabkan oleh HPV. Biasanya muncul di tangan atau kaki.', common: true, severity: 'ringan', icon: AlertTriangle },
  { id: '7', name: 'Melasma', description: 'Bercak coklat keabu-abuan pada kulit, biasanya di wajah. Umum pada wanita hamil.', common: true, severity: 'ringan', icon: Eye },
  { id: '8', name: 'Vitiligo', description: 'Kondisi yang menyebabkan hilangnya pigmentasi kulit dalam bercak-bercak.', common: false, severity: 'perlu-perhatian', icon: Eye },
]

const PAST_SCANS: PastScan[] = [
  { id: '1', date: '10 Feb 2026', condition: 'Jerawat', confidence: 87, severity: 'ringan', thumbnail: '🔴' },
  { id: '2', date: '28 Jan 2026', condition: 'Eksim', confidence: 72, severity: 'sedang', thumbnail: '🟡' },
  { id: '3', date: '15 Jan 2026', condition: 'Normal', confidence: 95, severity: 'ringan', thumbnail: '🟢' },
]

const MOCK_RESULT: ScanResult = {
  condition: 'Dermatitis Kontak Iritan',
  confidence: 78,
  severity: 'sedang',
  description: 'Kondisi peradangan kulit yang disebabkan oleh paparan zat iritan seperti deterjen, sabun, atau bahan kimia. Ditandai dengan kemerahan, gatal, dan kulit kering pada area yang terpapar.',
  recommendation: 'Hindari kontak dengan zat iritan. Gunakan pelembap hypoallergenic. Jika gejala tidak membaik dalam 1-2 minggu, konsultasi dengan dokter kulit sangat disarankan.',
  characteristics: [
    'Kemerahan pada area kulit yang terpapar',
    'Gatal atau rasa terbakar',
    'Kulit kering dan mungkin mengelupas',
    'Biasanya terlokalisir pada area kontak',
  ],
}

const SEVERITY_CONFIG: Record<Severity, { label: string; color: string; bgColor: string; icon: typeof CheckCircle2 }> = {
  ringan: { label: 'Ringan', color: 'text-emerald-700', bgColor: 'bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  sedang: { label: 'Sedang', color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200', icon: AlertTriangle },
  'perlu-perhatian': { label: 'Perlu Perhatian', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200', icon: AlertTriangle },
}

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

/* ─── Component ──────────────────────────────────────────────────── */
function DermatologiPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('upload')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [searchCondition, setSearchCondition] = useState('')
  const [cameraActive, setCameraActive] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [liveDetections, setLiveDetections] = useState<{ name: string; pct: number; severity: Severity }[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Start live camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
      setCameraActive(true)
      // Simulate live AI detection
      startLiveDetection()
    } catch {
      // Fallback: show simulated camera
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

  // Simulate live AI detections
  const startLiveDetection = () => {
    const conditions = [
      { name: 'Kulit Normal', pct: 45, severity: 'ringan' as Severity },
      { name: 'Dermatitis Kontak', pct: 28, severity: 'sedang' as Severity },
      { name: 'Jerawat', pct: 15, severity: 'ringan' as Severity },
      { name: 'Eksim', pct: 8, severity: 'sedang' as Severity },
      { name: 'Infeksi Jamur', pct: 4, severity: 'perlu-perhatian' as Severity },
    ]

    let step = 0
    const interval = setInterval(() => {
      step++
      // Gradually reveal detections with fluctuating percentages
      const revealed = conditions.slice(0, Math.min(step, conditions.length)).map((c) => ({
        ...c,
        pct: Math.max(1, Math.min(99, c.pct + Math.floor(Math.random() * 7) - 3)),
      }))
      // Sort by percentage descending
      revealed.sort((a, b) => b.pct - a.pct)
      setLiveDetections(revealed)
      setScanProgress(Math.min(step * 12, 100))

      if (step >= 10) clearInterval(interval)
    }, 800)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setUploadedImage(ev.target?.result as string)
      startAnalysis()
    }
    reader.readAsDataURL(file)
  }

  const startAnalysis = () => {
    setViewMode('analyzing')
    setTimeout(() => {
      setScanResult(MOCK_RESULT)
      setViewMode('result')
    }, 3000)
  }

  const captureAndAnalyze = () => {
    // Capture current frame from video
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth || 640
      canvas.height = videoRef.current.videoHeight || 480
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        setUploadedImage(canvas.toDataURL('image/jpeg'))
      }
    }
    stopCamera()
    startAnalysis()
  }

  const resetAll = () => {
    setViewMode('upload')
    setUploadedImage(null)
    setScanResult(null)
    setCameraActive(false)
    setScanProgress(0)
    setLiveDetections([])
    stopCamera()
  }

  const filteredConditions = SKIN_CONDITIONS.filter((c) =>
    c.name.toLowerCase().includes(searchCondition.toLowerCase())
  )

  return (
    <div className="relative z-10 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-14">

        {/* ── Hero ──────────────────────────────────────────────── */}
        <motion.header variants={fadeIn} initial="hidden" animate="visible" className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-pink-100/80 border border-pink-200/60 px-4 py-1.5 mb-5">
            <ScanLine className="h-3.5 w-3.5 text-pink-600" />
            <span className="text-xs font-semibold text-pink-700 tracking-wide uppercase">Dermatologi AI Scan</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
            Pre-Screening Kulit Anda
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-500 leading-relaxed max-w-lg">
            Upload foto area kulit yang bermasalah. AI kami akan menganalisis dan memberikan indikasi awal sebelum konsultasi ke dermatologis.
          </p>
        </motion.header>

        {/* ── Navigation ───────────────────────────────────────── */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100/80 p-1 w-fit">
          {[
            { key: 'upload', label: 'Scan Baru', icon: Camera },
            { key: 'history', label: 'Riwayat Scan', icon: Clock },
            { key: 'conditions', label: 'Kondisi Kulit', icon: Search },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setViewMode(key as ViewMode)}
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

        {/* ═══════════════════ UPLOAD / LIVE CAMERA ═══════════════════ */}
        {viewMode === 'upload' && (
          <motion.div key="upload" variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">

            {!cameraActive ? (
              /* ── Start Camera CTA ── */
              <div className="space-y-6">
                <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 sm:p-12 text-center shadow-2xl">
                  <div className="flex flex-col items-center gap-5">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-pink-500/20 animate-ping" />
                      <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-600 shadow-2xl shadow-pink-500/30">
                        <Camera className="h-12 w-12 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Nyalakan Kamera</h3>
                      <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                        Arahkan kamera ke area kulit yang bermasalah. AI akan menganalisis secara real-time.
                      </p>
                    </div>
                    <button
                      onClick={startCamera}
                      className="flex items-center gap-2 rounded-xl bg-pink-600 px-8 py-4 text-base font-bold text-white hover:bg-pink-700 shadow-lg shadow-pink-600/30 transition-all hover:scale-105"
                    >
                      <Camera className="h-5 w-5" />
                      Mulai Scan
                    </button>
                    <button
                      onClick={startAnalysis}
                      className="text-xs text-slate-400 hover:text-white transition-colors underline"
                    >
                      Atau coba demo tanpa kamera
                    </button>
                  </div>
                </div>

                {/* Tips */}
                <div className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 p-6">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Info className="h-4 w-4 text-slate-400" />
                    Tips Scan yang Baik
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {[
                      { icon: Eye, title: 'Fokus Jelas', desc: 'Pastikan area kulit terlihat tajam dan tidak blur' },
                      { icon: Zap, title: 'Cahaya Cukup', desc: 'Scan di tempat terang, hindari bayangan' },
                      { icon: Camera, title: 'Jarak Dekat', desc: 'Arahkan kamera close-up ±15-20 cm' },
                    ].map((tip) => {
                      const Icon = tip.icon
                      return (
                        <div key={tip.title} className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                          <Icon className="h-5 w-5 text-pink-600 mb-2" />
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
                  {/* Video Feed */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* Simulated camera bg if no real camera */}
                  {!streamRef.current && (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="h-16 w-16 text-slate-600 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">Kamera aktif</p>
                        <p className="text-xs text-slate-600 mt-1">Arahkan ke area kulit</p>
                      </div>
                    </div>
                  )}

                  {/* Scanning line animation */}
                  <motion.div
                    animate={{ top: ['5%', '95%', '5%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="absolute left-0 right-0 h-0.5 pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(236, 72, 153, 0.8), transparent)',
                      boxShadow: '0 0 20px rgba(236, 72, 153, 0.5)',
                    }}
                  />

                  {/* Corner brackets */}
                  <div className="absolute inset-6 pointer-events-none">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-pink-400 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-pink-400 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-pink-400 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-pink-400 rounded-br-lg" />
                  </div>

                  {/* Top bar: Status + Progress */}
                  <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)' }}>
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-bold text-white">LIVE</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-white/70">AI Scan</span>
                      <div className="w-20 h-1.5 rounded-full bg-white/20 overflow-hidden">
                        <motion.div
                          animate={{ width: `${scanProgress}%` }}
                          className="h-full rounded-full bg-pink-500"
                        />
                      </div>
                      <span className="text-xs font-mono text-white/70">{scanProgress}%</span>
                    </div>
                  </div>

                  {/* Camera controls */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
                    <button
                      onClick={stopCamera}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all border border-white/20"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <button
                      onClick={captureAndAnalyze}
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-600 text-white hover:bg-pink-700 shadow-lg shadow-pink-600/30 transition-all hover:scale-105 border-4 border-white/30"
                    >
                      <ScanLine className="h-7 w-7" />
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all border border-white/20"
                    >
                      <RotateCcw className="h-5 w-5" />
                    </button>
                  </div>

                  <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
                </div>

                {/* ── AI Analysis Card (below camera) ── */}
                <div className="rounded-b-2xl bg-white border border-t-0 border-white/60 shadow-xl shadow-slate-200/60 overflow-hidden">
                  {/* Card Header */}
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ScanLine className="h-4 w-4 text-pink-600" />
                      <h3 className="text-sm font-bold text-slate-800">Analisis AI Real-time</h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
                      <span className="text-[10px] font-semibold text-pink-600">Mendeteksi...</span>
                    </div>
                  </div>

                  {/* Live Detections */}
                  <div className="p-4 space-y-2 min-h-[200px]">
                    {liveDetections.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 text-pink-400 animate-spin mb-2" />
                        <p className="text-xs text-slate-400">Menganalisis area kulit...</p>
                      </div>
                    )}
                    <AnimatePresence>
                      {liveDetections.map((det, i) => {
                        const sevConf = SEVERITY_CONFIG[det.severity]
                        return (
                          <motion.div
                            key={det.name}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={cn(
                              'flex items-center gap-3 p-3 rounded-xl border',
                              i === 0 ? cn(sevConf.bgColor, 'shadow-sm') : 'bg-slate-50 border-slate-100'
                            )}
                          >
                            {/* Percentage Circle */}
                            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                              <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
                                <circle cx="24" cy="24" r="20" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                                <motion.circle
                                  cx="24" cy="24" r="20" fill="none"
                                  stroke={i === 0 ? (det.severity === 'ringan' ? '#10b981' : det.severity === 'sedang' ? '#f59e0b' : '#ef4444') : '#94a3b8'}
                                  strokeWidth="4" strokeLinecap="round"
                                  strokeDasharray={`${2 * Math.PI * 20}`}
                                  initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                                  animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - det.pct / 100) }}
                                  transition={{ duration: 0.6 }}
                                />
                              </svg>
                              <span className={cn('absolute text-xs font-bold', i === 0 ? sevConf.color : 'text-slate-500')}>{det.pct}%</span>
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className={cn('text-sm font-bold', i === 0 ? sevConf.color : 'text-slate-600')}>{det.name}</p>
                              <p className="text-[10px] text-slate-400">
                                {det.severity === 'ringan' ? 'Risiko rendah' : det.severity === 'sedang' ? 'Risiko sedang — pantau' : 'Perlu perhatian medis'}
                              </p>
                            </div>
                            {/* Severity badge */}
                            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', i === 0 ? cn(sevConf.bgColor, sevConf.color) : 'bg-slate-100 text-slate-500 border-slate-200')}>
                              {sevConf.label}
                            </span>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>

                  {/* Card Footer */}
                  {scanProgress >= 100 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 py-4 border-t border-slate-100 flex gap-3">
                      <button onClick={stopCamera} className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                        Stop Kamera
                      </button>
                      <button onClick={captureAndAnalyze} className="flex-1 rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-pink-700 transition-colors shadow-md shadow-pink-600/20">
                        <ScanLine className="h-4 w-4 inline mr-1.5" /> Analisis Detail
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ═══════════════════ ANALYZING ═══════════════════ */}
        {viewMode === 'analyzing' && (
          <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 p-12 text-center">
              <div className="flex flex-col items-center gap-6">
                {/* Scanning Animation */}
                <div className="relative">
                  <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-pink-100 to-pink-50 border-2 border-pink-200 flex items-center justify-center overflow-hidden">
                    {uploadedImage ? (
                      <img src={uploadedImage} alt="Scanning" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-16 w-16 text-pink-300" />
                    )}
                    {/* Scanning line */}
                    <motion.div
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute left-0 right-0 h-0.5 bg-pink-500"
                      style={{ boxShadow: '0 0 10px rgba(236, 72, 153, 0.8)' }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Loader2 className="h-8 w-8 text-pink-600 animate-spin mx-auto" />
                  <h3 className="text-lg font-bold text-slate-800">AI Sedang Menganalisis</h3>
                  <p className="text-sm text-slate-500">Mengenali pola, tekstur, dan karakteristik kulit...</p>
                </div>

                {/* Analysis steps */}
                <div className="space-y-2 w-full max-w-sm">
                  {['Deteksi area kulit', 'Analisis pola & tekstur', 'Pencocokan dengan database', 'Generate rekomendasi'].map((step, i) => (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.5 }}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.5 + 0.3 }}
                      >
                        <CheckCircle2 className="h-4 w-4 text-pink-500" />
                      </motion.div>
                      <span className="text-xs text-slate-600">{step}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════ RESULT ═══════════════════ */}
        {viewMode === 'result' && scanResult && (
          <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Severity Badge */}
            <div className={cn('rounded-2xl border overflow-hidden shadow-lg', SEVERITY_CONFIG[scanResult.severity].bgColor)}>
              <div className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  {(() => {
                    const Icon = SEVERITY_CONFIG[scanResult.severity].icon
                    return <Icon className={cn('h-12 w-12 shrink-0', SEVERITY_CONFIG[scanResult.severity].color)} />
                  })()}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={cn('text-lg font-bold', SEVERITY_CONFIG[scanResult.severity].color)}>
                        {SEVERITY_CONFIG[scanResult.severity].label}
                      </p>
                      <span className="text-xs text-slate-500">• Akurasi {scanResult.confidence}%</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">{scanResult.condition}</h2>
                    <p className="text-sm text-slate-700 leading-relaxed">{scanResult.description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-800">Tingkat Keyakinan AI</p>
                <p className="text-lg font-bold text-slate-900">{scanResult.confidence}%</p>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${scanResult.confidence}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500"
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {scanResult.confidence >= 80 ? 'Keyakinan tinggi. Disarankan konsultasi untuk konfirmasi.' : 'Keyakinan sedang. Foto tambahan dari sudut berbeda dapat meningkatkan akurasi.'}
              </p>
            </div>

            {/* Characteristics */}
            <div className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 p-6">
              <p className="text-sm font-semibold text-slate-800 mb-4">Karakteristik yang Terdeteksi</p>
              <div className="space-y-2">
                {scanResult.characteristics.map((char, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="h-4 w-4 text-pink-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600">{char}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendation */}
            <div className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 p-6">
              <p className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-slate-400" />
                Rekomendasi
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">{scanResult.recommendation}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={resetAll} className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                <RotateCcw className="h-4 w-4" />
                Scan Baru
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white hover:bg-pink-700 transition-colors shadow-md shadow-pink-600/20">
                <Stethoscope className="h-4 w-4" />
                Konsultasi Dermatologis
              </button>
            </div>

            {/* Disclaimer */}
            <div className="flex gap-3 rounded-xl bg-white/80 border border-slate-200/80 p-4 shadow-sm">
              <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 leading-relaxed">
                Hasil ini bersifat pre-screening dan BUKAN pengganti diagnosis medis profesional. Selalu konsultasikan kondisi kulit Anda dengan dermatologis untuk diagnosis dan penanganan yang tepat.
              </p>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════ HISTORY ═══════════════════ */}
        {viewMode === 'history' && (
          <motion.div key="history" variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-800">Riwayat Scan</h2>
            <div className="space-y-3">
              {PAST_SCANS.map((scan) => (
                <div key={scan.id} className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 p-5 hover:shadow-xl transition-all">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-3xl">
                      {scan.thumbnail}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', SEVERITY_CONFIG[scan.severity].bgColor, SEVERITY_CONFIG[scan.severity].color)}>
                          {SEVERITY_CONFIG[scan.severity].label}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800">{scan.condition}</h3>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {scan.date}</span>
                        <span>Akurasi {scan.confidence}%</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══════════════════ CONDITIONS ═══════════════════ */}
        {viewMode === 'conditions' && (
          <motion.div key="conditions" variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={searchCondition}
                onChange={(e) => setSearchCondition(e.target.value)}
                placeholder="Cari kondisi kulit..."
                className="flex-1 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {filteredConditions.map((cond) => {
                const Icon = cond.icon
                return (
                  <div key={cond.id} className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 p-5 hover:shadow-xl transition-all">
                    <div className="flex items-start gap-3">
                      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border', SEVERITY_CONFIG[cond.severity].bgColor)}>
                        <Icon className={cn('h-5 w-5', SEVERITY_CONFIG[cond.severity].color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-sm font-bold text-slate-800">{cond.name}</h3>
                          {cond.common && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">Umum</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{cond.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
