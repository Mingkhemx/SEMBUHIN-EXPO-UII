import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  Camera, X, Loader2, CheckCircle2, Info, Clock,
  Smile, Frown, Meh, Heart, Brain, Sparkles, RotateCcw,
  ChevronRight, BookOpen, Music, Wind, Users, Sun,
  AlertTriangle, Stethoscope, Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { PremiumGate } from '@/components/PremiumGate'

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
type ViewMode = 'camera' | 'result' | 'history'
type MoodLevel = 'happy' | 'calm' | 'neutral' | 'anxious' | 'sad' | 'angry' | 'tired'

interface MoodDetection {
  emotion: string
  pct: number
  icon: typeof Smile
  color: string
  description: string
  rawKey: string
}

interface MoodResult {
  primaryMood: MoodLevel
  confidence: number
  description: string
  recommendation: string
  activities: { title: string; desc: string; icon: typeof Brain; duration: string }[]
  detections: MoodDetection[]
}

/* ─── Emotion map ────────────────────────────────────────────────── */
const EMOTION_MAP: Record<string, Omit<MoodDetection, 'pct'>> = {
  happy:    { emotion: 'Senang',   icon: Smile,         color: 'text-emerald-600', description: 'Ekspresi positif terdeteksi',      rawKey: 'happy'    },
  calm:     { emotion: 'Tenang',   icon: Meh,           color: 'text-sky-600',     description: 'Wajah rileks dan stabil',           rawKey: 'calm'     },
  neutral:  { emotion: 'Netral',   icon: Meh,           color: 'text-slate-500',   description: 'Tanpa ekspresi dominan',            rawKey: 'neutral'  },
  fearful:  { emotion: 'Cemas',    icon: AlertTriangle, color: 'text-amber-600',   description: 'Tanda ketegangan / rasa takut',     rawKey: 'fearful'  },
  sad:      { emotion: 'Sedih',    icon: Frown,         color: 'text-indigo-600',  description: 'Indikasi kesedihan terdeteksi',     rawKey: 'sad'      },
  angry:    { emotion: 'Marah',    icon: Frown,         color: 'text-red-600',     description: 'Ekspresi kemarahan terdeteksi',     rawKey: 'angry'    },
  disgusted:{ emotion: 'Jijik',    icon: Frown,         color: 'text-orange-600',  description: 'Ekspresi tidak suka terdeteksi',    rawKey: 'disgusted'},
  surprised:{ emotion: 'Terkejut', icon: Sparkles,      color: 'text-violet-600',  description: 'Ekspresi terkejut terdeteksi',      rawKey: 'surprised'},
  tired:    { emotion: 'Lelah',    icon: Meh,           color: 'text-violet-500',  description: 'Kelelahan terdeteksi',              rawKey: 'tired'    },
}

/* ─── Mood config ────────────────────────────────────────────────── */
const MOOD_CONFIG: Record<MoodLevel, { label: string; color: string; bgColor: string; emoji: string; desc: string }> = {
  happy:   { label: 'Senang',   color: 'text-emerald-700', bgColor: 'bg-emerald-50 border-emerald-200', emoji: '😊', desc: 'Anda terlihat dalam kondisi emosional yang baik! Ekspresi wajah menunjukkan kebahagiaan dan ketenangan.' },
  calm:    { label: 'Tenang',   color: 'text-sky-700',     bgColor: 'bg-sky-50 border-sky-200',         emoji: '😌', desc: 'Anda tampak tenang dan rileks. Kondisi ini sangat baik untuk fokus dan produktivitas.' },
  neutral: { label: 'Netral',   color: 'text-slate-700',   bgColor: 'bg-slate-50 border-slate-200',     emoji: '😐', desc: 'Ekspresi Anda netral saat ini. Tidak ada emosi dominan yang terdeteksi.' },
  anxious: { label: 'Cemas',    color: 'text-amber-700',   bgColor: 'bg-amber-50 border-amber-200',     emoji: '😰', desc: 'Terdeteksi tanda-tanda kecemasan atau ketegangan. Coba teknik relaksasi untuk menenangkan diri.' },
  sad:     { label: 'Sedih',    color: 'text-indigo-700',  bgColor: 'bg-indigo-50 border-indigo-200',   emoji: '😢', desc: 'Anda tampak sedih. Itu wajar — luapkan perasaan Anda dan jangan ragu untuk mencari dukungan.' },
  angry:   { label: 'Marah',    color: 'text-red-700',     bgColor: 'bg-red-50 border-red-200',         emoji: '😠', desc: 'Terdeteksi ekspresi kemarahan. Coba tarik napas dalam dan fokus ke hal-hal yang bisa dikendalikan.' },
  tired:   { label: 'Lelah',    color: 'text-violet-700',  bgColor: 'bg-violet-50 border-violet-200',   emoji: '😫', desc: 'Anda tampak kelelahan. Istirahat sejenak bisa membantu memulihkan energi Anda.' },
}

/* ─── Activity recommendations per mood ─────────────────────────── */
const MOOD_ACTIVITIES: Record<MoodLevel, MoodResult['activities']> = {
  happy:   [
    { title: 'Jalan Kaki 15 Menit',   desc: 'Pertahankan mood positif dengan aktivitas ringan',      icon: Sun,      duration: '15 min' },
    { title: 'Journaling Syukur',     desc: 'Tulis 3 hal yang Anda syukuri hari ini',                icon: BookOpen, duration: '10 min' },
    { title: 'Musik Favorit',         desc: 'Dengarkan playlist yang membuat Anda bahagia',          icon: Music,    duration: '20 min' },
    { title: 'Hubungi Teman',         desc: 'Ceritakan kabar baik ke orang terdekat',                icon: Users,    duration: '15 min' },
  ],
  calm:    [
    { title: 'Meditasi Mindfulness',  desc: 'Pertahankan ketenangan dengan meditasi singkat',        icon: Brain,    duration: '10 min' },
    { title: 'Journaling',            desc: 'Refleksi pikiran saat tenang sangat produktif',         icon: BookOpen, duration: '15 min' },
    { title: 'Musik Lo-fi',           desc: 'Iringi produktivitas dengan musik tenang',              icon: Music,    duration: '30 min' },
    { title: 'Stretching',            desc: 'Regangkan tubuh untuk menjaga energi',                  icon: Sparkles, duration: '10 min' },
  ],
  neutral: [
    { title: 'Jalan Santai',          desc: 'Tingkatkan mood dengan gerakan ringan di luar',         icon: Sun,      duration: '15 min' },
    { title: 'Baca Buku',             desc: 'Isi waktu dengan bacaan yang menarik',                  icon: BookOpen, duration: '20 min' },
    { title: 'Hubungi Sahabat',       desc: 'Obrolan ringan bisa meningkatkan mood',                 icon: Users,    duration: '15 min' },
    { title: 'Musik Upbeat',          desc: 'Coba playlist ceria untuk membangkitkan semangat',      icon: Music,    duration: '20 min' },
  ],
  anxious: [
    { title: 'Pernapasan 4-7-8',      desc: 'Tarik 4 detik, tahan 7, hembuskan 8 — sangat menenangkan', icon: Wind,     duration: '5 min'  },
    { title: 'Grounding 5-4-3-2-1',   desc: 'Fokus ke 5 benda, 4 suara, 3 sentuhan, 2 bau, 1 rasa',    icon: Brain,    duration: '3 min'  },
    { title: 'Jalan di Alam',         desc: 'Paparan alam terbukti menurunkan kortisol',                 icon: Sun,      duration: '20 min' },
    { title: 'Teh Chamomile',         desc: 'Minuman herbal untuk menenangkan sistem saraf',             icon: Heart,    duration: '10 min' },
  ],
  sad:     [
    { title: 'Jalan di Alam',         desc: 'Kontak dengan alam meningkatkan mood secara alami',     icon: Sun,      duration: '20 min' },
    { title: 'Hubungi Orang Terdekat',desc: 'Berbagi cerita meringankan beban emosional',           icon: Users,    duration: '15 min' },
    { title: 'Journaling Perasaan',   desc: 'Tulis apa yang Anda rasakan tanpa menghakimi',          icon: BookOpen, duration: '15 min' },
    { title: 'Musik yang Disukai',    desc: 'Biarkan musik menemani dan mengangkat perasaan',        icon: Music,    duration: '20 min' },
  ],
  angry:   [
    { title: 'Napas Kotak',           desc: 'Tarik 4s, tahan 4s, hembuskan 4s, tahan 4s',           icon: Wind,     duration: '5 min'  },
    { title: 'Olahraga Ringan',       desc: 'Lepaskan energi negatif lewat gerakan fisik',           icon: Sparkles, duration: '15 min' },
    { title: 'Tulis Uneg-uneg',       desc: 'Tuliskan lalu buang — jangan kirim ke siapapun',        icon: BookOpen, duration: '10 min' },
    { title: 'Jalan Cepat',           desc: 'Aktivitas aerobik menurunkan hormon stres dengan cepat',icon: Sun,      duration: '15 min' },
  ],
  tired:   [
    { title: 'Power Nap',             desc: 'Tidur 20 menit untuk recharge tanpa grogginess',        icon: Heart,    duration: '20 min' },
    { title: 'Stretching Ringan',     desc: 'Regangkan otot leher & punggung untuk energi',          icon: Sparkles, duration: '10 min' },
    { title: 'Air Putih & Snack',     desc: 'Dehidrasi sering menyebabkan rasa lelah',               icon: Wind,     duration: '5 min'  },
    { title: 'Musik Energik',         desc: 'Playlist upbeat bisa membantu melawan rasa ngantuk',    icon: Music,    duration: '15 min' },
  ],
}

const MOOD_RECOMMENDATIONS: Record<MoodLevel, string> = {
  happy:   'Mood Anda sedang bagus! Manfaatkan energi positif ini untuk aktivitas yang produktif atau bersosialisasi.',
  calm:    'Ketenangan Anda saat ini sangat berharga. Gunakan untuk fokus pada tujuan penting.',
  neutral: 'Mood Anda stabil. Ini waktu yang baik untuk mencoba aktivitas baru atau meningkatkan semangat.',
  anxious: 'Terdeteksi kecemasan. Prioritaskan teknik relaksasi dan kurangi stimulasi berlebih.',
  sad:     'Anda boleh merasakan kesedihan. Rangkul perasaan itu dan jangan ragu mencari dukungan orang terdekat.',
  angry:   'Kemarahan adalah emosi yang valid. Salurkan dengan cara yang sehat dan konstruktif.',
  tired:   'Tubuh Anda meminta istirahat. Dengarkan sinyal itu dan berikan waktu untuk pulih.',
}

const fadeIn: Variants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

/* ─── OpenRouter Vision AI ────────────────────────────────────────── */
const FACE_API_KEY = import.meta.env.VITE_GEMINI_FACE_API_KEY as string | undefined

function emotionToMoodLevel(key: string): MoodLevel {
  switch (key) {
    case 'happy':     return 'happy'
    case 'calm':      return 'calm'
    case 'neutral':   return 'neutral'
    case 'fearful':   return 'anxious'
    case 'sad':       return 'sad'
    case 'angry':     return 'angry'
    case 'disgusted': return 'angry'
    case 'surprised': return 'neutral'
    case 'tired':     return 'tired'
    default:          return 'neutral'
  }
}

interface AIEmotionResult {
  emotions: Record<string, number>
  primaryEmotion: string
  confidence: number
  geminiDescription: string
}

async function analyzeWithOpenRouter(imageBase64: string): Promise<AIEmotionResult | null> {
  if (!FACE_API_KEY) return null

  const prompt = `Kamu adalah ahli psikologi emosi dan computer vision.

Analisis ekspresi wajah pada gambar ini dengan teliti.

Berikan skor emosi (0.0 sampai 1.0) dan pastikan totalnya mendekati 1.0.
Emosi yang tersedia: happy, calm, neutral, fearful, sad, angry, disgusted, surprised, tired.

Tentukan emosi dominan dan berikan confidence score 0-100.

PENTING: Berikan response HANYA dalam format JSON valid ini (tanpa markdown, tanpa kode block):
{
  "emotions": {
    "happy": 0.0,
    "calm": 0.0,
    "neutral": 0.0,
    "fearful": 0.0,
    "sad": 0.0,
    "angry": 0.0,
    "disgusted": 0.0,
    "surprised": 0.0,
    "tired": 0.0
  },
  "primaryEmotion": "neutral",
  "confidence": 75,
  "geminiDescription": "Deskripsi singkat kondisi emosional dalam Bahasa Indonesia"
}`

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FACE_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Sembuhin Face Mood Tracker',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
          ],
        }],
        temperature: 0.1,
        max_tokens: 512,
      }),
    })
    if (!res.ok) {
      console.error('[OpenRouter] HTTP', res.status, await res.text())
      return null
    }
    const data = await res.json()
    const rawText: string = data?.choices?.[0]?.message?.content ?? ''
    const clean = rawText.replace(/```json|```/g, '').trim()
    return JSON.parse(clean) as AIEmotionResult
  } catch (err) {
    console.error('[FaceAI] error:', err)
    return null
  }
}

function buildMoodResult(emotions: Record<string, number>, confidence: number, description?: string): MoodResult {
  const detections: MoodDetection[] = Object.entries(emotions)
    .filter(([key]) => EMOTION_MAP[key])
    .map(([key, score]) => ({
      ...EMOTION_MAP[key],
      pct: Math.round(score * 100),
    }))
    .sort((a, b) => b.pct - a.pct)

  const top = detections[0]
  const primaryMood = emotionToMoodLevel(top?.rawKey ?? 'neutral')

  return {
    primaryMood,
    confidence,
    description: description ?? MOOD_CONFIG[primaryMood].desc,
    recommendation: MOOD_RECOMMENDATIONS[primaryMood],
    activities: MOOD_ACTIVITIES[primaryMood],
    detections,
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/* ══════════════════════════════════════════════════════════════════ */
/*  Component                                                         */
/* ══════════════════════════════════════════════════════════════════ */
function MoodCheckPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const [viewMode, setViewMode]             = useState<ViewMode>('camera')
  const [cameraActive, setCameraActive]     = useState(false)
  const [analyzing, setAnalyzing]           = useState(false)
  // countdown: 3s timer after camera opens
  const [countdown, setCountdown]           = useState<number | null>(null)
  const [moodResult, setMoodResult]         = useState<MoodResult | null>(null)
  const [capturedImage, setCapturedImage]   = useState<string | null>(null) // base64 for preview
  const [moodHistory, setMoodHistory]       = useState<{ id: number; created_at: string; mood: MoodLevel; confidence: number }[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError]                   = useState<string | null>(null)

  const videoRef   = useRef<HTMLVideoElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const streamRef  = useRef<MediaStream | null>(null)
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* Attach stream to video */
  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }, [cameraActive])

  /* Cleanup */
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  /* ── Fetch mood history ─────────────────────────────────── */
  const fetchMoodHistory = useCallback(async () => {
    if (!user) return
    setHistoryLoading(true)
    try {
      const { data, error: err } = await supabase
        .from('mood_history')
        .select('id, created_at, mood, confidence')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (err) throw err
      setMoodHistory(data as any)
    } catch (e) {
      console.error('Error fetching mood history:', e)
    } finally {
      setHistoryLoading(false)
    }
  }, [user])

  useEffect(() => { if (user) fetchMoodHistory() }, [user, fetchMoodHistory])

  /* ── Save mood result ───────────────────────────────────── */
  const saveMoodResult = useCallback(async (result: MoodResult) => {
    if (!user) return
    try {
      await supabase.from('mood_history').insert({
        user_id: user.id,
        mood: result.primaryMood,
        confidence: result.confidence,
      })
      fetchMoodHistory()
    } catch (e) {
      console.error('Error saving mood result:', e)
    }
  }, [user, fetchMoodHistory])

  /* ── Capture frame from video as base64 ────────────────── */
  const captureFrame = (): string | null => {
    const video = videoRef.current
    if (!video || video.videoWidth === 0) return null
    const canvas = canvasRef.current ?? document.createElement('canvas')
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(video, 0, 0)
    // Return base64 JPEG without the data URL prefix
    return canvas.toDataURL('image/jpeg', 0.85).split(',')[1]
  }

  /* ── Start camera + countdown ───────────────────────────── */
  const startCamera = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      setCameraActive(true)

      // 3-second countdown then auto-capture
      setCountdown(3)
      let c = 3
      const tick = () => {
        c -= 1
        if (c > 0) {
          setCountdown(c)
          timerRef.current = setTimeout(tick, 1000)
        } else {
          setCountdown(0)
          doCapture()
        }
      }
      timerRef.current = setTimeout(tick, 1000)
    } catch {
      setError('Gagal mengakses kamera! Izinkan akses kamera di browser Anda.')
    }
  }

  /* ── Capture & analyze ──────────────────────────────────── */
  const doCapture = async () => {
    const b64 = captureFrame()
    if (!b64) {
      setError('Gagal capture frame. Coba lagi.')
      stopCamera()
      return
    }
    // Show preview
    setCapturedImage(`data:image/jpeg;base64,${b64}`)
    // Stop camera
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setCameraActive(false)
    setCountdown(null)

    setAnalyzing(true)
    try {
      const aiResult = await analyzeWithOpenRouter(b64)
      if (!aiResult) throw new Error('AI tidak merespons')
      const result = buildMoodResult(aiResult.emotions, aiResult.confidence, aiResult.geminiDescription)
      setMoodResult(result)
      setViewMode('result')
      saveMoodResult(result)
    } catch (e: any) {
      setError(`Analisis gagal: ${e.message}. Pastikan API key OpenRouter sudah diatur.`)
    } finally {
      setAnalyzing(false)
    }
  }

  /* ── Stop camera ────────────────────────────────────────── */
  const stopCamera = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setCameraActive(false)
    setCountdown(null)
  }, [])

  /* ── Reset ──────────────────────────────────────────────── */
  const resetAll = () => {
    stopCamera()
    setMoodResult(null)
    setCapturedImage(null)
    setError(null)
    setAnalyzing(false)
    setViewMode('camera')
  }

  const CIRC_R = 48
  const CIRC_C = 2 * Math.PI * CIRC_R

  return (
    <PremiumGate>
      <div className="relative z-10 min-h-screen">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-14">

          {/* ── Hero ────────────────────────────────────────── */}
          <motion.header variants={fadeIn} initial="hidden" animate="visible" className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-100/80 border border-cyan-200/60 px-4 py-1.5 mb-5">
              <Zap className="h-3.5 w-3.5 text-cyan-600" />
              <span className="text-xs font-semibold text-cyan-700 tracking-wide uppercase">AI Mood Tracker</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
              Cek Mood Via Kamera
            </h1>
            <p className="mt-3 text-base sm:text-lg text-slate-500 leading-relaxed max-w-lg">
              AI menganalisis ekspresi wajah Anda menggunakan Gemini Vision — cukup hadap kamera, foto diambil otomatis, dan hasilnya langsung muncul.
            </p>
          </motion.header>

          {/* ── Navigation ──────────────────────────────────── */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100/80 p-1 w-fit">
            {([
              { key: 'camera',  label: 'Cek Mood',     icon: Camera },
              { key: 'history', label: 'Riwayat Mood', icon: Clock  },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => { if (key === 'camera') resetAll(); else setViewMode(key) }}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200',
                  viewMode === key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* ══════════════ CAMERA VIEW ══════════════ */}
          {viewMode === 'camera' && (
            <motion.div key="camera" variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">

              {/* Error banner */}
              {error && (
                <div className="flex items-center gap-3 rounded-xl bg-rose-50 border border-rose-200 p-4">
                  <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
                  <p className="text-sm text-rose-700">{error}</p>
                  <button onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-rose-600"><X className="h-4 w-4" /></button>
                </div>
              )}

              {/* Analyzing state */}
              {analyzing && (
                <div className="rounded-2xl bg-white border border-white/60 shadow-xl p-8 text-center space-y-4">
                  {capturedImage && (
                    <img src={capturedImage} alt="captured" className="w-48 h-36 object-cover rounded-xl mx-auto border-4 border-cyan-200 shadow" />
                  )}
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100">
                      <Sparkles className="h-8 w-8 text-violet-500 animate-pulse" />
                    </div>
                    <p className="text-base font-bold text-slate-800">Gemini Vision sedang menganalisis...</p>
                    <p className="text-sm text-slate-500">Membaca ekspresi wajah Anda</p>
                    <Loader2 className="h-6 w-6 text-violet-400 animate-spin" />
                  </div>
                </div>
              )}

              {/* Camera + countdown */}
              {!analyzing && (
                <>
                  {!cameraActive ? (
                    <div className="space-y-6">
                      <div className="rounded-2xl bg-gradient-to-br from-cyan-600 via-sky-700 to-blue-800 p-8 sm:p-12 text-center shadow-2xl">
                        <div className="flex flex-col items-center gap-5">
                          <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping" />
                            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white/15 border-2 border-white/30 backdrop-blur-sm">
                              <Brain className="h-12 w-12 text-white" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">Siap Cek Mood?</h3>
                            <p className="text-sm text-cyan-100 mt-1 max-w-sm mx-auto">
                              Hadap kamera, foto akan diambil otomatis dalam 3 detik. Gemini Vision akan menganalisis ekspresi wajah Anda.
                            </p>
                          </div>
                          <button
                            onClick={startCamera}
                            className="flex items-center gap-2 rounded-xl bg-white text-cyan-700 px-8 py-4 text-base font-bold hover:bg-cyan-50 shadow-lg transition-all hover:scale-105"
                          >
                            <Camera className="h-5 w-5" /> Nyalakan Kamera
                          </button>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white border border-white/60 shadow-lg p-6">
                        <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                          <Info className="h-4 w-4 text-slate-400" />
                          Tips untuk Hasil Terbaik
                        </h3>
                        <div className="grid sm:grid-cols-3 gap-3">
                          {[
                            { icon: Smile,  title: 'Wajah Natural',  desc: 'Tunjukkan ekspresi alami Anda' },
                            { icon: Sun,    title: 'Cahaya Merata',   desc: 'Pastikan wajah terkena cahaya cukup' },
                            { icon: Camera, title: 'Kamera Depan',    desc: 'Posisikan wajah di tengah frame' },
                          ].map(tip => {
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
                    /* Live camera + countdown overlay */
                    <div className="space-y-0">
                      <div className="relative rounded-t-2xl overflow-hidden shadow-2xl bg-black" style={{ aspectRatio: '4/3' }}>
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover block" />
                        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none hidden" />

                        {/* Scan line */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                          <motion.div
                            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                            style={{ boxShadow: '0 0 12px 3px rgba(6,182,212,0.8)' }}
                            animate={{ top: ['5%', '95%', '5%'] }}
                            transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
                          />
                        </div>

                        {/* Countdown */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <AnimatePresence mode="wait">
                            {countdown !== null && countdown > 0 && (
                              <motion.div
                                key={countdown}
                                initial={{ scale: 1.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                className="flex h-28 w-28 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm border-4 border-cyan-400"
                              >
                                <span className="text-6xl font-black text-white drop-shadow-lg">{countdown}</span>
                              </motion.div>
                            )}
                            {countdown === 0 && (
                              <motion.div
                                key="flash"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 0.5 }}
                                className="absolute inset-0 bg-white/60"
                              />
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Corner brackets */}
                        <div className="absolute inset-4 pointer-events-none">
                          <div className="absolute top-0 left-0  w-8 h-8 border-t-2 border-l-2 rounded-tl-lg border-cyan-400" />
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 rounded-tr-lg border-cyan-400" />
                          <div className="absolute bottom-0 left-0  w-8 h-8 border-b-2 border-l-2 rounded-bl-lg border-cyan-400" />
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 rounded-br-lg border-cyan-400" />
                        </div>

                        {/* Stop button */}
                        <div className="absolute top-3 right-3 z-50">
                          <button
                            onClick={stopCamera}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-all border border-white/20"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Info bar */}
                      <div className="rounded-b-2xl bg-white border border-t-0 border-white/60 shadow-xl p-4 text-center">
                        <p className="text-sm font-semibold text-slate-700">
                          {countdown !== null && countdown > 0 ? (
                            <span>Foto diambil dalam <span className="text-cyan-600 font-black">{countdown}</span> detik...</span>
                          ) : (
                            <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin text-cyan-500" /> Mengambil foto...</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Pastikan wajah Anda terlihat jelas di kamera</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ══════════════ RESULT VIEW ══════════════ */}
          {viewMode === 'result' && moodResult && (
            <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">

              {/* Captured photo + mood card */}
              <div className="grid sm:grid-cols-2 gap-4">
                {capturedImage && (
                  <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                    <img src={capturedImage} alt="Foto mood Anda" className="w-full h-full object-cover" style={{ aspectRatio: '4/3' }} />
                  </div>
                )}
                <div className={cn('rounded-2xl border overflow-hidden shadow-lg flex flex-col justify-center p-6 sm:p-8', MOOD_CONFIG[moodResult.primaryMood].bgColor)}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, delay: 0.1 }} className="text-6xl mb-3">
                    {MOOD_CONFIG[moodResult.primaryMood].emoji}
                  </motion.div>
                  <p className={cn('text-xl font-bold mb-1', MOOD_CONFIG[moodResult.primaryMood].color)}>
                    Mood: {MOOD_CONFIG[moodResult.primaryMood].label}
                  </p>
                  <p className="text-sm text-slate-500 mb-2">Akurasi {moodResult.confidence}%</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{moodResult.description}</p>
                  <div className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-violet-700 bg-violet-100 border border-violet-200 px-2 py-0.5 rounded-full w-fit">
                    <Sparkles className="h-3 w-3" /> Dianalisis Gemini Vision
                  </div>
                </div>
              </div>

              {/* AI confidence bar */}
              <div className="rounded-2xl bg-white border border-white/60 shadow-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-slate-800">Tingkat Keyakinan AI</p>
                  <p className="text-lg font-bold text-slate-900">{moodResult.confidence}%</p>
                </div>
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${moodResult.confidence}%` }}
                    transition={{ duration: 1.1, delay: 0.1, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400"
                  />
                </div>
              </div>

              {/* Emotions breakdown */}
              <div className="rounded-2xl bg-white border border-white/60 shadow-lg p-6">
                <p className="text-sm font-semibold text-slate-800 mb-4">Detail Emosi yang Terdeteksi</p>
                <div className="space-y-2">
                  {moodResult.detections.slice(0, 5).map((det, i) => {
                    const Icon = det.icon
                    return (
                      <div key={det.emotion} className={cn('flex items-center gap-3 p-3 rounded-xl border', i === 0 ? 'bg-cyan-50 border-cyan-200' : 'bg-slate-50 border-slate-100')}>
                        <Icon className={cn('h-4 w-4 shrink-0', i === 0 ? det.color : 'text-slate-400')} />
                        <span className={cn('text-sm font-semibold w-20 shrink-0', i === 0 ? 'text-slate-800' : 'text-slate-600')}>{det.emotion}</span>
                        <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${det.pct}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className={cn('h-full rounded-full', i === 0 ? 'bg-cyan-500' : 'bg-slate-400')}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-600 w-10 text-right">{det.pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Recommendations */}
              <div className="rounded-2xl bg-white border border-white/60 shadow-lg p-6">
                <p className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-500" />
                  Rekomendasi
                </p>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{moodResult.recommendation}</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {moodResult.activities.map(act => {
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
                <button
                  onClick={() => navigate({ to: '/konsul' })}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white hover:bg-cyan-700 shadow-md shadow-cyan-600/20"
                >
                  <Stethoscope className="h-4 w-4" /> Konsultasi Mental Health
                </button>
              </div>

              <div className="flex gap-3 rounded-xl bg-white/80 border border-slate-200/80 p-4 shadow-sm">
                <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 leading-relaxed">
                  Mood check bersifat indikatif dan bukan pengganti evaluasi psikologis profesional.
                  Jika Anda mengalami perubahan mood yang signifikan, konsultasikan dengan profesional kesehatan mental.
                </p>
              </div>
            </motion.div>
          )}

          {/* ══════════════ HISTORY VIEW ══════════════ */}
          {viewMode === 'history' && (
            <motion.div key="history" variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-800">Riwayat Mood</h2>
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 text-cyan-500 animate-spin mb-2" />
                  <p className="text-sm text-slate-500">Memuat riwayat mood...</p>
                </div>
              ) : moodHistory.length === 0 ? (
                <div className="rounded-2xl bg-white border border-white/60 shadow-lg p-8 text-center">
                  <Clock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">Belum Ada Riwayat Mood</h3>
                  <p className="text-xs text-slate-500">Lakukan cek mood pertama Anda untuk melihat riwayat di sini!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {moodHistory.map((entry) => {
                    const conf = MOOD_CONFIG[entry.mood]
                    return (
                      <div key={entry.id} className="rounded-2xl bg-white border border-white/60 shadow-lg p-5 flex items-center gap-4">
                        <div className="text-3xl">{conf.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={cn('text-sm font-bold', conf.color)}>{conf.label}</span>
                            <span className="text-[10px] text-slate-400">Akurasi {entry.confidence}%</span>
                          </div>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {formatDate(entry.created_at)}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300" />
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

        </div>
      </div>
    </PremiumGate>
  )
}
