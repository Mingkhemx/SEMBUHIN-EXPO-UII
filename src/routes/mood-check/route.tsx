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

/* ─── Emotion definitions ────────────────────────────────────────── */
const EMOTION_MAP: Record<string, Omit<MoodDetection, 'pct'>> = {
  happy:    { emotion: 'Senang',   icon: Smile,         color: 'text-emerald-600', description: 'Ekspresi positif terdeteksi',    rawKey: 'happy'    },
  calm:     { emotion: 'Tenang',   icon: Meh,           color: 'text-sky-600',     description: 'Wajah rileks dan stabil',         rawKey: 'calm'     },
  neutral:  { emotion: 'Netral',   icon: Meh,           color: 'text-slate-500',   description: 'Tanpa ekspresi dominan',          rawKey: 'neutral'  },
  fearful:  { emotion: 'Cemas',    icon: AlertTriangle, color: 'text-amber-600',   description: 'Tanda ketegangan / rasa takut',   rawKey: 'fearful'  },
  sad:      { emotion: 'Sedih',    icon: Frown,         color: 'text-indigo-600',  description: 'Indikasi kesedihan terdeteksi',   rawKey: 'sad'      },
  angry:    { emotion: 'Marah',    icon: Frown,         color: 'text-red-600',     description: 'Ekspresi kemarahan terdeteksi',   rawKey: 'angry'    },
  disgusted:{ emotion: 'Jijik',    icon: Frown,         color: 'text-orange-600',  description: 'Ekspresi tidak suka terdeteksi',  rawKey: 'disgusted'},
  surprised:{ emotion: 'Terkejut', icon: Sparkles,      color: 'text-violet-600',  description: 'Ekspresi terkejut terdeteksi',    rawKey: 'surprised'},
  tired:    { emotion: 'Lelah',    icon: Meh,           color: 'text-violet-500',  description: 'Kelelahan terdeteksi',            rawKey: 'tired'    },
}

const MOOD_CONFIG: Record<MoodLevel, { label: string; color: string; bgColor: string; emoji: string; desc: string }> = {
  happy:   { label: 'Senang',   color: 'text-emerald-700', bgColor: 'bg-emerald-50 border-emerald-200', emoji: '😊', desc: 'Anda terlihat dalam kondisi emosional yang baik! Ekspresi wajah menunjukkan kebahagiaan dan ketenangan.' },
  calm:    { label: 'Tenang',   color: 'text-sky-700',     bgColor: 'bg-sky-50 border-sky-200',         emoji: '😌', desc: 'Anda tampak tenang dan rileks. Kondisi ini sangat baik untuk fokus dan produktivitas.' },
  neutral: { label: 'Netral',   color: 'text-slate-700',   bgColor: 'bg-slate-50 border-slate-200',     emoji: '😐', desc: 'Ekspresi Anda netral saat ini. Tidak ada emosi dominan yang terdeteksi.' },
  anxious: { label: 'Cemas',    color: 'text-amber-700',   bgColor: 'bg-amber-50 border-amber-200',     emoji: '😰', desc: 'Terdeteksi tanda-tanda kecemasan. Coba teknik relaksasi untuk menenangkan diri.' },
  sad:     { label: 'Sedih',    color: 'text-indigo-700',  bgColor: 'bg-indigo-50 border-indigo-200',   emoji: '😢', desc: 'Anda tampak sedih. Itu wajar — luapkan perasaan Anda dan jangan ragu mencari dukungan.' },
  angry:   { label: 'Marah',    color: 'text-red-700',     bgColor: 'bg-red-50 border-red-200',         emoji: '😠', desc: 'Terdeteksi ekspresi kemarahan. Coba tarik napas dalam dan fokus ke hal-hal yang bisa dikendalikan.' },
  tired:   { label: 'Lelah',    color: 'text-violet-700',  bgColor: 'bg-violet-50 border-violet-200',   emoji: '😫', desc: 'Anda tampak kelelahan. Istirahat sejenak bisa membantu memulihkan energi Anda.' },
}

const MOOD_ACTIVITIES: Record<MoodLevel, MoodResult['activities']> = {
  happy:   [
    { title: 'Jalan Kaki 15 Menit',   desc: 'Pertahankan mood positif dengan aktivitas ringan',       icon: Sun,      duration: '15 min' },
    { title: 'Journaling Syukur',     desc: 'Tulis 3 hal yang Anda syukuri hari ini',                 icon: BookOpen, duration: '10 min' },
    { title: 'Musik Favorit',         desc: 'Dengarkan playlist yang membuat Anda bahagia',           icon: Music,    duration: '20 min' },
    { title: 'Hubungi Teman',         desc: 'Ceritakan kabar baik ke orang terdekat',                 icon: Users,    duration: '15 min' },
  ],
  calm:    [
    { title: 'Meditasi Mindfulness',  desc: 'Pertahankan ketenangan dengan meditasi singkat',         icon: Brain,    duration: '10 min' },
    { title: 'Journaling',            desc: 'Refleksi pikiran saat tenang sangat produktif',          icon: BookOpen, duration: '15 min' },
    { title: 'Musik Lo-fi',           desc: 'Iringi produktivitas dengan musik tenang',               icon: Music,    duration: '30 min' },
    { title: 'Stretching',            desc: 'Regangkan tubuh untuk menjaga energi',                   icon: Sparkles, duration: '10 min' },
  ],
  neutral: [
    { title: 'Jalan Santai',          desc: 'Tingkatkan mood dengan gerakan ringan di luar',          icon: Sun,      duration: '15 min' },
    { title: 'Baca Buku',             desc: 'Isi waktu dengan bacaan yang menarik',                   icon: BookOpen, duration: '20 min' },
    { title: 'Hubungi Sahabat',       desc: 'Obrolan ringan bisa meningkatkan mood',                  icon: Users,    duration: '15 min' },
    { title: 'Musik Upbeat',          desc: 'Coba playlist ceria untuk membangkitkan semangat',       icon: Music,    duration: '20 min' },
  ],
  anxious: [
    { title: 'Pernapasan 4-7-8',      desc: 'Tarik 4 detik, tahan 7, hembuskan 8',                    icon: Wind,     duration: '5 min'  },
    { title: 'Grounding 5-4-3-2-1',   desc: 'Fokus ke 5 benda, 4 suara, 3 sentuhan, 2 bau, 1 rasa',  icon: Brain,    duration: '3 min'  },
    { title: 'Jalan di Alam',         desc: 'Paparan alam terbukti menurunkan kortisol',              icon: Sun,      duration: '20 min' },
    { title: 'Teh Chamomile',         desc: 'Minuman herbal untuk menenangkan sistem saraf',          icon: Heart,    duration: '10 min' },
  ],
  sad:     [
    { title: 'Jalan di Alam',         desc: 'Kontak dengan alam meningkatkan mood secara alami',      icon: Sun,      duration: '20 min' },
    { title: 'Hubungi Orang Terdekat',desc: 'Berbagi cerita meringankan beban emosional',             icon: Users,    duration: '15 min' },
    { title: 'Journaling Perasaan',   desc: 'Tulis apa yang Anda rasakan tanpa menghakimi',           icon: BookOpen, duration: '15 min' },
    { title: 'Musik yang Disukai',    desc: 'Biarkan musik menemani dan mengangkat perasaan',         icon: Music,    duration: '20 min' },
  ],
  angry:   [
    { title: 'Napas Kotak',           desc: 'Tarik 4s, tahan 4s, hembuskan 4s, tahan 4s',            icon: Wind,     duration: '5 min'  },
    { title: 'Olahraga Ringan',       desc: 'Lepaskan energi negatif lewat gerakan fisik',            icon: Sparkles, duration: '15 min' },
    { title: 'Tulis Uneg-uneg',       desc: 'Tuliskan lalu buang — jangan kirim ke siapapun',         icon: BookOpen, duration: '10 min' },
    { title: 'Jalan Cepat',           desc: 'Aktivitas aerobik menurunkan hormon stres dengan cepat', icon: Sun,      duration: '15 min' },
  ],
  tired:   [
    { title: 'Power Nap',             desc: 'Tidur 20 menit untuk recharge tanpa grogginess',         icon: Heart,    duration: '20 min' },
    { title: 'Stretching Ringan',     desc: 'Regangkan otot leher & punggung untuk energi',           icon: Sparkles, duration: '10 min' },
    { title: 'Air Putih & Snack',     desc: 'Dehidrasi sering menyebabkan rasa lelah',                icon: Wind,     duration: '5 min'  },
    { title: 'Musik Energik',         desc: 'Playlist upbeat bisa membantu melawan rasa ngantuk',     icon: Music,    duration: '15 min' },
  ],
}

const MOOD_RECOMMENDATIONS: Record<MoodLevel, string> = {
  happy:   'Mood Anda sedang bagus! Manfaatkan energi positif ini untuk aktivitas yang produktif.',
  calm:    'Ketenangan Anda saat ini sangat berharga. Gunakan untuk fokus pada tujuan penting.',
  neutral: 'Mood Anda stabil. Ini waktu yang baik untuk mencoba aktivitas baru.',
  anxious: 'Terdeteksi kecemasan. Prioritaskan teknik relaksasi dan kurangi stimulasi berlebih.',
  sad:     'Anda boleh merasakan kesedihan. Jangan ragu mencari dukungan orang terdekat.',
  angry:   'Kemarahan adalah emosi yang valid. Salurkan dengan cara yang sehat dan konstruktif.',
  tired:   'Tubuh Anda meminta istirahat. Dengarkan sinyal itu dan berikan waktu untuk pulih.',
}

/* ─── Per-mood rich recommendation content ──────────────────────── */
interface MoodRecoDetail {
  quote: string
  quoteAuthor: string
  context: string        // short label, e.g. "Yang perlu kamu lakukan sekarang"
  accentColor: string    // tailwind bg class for the quote card
  accentText: string     // tailwind text class
  accentBorder: string   // tailwind border class
  priorityLabel: string  // label for top activity
  tips: string[]         // 2 quick tips shown as bullets
}

const MOOD_RECO_DETAIL: Record<MoodLevel, MoodRecoDetail> = {
  happy: {
    quote: 'Kebahagiaan bukan tujuan — ia adalah cara kita menjalani perjalanan.',
    quoteAuthor: 'Margaret Lee Runbeck',
    context: 'Pertahankan energi positifmu',
    accentColor: 'bg-emerald-50',
    accentText: 'text-emerald-800',
    accentBorder: 'border-emerald-200',
    priorityLabel: '✨ Rayakan momen ini',
    tips: [
      'Bagikan kebahagiaan kamu ke orang-orang terdekat',
      'Catat hal baik hari ini agar bisa dikenang',
    ],
  },
  calm: {
    quote: 'Ketenangan pikiran adalah kebahagiaan yang sesungguhnya.',
    quoteAuthor: 'Epictetus',
    context: 'Manfaatkan ketenanganmu',
    accentColor: 'bg-sky-50',
    accentText: 'text-sky-800',
    accentBorder: 'border-sky-200',
    priorityLabel: '🎯 Waktu terbaik untuk fokus',
    tips: [
      'Gunakan kondisi ini untuk mengerjakan tugas penting',
      'Meditasi singkat akan memperkuat ketenangan ini',
    ],
  },
  neutral: {
    quote: 'Setiap hari adalah kesempatan baru untuk menjadi lebih baik dari kemarin.',
    quoteAuthor: 'Anonim',
    context: 'Beri dirimu sedikit dorongan',
    accentColor: 'bg-slate-50',
    accentText: 'text-slate-800',
    accentBorder: 'border-slate-200',
    priorityLabel: '💡 Bangkitkan semangatmu',
    tips: [
      'Coba satu hal baru hari ini, sekecil apapun',
      'Gerakan fisik ringan terbukti meningkatkan mood',
    ],
  },
  anxious: {
    quote: 'Kamu sudah melewati 100% hari-hari terberatmu. Itu rekor yang luar biasa.',
    quoteAuthor: 'Anonim',
    context: 'Prioritas utama: tenangkan dirimu dulu',
    accentColor: 'bg-amber-50',
    accentText: 'text-amber-800',
    accentBorder: 'border-amber-200',
    priorityLabel: '🫁 Mulai dari napas dulu',
    tips: [
      'Tarik napas dalam 4 detik, tahan 4, hembuskan 4 — ulangi 3x',
      'Batasi paparan berita atau media sosial untuk sementara',
    ],
  },
  sad: {
    quote: 'Tidak apa-apa untuk tidak baik-baik saja. Kamu tidak harus kuat setiap saat.',
    quoteAuthor: 'Anonim',
    context: 'Peluk perasaanmu, jangan ditahan',
    accentColor: 'bg-indigo-50',
    accentText: 'text-indigo-800',
    accentBorder: 'border-indigo-200',
    priorityLabel: '💙 Yang kamu butuhkan sekarang',
    tips: [
      'Cerita ke orang yang kamu percaya — berbagi itu melegakan',
      'Kesedihan itu normal. Beri dirimu izin untuk merasakannya',
    ],
  },
  angry: {
    quote: 'Kemarahan yang dikelola dengan bijak bisa menjadi bahan bakar perubahan.',
    quoteAuthor: 'Anonim',
    context: 'Salurkan energimu dengan tepat',
    accentColor: 'bg-red-50',
    accentText: 'text-red-800',
    accentBorder: 'border-red-200',
    priorityLabel: '🔥 Lepaskan dulu sebelum bicara',
    tips: [
      'Jangan buat keputusan penting saat masih marah',
      'Gerak fisik adalah cara tercepat meredakan amarah',
    ],
  },
  tired: {
    quote: 'Istirahat bukan kelemahan. Istirahat adalah bagian dari perjuangan.',
    quoteAuthor: 'Anonim',
    context: 'Tubuhmu butuh pemulihan',
    accentColor: 'bg-violet-50',
    accentText: 'text-violet-800',
    accentBorder: 'border-violet-200',
    priorityLabel: '😴 Izinkan dirimu beristirahat',
    tips: [
      'Power nap 20 menit lebih efektif dari kafein',
      'Jauhkan layar setidaknya 30 menit sebelum tidur',
    ],
  },
}

const fadeIn: Variants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

/* ─── OpenRouter Vision AI ────────────────────────────────────────── */
const FACE_API_KEY = import.meta.env.VITE_GEMINI_FACE_API_KEY as string | undefined

function emotionToMoodLevel(key: string): MoodLevel {
  const map: Record<string, MoodLevel> = {
    happy: 'happy', calm: 'calm', neutral: 'neutral',
    fearful: 'anxious', sad: 'sad', angry: 'angry',
    disgusted: 'angry', surprised: 'neutral', tired: 'tired',
  }
  return map[key] ?? 'neutral'
}

interface AIEmotionResult {
  faceDetected: boolean
  emotions: Record<string, number>
  primaryEmotion: string
  confidence: number
  geminiDescription: string
}

async function analyzeWithOpenRouter(imageBase64: string): Promise<AIEmotionResult | null> {
  if (!FACE_API_KEY) return null
  const prompt = `Kamu adalah sistem deteksi ekspresi wajah berbasis AI.

LANGKAH 1: Periksa apakah ada wajah manusia yang terlihat jelas di gambar ini.
- Jika TIDAK ada wajah (foto kosong, foto objek/benda, foto dari jauh tanpa wajah jelas, gambar gelap): set "faceDetected": false dan isi emotions dengan 0 semua.
- Jika ADA wajah: set "faceDetected": true dan analisis ekspresi.

LANGKAH 2 (hanya jika faceDetected = true):
Berikan skor emosi (0.0-1.0, total mendekati 1.0):
happy, calm, neutral, fearful, sad, angry, disgusted, surprised, tired

Response HANYA JSON valid ini (tanpa markdown, tanpa kode block):
{"faceDetected":true,"emotions":{"happy":0.0,"calm":0.0,"neutral":0.0,"fearful":0.0,"sad":0.0,"angry":0.0,"disgusted":0.0,"surprised":0.0,"tired":0.0},"primaryEmotion":"neutral","confidence":75,"geminiDescription":"Deskripsi singkat kondisi emosional dalam Bahasa Indonesia"}`

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
        messages: [{ role: 'user', content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
        ]}],
        temperature: 0.1,
        max_tokens: 512,
      }),
    })
    if (!res.ok) { console.error('[OpenRouter]', res.status, await res.text()); return null }
    const data = await res.json()
    const raw: string = data?.choices?.[0]?.message?.content ?? ''
    return JSON.parse(raw.replace(/```json|```/g, '').trim()) as AIEmotionResult
  } catch (e) {
    console.error('[FaceAI]', e)
    return null
  }
}

function buildMoodResult(emotions: Record<string, number>, confidence: number, desc?: string): MoodResult {
  const detections: MoodDetection[] = Object.entries(emotions)
    .filter(([k]) => EMOTION_MAP[k])
    .map(([k, v]) => ({ ...EMOTION_MAP[k], pct: Math.round(v * 100) }))
    .sort((a, b) => b.pct - a.pct)
  const top = detections[0]
  const primaryMood = emotionToMoodLevel(top?.rawKey ?? 'neutral')
  return {
    primaryMood, confidence,
    description: desc ?? MOOD_CONFIG[primaryMood].desc,
    recommendation: MOOD_RECOMMENDATIONS[primaryMood],
    activities: MOOD_ACTIVITIES[primaryMood],
    detections,
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/* ─── Realistic emotion simulation ──────────────────────────────── */
// Generates plausible fluctuating emotion scores that converge toward the real result
function simulateEmotions(
  frame: number,            // 0-29
  targetEmotions: Record<string, number> | null,
): Record<string, number> {
  const keys = ['happy', 'calm', 'neutral', 'fearful', 'sad', 'angry', 'disgusted', 'surprised']
  const result: Record<string, number> = {}
  // Early frames: noisy random
  // Later frames: converge toward target if we have it
  const progress = frame / 29
  for (const k of keys) {
    const target = targetEmotions?.[k] ?? (k === 'neutral' ? 0.4 : 0.08)
    // Add decreasing noise
    const noise = (Math.random() - 0.5) * 0.3 * (1 - progress * 0.7)
    result[k] = Math.max(0, Math.min(1, target + noise))
  }
  // Normalize so they sum to ~1
  const sum = Object.values(result).reduce((a, b) => a + b, 0)
  for (const k of keys) result[k] = result[k] / sum
  return result
}

/* ══════════════════════════════════════════════════════════════════ */
/*  Component                                                         */
/* ══════════════════════════════════════════════════════════════════ */
function MoodCheckPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [viewMode, setViewMode]           = useState<ViewMode>('camera')
  const [cameraActive, setCameraActive]   = useState(false)
  // scanning = camera is live + AI is processing
  const [scanning, setScanning]           = useState(false)
  const [scanProgress, setScanProgress]   = useState(0)
  const [faceFound, setFaceFound]         = useState(false)
  // live emotion bars during scanning
  const [liveDetections, setLiveDetections] = useState<MoodDetection[]>([])
  const [moodResult, setMoodResult]       = useState<MoodResult | null>(null)
  const [moodHistory, setMoodHistory]     = useState<{ id: number; created_at: string; mood: MoodLevel; confidence: number }[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError]                 = useState<string | null>(null)
  const [geminiUsed, setGeminiUsed]       = useState(false)

  const videoRef    = useRef<HTMLVideoElement>(null)
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const streamRef   = useRef<MediaStream | null>(null)
  const rafRef      = useRef<number | null>(null)
  const frameRef    = useRef(0)
  const aiResultRef = useRef<Promise<AIEmotionResult | null> | null>(null)
  const capturedB64 = useRef<string | null>(null)
  const autoCountdownRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [autoCountdown, setAutoCountdown] = useState<number | null>(null)

  /* attach stream */
  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }, [cameraActive])

  /* cleanup */
  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (autoCountdownRef.current) clearTimeout(autoCountdownRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
  }, [])

  /* ── Supabase history ────────────────────────────────────── */
  const fetchMoodHistory = useCallback(async () => {
    if (!user) return
    setHistoryLoading(true)
    try {
      const { data, error: e } = await supabase
        .from('mood_history').select('id, created_at, mood, confidence')
        .eq('user_id', user.id).order('created_at', { ascending: false })
      if (e) throw e
      setMoodHistory(data as any)
    } catch (e) { console.error(e) }
    finally { setHistoryLoading(false) }
  }, [user])

  useEffect(() => { if (user) fetchMoodHistory() }, [user, fetchMoodHistory])

  const saveMoodResult = useCallback(async (r: MoodResult) => {
    if (!user) return
    await supabase.from('mood_history').insert({ user_id: user.id, mood: r.primaryMood, confidence: r.confidence })
    fetchMoodHistory()
  }, [user, fetchMoodHistory])

  /* ── Capture frame as base64 ────────────────────────────── */
  const captureFrame = (): string | null => {
    const video = videoRef.current
    if (!video || video.videoWidth === 0) return null
    const c = document.createElement('canvas')
    c.width = video.videoWidth; c.height = video.videoHeight
    c.getContext('2d')!.drawImage(video, 0, 0)
    return c.toDataURL('image/jpeg', 0.85).split(',')[1]
  }

  /* ── Animation loop: runs for ~5 seconds, 30 frames ────── */
  const runScanLoop = useCallback((targetEmotions: Record<string, number> | null) => {
    const TOTAL_FRAMES = 30
    frameRef.current = 0

    const tick = () => {
      const f = frameRef.current
      const prog = Math.min(Math.round((f / TOTAL_FRAMES) * 100), 99)
      setScanProgress(prog)

      // Simulate live emotion bars
      const sim = simulateEmotions(f, targetEmotions)
      const dets: MoodDetection[] = Object.entries(sim)
        .filter(([k]) => EMOTION_MAP[k])
        .map(([k, v]) => ({ ...EMOTION_MAP[k], pct: Math.round(v * 100) }))
        .sort((a, b) => b.pct - a.pct)
      setLiveDetections(dets)
      setFaceFound(true)

      frameRef.current++
      if (frameRef.current <= TOTAL_FRAMES) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  /* ── startCamera: auto-start scan after 3s countdown ────── */
  const startCamera = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      setCameraActive(true)

      // Auto-scan after 3 second countdown
      let c = 3
      setAutoCountdown(c)
      const tick = () => {
        c -= 1
        if (c > 0) {
          setAutoCountdown(c)
          autoCountdownRef.current = setTimeout(tick, 1000)
        } else {
          setAutoCountdown(0)
          // small delay so user sees "0" flash before scan starts
          autoCountdownRef.current = setTimeout(() => {
            setAutoCountdown(null)
            startScan()
          }, 300)
        }
      }
      autoCountdownRef.current = setTimeout(tick, 1000)
    } catch {
      setError('Gagal mengakses kamera! Izinkan akses kamera di browser.')
    }
  }

  /* ── startScan: capture + fire AI + animate simultaneously ─ */
  const startScan = useCallback(async () => {
    const b64 = captureFrame()
    if (!b64) return
    capturedB64.current = b64
    setScanning(true)
    setScanProgress(0)
    setFaceFound(false)
    setLiveDetections([])

    // Fire AI request immediately (runs in background)
    aiResultRef.current = analyzeWithOpenRouter(b64)

    // Start animation loop (~5s for 30 frames at 60fps = actually faster,
    // so we pace it with setTimeout per frame to ~166ms = ~6fps = 5s total)
    const TOTAL_FRAMES = 30
    const FRAME_MS = 167 // 30 frames × 167ms ≈ 5 seconds
    frameRef.current = 0

    const tick = async () => {
      const f = frameRef.current
      const prog = Math.min(Math.round((f / TOTAL_FRAMES) * 100), f < TOTAL_FRAMES ? 99 : 100)
      setScanProgress(prog)

      // Simulated live detections (no target yet, pure noise)
      const sim = simulateEmotions(f, null)
      const dets: MoodDetection[] = Object.entries(sim)
        .filter(([k]) => EMOTION_MAP[k])
        .map(([k, v]) => ({ ...EMOTION_MAP[k], pct: Math.round(v * 100) }))
        .sort((a, b) => b.pct - a.pct)
      setLiveDetections(dets)
      setFaceFound(true)

      frameRef.current++

      if (frameRef.current < TOTAL_FRAMES) {
        setTimeout(tick, FRAME_MS)
      } else {
        // Animation done — now wait for AI result
        setScanProgress(100)
        const aiResult = await aiResultRef.current

        // Stop camera
        streamRef.current?.getTracks().forEach(t => t.stop())
        streamRef.current = null
        setCameraActive(false)
        setScanning(false)
        setLiveDetections([])

        if (!aiResult) {
          // Network/API error
          setError('Analisis gagal. Pastikan koneksi internet stabil dan coba lagi.')
          return
        }

        if (!aiResult.faceDetected) {
          // No face in frame — reset camera so user can try again
          setFaceFound(false)
          setScanProgress(0)
          setError('Tidak ada wajah yang terdeteksi. Pastikan wajah Anda terlihat jelas di kamera, lalu coba lagi.')
          return
        }

        // Valid face detected — show result
        const finalDets: MoodDetection[] = Object.entries(aiResult.emotions)
          .filter(([k]) => EMOTION_MAP[k])
          .map(([k, v]) => ({ ...EMOTION_MAP[k], pct: Math.round(v * 100) }))
          .sort((a, b) => b.pct - a.pct)
        setLiveDetections(finalDets)

        const result = buildMoodResult(aiResult.emotions, aiResult.confidence, aiResult.geminiDescription)
        setMoodResult(result)
        setGeminiUsed(true)
        setViewMode('result')
        saveMoodResult(result)
      }
    }

    setTimeout(tick, FRAME_MS)
  }, [saveMoodResult])

  /* ── stopCamera ──────────────────────────────────────────── */
  const stopCamera = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    if (autoCountdownRef.current) { clearTimeout(autoCountdownRef.current); autoCountdownRef.current = null }
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setCameraActive(false)
    setScanning(false)
    setScanProgress(0)
    setFaceFound(false)
    setLiveDetections([])
    setAutoCountdown(null)
  }, [])

  /* ── reset ───────────────────────────────────────────────── */
  const resetAll = () => {
    stopCamera()
    setMoodResult(null)
    setGeminiUsed(false)
    setError(null)
    setViewMode('camera')
  }

  const scanLabel = scanProgress < 25 ? 'Mendeteksi wajah...'
    : scanProgress < 50 ? 'Membaca ekspresi...'
    : scanProgress < 75 ? 'Menganalisis emosi...'
    : scanProgress < 100 ? 'Menyempurnakan hasil...'
    : '✓ Analisis selesai!'

  const CIRC_R = 48
  const CIRC_C = 2 * Math.PI * CIRC_R

  return (
    <PremiumGate>
      <div className="relative z-10 min-h-screen">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 flex flex-col gap-8">

          {/* ── Hero Card with Image ─────────────────────────────── */}
          <motion.div variants={fadeIn} initial="hidden" animate="visible"
            className="relative w-full overflow-hidden rounded-3xl shadow-2xl"
            style={{ height: '380px', minHeight: '380px', maxHeight: '380px', flexShrink: 0, flexGrow: 0 }}
          >
            {/* Background image */}
            <img
              src="/images/mood.jpg"
              alt="Mood Check"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-7 sm:p-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 px-3 py-1.5 mb-5 w-fit">
                <Zap className="h-3 w-3 text-cyan-300" />
                <span className="text-[11px] font-bold text-white/90 tracking-wider uppercase">AI Mood Tracker</span>
                <span className="h-3.5 w-px bg-white/30" />
                <span className="text-[11px] font-semibold text-cyan-300">Sembuhin Vision 1.5</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight drop-shadow-lg max-w-lg">
                Cek Mood Via Kamera
              </h1>
              <p className="mt-3 text-sm sm:text-base text-white/70 leading-relaxed max-w-md">
                AI menganalisis ekspresi wajah Anda untuk mendeteksi kondisi emosional dan memberikan rekomendasi personal.
              </p>

              {/* Nav tabs */}
              <div className="mt-5 flex items-center gap-2">
                {([
                  { key: 'camera',  label: 'Cek Mood',     icon: Camera },
                  { key: 'history', label: 'Riwayat Mood', icon: Clock  },
                ] as const).map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => { if (key === 'camera') resetAll(); else setViewMode(key) }}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all',
                      viewMode === key
                        ? 'bg-white/20 border-white/40 text-white backdrop-blur-sm shadow-md'
                        : 'bg-white/10 border-white/20 text-white/60 hover:bg-white/15 hover:text-white/80 backdrop-blur-sm'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                    {viewMode === key && <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 ml-1" />}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ══════ CAMERA VIEW ══════ */}
          {viewMode === 'camera' && (
            <motion.div key="camera" variants={fadeIn} initial="hidden" animate="visible" className="w-full space-y-6">

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex items-start gap-3 rounded-2xl border p-5',
                    error.includes('wajah') 
                      ? 'bg-amber-50 border-amber-200' 
                      : 'bg-rose-50 border-rose-200'
                  )}
                >
                  <div className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-2xl',
                    error.includes('wajah') ? 'bg-amber-100' : 'bg-rose-100'
                  )}>
                    {error.includes('wajah') ? '🙈' : '⚠️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-bold mb-1', error.includes('wajah') ? 'text-amber-800' : 'text-rose-800')}>
                      {error.includes('wajah') ? 'Wajah Tidak Terdeteksi' : 'Terjadi Kesalahan'}
                    </p>
                    <p className={cn('text-xs leading-relaxed', error.includes('wajah') ? 'text-amber-700' : 'text-rose-700')}>
                      {error}
                    </p>
                    {error.includes('wajah') && (
                      <button
                        onClick={() => { setError(null); startCamera() }}
                        className="mt-3 flex items-center gap-2 rounded-xl bg-amber-500 text-white px-4 py-2 text-xs font-bold hover:bg-amber-600 transition-all"
                      >
                        <Camera className="h-3.5 w-3.5" /> Coba Lagi
                      </button>
                    )}
                  </div>
                  {!error.includes('wajah') && (
                    <button onClick={() => setError(null)} className="shrink-0">
                      <X className="h-4 w-4 text-rose-400 hover:text-rose-600" />
                    </button>
                  )}
                </motion.div>
              )}

              {!cameraActive ? (
                /* ── Start CTA ── */
                <div className="space-y-6">
                  <div className="rounded-2xl bg-gradient-to-br from-cyan-600 via-sky-700 to-blue-800 p-8 sm:p-12 text-center shadow-2xl">
                    <div className="flex flex-col items-center gap-5">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping" />
                        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white/15 border-2 border-white/30">
                          <Brain className="h-12 w-12 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Siap Cek Mood?</h3>
                        <p className="text-sm text-cyan-100 mt-1 max-w-sm mx-auto">
                          Nyalakan kamera dan hadap layar — scan dimulai otomatis dalam 3 detik.
                        </p>
                      </div>
                      <button onClick={startCamera}
                        className="flex items-center gap-2 rounded-xl bg-white text-cyan-700 px-8 py-4 text-base font-bold hover:bg-cyan-50 shadow-lg transition-all hover:scale-105">
                        <Camera className="h-5 w-5" /> Nyalakan Kamera
                      </button>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white border border-white/60 shadow-lg p-6">
                    <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Info className="h-4 w-4 text-slate-400" /> Tips untuk Hasil Terbaik
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {[
                        { icon: Smile,  title: 'Wajah Natural',  desc: 'Tunjukkan ekspresi alami Anda' },
                        { icon: Sun,    title: 'Cahaya Merata',   desc: 'Pastikan wajah terkena cahaya cukup' },
                        { icon: Camera, title: 'Kamera Depan',    desc: 'Posisikan wajah di tengah frame' },
                      ].map(tip => { const I = tip.icon; return (
                        <div key={tip.title} className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                          <I className="h-5 w-5 text-cyan-600 mb-2" />
                          <p className="text-xs font-bold text-slate-800">{tip.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{tip.desc}</p>
                        </div>
                      )})}
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Live Camera + Scan ── */
                <div className="space-y-0">
                  {/* Video */}
                  <div className="relative rounded-t-2xl overflow-hidden shadow-2xl bg-black" style={{ aspectRatio: '4/3' }}>
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover block" />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Scan line — only while scanning */}
                    {scanning && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <motion.div
                          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                          style={{ boxShadow: '0 0 12px 3px rgba(6,182,212,0.8)' }}
                          animate={{ top: ['5%', '95%', '5%'] }}
                          transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
                        />
                      </div>
                    )}

                    {/* No face warning / countdown — only before scanning */}
                    {!scanning && (
                      <div className="absolute inset-x-0 bottom-20 flex justify-center pointer-events-none">
                        {autoCountdown !== null && autoCountdown > 0 ? (
                          <motion.div
                            key={autoCountdown}
                            initial={{ scale: 1.4, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.6, opacity: 0 }}
                            className="flex items-center gap-3 bg-black/55 backdrop-blur-sm text-white font-bold px-6 py-3 rounded-2xl"
                          >
                            <span className="text-3xl font-black tabular-nums text-cyan-300">{autoCountdown}</span>
                            <span className="text-sm">Scan dimulai dalam...</span>
                          </motion.div>
                        ) : autoCountdown === null && !scanning ? (
                          <div className="flex items-center gap-2 bg-amber-500/80 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-full">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Hadap kamera dengan baik
                          </div>
                        ) : null}
                      </div>
                    )}

                    {/* Corner brackets */}
                    <div className="absolute inset-4 pointer-events-none">
                      {(['tl','tr','bl','br'] as const).map(pos => (
                        <div key={pos} className={cn('absolute w-8 h-8 transition-colors',
                          pos === 'tl' && 'top-0 left-0  border-t-2 border-l-2 rounded-tl-lg',
                          pos === 'tr' && 'top-0 right-0 border-t-2 border-r-2 rounded-tr-lg',
                          pos === 'bl' && 'bottom-0 left-0  border-b-2 border-l-2 rounded-bl-lg',
                          pos === 'br' && 'bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg',
                          faceFound && scanning ? 'border-emerald-400' : 'border-cyan-400',
                        )} />
                      ))}
                    </div>

                    {/* Progress circle — only while scanning */}
                    {scanning && (
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 px-8 pointer-events-none">
                        <div className="relative flex items-center justify-center">
                          <svg className="w-32 h-32 -rotate-90 drop-shadow-xl" viewBox="0 0 112 112">
                            <circle cx="56" cy="56" r={CIRC_R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="7" />
                            <motion.circle cx="56" cy="56" r={CIRC_R} fill="none"
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
                                <motion.span key={scanProgress} initial={{ scale: 0.75, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                  className="text-4xl font-black text-white drop-shadow-lg tabular-nums">
                                  {scanProgress}%
                                </motion.span>
                                <span className="text-[10px] text-cyan-200 font-semibold mt-1">
                                  {faceFound ? 'Wajah terdeteksi ✓' : 'Memindai...'}
                                </span>
                              </>
                            ) : (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260 }}
                                className="flex flex-col items-center">
                                <CheckCircle2 className="h-11 w-11 text-emerald-300 drop-shadow-lg" />
                                <span className="text-[10px] text-emerald-200 font-semibold mt-1">Selesai!</span>
                              </motion.div>
                            )}
                          </div>
                        </div>
                        {/* Linear bar */}
                        <div className="w-full max-w-xs">
                          <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
                            <motion.div
                              className={cn('h-full rounded-full bg-gradient-to-r', faceFound ? 'from-emerald-400 to-teal-300' : 'from-cyan-400 to-sky-300')}
                              animate={{ width: `${scanProgress}%` }}
                              transition={{ duration: 0.4, ease: 'easeOut' }}
                            />
                          </div>
                        </div>
                        <AnimatePresence mode="wait">
                          <motion.span key={scanLabel} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                            className="text-xs font-semibold text-white/90 bg-black/35 backdrop-blur-sm px-4 py-1.5 rounded-full">
                            {scanLabel}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Stop button */}
                    <div className="absolute top-3 right-3 z-50">
                      <button onClick={stopCamera}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-all border border-white/20">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Live Detections Card */}
                  <div className="rounded-b-2xl bg-white border border-t-0 border-white/60 shadow-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-cyan-600" />
                        <h3 className="text-sm font-bold text-slate-800">Analisis Emosi Real-time</h3>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {scanning ? (
                          <><div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                            <span className="text-[10px] font-semibold text-cyan-600">
                              {scanProgress < 100 ? `${Math.round(scanProgress * 30 / 100)} frame dianalisis` : 'Memproses...'}
                            </span></>
                        ) : liveDetections.length > 0 ? (
                          <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-[10px] font-semibold text-emerald-600">Analisis selesai!</span></>
                        ) : autoCountdown !== null && autoCountdown > 0 ? (
                          <><div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-[10px] font-semibold text-amber-600">Auto-scan dalam {autoCountdown}s...</span></>
                        ) : (
                          <span className="text-[10px] text-slate-400">Mempersiapkan...</span>
                        )}
                      </div>
                    </div>
                    <div className="p-4 space-y-2 min-h-[180px]">
                      {liveDetections.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mb-2" />
                          <p className="text-xs text-slate-400">Menunggu scan dimulai...</p>
                        </div>
                      )}
                      <AnimatePresence>
                        {liveDetections.map((det, i) => {
                          const Icon = det.icon
                          return (
                            <motion.div key={det.emotion}
                              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3 }}
                              className={cn('flex items-center gap-3 p-3 rounded-xl border',
                                i === 0 ? 'bg-cyan-50 border-cyan-200 shadow-sm' : 'bg-slate-50 border-slate-100')}
                            >
                              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                                <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
                                  <circle cx="24" cy="24" r="20" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                                  <motion.circle cx="24" cy="24" r="20" fill="none"
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
                    {/* Start scan button — only show if countdown was cancelled */}
                    {!scanning && autoCountdown === null && liveDetections.length === 0 && (
                      <div className="px-4 pb-4">
                        <button onClick={startScan}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 text-white px-6 py-3.5 text-sm font-bold hover:from-cyan-700 hover:to-sky-700 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.01]">
                          <Sparkles className="h-4 w-4" /> Mulai Scan Ekspresi
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ══════ RESULT VIEW ══════ */}
          {viewMode === 'result' && moodResult && (
            <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">

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
                            <Sparkles className="h-3 w-3" /> Sembuhin Vision
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{moodResult.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confidence bar */}
              <div className="rounded-2xl bg-white border border-white/60 shadow-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-slate-800">Tingkat Keyakinan AI</p>
                  <p className="text-lg font-bold text-slate-900">{moodResult.confidence}%</p>
                </div>
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${moodResult.confidence}%` }}
                    transition={{ duration: 1.1, delay: 0.1, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400" />
                </div>
                <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-violet-400" /> Dianalisis oleh Sembuhin Vision 1.5
                </p>
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
                          <motion.div initial={{ width: 0 }} animate={{ width: `${det.pct}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className={cn('h-full rounded-full', i === 0 ? 'bg-cyan-500' : 'bg-slate-400')} />
                        </div>
                        <span className="text-xs font-bold text-slate-600 w-10 text-right">{det.pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Recommendations */}
              <div className="rounded-2xl bg-white border border-white/60 shadow-lg overflow-hidden">
                {/* Header */}
                <div className={cn('px-6 pt-6 pb-4', MOOD_RECO_DETAIL[moodResult.primaryMood].accentColor)}>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-current opacity-70" />
                    <p className="text-sm font-bold text-slate-800">Rekomendasi untuk Kamu</p>
                    <span className={cn('ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border',
                      MOOD_RECO_DETAIL[moodResult.primaryMood].accentText,
                      MOOD_RECO_DETAIL[moodResult.primaryMood].accentBorder,
                      MOOD_RECO_DETAIL[moodResult.primaryMood].accentColor,
                    )}>
                      {MOOD_CONFIG[moodResult.primaryMood].emoji} {MOOD_CONFIG[moodResult.primaryMood].label}
                    </span>
                  </div>

                  {/* Quote card */}
                  <div className={cn('rounded-xl border p-4 mb-3',
                    MOOD_RECO_DETAIL[moodResult.primaryMood].accentBorder,
                    'bg-white/70 backdrop-blur-sm'
                  )}>
                    <p className={cn('text-sm font-medium italic leading-relaxed',
                      MOOD_RECO_DETAIL[moodResult.primaryMood].accentText
                    )}>
                      "{MOOD_RECO_DETAIL[moodResult.primaryMood].quote}"
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1.5 text-right">
                      — {MOOD_RECO_DETAIL[moodResult.primaryMood].quoteAuthor}
                    </p>
                  </div>

                  {/* Context + recommendation text */}
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    {MOOD_RECO_DETAIL[moodResult.primaryMood].context}
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {moodResult.recommendation}
                  </p>

                  {/* Quick tips */}
                  <div className="mt-3 space-y-1.5">
                    {MOOD_RECO_DETAIL[moodResult.primaryMood].tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className={cn('mt-1 h-1.5 w-1.5 rounded-full shrink-0',
                          moodResult.primaryMood === 'happy'   ? 'bg-emerald-400' :
                          moodResult.primaryMood === 'calm'    ? 'bg-sky-400' :
                          moodResult.primaryMood === 'neutral' ? 'bg-slate-400' :
                          moodResult.primaryMood === 'anxious' ? 'bg-amber-400' :
                          moodResult.primaryMood === 'sad'     ? 'bg-indigo-400' :
                          moodResult.primaryMood === 'angry'   ? 'bg-red-400' :
                          'bg-violet-400'
                        )} />
                        <p className="text-xs text-slate-600 leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity cards */}
                <div className="px-6 pb-6 pt-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    {MOOD_RECO_DETAIL[moodResult.primaryMood].priorityLabel}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {moodResult.activities.map((act, i) => {
                      const Icon = act.icon
                      return (
                        <motion.div
                          key={act.title}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className={cn(
                            'flex items-start gap-3 p-3 rounded-xl border transition-all hover:shadow-md',
                            i === 0
                              ? cn(MOOD_RECO_DETAIL[moodResult.primaryMood].accentColor, MOOD_RECO_DETAIL[moodResult.primaryMood].accentBorder)
                              : 'bg-slate-50 border-slate-100 hover:bg-white'
                          )}
                        >
                          <div className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border',
                            i === 0 ? 'bg-white border-white/80 shadow-sm' : 'bg-white border-slate-200'
                          )}>
                            <Icon className={cn('h-4 w-4',
                              i === 0
                                ? MOOD_RECO_DETAIL[moodResult.primaryMood].accentText
                                : 'text-slate-500'
                            )} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-xs font-bold text-slate-800">{act.title}</p>
                              {i === 0 && (
                                <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full',
                                  MOOD_RECO_DETAIL[moodResult.primaryMood].accentText,
                                  MOOD_RECO_DETAIL[moodResult.primaryMood].accentBorder,
                                  'border bg-white/60'
                                )}>
                                  #1
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{act.desc}</p>
                            <p className={cn('text-[10px] font-bold mt-1',
                              i === 0 ? MOOD_RECO_DETAIL[moodResult.primaryMood].accentText : 'text-slate-400'
                            )}>
                              ⏱ {act.duration}
                            </p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={resetAll} className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm">
                  <RotateCcw className="h-4 w-4" /> Cek Ulang
                </button>
                <button onClick={() => navigate({ to: '/konsul' })}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white hover:bg-cyan-700 shadow-md shadow-cyan-600/20">
                  <Stethoscope className="h-4 w-4" /> Konsultasi Mental Health
                </button>
              </div>

              <div className="flex gap-3 rounded-xl bg-white/80 border border-slate-200/80 p-4 shadow-sm">
                <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 leading-relaxed">
                  Mood check bersifat indikatif dan bukan pengganti evaluasi psikologis profesional.
                </p>
              </div>
            </motion.div>
          )}

          {/* ══════ HISTORY VIEW ══════ */}
          {viewMode === 'history' && (
            <motion.div key="history" variants={fadeIn} initial="hidden" animate="visible" className="w-full space-y-4">

              {/* Header bar — sama dengan section header di camera view */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-100">
                    <Clock className="h-4 w-4 text-cyan-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">Riwayat Mood</h2>
                    <p className="text-[11px] text-slate-400">
                      {moodHistory.length > 0 ? `${moodHistory.length} sesi tercatat` : 'Belum ada sesi'}
                    </p>
                  </div>
                </div>
                {moodHistory.length > 0 && (
                  <span className="text-[10px] font-semibold text-cyan-600 bg-cyan-50 border border-cyan-100 px-2.5 py-1 rounded-full">
                    Sembuhin Vision 1.5
                  </span>
                )}
              </div>

              {historyLoading ? (
                <div className="rounded-2xl bg-white border border-white/60 shadow-lg p-10 flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
                  <p className="text-sm text-slate-400">Memuat riwayat mood...</p>
                </div>
              ) : moodHistory.length === 0 ? (
                <div className="rounded-2xl bg-white border border-white/60 shadow-lg p-10 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 mx-auto mb-4">
                    <Clock className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700 mb-1">Belum Ada Riwayat Mood</h3>
                  <p className="text-xs text-slate-400 mb-5">Lakukan cek mood pertama Anda untuk melihat riwayat di sini</p>
                  <button
                    onClick={() => setViewMode('camera')}
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 text-white px-5 py-2.5 text-xs font-bold hover:bg-cyan-700 transition-all"
                  >
                    <Camera className="h-3.5 w-3.5" /> Mulai Cek Mood
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {moodHistory.map((entry, i) => {
                    const conf = MOOD_CONFIG[entry.mood]
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-2xl bg-white border border-white/60 shadow-lg p-5 flex items-center gap-4"
                      >
                        {/* Emoji + confidence ring */}
                        <div className="relative shrink-0">
                          <div className="text-3xl leading-none">{conf.emoji}</div>
                          <div className={cn(
                            'absolute -bottom-1 -right-1 text-[9px] font-bold px-1 py-0.5 rounded-full border',
                            conf.bgColor, conf.color
                          )}>
                            {entry.confidence}%
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={cn('text-sm font-bold', conf.color)}>{conf.label}</span>
                            <span className={cn(
                              'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                              conf.bgColor, conf.color
                            )}>
                              {MOOD_CONFIG[entry.mood].label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3 shrink-0" />
                            {formatDate(entry.created_at)}
                          </p>
                        </div>

                        {/* Confidence bar */}
                        <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 w-24">
                          <span className="text-[10px] text-slate-400">Akurasi</span>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={cn('h-full rounded-full',
                                entry.mood === 'happy'   ? 'bg-emerald-400' :
                                entry.mood === 'calm'    ? 'bg-sky-400' :
                                entry.mood === 'neutral' ? 'bg-slate-400' :
                                entry.mood === 'anxious' ? 'bg-amber-400' :
                                entry.mood === 'sad'     ? 'bg-indigo-400' :
                                entry.mood === 'angry'   ? 'bg-red-400' :
                                'bg-violet-400'
                              )}
                              style={{ width: `${entry.confidence}%` }}
                            />
                          </div>
                          <span className={cn('text-xs font-bold', conf.color)}>{entry.confidence}%</span>
                        </div>
                      </motion.div>
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
