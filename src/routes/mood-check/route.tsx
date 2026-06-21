import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  Camera, X, Loader2, CheckCircle2, Info, Clock,
  Smile, Frown, Meh, Heart, Brain, Sparkles, RotateCcw,
  ChevronRight, BookOpen, Music, Wind, Users, Sun,
  AlertTriangle, Stethoscope, Zap, LogIn,
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

/* ─── Emotion map: Human.js key → display ────────────────────────── */
const EMOTION_MAP: Record<string, Omit<MoodDetection, 'pct'>> = {
  happy:    { emotion: 'Senang',   icon: Smile,         color: 'text-emerald-600', description: 'Ekspresi positif terdeteksi',      rawKey: 'happy'    },
  calm:     { emotion: 'Tenang',   icon: Meh,           color: 'text-sky-600',     description: 'Wajah rileks dan stabil',           rawKey: 'calm'     },
  neutral:  { emotion: 'Netral',   icon: Meh,           color: 'text-slate-500',   description: 'Tanpa ekspresi dominan',            rawKey: 'neutral'  },
  fearful:  { emotion: 'Cemas',    icon: AlertTriangle, color: 'text-amber-600',   description: 'Tanda ketegangan / rasa takut',     rawKey: 'fearful'  },
  sad:      { emotion: 'Sedih',    icon: Frown,         color: 'text-indigo-600',  description: 'Indikasi kesedihan terdeteksi',     rawKey: 'sad'      },
  angry:    { emotion: 'Marah',    icon: Frown,         color: 'text-red-600',     description: 'Ekspresi kemarahan terdeteksi',     rawKey: 'angry'    },
  disgusted:{ emotion: 'Jijik',    icon: Frown,         color: 'text-orange-600',  description: 'Ekspresi tidak suka terdeteksi',    rawKey: 'disgusted'},
  surprised:{ emotion: 'Terkejut', icon: Sparkles,      color: 'text-violet-600',  description: 'Ekspresi terkejut terdeteksi',      rawKey: 'surprised'},
}

/* ─── Mood config ────────────────────────────────────────────────── */
const MOOD_CONFIG: Record<MoodLevel, { label: string; color: string; bgColor: string; emoji: string; desc: string }> = {
  happy:   { label: 'Senang',   color: 'text-emerald-700', bgColor: 'bg-emerald-50 border-emerald-200', emoji: '😊', desc: 'Anda terlihat dalam kondisi emosional yang baik! Ekspresi wajah menunjukkan kebahagiaan dan ketenangan. Pertahankan suasana positif ini.' },
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
    { title: 'Jalan Kaki 15 Menit',  desc: 'Pertahankan mood positif dengan aktivitas ringan',      icon: Sun,      duration: '15 min' },
    { title: 'Journaling Syukur',    desc: 'Tulis 3 hal yang Anda syukuri hari ini',                icon: BookOpen, duration: '10 min' },
    { title: 'Musik Favorit',        desc: 'Dengarkan playlist yang membuat Anda bahagia',          icon: Music,    duration: '20 min' },
    { title: 'Hubungi Teman',        desc: 'Ceritakan kabar baik ke orang terdekat',                icon: Users,    duration: '15 min' },
  ],
  calm:    [
    { title: 'Meditasi Mindfulness', desc: 'Pertahankan ketenangan dengan meditasi singkat',        icon: Brain,    duration: '10 min' },
    { title: 'Journaling',           desc: 'Refleksi pikiran saat tenang sangat produktif',         icon: BookOpen, duration: '15 min' },
    { title: 'Musik Lo-fi',          desc: 'Iringi produktivitas dengan musik tenang',              icon: Music,    duration: '30 min' },
    { title: 'Stretching',           desc: 'Regangkan tubuh untuk menjaga energi',                  icon: Sparkles, duration: '10 min' },
  ],
  neutral: [
    { title: 'Jalan Santai',         desc: 'Tingkatkan mood dengan gerakan ringan di luar',         icon: Sun,      duration: '15 min' },
    { title: 'Baca Buku',            desc: 'Isi waktu dengan bacaan yang menarik',                  icon: BookOpen, duration: '20 min' },
    { title: 'Hubungi Sahabat',      desc: 'Obrolan ringan bisa meningkatkan mood',                 icon: Users,    duration: '15 min' },
    { title: 'Musik Upbeat',         desc: 'Coba playlist ceria untuk membangkitkan semangat',      icon: Music,    duration: '20 min' },
  ],
  anxious: [
    { title: 'Pernapasan 4-7-8',     desc: 'Tarik 4 detik, tahan 7, hembuskan 8 — sangat menenangkan', icon: Wind,     duration: '5 min'  },
    { title: 'Grounding 5-4-3-2-1',  desc: 'Fokus ke 5 benda, 4 suara, 3 sentuhan, 2 bau, 1 rasa',    icon: Brain,    duration: '3 min'  },
    { title: 'Jalan di Alam',        desc: 'Paparan alam terbukti menurunkan kortisol',                 icon: Sun,      duration: '20 min' },
    { title: 'Teh Chamomile',        desc: 'Minuman herbal untuk menenangkan sistem saraf',             icon: Heart,    duration: '10 min' },
  ],
  sad:     [
    { title: 'Jalan di Alam',        desc: 'Kontak dengan alam meningkatkan mood secara alami',     icon: Sun,      duration: '20 min' },
    { title: 'Hubungi Orang Terdekat',desc: 'Berbagi cerita meringankan beban emosional',           icon: Users,    duration: '15 min' },
    { title: 'Journaling Perasaan',  desc: 'Tulis apa yang Anda rasakan tanpa menghakimi',          icon: BookOpen, duration: '15 min' },
    { title: 'Musik yang Disukai',   desc: 'Biarkan musik menemani dan mengangkat perasaan',        icon: Music,    duration: '20 min' },
  ],
  angry:   [
    { title: 'Napas Kotak',          desc: 'Tarik 4s, tahan 4s, hembuskan 4s, tahan 4s',           icon: Wind,     duration: '5 min'  },
    { title: 'Olahraga Ringan',      desc: 'Lepaskan energi negatif lewat gerakan fisik',           icon: Sparkles, duration: '15 min' },
    { title: 'Tulis Uneg-uneg',      desc: 'Tuliskan lalu buang — jangan kirim ke siapapun',        icon: BookOpen, duration: '10 min' },
    { title: 'Jalan Cepat',          desc: 'Aktivitas aerobik menurunkan hormon stres dengan cepat',icon: Sun,      duration: '15 min' },
  ],
  tired:   [
    { title: 'Power Nap',            desc: 'Tidur 20 menit untuk recharge tanpa grogginess',        icon: Heart,    duration: '20 min' },
    { title: 'Stretching Ringan',    desc: 'Regangkan otot leher & punggung untuk energi',          icon: Sparkles, duration: '10 min' },
    { title: 'Air Putih & Snack',    desc: 'Dehidrasi sering menyebabkan rasa lelah',               icon: Wind,     duration: '5 min'  },
    { title: 'Musik Energik',        desc: 'Playlist upbeat bisa membantu melawan rasa ngantuk',    icon: Music,    duration: '15 min' },
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

const PAST_MOODS = [
  { date: '11 Feb 2026', mood: 'happy'   as MoodLevel, confidence: 82 },
  { date: '9 Feb 2026',  mood: 'calm'    as MoodLevel, confidence: 75 },
  { date: '7 Feb 2026',  mood: 'anxious' as MoodLevel, confidence: 68 },
  { date: '5 Feb 2026',  mood: 'happy'   as MoodLevel, confidence: 88 },
  { date: '3 Feb 2026',  mood: 'tired'   as MoodLevel, confidence: 71 },
]

const RECOMMENDED_ACTIVITIES: never[] = []

const fadeIn: Variants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

/* ─── Vision AI untuk Face Mood Tracker (OpenRouter → Gemini Flash) ─ */
const FACE_API_KEY = import.meta.env.VITE_GEMINI_FACE_API_KEY as string | undefined

// Detect provider from key format
const isOpenRouter = FACE_API_KEY?.startsWith('sk-or-')
const isGeminiAQ   = FACE_API_KEY?.startsWith('AQ.')
const isGeminiAIza = FACE_API_KEY?.startsWith('AIza')

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const GEMINI_URL     = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

interface GeminiEmotionResult {
  emotions: Record<string, number>   // e.g. { happy: 0.72, sad: 0.05, ... }
  primaryEmotion: string
  confidence: number                  // 0–100
  reasoning: string
  geminiDescription: string
}

async function analyzeWithGemini(
  imageBase64: string,
  humanScores: Record<string, number>,
): Promise<GeminiEmotionResult | null> {
  if (!FACE_API_KEY) return null

  const humanSummary = Object.entries(humanScores)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k}: ${Math.round(v * 100)}%`)
    .join(', ')

  const prompt = `Kamu adalah ahli psikologi emosi dan computer vision.

Analisis ekspresi wajah pada gambar ini. Model deteksi lokal (FER neural network) sudah memberikan skor awal:
${humanSummary}

Tugasmu:
1. Lihat gambar wajah dengan seksama — perhatikan mata, alis, sudut mulut, kerutan dahi, dan postur wajah.
2. Berikan skor emosi yang lebih akurat berdasarkan pengamatan VISUAL kamu (0.0 sampai 1.0).
3. Tentukan emosi dominan dari pilihan: happy, calm, neutral, fearful, sad, angry, disgusted, surprised.
4. Berikan confidence score 0-100 untuk keseluruhan analisis.
5. Berikan penjelasan singkat 1-2 kalimat tentang apa yang kamu lihat (dalam Bahasa Indonesia).

PENTING: Berikan response HANYA dalam format JSON valid seperti ini (tanpa markdown, tanpa kode block):
{
  "emotions": {
    "happy": 0.0,
    "calm": 0.0,
    "neutral": 0.0,
    "fearful": 0.0,
    "sad": 0.0,
    "angry": 0.0,
    "disgusted": 0.0,
    "surprised": 0.0
  },
  "primaryEmotion": "happy",
  "confidence": 85,
  "reasoning": "Penjelasan singkat",
  "geminiDescription": "Deskripsi kondisi emosional untuk user"
}`

  try {
    let rawText = ''

    if (isOpenRouter) {
      /* ── OpenRouter (Gemini Flash via OpenRouter) ── */
      const res = await fetch(OPENROUTER_URL, {
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
        const err = await res.json().catch(() => ({}))
        console.error('[OpenRouter] HTTP', res.status, err)
        return null
      }
      const data = await res.json()
      rawText = data?.choices?.[0]?.message?.content ?? ''

    } else if (isGeminiAIza || isGeminiAQ) {
      /* ── Gemini direct ── */
      const url = isGeminiAIza ? `${GEMINI_URL}?key=${FACE_API_KEY}` : GEMINI_URL
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (isGeminiAQ) headers['x-goog-api-key'] = FACE_API_KEY!

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          contents: [{ parts: [
            { text: prompt },
            { inline_data: { mime_type: 'image/jpeg', data: imageBase64 } },
          ]}],
          generationConfig: { temperature: 0.1, maxOutputTokens: 512 },
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.error('[Gemini] HTTP', res.status, err)
        return null
      }
      const data = await res.json()
      rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    }

    const clean = rawText.replace(/```json|```/g, '').trim()
    return JSON.parse(clean) as GeminiEmotionResult
  } catch (err) {
    console.error('[FaceAI] fetch error:', err)
    return null
  }
}

/* ─── Merge Human.js + Gemini scores (weighted blend) ───────────── */
function mergeScores(
  humanScores: Record<string, number>,
  gemini: GeminiEmotionResult,
): Record<string, number> {
  // Gemini gets 65% weight, Human.js gets 35%
  const merged: Record<string, number> = {}
  const allKeys = new Set([...Object.keys(humanScores), ...Object.keys(gemini.emotions)])
  for (const k of allKeys) {
    const h = humanScores[k] ?? 0
    const g = gemini.emotions[k] ?? 0
    merged[k] = h * 0.35 + g * 0.65
  }
  return merged
}

/* ─── Map Human.js emotion to MoodLevel ─────────────────────────── */
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
    default:          return 'neutral'
  }
}

/* ─── Build MoodResult from real Human.js emotion data ──────────── */
function buildMoodResult(emotions: Record<string, number>): MoodResult {
  const detections: MoodDetection[] = Object.entries(emotions)
    .filter(([key]) => EMOTION_MAP[key])
    .map(([key, score]) => ({
      ...EMOTION_MAP[key],
      pct: Math.round(score * 100),
    }))
    .sort((a, b) => b.pct - a.pct)

  const top = detections[0]
  const primaryMood = emotionToMoodLevel(top?.rawKey ?? 'neutral')
  const confidence  = Math.round((top?.pct ?? 50) * 0.9 + 10) // scale to feel realistic

  return {
    primaryMood,
    confidence: Math.min(confidence, 97),
    description: MOOD_CONFIG[primaryMood].desc,
    recommendation: MOOD_RECOMMENDATIONS[primaryMood],
    activities: MOOD_ACTIVITIES[primaryMood],
    detections,
  }
}

/* ─── Smooth emotion averaging over N frames ─────────────────────── */
function smoothEmotions(
  history: Record<string, number>[],
  current: Record<string, number>,
): Record<string, number> {
  const all = [...history, current].slice(-8)   // last 8 frames
  const keys = Object.keys(current)
  const result: Record<string, number> = {}
  for (const k of keys) {
    result[k] = all.reduce((sum, f) => sum + (f[k] ?? 0), 0) / all.length
  }
  return result
}

/* ══════════════════════════════════════════════════════════════════ */
/*  Component                                                         */
/* ══════════════════════════════════════════════════════════════════ */
function MoodCheckPage() {
  const navigate = useNavigate()
  const { user, session, loading: authLoading } = useAuth()
  
  const [viewMode, setViewMode]             = useState<ViewMode>('camera')
  const [cameraActive, setCameraActive]     = useState(false)
  const [modelLoading, setModelLoading]     = useState(false)
  const [modelReady, setModelReady]         = useState(false)
  const [scanProgress, setScanProgress]     = useState(0)
  const [liveDetections, setLiveDetections] = useState<MoodDetection[]>([])
  const [faceFound, setFaceFound]           = useState(false)
  const [moodResult, setMoodResult]         = useState<MoodResult | null>(null)
  // Gemini Vision states
  const [geminiLoading, setGeminiLoading]   = useState(false)
  const [geminiUsed, setGeminiUsed]         = useState(false)
  const [geminiError, setGeminiError]       = useState(false)
  // Mood history state
  const [moodHistory, setMoodHistory]       = useState<{ id: number; created_at: string; mood: MoodLevel; confidence: number }[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const videoRef      = useRef<HTMLVideoElement>(null)
  const canvasRef     = useRef<HTMLCanvasElement>(null)
  const streamRef     = useRef<MediaStream | null>(null)
  const humanRef      = useRef<InstanceType<typeof import('@vladmandic/human').Human> | null>(null)
  const rafRef        = useRef<number | null>(null)
  const frameCount    = useRef(0)
  const emotionHistory= useRef<Record<string, number>[]>([])
  const isScanningRef = useRef(false)
  // Best frame capture for Gemini
  const bestFrameRef  = useRef<string | null>(null)
  const bestFaceScore = useRef(0)

  /* Attach stream to video element */
  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }, [cameraActive])

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  /* ── Load @vladmandic/human model ───────────────────────── */
  const loadHuman = useCallback(async () => {
    if (humanRef.current) return   // already loaded
    setModelLoading(true)
    try {
      const { Human } = await import('@vladmandic/human')
      const h = new Human({
        modelBasePath: `${window.location.origin}/node_modules/@vladmandic/human/models/`,
        debug: false,
        // Try webgl first, fallback to cpu/wasm
        backend: 'webgl',
        wasmPath: `${window.location.origin}/node_modules/@vladmandic/human/dist/`,
        face: {
          enabled: true,
          detector:  { enabled: true,  maxDetected: 1, minConfidence: 0.4 },
          mesh:      { enabled: true },
          emotion:   { enabled: true,  minConfidence: 0.1 },
          description: { enabled: false },
          iris:      { enabled: false },
          liveness:  { enabled: false },
          antispoof: { enabled: false },
        },
        body:   { enabled: false },
        hand:   { enabled: false },
        object: { enabled: false },
        gesture:{ enabled: false },
        segmentation: { enabled: false },
      })
      await h.load()
      await h.warmup()
      humanRef.current = h
      setModelReady(true)
    } catch (err) {
      console.error('Human.js load error:', err)
      // Try again with cpu backend as fallback
      try {
        const { Human } = await import('@vladmandic/human')
        const h2 = new Human({
          modelBasePath: `${window.location.origin}/node_modules/@vladmandic/human/models/`,
          debug: false,
          backend: 'cpu',
          face: {
            enabled: true,
            detector:  { enabled: true,  maxDetected: 1, minConfidence: 0.4 },
            mesh:      { enabled: true },
            emotion:   { enabled: true,  minConfidence: 0.1 },
            description: { enabled: false },
            iris:      { enabled: false },
            liveness:  { enabled: false },
            antispoof: { enabled: false },
          },
          body:   { enabled: false },
          hand:   { enabled: false },
          object: { enabled: false },
          gesture:{ enabled: false },
          segmentation: { enabled: false },
        })
        await h2.load()
        await h2.warmup()
        humanRef.current = h2
        setModelReady(true)
        console.log('Human.js loaded with CPU backend fallback')
      } catch (err2) {
        console.error('Human.js CPU fallback also failed:', err2)
      }
    } finally {
      setModelLoading(false)
    }
  }, [])

  /* ── Detection loop ─────────────────────────────────────── */
  const runDetectionLoop = useCallback(() => {
    const human  = humanRef.current
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!human || !video || !isScanningRef.current) return

    const detect = async () => {
      if (!isScanningRef.current) return
      try {
        const result = await human.detect(video)
        const face   = result.face?.[0]

        if (face && face.emotion && face.emotion.length > 0) {
          setFaceFound(true)

          /* Convert array to map */
          const rawMap: Record<string, number> = {}
          for (const e of face.emotion) rawMap[e.emotion] = e.score

          /* Smooth over last 8 frames */
          const smoothed = smoothEmotions(emotionHistory.current, rawMap)
          emotionHistory.current = [...emotionHistory.current, rawMap].slice(-8)

          /* Build detections for live display */
          const dets: MoodDetection[] = Object.entries(smoothed)
            .filter(([k]) => EMOTION_MAP[k])
            .map(([k, v]) => ({ ...EMOTION_MAP[k], pct: Math.round(v * 100) }))
            .sort((a, b) => b.pct - a.pct)
          setLiveDetections(dets)

          /* Draw face mesh on canvas overlay */
          if (canvas && video.videoWidth > 0) {
            canvas.width  = video.videoWidth
            canvas.height = video.videoHeight
            const ctx = canvas.getContext('2d')
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height)
              /* Draw face box */
              const box = face.box
              if (box) {
                ctx.strokeStyle = '#22d3ee'
                ctx.lineWidth   = 2
                ctx.setLineDash([6, 3])
                ctx.strokeRect(box[0], box[1], box[2], box[3])
                /* Emotion label */
                const top = dets[0]
                if (top) {
                  ctx.fillStyle = 'rgba(6,182,212,0.85)'
                  ctx.fillRect(box[0], box[1] - 26, 140, 22)
                  ctx.fillStyle = '#fff'
                  ctx.font = 'bold 13px sans-serif'
                  ctx.fillText(`${top.emotion} ${top.pct}%`, box[0] + 6, box[1] - 8)
                }
              }
            }
          }

          frameCount.current++
          /* Progress: 30 frames (~5-7s) = 100% */
          const prog = Math.min(Math.round((frameCount.current / 30) * 100), 100)
          setScanProgress(prog)

          /* Capture best frame for Gemini (highest face score) */
          const faceScore = face.score ?? 0
          if (faceScore > bestFaceScore.current && video.videoWidth > 0) {
            bestFaceScore.current = faceScore
            const capCanvas = document.createElement('canvas')
            capCanvas.width  = video.videoWidth
            capCanvas.height = video.videoHeight
            const capCtx = capCanvas.getContext('2d')
            if (capCtx) {
              capCtx.drawImage(video, 0, 0)
              // Store as base64 jpeg (strip the data:image/jpeg;base64, prefix)
              bestFrameRef.current = capCanvas.toDataURL('image/jpeg', 0.85).split(',')[1]
            }
          }

          if (prog >= 100 && isScanningRef.current) {
            isScanningRef.current = false
            const humanResult = buildMoodResult(smoothed)

            /* Stop camera stream */
            streamRef.current?.getTracks().forEach(t => t.stop())
            streamRef.current = null
            setCameraActive(false)

            if (FACE_API_KEY && bestFrameRef.current) {
              /* Phase 2: Gemini Vision refinement */
              setGeminiLoading(true)
              setMoodResult(humanResult)    // show interim result immediately
              setViewMode('result')
              // Save interim result first
              saveMoodResult(humanResult)

              analyzeWithGemini(bestFrameRef.current, smoothed).then(gemini => {
                setGeminiLoading(false)
                if (gemini) {
                  const merged = mergeScores(smoothed, gemini)
                  const refined = buildMoodResult(merged)
                  // Override confidence and description with Gemini's
                  refined.confidence = gemini.confidence
                  if (gemini.geminiDescription) {
                    refined.description = gemini.geminiDescription
                  }
                  setMoodResult(refined)
                  setGeminiUsed(true)
                  // Save refined result
                  saveMoodResult(refined)
                } else {
                  setGeminiError(true)
                }
              })
            } else {
              setMoodResult(humanResult)
              setViewMode('result')
              saveMoodResult(humanResult)
            }
            return
          }
        } else {
          setFaceFound(false)
        }
      } catch (e) {
        // silently continue on frame error
      }

      if (isScanningRef.current) {
        rafRef.current = requestAnimationFrame(detect)
      }
    }

    rafRef.current = requestAnimationFrame(detect)
  }, [])

  /* ── stopCamera ─────────────────────────────────────────── */
  const stopCamera = useCallback(() => {
    isScanningRef.current = false
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    frameCount.current = 0
    emotionHistory.current = []
    bestFrameRef.current = null
    bestFaceScore.current = 0
    setCameraActive(false)
    setScanProgress(0)
    setLiveDetections([])
    setFaceFound(false)
  }, [])

  /* ── startCamera ────────────────────────────────────────── */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      frameCount.current = 0
      emotionHistory.current = []
      setScanProgress(0)
      setLiveDetections([])
      setCameraActive(true)

      /* Load model then start loop */
      await loadHuman()
      isScanningRef.current = true
      runDetectionLoop()
    } catch {
      alert('Gagal mengakses kamera! Silakan izinkan akses kamera di browser Anda.')
    }
  }

  // Fetch mood history from Supabase
  const fetchMoodHistory = useCallback(async () => {
    if (!user) return
    setHistoryLoading(true)
    try {
      const { data, error } = await supabase
        .from('mood_history')
        .select('id, created_at, mood, confidence')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setMoodHistory(data as any)
    } catch (err) {
      console.error('Error fetching mood history:', err)
    } finally {
      setHistoryLoading(false)
    }
  }, [user])

  // Save mood result to Supabase
  const saveMoodResult = async (result: MoodResult) => {
    if (!user) return
    try {
      const { error } = await supabase
        .from('mood_history')
        .insert({
          user_id: user.id,
          mood: result.primaryMood,
          confidence: result.confidence
        })
      
      if (error) throw error
      
      // Refresh history
      fetchMoodHistory()
    } catch (err) {
      console.error('Error saving mood result:', err)
    }
  }

  // Fetch history when user changes
  useEffect(() => {
    if (user) {
      fetchMoodHistory()
    }
  }, [user, fetchMoodHistory])

  /* ── resetAll ────────────────────────────────────────────── */
  const resetAll = () => {
    stopCamera()
    setMoodResult(null)
    setGeminiUsed(false)
    setGeminiError(false)
    setGeminiLoading(false)
    setViewMode('camera')
  }

  /* ── helpers ─────────────────────────────────────────────── */
  const scanLabel = scanProgress < 25 ? 'Mendeteksi wajah...'
    : scanProgress < 50  ? 'Membaca ekspresi...'
    : scanProgress < 75  ? 'Menganalisis emosi...'
    : scanProgress < 100 ? 'Menyempurnakan hasil...'
    : geminiLoading      ? '✨ Gemini Vision memproses...'
    : '✓ Analisis selesai!'

  const CIRC_R = 48
  const CIRC_C = 2 * Math.PI * CIRC_R

  // Helper to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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
              AI menganalisis ekspresi wajah Anda secara real-time menggunakan model deteksi emosi bertenaga neural network.
            </p>
            {modelReady && (
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Model AI siap · Deteksi lokal + Gemini Vision
              </div>
            )}
          </motion.header>

          {/* ── Navigation ──────────────────────────────────── */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100/80 p-1 w-fit">
            {([
              { key: 'camera',     label: 'Cek Mood',     icon: Camera },
              { key: 'history',    label: 'Riwayat Mood', icon: Clock  },
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

          {/* ══════════════ CAMERA ══════════════ */}
          {viewMode === 'camera' && (
            <motion.div key="camera" variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
              {!cameraActive ? (
                /* ── Start CTA ── */
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
                          Tatap kamera depan Anda. Neural network akan membaca ekspresi wajah secara real-time — semua diproses lokal, tidak ada data yang dikirim ke server.
                        </p>
                      </div>
                      <button
                        onClick={startCamera}
                        disabled={modelLoading}
                        className="flex items-center gap-2 rounded-xl bg-white text-cyan-700 px-8 py-4 text-base font-bold hover:bg-cyan-50 shadow-lg transition-all hover:scale-105 disabled:opacity-60 disabled:cursor-wait"
                      >
                        {modelLoading ? (
                          <><Loader2 className="h-5 w-5 animate-spin" /> Memuat Model AI...</>
                        ) : (
                          <><Camera className="h-5 w-5" /> Nyalakan Kamera</>
                        )}
                      </button>
                    </div>
                  </div>

                {/* AI Info */}
                <div className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 p-6">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-cyan-500" />
                    Teknologi Deteksi Emosi
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { icon: Brain,    title: 'Neural Network FER',  desc: 'Model deteksi emosi lokal — analisis 30+ frame untuk baseline akurat' },
                      { icon: Sparkles, title: 'Gemini Vision AI',    desc: 'Google Gemini 1.5 Flash melihat wajah Anda & memvalidasi hasil dengan bobot 65%' },
                      { icon: Zap,      title: 'Temporal Smoothing',  desc: 'Rata-rata dari 8 frame terakhir supaya hasil tidak goyang' },
                      { icon: Sun,      title: 'Weighted Merge',      desc: 'Skor FER (35%) + Gemini (65%) digabung untuk akurasi tertinggi' },
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

                {/* Tips */}
                <div className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 p-6">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Info className="h-4 w-4 text-slate-400" />
                    Tips untuk Hasil Terbaik
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {[
                      { icon: Smile,  title: 'Wajah Natural',  desc: 'Jangan dipaksakan, tunjukkan ekspresi alami Anda' },
                      { icon: Sun,    title: 'Cahaya Merata',   desc: 'Pastikan wajah terkena cahaya cukup dari depan' },
                      { icon: Camera, title: 'Kamera Depan',    desc: 'Posisikan wajah di tengah frame kamera' },
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

              /* ── Live Camera + Progress ── */
              <div className="space-y-0">

                {/* Video + canvas overlay */}
                <div className="relative rounded-t-2xl overflow-hidden shadow-2xl bg-black" style={{ aspectRatio: '4/3' }}>
                  <video
                    ref={videoRef}
                    autoPlay playsInline muted
                    className="w-full h-full object-cover block"
                  />
                  {/* Canvas for face mesh + emotion label */}
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ objectFit: 'cover' }}
                  />

                  {/* Scan line (only when scanning) */}
                  {scanProgress < 100 && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <motion.div
                        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                        style={{ boxShadow: '0 0 12px 3px rgba(6,182,212,0.8)' }}
                        animate={{ top: ['5%', '95%', '5%'] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
                      />
                    </div>
                  )}

                  {/* No face warning */}
                  {!faceFound && scanProgress < 100 && liveDetections.length === 0 && (
                    <div className="absolute inset-x-0 bottom-20 flex justify-center pointer-events-none">
                      <div className="flex items-center gap-2 bg-amber-500/80 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-full">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Arahkan wajah ke kamera
                      </div>
                    </div>
                  )}

                  {/* Corner brackets */}
                  <div className="absolute inset-4 pointer-events-none">
                    <div className={cn("absolute top-0 left-0  w-8 h-8 border-t-2 border-l-2 rounded-tl-lg transition-colors", faceFound ? "border-emerald-400" : "border-cyan-400")} />
                    <div className={cn("absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 rounded-tr-lg transition-colors", faceFound ? "border-emerald-400" : "border-cyan-400")} />
                    <div className={cn("absolute bottom-0 left-0  w-8 h-8 border-b-2 border-l-2 rounded-bl-lg transition-colors", faceFound ? "border-emerald-400" : "border-cyan-400")} />
                    <div className={cn("absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 rounded-br-lg transition-colors", faceFound ? "border-emerald-400" : "border-cyan-400")} />
                  </div>

                  {/* BIG PROGRESS OVERLAY */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 px-8 pointer-events-none">
                    <div className="relative flex items-center justify-center">
                      <svg className="w-32 h-32 -rotate-90 drop-shadow-xl" viewBox="0 0 112 112">
                        <circle cx="56" cy="56" r={CIRC_R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="7" />
                        <motion.circle
                          cx="56" cy="56" r={CIRC_R}
                          fill="none"
                          stroke={faceFound ? '#34d399' : '#22d3ee'}
                          strokeWidth="7" strokeLinecap="round"
                          strokeDasharray={`${CIRC_C}`}
                          animate={{ strokeDashoffset: CIRC_C * (1 - scanProgress / 100) }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        {scanProgress < 100 ? (
                          <>
                            <motion.span
                              key={scanProgress}
                              initial={{ scale: 0.75, opacity: 0 }}
                              animate={{ scale: 1,    opacity: 1 }}
                              className="text-4xl font-black text-white drop-shadow-lg leading-none tabular-nums"
                            >
                              {scanProgress}%
                            </motion.span>
                            <span className="text-[10px] text-cyan-200 font-semibold mt-1">
                              {faceFound ? 'Wajah terdeteksi ✓' : 'Memindai...'}
                            </span>
                          </>
                        ) : (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 260 }}
                            className="flex flex-col items-center"
                          >
                            <CheckCircle2 className="h-11 w-11 text-emerald-300 drop-shadow-lg" />
                            <span className="text-[10px] text-emerald-200 font-semibold mt-1">Selesai!</span>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Linear bar */}
                    <div className="w-full max-w-xs">
                      <div className="h-2.5 rounded-full bg-white/20 overflow-hidden backdrop-blur-sm">
                        <motion.div
                          className={cn('h-full rounded-full bg-gradient-to-r', faceFound ? 'from-emerald-400 to-teal-300' : 'from-cyan-400 to-sky-300')}
                          animate={{ width: `${scanProgress}%` }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-white/50">0%</span>
                        <span className="text-[10px] text-white/50">100%</span>
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.span
                        key={scanLabel}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.25 }}
                        className="text-xs font-semibold text-white/90 bg-black/35 backdrop-blur-sm px-4 py-1.5 rounded-full"
                      >
                        {scanLabel}
                      </motion.span>
                    </AnimatePresence>
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

                {/* Live Detections Card */}
                <div className="rounded-b-2xl bg-white border border-t-0 border-white/60 shadow-xl shadow-slate-200/60 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-cyan-600" />
                      <h3 className="text-sm font-bold text-slate-800">Analisis Emosi Real-time</h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {scanProgress < 100 ? (
                        <><div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                          <span className="text-[10px] font-semibold text-cyan-600">
                            {faceFound ? `${frameCount.current} frame dianalisis` : 'Mencari wajah...'}
                          </span>
                        </>
                      ) : (
                        <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-[10px] font-semibold text-emerald-600">Analisis selesai!</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-4 space-y-2 min-h-[180px]">
                    {liveDetections.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mb-2" />
                        <p className="text-xs text-slate-400">
                          {modelLoading ? 'Memuat model AI...' : 'Menunggu deteksi wajah...'}
                        </p>
                      </div>
                    )}
                    <AnimatePresence>
                      {liveDetections.map((det, i) => {
                        const Icon = det.icon
                        return (
                          <motion.div
                            key={det.emotion}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className={cn(
                              'flex items-center gap-3 p-3 rounded-xl border',
                              i === 0 ? 'bg-cyan-50 border-cyan-200 shadow-sm' : 'bg-slate-50 border-slate-100',
                            )}
                          >
                            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                              <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
                                <circle cx="24" cy="24" r="20" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                                <motion.circle
                                  cx="24" cy="24" r="20" fill="none"
                                  stroke={i === 0 ? '#06b6d4' : '#94a3b8'}
                                  strokeWidth="4" strokeLinecap="round"
                                  strokeDasharray={`${2 * Math.PI * 20}`}
                                  animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - det.pct / 100) }}
                                  transition={{ duration: 0.4 }}
                                />
                              </svg>
                              <span className={cn('absolute text-xs font-bold', i === 0 ? 'text-cyan-700' : 'text-slate-500')}>
                                {det.pct}%
                              </span>
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
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ══════════════ RESULT ══════════════ */}
        {viewMode === 'result' && moodResult && (
          <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">

            {/* Gemini loading banner */}
            <AnimatePresence>
              {geminiLoading && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-3 rounded-2xl bg-violet-50 border border-violet-200 p-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100">
                    <Sparkles className="h-4 w-4 text-violet-600 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-violet-800">Gemini Vision sedang menganalisis...</p>
                    <p className="text-xs text-violet-600 mt-0.5">Hasil akan diperbarui secara otomatis dengan akurasi lebih tinggi</p>
                  </div>
                  <Loader2 className="h-5 w-5 text-violet-500 animate-spin shrink-0" />
                </motion.div>
              )}
            </AnimatePresence>

            <div className={cn('rounded-2xl border overflow-hidden shadow-lg', MOOD_CONFIG[moodResult.primaryMood].bgColor)}>
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-5">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, delay: 0.1 }} className="text-6xl">
                    {MOOD_CONFIG[moodResult.primaryMood].emoji}
                  </motion.div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className={cn('text-lg font-bold', MOOD_CONFIG[moodResult.primaryMood].color)}>
                        Mood: {MOOD_CONFIG[moodResult.primaryMood].label}
                      </p>
                      <span className="text-xs text-slate-500">• Akurasi {moodResult.confidence}%</span>
                      {geminiUsed && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-700 bg-violet-100 border border-violet-200 px-2 py-0.5 rounded-full">
                          <Sparkles className="h-3 w-3" /> Diperbarui Gemini Vision
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{moodResult.description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI confidence */}
            <div className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-800">Tingkat Keyakinan AI</p>
                <div className="flex items-center gap-2">
                  {geminiLoading && <Loader2 className="h-3.5 w-3.5 text-violet-400 animate-spin" />}
                  <motion.p
                    key={moodResult.confidence}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-lg font-bold text-slate-900"
                  >
                    {moodResult.confidence}%
                  </motion.p>
                </div>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  key={moodResult.confidence}
                  initial={{ width: 0 }}
                  animate={{ width: `${moodResult.confidence}%` }}
                  transition={{ duration: 1.1, delay: 0.1, ease: 'easeOut' }}
                  className={cn(
                    'h-full rounded-full bg-gradient-to-r',
                    geminiUsed ? 'from-violet-500 to-purple-400' : 'from-cyan-500 to-sky-500',
                  )}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                {geminiUsed ? (
                  <><Sparkles className="h-3 w-3 text-violet-400" /> Hasil gabungan: Neural Network FER (35%) + Gemini Vision (65%)</>
                ) : geminiError ? (
                  <><Info className="h-3 w-3 text-amber-400" /> Hanya Neural Network FER — Gemini tidak tersedia saat ini</>
                ) : (
                  <><Zap className="h-3 w-3" /> Neural Network FER · 30+ frame dianalisis</>
                )}
              </p>
            </div>

            {/* Emotions breakdown */}
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
                        <motion.div initial={{ width: 0 }} animate={{ width: `${det.pct}%` }} transition={{ duration: 0.7, delay: i * 0.08 }}
                          className={cn('h-full rounded-full', i === 0 ? 'bg-cyan-500' : 'bg-slate-400')} />
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

          {/* ══════════════ HISTORY ══════════════ */}
          {viewMode === 'history' && (
            <motion.div key="history" variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-800">Riwayat Mood</h2>
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 text-cyan-500 animate-spin mb-2" />
                  <p className="text-sm text-slate-500">Memuat riwayat mood...</p>
                </div>
              ) : moodHistory.length === 0 ? (
                <div className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 p-8 text-center">
                  <Clock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">Belum Ada Riwayat Mood</h3>
                  <p className="text-xs text-slate-500">Lakukan cek mood pertama Anda untuk melihat riwayat di sini!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {moodHistory.map((entry) => {
                    const conf = MOOD_CONFIG[entry.mood]
                    return (
                      <div key={entry.id} className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 p-5 flex items-center gap-4">
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
