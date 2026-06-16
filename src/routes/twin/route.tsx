import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  Heart,
  Wind,
  Brain,
  Utensils,
  Activity,
  Eye,
  Layers,
  ChevronRight,
  Sparkles,
  Scan,
  Move3D,
  Loader2,
  ShieldCheck,
  Clock,
  TrendingUp,
  Info,
} from 'lucide-react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/twin')({
  head: () => ({
    meta: [
      { title: 'Health Twin 3D — Sembuhin' },
      {
        name: 'description',
        content: 'Avatar 3D digital twin tubuh kamu. Putar, zoom, dan klik organ untuk info detail.',
      },
    ],
  }),
  component: TwinPage,
})

/* ─── Types ──────────────────────────────────────────────────────── */
type ViewMode = 'muscular' | 'skeleton'

const SKETCHFAB_MODELS: Record<ViewMode, { uid: string; name: string }> = {
  muscular: { uid: '244061a0323b4d2e9c60d9aba374c937', name: 'Muscular Anatomy' },
  skeleton: { uid: '9893488f355d4e13934f0822b8bfe038', name: 'Skeletal Structure' },
}

interface OrganData {
  id: string
  icon: typeof Heart
  label: string
  value: string
  status: string
  statusType: 'optimal' | 'warning' | 'normal'
  color: string
  bgColor: string
  description: string
  metrics: { label: string; value: string; unit: string }[]
}

const ORGANS: OrganData[] = [
  {
    id: 'heart',
    icon: Heart,
    label: 'Jantung',
    value: '72 BPM',
    status: 'Optimal',
    statusType: 'optimal',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50 border-rose-100',
    description: 'Detak jantung stabil. Ritme sinus normal terdeteksi.',
    metrics: [
      { label: 'Heart Rate', value: '72', unit: 'BPM' },
      { label: 'Tekanan Darah', value: '120/80', unit: 'mmHg' },
      { label: 'Cardiac Output', value: '5.2', unit: 'L/min' },
    ],
  },
  {
    id: 'lungs',
    icon: Wind,
    label: 'Paru-paru',
    value: '98% SpO₂',
    status: 'Sehat',
    statusType: 'optimal',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50 border-cyan-100',
    description: 'Kapasitas paru optimal. Saturasi oksigen sangat baik.',
    metrics: [
      { label: 'SpO₂', value: '98', unit: '%' },
      { label: 'Resp. Rate', value: '16', unit: '/min' },
      { label: 'Kapasitas', value: '4.8', unit: 'L' },
    ],
  },
  {
    id: 'brain',
    icon: Brain,
    label: 'Otak',
    value: 'Skor 8.5',
    status: 'Fokus baik',
    statusType: 'optimal',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50 border-violet-100',
    description: 'Aktivitas kognitif tinggi. Gelombang beta dominan.',
    metrics: [
      { label: 'Fokus', value: '8.5', unit: '/10' },
      { label: 'Stres', value: 'Rendah', unit: '' },
      { label: 'Tidur', value: '7.8', unit: '/10' },
    ],
  },
  {
    id: 'stomach',
    icon: Utensils,
    label: 'Lambung',
    value: 'pH 2.0',
    status: 'Normal',
    statusType: 'normal',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-100',
    description: 'Asam lambung normal. Pencernaan berjalan baik.',
    metrics: [
      { label: 'pH Level', value: '2.0', unit: '' },
      { label: 'Motilitas', value: 'Normal', unit: '' },
      { label: 'Pencernaan', value: 'Aktif', unit: '' },
    ],
  },
]

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

/* ─── Component ──────────────────────────────────────────────────── */
function TwinPage() {
  const [active, setActive] = useState('heart')
  const [viewMode, setViewMode] = useState<ViewMode>('muscular')
  const [scanActive, setScanActive] = useState(false)
  const [heartBeat, setHeartBeat] = useState(72)
  const [iframeLoaded, setIframeLoaded] = useState(false)

  const activeOrgan = ORGANS.find((o) => o.id === active)!
  const currentModel = SKETCHFAB_MODELS[viewMode]

  useEffect(() => {
    const interval = setInterval(() => {
      setHeartBeat((prev) => Math.max(65, Math.min(82, prev + Math.floor(Math.random() * 5) - 2)))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setIframeLoaded(false)
  }, [viewMode])

  const triggerScan = () => {
    setScanActive(true)
    setTimeout(() => setScanActive(false), 3000)
  }

  const sketchfabUrl = `https://sketchfab.com/models/${currentModel.uid}/embed?autostart=1&autospin=0.3&transparent=0&ui_animations=0&ui_infos=0&ui_stop=0&ui_inspector=0&ui_watermark_link=0&ui_watermark=0&ui_ar=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0&camera=0&preload=1&ui_hint=0&ui_color=38bdf8&ui_controls=0&scrollwheel=1&dnt=1`

  return (
    <div className="relative z-10 min-h-screen">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-10">

        {/* ── Hero ──────────────────────────────────────────────── */}
        <motion.header variants={fadeIn} initial="hidden" animate="visible" className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-100/80 border border-violet-200/60 px-4 py-1.5 mb-5">
            <Sparkles className="h-3.5 w-3.5 text-violet-600" />
            <span className="text-xs font-semibold text-violet-700 tracking-wide uppercase">Digital Twin 3D</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
            Health Twin 3D
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-500 leading-relaxed max-w-lg">
            Salinan digital tubuh Anda yang hidup. Putar, zoom, dan jelajahi organ secara interaktif.
          </p>
        </motion.header>

        {/* ── Main Grid ─────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-5 gap-6">

          {/* ── 3D Viewer ─────────────────────────────────────────── */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div
              className="relative overflow-hidden rounded-2xl"
              style={{
                background: 'linear-gradient(145deg, #0a0e1a 0%, #111827 50%, #0f172a 100%)',
                border: '1px solid rgba(99, 179, 237, 0.15)',
                boxShadow: '0 0 80px rgba(56, 128, 255, 0.06), inset 0 1px 0 rgba(255,255,255,0.04)',
              }}
            >
              {/* Toolbar */}
              <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                {[
                  { mode: 'muscular' as ViewMode, icon: Layers, label: 'Otot' },
                  { mode: 'skeleton' as ViewMode, icon: Eye, label: 'Tulang' },
                ].map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg transition-all',
                      viewMode === mode
                        ? 'bg-sky-500/25 text-sky-300 shadow-lg shadow-sky-500/10'
                        : 'bg-black/40 text-gray-500 hover:bg-black/60 hover:text-gray-300'
                    )}
                    title={label}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
                <div className="my-0.5 h-px bg-white/10" />
                <button
                  onClick={triggerScan}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg transition-all',
                    scanActive ? 'bg-cyan-500/25 text-cyan-300' : 'bg-black/40 text-gray-500 hover:bg-black/60 hover:text-gray-300'
                  )}
                  title="Scan Tubuh"
                >
                  <Scan className="h-4 w-4" />
                </button>
              </div>

              {/* View Mode Label */}
              <div className="absolute top-4 right-4 z-20">
                <div className="flex items-center gap-2 rounded-lg bg-black/50 px-3 py-1.5 text-xs text-gray-300 backdrop-blur-sm border border-white/10">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  {viewMode === 'muscular' ? 'Otot' : 'Tulang'}
                </div>
              </div>

              {/* Sketchfab Embed */}
              <div className="relative" style={{ height: '55vh', minHeight: '460px' }}>
                {!iframeLoaded && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="h-7 w-7 animate-spin text-sky-400" />
                    <p className="text-sm text-gray-400">Memuat model 3D...</p>
                  </div>
                )}

                {scanActive && (
                  <motion.div
                    initial={{ top: 0 }}
                    animate={{ top: '100%' }}
                    transition={{ duration: 3, ease: 'linear' }}
                    className="absolute left-0 right-0 z-30 h-0.5 pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.8), transparent)',
                      boxShadow: '0 0 20px rgba(56, 189, 248, 0.5)',
                    }}
                  />
                )}

                <AnimatePresence mode="wait">
                  <motion.div
                    key={viewMode}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="h-full w-full"
                  >
                    <iframe
                      title={currentModel.name}
                      src={sketchfabUrl}
                      className="h-full w-full border-0"
                      allow="autoplay; fullscreen; xr-spatial-tracking"
                      onLoad={() => setIframeLoaded(true)}
                      style={{ background: '#0a0e1a' }}
                    />
                    {/* Cover overlays */}
                    <div className="absolute bottom-0 left-0 w-36 h-14 pointer-events-none" style={{ background: 'linear-gradient(135deg, #0a0e1a 60%, transparent)' }} />
                    <div className="absolute top-0 right-0 w-14 h-14 pointer-events-none" style={{ background: 'linear-gradient(225deg, #0a0e1a 40%, transparent)' }} />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom Bar */}
              <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-2.5 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                <div className="flex items-center gap-3 text-[11px] text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-sky-400" />
                    Anatomy Engine v2.4
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-gray-500 font-mono">
                  <span>HR: <span className="text-emerald-400">{heartBeat}</span></span>
                  <span>SpO₂: <span className="text-sky-400">98</span>%</span>
                </div>
              </div>

              {/* Interaction hint */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <div className="flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-[10px] text-gray-500 backdrop-blur-sm border border-white/10">
                  <Move3D className="h-3 w-3 text-sky-400" />
                  Drag untuk putar • Scroll untuk zoom
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Right Panel ───────────────────────────────────────── */}
          <motion.aside
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-4"
          >
            {/* Organ Buttons */}
            <div className="space-y-2">
              {ORGANS.map((organ) => {
                const Icon = organ.icon
                const isActive = active === organ.id
                return (
                  <button
                    key={organ.id}
                    onClick={() => setActive(organ.id)}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-xl p-3.5 text-left transition-all duration-200 border',
                      isActive
                        ? 'bg-white border-slate-200 shadow-lg shadow-slate-200/60'
                        : 'bg-white/70 border-white/60 shadow-sm hover:bg-white hover:shadow-md'
                    )}
                  >
                    <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border', organ.bgColor)}>
                      <Icon className={cn('h-5 w-5', organ.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-slate-800">{organ.label}</span>
                        <span className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          organ.statusType === 'optimal' ? 'bg-emerald-500' : organ.statusType === 'warning' ? 'bg-amber-500' : 'bg-sky-500'
                        )} />
                        <span className="text-[11px] text-slate-400">{organ.status}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{organ.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-slate-800">{organ.value}</span>
                    </div>
                    <ChevronRight className={cn('h-4 w-4 shrink-0 transition-all', isActive ? 'text-sky-500 rotate-90' : 'text-slate-300')} />
                  </button>
                )
              })}
            </div>

            {/* Active Organ Detail */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <activeOrgan.icon className={cn('h-4 w-4', activeOrgan.color)} />
                  <h3 className="text-sm font-semibold text-slate-800">{activeOrgan.label}</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{activeOrgan.description}</p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2">
                  {activeOrgan.metrics.map((m) => (
                    <div key={m.label} className="rounded-lg bg-slate-50 border border-slate-100 p-2.5 text-center">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">{m.label}</p>
                      <p className="text-lg font-bold text-slate-800 mt-0.5">{m.value}</p>
                      <p className="text-[10px] text-slate-400">{m.unit}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Health Score */}
            <div className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 p-5">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Skor Kesehatan</p>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-4xl font-bold text-slate-900">87</span>
                  <span className="text-lg text-slate-400 ml-1">/100</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <TrendingUp className="h-3.5 w-3.5" />
                  +4 dari kemarin
                </div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '87%' }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-500"
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">Pertahankan! Kondisi Anda sangat baik.</p>
            </div>

            {/* Trust */}
            <div className="flex items-center gap-4 px-1">
              {[
                { icon: ShieldCheck, label: 'Data Terenkripsi' },
                { icon: Clock, label: 'Real-time Sync' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </div>
              ))}
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  )
}
