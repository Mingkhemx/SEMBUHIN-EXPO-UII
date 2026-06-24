import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  Brain,
  Heart,
  Clock,
  ChevronRight,
  CheckCircle2,
  Info,
  SmilePlus,
  Users,
  MessageCircle,
  Sparkles,
  Target,
  TrendingUp,
  Play,
  Wind,
  Smile,
  Frown,
  Meh,
  ArrowLeft,
  BookOpen,
  Flame,
  Video,
  Phone,
  Mic,
  MicOff,
  VideoOff,
  X,
  Circle,
  Send,
  Bot,
  ChevronLeft,
  Save,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/mental-health')({
  head: () => ({
    meta: [
      { title: 'Mental Health Care — Sembuhin' },
      { name: 'description', content: 'Screening PHQ-9 & GAD-7, CBT interaktif, dan video call AI terhubung ke psikolog.' },
    ],
  }),
  component: MentalHealthPage,
})

/* ─── Types ──────────────────────────────────────────────────────── */
type ScreeningType = 'phq9' | 'gad7' | null
type Severity = 'minimal' | 'mild' | 'moderate' | 'mod-severe' | 'severe'
type MoodRating = 1 | 2 | 3 | 4 | 5 | null
type ViewMode = 'landing' | 'screening' | 'result' | 'cbt-detail' | 'video-call'
/* ─── Questions ──────────────────────────────────────────────────── */
const PHQ9_QUESTIONS = [
  'Kurang minat atau kesenangan dalam melakukan sesuatu',
  'Merasa sedih, tertekan, atau tidak ada harapan',
  'Sulit tidur, sering terbangun, atau tidur terlalu banyak',
  'Merasa lelah atau kurang berenergi',
  'Nafsu makan berkurang atau makan berlebihan',
  'Merasa buruk tentang diri sendiri — atau merasa gagal',
  'Sulit berkonsentrasi pada sesuatu',
  'Bergerak atau berbicara sangat lambat, atau sebaliknya gelisah',
  'Pikiran bahwa lebih baik mati atau ingin menyakiti diri sendiri',
]

const GAD7_QUESTIONS = [
  'Merasa gugup, cemas, atau tegang',
  'Tidak bisa berhenti atau mengendalikan kekhawatiran',
  'Terlalu banyak khawatir tentang berbagai hal',
  'Sulit untuk rileks',
  'Gelisah hingga sulit untuk diam',
  'Mudah tersinggung atau jengkel',
  'Merasa takut seolah-olah sesuatu yang buruk akan terjadi',
]

const ANSWER_OPTIONS = [
  { value: 0, label: 'Tidak pernah', emoji: '😌', color: 'emerald' },
  { value: 1, label: 'Beberapa hari', emoji: '🙂', color: 'sky' },
  { value: 2, label: 'Lebih dari separuh waktu', emoji: '😟', color: 'amber' },
  { value: 3, label: 'Hampir setiap hari', emoji: '😰', color: 'rose' },
]

const SEVERITY_CONFIG: Record<Severity, { color: string; bgColor: string; label: string; description: string }> = {
  minimal: { color: 'text-emerald-700', bgColor: 'bg-emerald-50 border-emerald-200', label: 'Minimal', description: 'Gejala sangat ringan. Pertahankan kebiasaan sehat Anda.' },
  mild: { color: 'text-sky-700', bgColor: 'bg-sky-50 border-sky-200', label: 'Ringan', description: 'Gejala ringan. CBT dan self-care dapat membantu.' },
  moderate: { color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200', label: 'Sedang', description: 'Disarankan konsultasi dengan psikolog.' },
  'mod-severe': { color: 'text-orange-700', bgColor: 'bg-orange-50 border-orange-200', label: 'Cukup Berat', description: 'Sangat disarankan konsultasi profesional.' },
  severe: { color: 'text-red-700', bgColor: 'bg-red-50 border-red-200', label: 'Berat', description: 'Segera hubungi psikolog atau layanan darurat.' },
}

/* ─── CBT Interactive Modules ────────────────────────────────────── */
interface CBTExercise {
  id: string
  type: 'breathing' | 'journal' | 'thought-record' | 'body-scan' | 'grounding'
  title: string
  instruction: string
  steps?: string[]
}

interface CBTModule {
  id: string
  title: string
  desc: string
  sessions: number
  icon: typeof Brain
  color: string
  bgColor: string
  exercises: CBTExercise[]
}

const CBT_MODULES: CBTModule[] = [
  {
    id: 'stres',
    title: 'Mengelola Stres',
    desc: 'Teknik relaksasi dan coping strategies',
    sessions: 6,
    icon: Brain,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50 border-violet-100',
    exercises: [
      {
        id: 'breathing-478',
        type: 'breathing',
        title: 'Pernapasan 4-7-8',
        instruction: 'Tarik napas 4 detik, tahan 7 detik, hembuskan 8 detik. Ulangi 4 kali.',
        steps: ['Duduk nyaman, tutup mata', 'Tarik napas melalui hidung — hitung sampai 4', 'Tahan napas — hitung sampai 7', 'Hembuskan perlahan melalui mulut — hitung sampai 8', 'Ulangi siklus ini 4 kali'],
      },
      {
        id: 'journal-stres',
        type: 'journal',
        title: 'Jurnal Stres',
        instruction: 'Tuliskan 3 hal yang membuat Anda stres hari ini dan 1 hal yang Anda syukuri.',
      },
      {
        id: 'pmr',
        type: 'body-scan',
        title: 'Progressive Muscle Relaxation',
        instruction: 'Tegangkan dan rilekskan setiap kelompok otot secara bergantian.',
        steps: ['Tangan & lengan — tegangkan 5 detik, rileks 10 detik', 'Bahu & leher — angkat ke telinga 5 detik, lepas', 'Wajah — kerutkan semua otot 5 detik, rileks', 'Perut — kencangkan 5 detik, lepas', 'Kaki & jari kaki — tegangkan 5 detik, rileks'],
      },
    ],
  },
  {
    id: 'cemas',
    title: 'Mengatasi Kecemasan',
    desc: 'CBT exercises untuk mengurangi anxiety',
    sessions: 8,
    icon: Heart,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50 border-rose-100',
    exercises: [
      {
        id: 'grounding-54321',
        type: 'grounding',
        title: 'Grounding 5-4-3-2-1',
        instruction: 'Gunakan panca indera untuk kembali ke saat ini.',
        steps: ['Sebutkan 5 benda yang bisa Anda LIHAT', 'Sebutkan 4 benda yang bisa Anda SENTUH', 'Sebutkan 3 suara yang bisa Anda DENGAR', 'Sebutkan 2 bau yang bisa Anda CIUM', 'Sebutkan 1 rasa yang bisa Anda RASAKAN'],
      },
      {
        id: 'thought-record',
        type: 'thought-record',
        title: 'Thought Record',
        instruction: 'Catat pikiran cemas Anda, tantang, dan ganti dengan pikiran yang lebih seimbang.',
      },
      {
        id: 'worry-time',
        type: 'journal',
        title: 'Worry Time Box',
        instruction: 'Tuliskan semua kekhawatiran Anda. Simpan dalam "kotak" — Anda hanya boleh mengkhawatirkannya selama 15 menit besok.',
      },
    ],
  },
  {
    id: 'tidur',
    title: 'Tidur Lebih Nyenyak',
    desc: 'Sleep hygiene dan CBT-I techniques',
    sessions: 5,
    icon: Clock,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 border-indigo-100',
    exercises: [
      {
        id: 'wind-down',
        type: 'breathing',
        title: 'Wind Down Breathing',
        instruction: 'Pernapasan lambat untuk mempersiapkan tubuh tidur.',
        steps: ['Berbaring nyaman, lampu redup', 'Tarik napas 4 detik', 'Hembuskan 6 detik (lebih panjang)', 'Fokus pada sensasi napas di perut', 'Lakukan 5 menit sebelum tidur'],
      },
      {
        id: 'sleep-journal',
        type: 'journal',
        title: 'Sleep Diary',
        instruction: 'Catat waktu tidur, bangun, kualitas tidur (1-5), dan aktivitas sebelum tidur.',
      },
      {
        id: 'stimulus-control',
        type: 'thought-record',
        title: 'Stimulus Control',
        instruction: 'Tempat tidur hanya untuk tidur. Jika tidak bisa tidur 20 menit, pindah ke ruangan lain.',
      },
    ],
  },
  {
    id: 'resiliensi',
    title: 'Membangun Resiliensi',
    desc: 'Emotional regulation & mental toughness',
    sessions: 7,
    icon: Target,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 border-emerald-100',
    exercises: [
      {
        id: 'self-compassion',
        type: 'thought-record',
        title: 'Self-Compassion Break',
        instruction: 'Saat menghadapi kesulitan, katakan pada diri sendiri: "Ini berat. Semua orang mengalami kesulitan. Saya boleh baik pada diri sendiri."',
      },
      {
        id: 'gratitude',
        type: 'journal',
        title: 'Gratitude Journal',
        instruction: 'Tuliskan 3 hal yang Anda syukuri hari ini dan mengapa.',
      },
      {
        id: 'emotion-naming',
        type: 'body-scan',
        title: 'Name Your Emotion',
        instruction: 'Scan tubuh Anda. Di mana Anda merasakan emosi? Beri nama emosi tersebut tanpa menghakimi.',
        steps: ['Duduk tenang, pejamkan mata', 'Scan tubuh dari kepala ke kaki', 'Di mana Anda merasakan sensasi?', 'Beri nama: cemas, sedih, marah, lelah...', 'Katakan: "Saya merasa [emosi]. Itu valid."'],
      },
    ],
  },
]

/* ─── Video Call AI Script ───────────────────────────────────────── */
interface VCMessage {
  role: 'ai' | 'user'
  text: string
}

const VC_AI_SCRIPT: VCMessage[] = [
  { role: 'ai', text: 'Halo, saya Dr. Aura. Terima kasih sudah meluangkan waktu hari ini. Bagaimana perasaan Anda sekarang?' },
  { role: 'ai', text: 'Saya mengerti. Tidak apa-apa merasa seperti itu. Mari kita mulai dengan latihan pernapasan sederhana.' },
  { role: 'ai', text: 'Tarik napas perlahan melalui hidung... 1... 2... 3... 4...' },
  { role: 'ai', text: 'Tahan... 1... 2... 3... 4... 5... 6... 7...' },
  { role: 'ai', text: 'Hembuskan perlahan melalui mulut... 1... 2... 3... 4... 5... 6... 7... 8...' },
  { role: 'ai', text: 'Bagus. Ulangi sekali lagi. Kali ini lebih lambat dan lebih dalam.' },
  { role: 'ai', text: 'Sekarang, ceritakan satu hal yang membuat Anda merasa tenang atau bahagia.' },
  { role: 'ai', text: 'Itu indah. Simpan perasaan itu. Anda bisa mengunjunginya kapan saja.' },
  { role: 'ai', text: 'Untuk minggu ini, saya sarankan: 1) Latihan napas 5 menit setiap pagi, 2) Tuliskan 3 hal yang disyukuri sebelum tidur, 3) Jalan kaki 15 menit setiap hari.' },
  { role: 'ai', text: 'Anda sudah melakukan hal yang hebat hari ini. Jaga diri Anda baik-baik. Sampai jumpa di sesi berikutnya. 💙' },
]

/* ─── Helpers ────────────────────────────────────────────────────── */
function getPHQ9Severity(score: number): Severity {
  if (score <= 4) return 'minimal'
  if (score <= 9) return 'mild'
  if (score <= 14) return 'moderate'
  if (score <= 19) return 'mod-severe'
  return 'severe'
}
function getGAD7Severity(score: number): Severity {
  if (score <= 4) return 'minimal'
  if (score <= 9) return 'mild'
  if (score <= 14) return 'moderate'
  return 'severe'
}

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

/* ─── Component ──────────────────────────────────────────────────── */
function MentalHealthPage() {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>('landing')
  const [activeScreening, setActiveScreening] = useState<ScreeningType>(null)
  const [phq9Answers, setPhq9Answers] = useState<Record<number, number>>({})
  const [gad7Answers, setGad7Answers] = useState<Record<number, number>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [savingScreening, setSavingScreening] = useState(false)
  const [savedScreening, setSavedScreening] = useState(false)
  const [activeCBT, setActiveCBT] = useState<CBTModule | null>(null)
  const [activeExercise, setActiveExercise] = useState<CBTExercise | null>(null)
  const [exerciseStep, setExerciseStep] = useState(0)
  const [journalText, setJournalText] = useState('')
  const [breathCount, setBreathCount] = useState(0)
  const [breathTarget, setBreathTarget] = useState(4)
  const [breathing, setBreathing] = useState<'in' | 'hold' | 'out' | null>(null)
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({})
  const breathInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  // Video Call state
  const [vcMessages, setVcMessages] = useState<VCMessage[]>([])
  const [vcScriptIndex, setVcScriptIndex] = useState(0)
  const [vcUserInput, setVcUserInput] = useState('')
  const [vcTyping, setVcTyping] = useState(false)
  const [vcMicOn, setVcMicOn] = useState(false)
  const [vcCamOn, setVcCamOn] = useState(true)
  const [vcStarted, setVcStarted] = useState(false)
  const vcEndRef = useRef<HTMLDivElement>(null)

  // Screening computed
  const questions = activeScreening === 'phq9' ? PHQ9_QUESTIONS : GAD7_QUESTIONS
  const answers = activeScreening === 'phq9' ? phq9Answers : gad7Answers
  const setAnswers = activeScreening === 'phq9' ? setPhq9Answers : setGad7Answers
  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0)
  const maxScore = questions.length * 3
  const severity = activeScreening === 'phq9' ? getPHQ9Severity(totalScore) : getGAD7Severity(totalScore)
  const allAnswered = Object.keys(answers).length === questions.length

  // Actions
  const startScreening = (type: ScreeningType) => {
    setActiveScreening(type)
    setPhq9Answers({})
    setGad7Answers({})
    setCurrentQuestion(0)
    setSavedScreening(false)
    setViewMode('screening')
  }

  const goToLanding = () => {
    setViewMode('landing')
    setActiveScreening(null)
    setActiveCBT(null)
    setActiveExercise(null)
    setPhq9Answers({})
    setGad7Answers({})
    setCurrentQuestion(0)
    setSavedScreening(false)
    setJournalText('')
    setExerciseStep(0)
    setBreathCount(0)
    setBreathing(null)
    setBreathTarget(4)
    setVcMessages([])
    setVcScriptIndex(0)
    setVcStarted(false)
  }

  // Save screening result to Supabase
  const saveScreeningResult = async () => {
    if (!user || savedScreening) return
    setSavingScreening(true)
    try {
      const { error } = await supabase
        .from('mental_health_screenings')
        .insert({
          user_id: user.id,
          screening_type: activeScreening,
          answers: answers,
          total_score: totalScore,
          severity: severity,
        })
      
      if (error) {
        throw error
      }
      
      setSavedScreening(true)
    } catch (err: any) {
      console.error('Gagal simpan screening:', err)
      alert(`Gagal menyimpan: ${err?.message || 'Pastikan tabel mental_health_screenings sudah dibuat di Supabase.'}`)
    } finally {
      setSavingScreening(false)
    }
  }

  // Auto-save when reaching the result view
  useEffect(() => {
    if (viewMode === 'result' && user && !savedScreening && !savingScreening) {
      saveScreeningResult();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, user]);

  // Breathing exercise timer
  const startBreathing = () => {
    setBreathCount(0)
    setExerciseStep(1)
    runBreathCycle()
  }

  const runBreathCycle = () => {
    setBreathing('in')
    breathInterval.current = setInterval(() => {
      setBreathing((prev) => {
        if (prev === 'in') return 'hold'
        if (prev === 'hold') return 'out'
        if (prev === 'out') {
          setBreathCount((c) => {
            const next = c + 1
            if (next >= breathTarget) {
              if (breathInterval.current) clearInterval(breathInterval.current)
              setBreathing(null)
              setExerciseStep(2)
              return next
            }
            return next
          })
          return 'in'
        }
        return prev
      })
    }, 1000)
  }

  useEffect(() => {
    return () => { if (breathInterval.current) clearInterval(breathInterval.current) }
  }, [])

  // Video Call logic
  const startVideoCall = () => {
    setViewMode('video-call')
    setVcMessages([])
    setVcScriptIndex(0)
    setVcStarted(false)
  }

  const beginVCSession = () => {
    setVcStarted(true)
    sendNextAIMessage(0)
  }

  const sendNextAIMessage = (index: number) => {
    if (index >= VC_AI_SCRIPT.length) return
    setVcTyping(true)
    setTimeout(() => {
      setVcTyping(false)
      const msg = VC_AI_SCRIPT[index]
      if (msg.role === 'ai') {
        setVcMessages((prev) => [...prev, msg])
        setVcScriptIndex(index + 1)
      }
    }, 1500 + Math.random() * 1000)
  }

  const sendVCUserMessage = () => {
    if (!vcUserInput.trim()) return
    const userMsg: VCMessage = { role: 'user', text: vcUserInput.trim() }
    setVcMessages((prev) => [...prev, userMsg])
    setVcUserInput('')
    // Send next AI message
    setTimeout(() => sendNextAIMessage(vcScriptIndex), 800)
  }

  useEffect(() => {
    vcEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [vcMessages, vcTyping])

  return (
    <div className="relative z-10 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-6">

        {/* ── Hero Card ─────────────────────────────────────── */}
        <motion.div
          variants={fadeIn} initial="hidden" animate="visible"
          className="rounded-3xl shadow-2xl shadow-violet-500/25 overflow-hidden relative min-h-[360px]"
        >
          {/* Background image */}
          <img
            src="/images/konsultasi.jpg"
            alt="Mental Health"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Gradient overlay — gelap di kiri agar teks terbaca */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-900/85 via-purple-800/60 to-indigo-700/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          <div className="relative z-10 p-8 sm:p-12 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-4 py-1.5 mb-5 backdrop-blur-sm">
              <SmilePlus className="h-3.5 w-3.5 text-violet-200" />
              <span className="text-xs font-semibold text-white/90 tracking-wide uppercase">Mental Health Care</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
              Jaga Kesehatan<br className="hidden sm:block" /> Mental Anda
            </h1>
            <p className="mt-3 text-base sm:text-lg text-violet-100 leading-relaxed max-w-lg">
              Screening klinis, sesi CBT interaktif, dan konsultasi video call dengan AI therapist.
            </p>

            {/* Quick stats */}
            <div className="flex items-center gap-8 mt-6">
              {[['4', 'Modul CBT'], ['2', 'Screening'], ['24/7', 'Tersedia']].map(([v, l]) => (
                <div key={l}>
                  <div className="text-2xl font-bold text-white">{v}</div>
                  <div className="text-[10px] text-violet-200 uppercase tracking-widest">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════ LANDING ═══════════════════ */}
        {viewMode === 'landing' && (
          <motion.div key="landing" variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="space-y-5">

            {/* 1. Screening */}
            <div className="rounded-3xl bg-white/80 backdrop-blur-md border border-white/60 shadow-xl shadow-slate-200/60 p-6">
              <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-violet-400" />
                Screening Kesehatan Mental
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <button onClick={() => startScreening('phq9')} className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 text-left hover:shadow-md hover:border-violet-200 transition-all group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 border border-violet-100">
                      <Brain className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">Screening Depresi</h3>
                      <p className="text-xs text-violet-600 font-medium">PHQ-9 • 9 pertanyaan</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">Deteksi gejala depresi dalam 2 minggu terakhir.</p>
                  <div className="flex items-center gap-2 text-sm font-semibold text-violet-600 group-hover:text-violet-700">Mulai <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></div>
                </button>
                <button onClick={() => startScreening('gad7')} className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 text-left hover:shadow-md hover:border-violet-200 transition-all group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 border border-violet-100">
                      <Heart className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">Screening Kecemasan</h3>
                      <p className="text-xs text-violet-600 font-medium">GAD-7 • 7 pertanyaan</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">Deteksi gejala gangguan kecemasan umum.</p>
                  <div className="flex items-center gap-2 text-sm font-semibold text-violet-600 group-hover:text-violet-700">Mulai <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></div>
                </button>
              </div>
            </div>

            {/* 2. CBT Interactive */}
            <div className="rounded-3xl bg-white/80 backdrop-blur-md border border-white/60 shadow-xl shadow-slate-200/60 p-6">
              <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-400" />
                Sesi CBT Interaktif
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {CBT_MODULES.map((mod) => {
                  const Icon = mod.icon
                  return (
                    <button key={mod.id} onClick={() => { setActiveCBT(mod); setViewMode('cbt-detail') }} className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5 hover:shadow-md hover:border-violet-200 transition-all text-left group">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg border', mod.bgColor)}>
                          <Icon className={cn('h-4 w-4', mod.color)} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">{mod.title}</h3>
                          <p className="text-[11px] text-slate-400">{mod.exercises.length} latihan interaktif</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-3">{mod.desc}</p>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 group-hover:text-violet-700">Mulai Sesi <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 3. Video Call AI */}
            <div className="rounded-3xl bg-white/80 backdrop-blur-md border border-white/60 shadow-xl shadow-slate-200/60 p-2">
              <button onClick={startVideoCall} className="w-full rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 text-white p-6 sm:p-8 shadow-lg shadow-violet-600/20 hover:shadow-xl transition-all text-left group">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 border border-white/20 group-hover:scale-105 transition-transform">
                    <Video className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">Video Call dengan AI Therapist</h3>
                    <p className="text-sm text-violet-100 mt-1 leading-relaxed">
                      Tatap muka virtual dengan Dr. Aura — AI therapist yang memandu Anda melalui sesi konseling, latihan pernapasan, dan memberikan rekomendasi personal.
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2 text-sm font-bold text-white bg-white/15 rounded-xl px-4 py-2.5 group-hover:bg-white/25 transition-colors">
                    <Play className="h-4 w-4" /> Mulai Sesi
                  </div>
                </div>
              </button>
            </div>

            {/* Psychologist CTA */}
            <div className="rounded-3xl bg-white/80 backdrop-blur-md border border-white/60 shadow-xl shadow-slate-200/60 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 border border-violet-100">
                <Users className="h-5 w-5 text-violet-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-800">Butuh Bantuan Profesional?</h3>
                <p className="text-xs text-slate-500 mt-0.5">Konsultasi langsung dengan psikolog berlisensi. Aman dan rahasia.</p>
              </div>
              <button className="shrink-0 rounded-xl bg-violet-600 text-white px-5 py-2.5 text-sm font-bold hover:bg-violet-700 transition-colors shadow-sm">
                Cari Psikolog
              </button>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════ SCREENING ═══════════════════ */}
        {viewMode === 'screening' && (
          <motion.div key="screening" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header card */}
            <div className="rounded-3xl bg-white/80 backdrop-blur-md border border-white/60 shadow-xl shadow-slate-200/60 p-6 mb-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl',
                    activeScreening === 'phq9' ? 'bg-violet-50 border border-violet-100' : 'bg-rose-50 border border-rose-100'
                  )}>
                    {activeScreening === 'phq9'
                      ? <Brain className="h-5 w-5 text-violet-600" />
                      : <Heart className="h-5 w-5 text-rose-500" />}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">
                      {activeScreening === 'phq9' ? 'PHQ-9: Screening Depresi' : 'GAD-7: Screening Kecemasan'}
                    </h2>
                    <p className="text-xs text-slate-500">Dalam 2 minggu terakhir</p>
                  </div>
                </div>
                <button onClick={goToLanding} className="text-xs font-medium text-slate-400 hover:text-rose-500 transition-colors">
                  Batal
                </button>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Pertanyaan <span className="font-bold text-violet-600">{currentQuestion + 1}</span> dari {questions.length}</span>
                  <span className="text-xs font-bold text-slate-600">{Math.round(((currentQuestion) / questions.length) * 100)}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <motion.div
                    animate={{ width: `${(currentQuestion / questions.length) * 100}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className={cn('h-full rounded-full', activeScreening === 'phq9' ? 'bg-gradient-to-r from-violet-500 to-purple-500' : 'bg-gradient-to-r from-rose-400 to-pink-500')}
                  />
                </div>
                {/* Step dots */}
                <div className="flex gap-1 pt-1">
                  {questions.map((_, i) => (
                    <div key={i} className={cn(
                      'h-1.5 flex-1 rounded-full transition-all duration-300',
                      i < currentQuestion ? (activeScreening === 'phq9' ? 'bg-violet-500' : 'bg-rose-400') :
                      i === currentQuestion ? (activeScreening === 'phq9' ? 'bg-violet-300' : 'bg-rose-300') :
                      'bg-slate-100'
                    )} />
                  ))}
                </div>
              </div>
            </div>

            {/* Question card — animasi slide */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="rounded-3xl bg-white/90 backdrop-blur-md border border-white/60 shadow-xl shadow-slate-200/60 overflow-hidden"
              >
                {/* Question header */}
                <div className={cn(
                  'px-8 pt-8 pb-6',
                  activeScreening === 'phq9'
                    ? 'bg-gradient-to-br from-violet-50 to-purple-50'
                    : 'bg-gradient-to-br from-rose-50 to-pink-50'
                )}>
                  <div className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide mb-4',
                    activeScreening === 'phq9' ? 'bg-violet-100 text-violet-600' : 'bg-rose-100 text-rose-600'
                  )}>
                    {activeScreening === 'phq9' ? <Brain className="h-3 w-3" /> : <Heart className="h-3 w-3" />}
                    Pertanyaan {currentQuestion + 1}
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-800 leading-snug">
                    {questions[currentQuestion]}
                  </p>
                </div>

                {/* Answer options */}
                <div className="p-6 space-y-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                    Seberapa sering Anda mengalami ini?
                  </p>
                  {ANSWER_OPTIONS.map((opt) => {
                    const selected = answers[currentQuestion] === opt.value
                    const colorMap = {
                      emerald: { selected: 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-emerald-100', hover: 'hover:border-emerald-300 hover:bg-emerald-50/50', dot: 'bg-emerald-500' },
                      sky: { selected: 'bg-sky-50 border-sky-400 text-sky-800 shadow-sky-100', hover: 'hover:border-sky-300 hover:bg-sky-50/50', dot: 'bg-sky-500' },
                      amber: { selected: 'bg-amber-50 border-amber-400 text-amber-800 shadow-amber-100', hover: 'hover:border-amber-300 hover:bg-amber-50/50', dot: 'bg-amber-500' },
                      rose: { selected: 'bg-rose-50 border-rose-400 text-rose-800 shadow-rose-100', hover: 'hover:border-rose-300 hover:bg-rose-50/50', dot: 'bg-rose-500' },
                    }
                    const c = colorMap[opt.color as keyof typeof colorMap]
                    return (
                      <motion.button
                        key={opt.value}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setAnswers((prev) => ({ ...prev, [currentQuestion]: opt.value }))
                          // Auto-advance setelah 350ms
                          setTimeout(() => {
                            if (currentQuestion < questions.length - 1) {
                              setCurrentQuestion((q) => q + 1)
                            } else {
                              setViewMode('result')
                            }
                          }, 350)
                        }}
                        className={cn(
                          'w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-200 shadow-sm',
                          selected
                            ? `${c.selected} shadow-md`
                            : `bg-white border-slate-200 text-slate-700 ${c.hover}`
                        )}
                      >
                        <span className="text-2xl flex-shrink-0">{opt.emoji}</span>
                        <div className="flex-1">
                          <span className="text-sm font-semibold">{opt.label}</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            {[0, 1, 2, 3].map((dot) => (
                              <div key={dot} className={cn(
                                'h-1.5 w-5 rounded-full transition-all',
                                dot <= opt.value ? c.dot : 'bg-slate-200'
                              )} />
                            ))}
                          </div>
                        </div>
                        <div className={cn(
                          'h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                          selected ? `border-current ${c.dot}` : 'border-slate-300'
                        )}>
                          {selected && <CheckCircle2 className="h-4 w-4 text-white" />}
                        </div>
                      </motion.button>
                    )
                  })}
                </div>

                {/* Navigation */}
                <div className="px-6 pb-6 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setCurrentQuestion((q) => Math.max(0, q - 1))}
                    disabled={currentQuestion === 0}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="h-4 w-4" /> Sebelumnya
                  </button>

                  {answers[currentQuestion] !== undefined && currentQuestion < questions.length - 1 && (
                    <button
                      onClick={() => setCurrentQuestion((q) => q + 1)}
                      className={cn(
                        'flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all shadow-md',
                        activeScreening === 'phq9'
                          ? 'bg-violet-600 hover:bg-violet-700 shadow-violet-200'
                          : 'bg-rose-500 hover:bg-rose-600 shadow-rose-200'
                      )}
                    >
                      Berikutnya <ChevronRight className="h-4 w-4" />
                    </button>
                  )}

                  {answers[currentQuestion] !== undefined && currentQuestion === questions.length - 1 && (
                    <button
                      onClick={() => setViewMode('result')}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all shadow-md shadow-emerald-200"
                    >
                      <Sparkles className="h-4 w-4" /> Lihat Hasil
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {/* ═══════════════════ RESULT ═══════════════════ */}
        {viewMode === 'result' && (
          <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className={cn('rounded-2xl border overflow-hidden shadow-lg', SEVERITY_CONFIG[severity].bgColor)}>
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-5xl font-bold">{totalScore}</p>
                    <p className="text-xs opacity-70 mt-0.5">dari {maxScore}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-bold">{SEVERITY_CONFIG[severity].label}</p>
                    <p className="text-sm opacity-80 mt-1">{SEVERITY_CONFIG[severity].description}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 p-6">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">Skala Keparahan</p>
              <div className="space-y-2">
                {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => {
                  const ranges = activeScreening === 'phq9' ? { minimal: '0–4', mild: '5–9', moderate: '10–14', 'mod-severe': '15–19', severe: '20–27' } : { minimal: '0–4', mild: '5–9', moderate: '10–14', 'mod-severe': '15+', severe: '' }
                  const range = ranges[key as Severity]
                  if (!range) return null
                  return (
                    <div key={key} className={cn('flex items-center justify-between rounded-xl px-4 py-2.5 border', key === severity ? cfg.bgColor : 'bg-slate-50 border-slate-100')}>
                      <span className={cn('text-xs font-bold', key === severity ? cfg.color : 'text-slate-600')}>{cfg.label}</span>
                      <span className={cn('text-xs font-mono', key === severity ? cfg.color : 'text-slate-400')}>Skor {range}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 p-6">
              <p className="text-sm font-semibold text-slate-800 mb-4">Rekomendasi untuk Anda</p>
              <div className="space-y-3">
                <button onClick={() => { setActiveCBT(CBT_MODULES[0]); setViewMode('cbt-detail') }} className="flex items-start gap-3 p-3 rounded-xl bg-violet-50 border border-violet-200 text-left hover:bg-violet-100 transition-colors w-full group">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600"><Sparkles className="h-4 w-4" /></div>
                  <div className="flex-1"><p className="text-sm font-semibold text-violet-700">Coba Sesi CBT Interaktif</p><p className="text-xs text-violet-600/80">Latihan pernapasan, journaling, dan grounding</p></div>
                  <ChevronRight className="h-4 w-4 text-violet-400 mt-1" />
                </button>
                <button onClick={startVideoCall} className="flex items-start gap-3 p-3 rounded-xl bg-sky-50 border border-sky-200 text-left hover:bg-sky-100 transition-colors w-full group">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-600"><Video className="h-4 w-4" /></div>
                  <div className="flex-1"><p className="text-sm font-semibold text-sky-700">Video Call dengan AI Therapist</p><p className="text-xs text-sky-600/80">Sesi konseling virtual dipandu Dr. Aura</p></div>
                  <ChevronRight className="h-4 w-4 text-sky-400 mt-1" />
                </button>
                {(severity === 'moderate' || severity === 'mod-severe' || severity === 'severe') && (
                  <Recommendation icon={Users} text="Konsultasi dengan psikolog profesional sangat disarankan" />
                )}
              </div>
            </div>
            {/* Save to profile status */}
            <div className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 p-5">
              {savedScreening ? (
                <div className="flex items-center gap-3 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-semibold">Hasil screening telah otomatis disimpan ke profil Anda.</p>
                </div>
              ) : savingScreening ? (
                <div className="flex items-center gap-3 text-violet-600">
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
                  <p className="text-sm font-semibold">Menyimpan hasil ke profil secara otomatis...</p>
                </div>
              ) : !user ? (
                <div className="flex items-center gap-3 text-rose-500">
                  <Info className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-semibold">Anda belum login, hasil tidak disimpan ke profil.</p>
                </div>
              ) : null}
            </div>
            <div className="flex gap-3">
              <button onClick={goToLanding} className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm">Kembali ke Menu</button>
              {(severity === 'moderate' || severity === 'mod-severe' || severity === 'severe') && (
                <button className="flex-1 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 shadow-md shadow-violet-600/20"><Users className="h-4 w-4 inline mr-2" />Hubungi Psikolog</button>
              )}
            </div>
            <div className="flex gap-3 rounded-xl bg-white/80 border border-slate-200/80 p-4 shadow-sm">
              <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500">Screening ini bersifat informatif dan bukan pengganti diagnosis klinis. Jika darurat, hubungi 119.</p>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════ CBT DETAIL ═══════════════════ */}
        {viewMode === 'cbt-detail' && activeCBT && (
          <motion.div key="cbt" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {!activeExercise ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl border', activeCBT.bgColor)}>
                      <activeCBT.icon className={cn('h-6 w-6', activeCBT.color)} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">{activeCBT.title}</h2>
                      <p className="text-sm text-slate-500">{activeCBT.exercises.length} latihan interaktif</p>
                    </div>
                  </div>
                  <button onClick={() => { setActiveCBT(null); setViewMode('landing') }} className="text-xs font-medium text-slate-400 hover:text-slate-600">Kembali</button>
                </div>
                <div className="space-y-3">
                  {activeCBT.exercises.map((ex, i) => {
                    const isCompleted = completedExercises[ex.id]
                    return (
                    <button key={ex.id} onClick={() => { setActiveExercise(ex); setExerciseStep(0); setJournalText(''); setBreathCount(0); setBreathing(null) }} className="w-full rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 p-5 hover:shadow-xl hover:border-violet-200 transition-all text-left group">
                      <div className="flex items-start gap-4">
                        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold', isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700')}>
                          {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className={cn('text-sm font-bold', isCompleted ? 'text-slate-800' : 'text-slate-800 group-hover:text-violet-700')}>{ex.title}</h3>
                          <p className="text-xs text-slate-500 mt-1">{ex.instruction}</p>
                        </div>
                        {isCompleted ? (
                          <div className="mt-1 flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-wider">
                            Selesai
                          </div>
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-300 mt-1 group-hover:text-violet-500" />
                        )}
                      </div>
                    </button>
                  )})}
                </div>
              </>
            ) : (
              /* Active Exercise */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-800">{activeExercise.title}</h2>
                  <button onClick={() => { setActiveExercise(null); setExerciseStep(0); setBreathing(null) }} className="text-xs font-medium text-slate-400 hover:text-slate-600">Kembali</button>
                </div>
                <p className="text-sm text-slate-500">{activeExercise.instruction}</p>

                {/* Breathing Exercise */}
                {activeExercise.type === 'breathing' && (
                  <div className="rounded-2xl bg-white border border-white/60 shadow-lg p-8 text-center">
                    {exerciseStep === 0 && (
                      <div className="space-y-6">
                        <div>
                          <p className="text-sm font-medium text-slate-600 mb-4">Berapa kali siklus napas?</p>
                          <div className="flex items-center justify-center gap-2">
                            {[3, 4, 5, 6, 7, 8].map((n) => (
                              <button
                                key={n}
                                onClick={() => setBreathTarget(n)}
                                className={cn(
                                  'flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold border transition-all',
                                  breathTarget === n
                                    ? 'bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-600/20'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-violet-300 hover:bg-violet-50'
                                )}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                          <p className="text-xs text-slate-400 mt-3">{breathTarget} siklus × ~19 detik = ±{Math.round(breathTarget * 19 / 60)} menit</p>
                        </div>
                        <button onClick={startBreathing} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 text-white px-8 py-4 text-base font-bold hover:bg-violet-700 shadow-lg shadow-violet-600/20">
                          <Play className="h-5 w-5" /> Mulai Pernapasan
                        </button>
                      </div>
                    )}
                    {breathing && (
                      <div className="space-y-6">
                        <motion.div
                          animate={{ scale: breathing === 'in' ? 1.5 : breathing === 'hold' ? 1.5 : 1 }}
                          transition={{ duration: breathing === 'in' ? 4 : breathing === 'hold' ? 7 : 8 }}
                          className="mx-auto w-32 h-32 rounded-full bg-violet-200/50 border-4 border-violet-400 flex items-center justify-center"
                        >
                          <span className="text-lg font-bold text-violet-700">
                            {breathing === 'in' ? 'Tarik...' : breathing === 'hold' ? 'Tahan...' : 'Hembus...'}
                          </span>
                        </motion.div>
                        {/* Progress dots */}
                        <div className="flex items-center justify-center gap-2">
                          {Array.from({ length: breathTarget }).map((_, i) => (
                            <div
                              key={i}
                              className={cn(
                                'h-3 w-3 rounded-full transition-all duration-300',
                                i < breathCount ? 'bg-violet-500 scale-100' : i === breathCount ? 'bg-violet-300 scale-110 animate-pulse' : 'bg-slate-200'
                              )}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-slate-500">Siklus {breathCount + 1} dari {breathTarget}</p>
                      </div>
                    )}
                    {exerciseStep === 2 && (
                      <div className="space-y-4">
                        <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
                        <p className="text-lg font-bold text-slate-800">{breathTarget} Siklus Selesai!</p>
                        <p className="text-sm text-slate-500">Bagaimana perasaan Anda sekarang?</p>
                        <button onClick={() => { if (activeExercise) setCompletedExercises(prev => ({...prev, [activeExercise.id]: true})); setActiveExercise(null); setExerciseStep(0); setBreathing(null) }} className="rounded-xl bg-violet-600 text-white px-6 py-3 text-sm font-bold hover:bg-violet-700">Selesai</button>
                      </div>
                    )}
                  </div>
                )}

                {/* Steps-based Exercise */}
                {activeExercise.steps && activeExercise.type !== 'breathing' && (
                  <div className="rounded-2xl bg-white border border-white/60 shadow-lg p-6">
                    <div className="space-y-3">
                      {activeExercise.steps.map((step, i) => (
                        <div key={i} className={cn('flex items-start gap-3 p-3 rounded-xl border transition-all', exerciseStep >= i ? 'bg-violet-50 border-violet-200' : 'bg-slate-50 border-slate-100')}>
                          <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold', exerciseStep >= i ? 'bg-violet-500 text-white' : 'bg-slate-200 text-slate-500')}>
                            {exerciseStep > i ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                          </div>
                          <p className={cn('text-sm', exerciseStep >= i ? 'text-slate-800 font-medium' : 'text-slate-400')}>{step}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex gap-3">
                      {exerciseStep > 0 && (
                        <button onClick={() => setExerciseStep((s) => s - 1)} className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Sebelumnya</button>
                      )}
                      {exerciseStep < (activeExercise.steps?.length || 0) - 1 ? (
                        <button onClick={() => setExerciseStep((s) => s + 1)} className="flex-1 rounded-xl bg-violet-600 text-white px-5 py-3 text-sm font-bold hover:bg-violet-700">Selanjutnya</button>
                      ) : (
                        <button onClick={() => { if (activeExercise) setCompletedExercises(prev => ({...prev, [activeExercise.id]: true})); setActiveExercise(null); setExerciseStep(0) }} className="flex-1 rounded-xl bg-emerald-600 text-white px-5 py-3 text-sm font-bold hover:bg-emerald-700">
                          <CheckCircle2 className="h-4 w-4 inline mr-1" /> Selesai
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Journal Exercise */}
                {activeExercise.type === 'journal' && (
                  <div className="rounded-2xl bg-white border border-white/60 shadow-lg p-6">
                    <textarea value={journalText} onChange={(e) => setJournalText(e.target.value)} placeholder="Tulis di sini..." rows={6} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 resize-none" />
                    <div className="mt-4 flex gap-3">
                      <button onClick={() => { if (activeExercise) setCompletedExercises(prev => ({...prev, [activeExercise.id]: true})); setActiveExercise(null); setJournalText('') }} className="flex-1 rounded-xl bg-violet-600 text-white px-5 py-3 text-sm font-bold hover:bg-violet-700">
                        <CheckCircle2 className="h-4 w-4 inline mr-1" /> Simpan & Selesai
                      </button>
                    </div>
                  </div>
                )}

                {/* Thought Record */}
                {activeExercise.type === 'thought-record' && !activeExercise.steps && (
                  <div className="rounded-2xl bg-white border border-white/60 shadow-lg p-6">
                    <p className="text-sm text-slate-700 leading-relaxed mb-4 whitespace-pre-line">{activeExercise.instruction}</p>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">Pikiran negatif/cemas:</label>
                        <textarea rows={2} placeholder="Apa yang saya pikirkan..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">Tantangan pikiran tersebut:</label>
                        <textarea rows={2} placeholder="Apakah pikiran ini realistis? Apa bukti sebaliknya?" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">Pikiran yang lebih seimbang:</label>
                        <textarea rows={2} placeholder="Pikiran yang lebih adil dan rasional..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none" />
                      </div>
                    </div>
                    <button onClick={() => { if (activeExercise) setCompletedExercises(prev => ({...prev, [activeExercise.id]: true})); setActiveExercise(null) }} className="mt-4 w-full rounded-xl bg-violet-600 text-white px-5 py-3 text-sm font-bold hover:bg-violet-700">
                      <CheckCircle2 className="h-4 w-4 inline mr-1" /> Simpan & Selesai
                    </button>
                  </div>
                )}

                {/* Grounding */}
                {activeExercise.type === 'grounding' && activeExercise.steps && (
                  <div className="rounded-2xl bg-white border border-white/60 shadow-lg p-6">
                    <div className="space-y-3">
                      {activeExercise.steps.map((step, i) => (
                        <button key={i} onClick={() => setExerciseStep(i + 1)} className={cn('w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all', exerciseStep > i ? 'bg-emerald-50 border-emerald-200' : exerciseStep === i ? 'bg-violet-50 border-violet-300' : 'bg-slate-50 border-slate-100')}>
                          <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold', exerciseStep > i ? 'bg-emerald-500 text-white' : exerciseStep === i ? 'bg-violet-500 text-white' : 'bg-slate-200 text-slate-500')}>
                            {exerciseStep > i ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                          </div>
                          <p className={cn('text-sm', exerciseStep >= i ? 'text-slate-800 font-medium' : 'text-slate-400')}>{step}</p>
                        </button>
                      ))}
                    </div>
                    {exerciseStep >= (activeExercise.steps?.length || 0) && (
                      <div className="mt-6 text-center space-y-3">
                        <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
                        <p className="font-bold text-slate-800">Grounding selesai!</p>
                        <button onClick={() => { if (activeExercise) setCompletedExercises(prev => ({...prev, [activeExercise.id]: true})); setActiveExercise(null); setExerciseStep(0) }} className="rounded-xl bg-violet-600 text-white px-6 py-3 text-sm font-bold hover:bg-violet-700">Kembali</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ═══════════════════ VIDEO CALL ═══════════════════ */}
        {viewMode === 'video-call' && (
          <motion.div key="vc" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Video Call UI */}
            <div className="rounded-2xl bg-slate-900 overflow-hidden shadow-2xl relative" style={{ aspectRatio: '16/9' }}>
              {/* AI Therapist "video" placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4 shadow-2xl shadow-violet-500/30">
                    <Bot className="h-12 w-12 text-white" />
                  </div>
                  <p className="text-white font-bold text-lg">Dr. Aura</p>
                  <p className="text-slate-400 text-sm">AI Therapist</p>
                  {vcTyping && (
                    <div className="flex items-center justify-center gap-1 mt-3">
                      {[0, 1, 2].map((i) => (
                        <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} className="h-2 w-2 rounded-full bg-violet-400" />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* User camera preview (PiP) */}
              {vcCamOn && (
                <div className="absolute bottom-4 right-4 w-32 h-24 rounded-xl bg-slate-700 border-2 border-white/20 overflow-hidden shadow-xl">
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-600 to-slate-700">
                    <Users className="h-8 w-8 text-slate-400" />
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                <button onClick={() => setVcMicOn(!vcMicOn)} className={cn('flex h-10 w-10 items-center justify-center rounded-full transition-all', vcMicOn ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-500 text-white hover:bg-red-600')}>
                  {vcMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </button>
                <button onClick={() => setVcCamOn(!vcCamOn)} className={cn('flex h-10 w-10 items-center justify-center rounded-full transition-all', vcCamOn ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-500 text-white hover:bg-red-600')}>
                  {vcCamOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </button>
                <button onClick={goToLanding} className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 transition-all">
                  <Phone className="h-4 w-4 rotate-[135deg]" />
                </button>
              </div>
            </div>

            {/* Chat area */}
            <div className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 overflow-hidden">
              {/* Messages */}
              <div className="h-64 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                {!vcStarted && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mb-3">
                      <Video className="h-8 w-8 text-violet-600" />
                    </div>
                    <p className="font-bold text-slate-800 mb-1">Siap memulai sesi?</p>
                    <p className="text-xs text-slate-500 mb-4">Dr. Aura akan memandu Anda melalui sesi konseling.</p>
                    <button onClick={beginVCSession} className="rounded-xl bg-violet-600 text-white px-6 py-3 text-sm font-bold hover:bg-violet-700 shadow-md shadow-violet-600/20">
                      <Play className="h-4 w-4 inline mr-1.5" /> Mulai Sesi
                    </button>
                  </div>
                )}
                {vcStarted && vcMessages.map((msg, i) => (
                  <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div className={cn('max-w-[80%] rounded-2xl px-4 py-2.5 text-sm', msg.role === 'user' ? 'bg-violet-600 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm')}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {vcTyping && vcStarted && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.span key={i} animate={{ y: [0, -3, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }} className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={vcEndRef} />
              </div>
              {/* Input */}
              {vcStarted && (
                <div className="p-3 border-t border-slate-100">
                  <div className="flex gap-2">
                    <input value={vcUserInput} onChange={(e) => setVcUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendVCUserMessage()} placeholder="Ketik respons Anda..." className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400" />
                    <button onClick={sendVCUserMessage} disabled={!vcUserInput.trim()} className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 transition-all">
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={goToLanding} className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm">
              <ArrowLeft className="h-4 w-4" /> Kembali ke Menu
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

/* ─── Sub-components ─────────────────────────────────────────────── */
function Recommendation({ icon: Icon, text }: { icon: typeof Brain; text: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600"><Icon className="h-4 w-4" /></div>
      <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
    </div>
  )
}
