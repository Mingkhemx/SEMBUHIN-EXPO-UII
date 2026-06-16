import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import {
  HeartPulse,
  Apple,
  Dumbbell,
  Moon,
  Brain,
  Droplets,
  Sun,
  CheckCircle2,
  Circle,
  Flame,
  Target,
  Clock,
  TrendingUp,
  Star,
  ChevronRight,
  Sparkles,
  Calendar,
  Zap,
  Coffee,
  Leaf,
  Wind,
  Smile,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/tips-sehat')({
  head: () => ({
    meta: [
      { title: 'Tips Hidup Sehat — Sembuhin' },
      { name: 'description', content: 'Panduan nutrisi dan pola hidup sehat harian untuk kehidupan yang lebih baik.' },
    ],
  }),
  component: TipsSehatPage,
})

/* ─── Types ──────────────────────────────────────────────────────── */
interface Tip {
  id: string
  title: string
  desc: string
  category: string
  categoryColor: string
  icon: typeof Apple
  duration?: string
  difficulty: 'mudah' | 'sedang' | 'menantang'
}

interface DailyHabit {
  id: string
  label: string
  icon: typeof CheckCircle2
  checked: boolean
  streak: number
}

/* ─── Mock Data ──────────────────────────────────────────────────── */
const CATEGORIES = [
  { id: 'semua', label: 'Semua', icon: Sparkles },
  { id: 'nutrisi', label: 'Nutrisi', icon: Apple },
  { id: 'olahraga', label: 'Olahraga', icon: Dumbbell },
  { id: 'tidur', label: 'Tidur', icon: Moon },
  { id: 'mental', label: 'Mental', icon: Brain },
  { id: 'hidrasi', label: 'Hidrasi', icon: Droplets },
  { id: 'kebiasaan', label: 'Kebiasaan', icon: Star },
]

const TIP_OF_THE_DAY: Tip = {
  id: 'totd',
  title: 'Minum Air Hangat dengan Lemon di Pagi Hari',
  desc: 'Memulai hari dengan segelas air hangat + perasan lemon membantu metabolisme, detoksifikasi ringan, dan menyediakan vitamin C. Minum 15-30 menit sebelum sarapan untuk hasil optimal.',
  category: 'nutrisi',
  categoryColor: 'bg-emerald-100 text-emerald-700',
  icon: Coffee,
  duration: '2 min',
  difficulty: 'mudah',
}

const TIPS: Tip[] = [
  { id: '1', title: 'Konsumsi 5 Porsi Sayur & Buah per Hari', desc: 'WHO merekomendasikan minimal 400g sayur dan buah per hari. Variasikan warna untuk mendapat spektrum nutrisi lengkap.', category: 'nutrisi', categoryColor: 'bg-emerald-100 text-emerald-700', icon: Apple, difficulty: 'sedang' },
  { id: '2', title: 'Jalan Kaki 10.000 Langkah Setiap Hari', desc: 'Target 10.000 langkah membantu membakar ~400 kalori, meningkatkan kesehatan jantung, dan memperbaiki mood.', category: 'olahraga', categoryColor: 'bg-amber-100 text-amber-700', icon: Dumbbell, duration: '60 min', difficulty: 'sedang' },
  { id: '3', title: 'Tidur Sebelum Jam 11 Malam', desc: 'Tubuh melakukan regenerasi sel optimal antara jam 11 malam - 3 pagi. Tidur lebih awal meningkatkan kualitas deep sleep.', category: 'tidur', categoryColor: 'bg-indigo-100 text-indigo-700', icon: Moon, duration: '7-8 jam', difficulty: 'menantang' },
  { id: '4', title: 'Meditasi 10 Menit Setiap Pagi', desc: 'Meditasi mindfulness menurunkan kortisol (hormon stres) hingga 25%. Mulai dengan fokus pada napas selama 10 menit.', category: 'mental', categoryColor: 'bg-violet-100 text-violet-700', icon: Brain, duration: '10 min', difficulty: 'mudah' },
  { id: '5', title: 'Minum 8 Gelas Air Putih per Hari', desc: 'Hidrasi yang cukup meningkatkan konsentrasi, metabolisme, dan fungsi ginjal. Tambah 2 gelas jika berolahraga.', category: 'hidrasi', categoryColor: 'bg-sky-100 text-sky-700', icon: Droplets, difficulty: 'mudah' },
  { id: '6', title: 'Stretching 5 Menit Setelah Bangun', desc: 'Peregangan pagi meningkatkan fleksibilitas, sirkulasi darah, dan mengurangi kekakuan otot setelah tidur.', category: 'olahraga', categoryColor: 'bg-amber-100 text-amber-700', icon: Wind, duration: '5 min', difficulty: 'mudah' },
  { id: '7', title: 'Batasi Gula Harian < 25 Gram', desc: 'Kelebihan gula meningkatkan risiko diabetes, obesitas, dan peradangan. Baca label nutrisi dan hindari minuman manis.', category: 'nutrisi', categoryColor: 'bg-emerald-100 text-emerald-700', icon: Leaf, difficulty: 'menantang' },
  { id: '8', title: 'Praktikkan Gratitude Journaling', desc: 'Menulis 3 hal yang disyukuri setiap malam meningkatkan kebahagiaan dan mengurangi gejala depresi hingga 35%.', category: 'mental', categoryColor: 'bg-violet-100 text-violet-700', icon: Smile, duration: '5 min', difficulty: 'mudah' },
  { id: '9', title: 'Tidur Siang Power Nap 20 Menit', desc: 'Nap singkat (15-20 min) meningkatkan kewaspadaan dan kreativitas tanpa mengganggu tidur malam.', category: 'tidur', categoryColor: 'bg-indigo-100 text-indigo-700', icon: Moon, duration: '20 min', difficulty: 'mudah' },
  { id: '10', title: 'Ganti Nasi Putih dengan Nasi Merah', desc: 'Nasi merah memiliki 3x lebih banyak serat, magnesium, dan vitamin B. Membantu mengontrol gula darah.', category: 'nutrisi', categoryColor: 'bg-emerald-100 text-emerald-700', icon: Apple, difficulty: 'sedang' },
]

const INITIAL_HABITS: DailyHabit[] = [
  { id: '1', label: 'Minum 8 gelas air', icon: Droplets, checked: true, streak: 12 },
  { id: '2', label: 'Jalan kaki 30 menit', icon: Dumbbell, checked: true, streak: 8 },
  { id: '3', label: 'Makan 5 porsi sayur & buah', icon: Apple, checked: false, streak: 5 },
  { id: '4', label: 'Meditasi 10 menit', icon: Brain, checked: true, streak: 15 },
  { id: '5', label: 'Tidur sebelum jam 11', icon: Moon, checked: false, streak: 3 },
  { id: '6', label: 'Stretching pagi', icon: Wind, checked: true, streak: 20 },
]

const DIFFICULTY_CONFIG = {
  mudah: { label: 'Mudah', className: 'bg-emerald-100 text-emerald-700' },
  sedang: { label: 'Sedang', className: 'bg-amber-100 text-amber-700' },
  menantang: { label: 'Menantang', className: 'bg-rose-100 text-rose-700' },
}

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

/* ─── Component ──────────────────────────────────────────────────── */
function TipsSehatPage() {
  const [activeCategory, setActiveCategory] = useState('semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [habits, setHabits] = useState<DailyHabit[]>(INITIAL_HABITS)

  const filteredTips = TIPS.filter((t) => {
    const matchCategory = activeCategory === 'semua' || t.category === activeCategory
    const matchSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.desc.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

  const toggleHabit = (id: string) => {
    setHabits((prev) => prev.map((h) => h.id === id ? { ...h, checked: !h.checked } : h))
  }

  const completedHabits = habits.filter((h) => h.checked).length
  const totalHabits = habits.length
  const habitProgress = Math.round((completedHabits / totalHabits) * 100)

  return (
    <div className="relative z-10 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-14">

        {/* ── Hero ──────────────────────────────────────────────── */}
        <motion.header variants={fadeIn} initial="hidden" animate="visible" className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 border border-emerald-200/60 px-4 py-1.5 mb-5">
            <HeartPulse className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700 tracking-wide uppercase">Tips Hidup Sehat</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
            Panduan Hidup Sehat Harian
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-500 leading-relaxed max-w-lg">
            Tips praktis dan checklist kebiasaan sehat yang bisa Anda terapkan setiap hari untuk kehidupan yang lebih baik.
          </p>
        </motion.header>

        {/* ── Tip of the Day ─────────────────────────────────── */}
        <motion.div variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 text-white p-6 sm:p-8 shadow-lg shadow-emerald-500/20">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 border border-white/20">
                <TIP_OF_THE_DAY.icon className="h-10 w-10 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="h-4 w-4 text-yellow-300" />
                  <span className="text-xs font-bold uppercase tracking-wider">Tip Hari Ini</span>
                </div>
                <h2 className="text-lg font-bold leading-tight">{TIP_OF_THE_DAY.title}</h2>
                <p className="text-sm text-emerald-100 mt-2 leading-relaxed">{TIP_OF_THE_DAY.desc}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-emerald-200">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {TIP_OF_THE_DAY.duration}</span>
                  <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {DIFFICULTY_CONFIG[TIP_OF_THE_DAY.difficulty].label}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Daily Habit Checklist ─────────────────────────── */}
        <motion.div variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.15 }}>
          <div className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-500" />
                  Checklist Kebiasaan Hari Ini
                </h2>
                <span className="text-xs font-bold text-emerald-600">{completedHabits}/{totalHabits} selesai</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  animate={{ width: `${habitProgress}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500"
                />
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {habits.map((habit) => {
                const Icon = habit.icon
                return (
                  <button
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 text-left transition-all hover:bg-slate-50/80',
                      habit.checked && 'bg-emerald-50/40'
                    )}
                  >
                    <div className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all',
                      habit.checked ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                    )}>
                      {habit.checked ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-medium transition-all', habit.checked ? 'text-slate-400 line-through' : 'text-slate-800')}>
                        {habit.label}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Flame className={cn('h-3.5 w-3.5', habit.streak >= 10 ? 'text-orange-500' : 'text-slate-300')} />
                      <span className={cn('text-xs font-bold', habit.streak >= 10 ? 'text-orange-500' : 'text-slate-400')}>{habit.streak}</span>
                      <span className="text-[10px] text-slate-400">hari</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* ── Search ───────────────────────────────────────── */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari tips kesehatan..."
            className="flex-1 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {/* ── Categories ───────────────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-all duration-200',
                  isActive
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* ── Tips Grid ────────────────────────────────────── */}
        <motion.div variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">
              {activeCategory === 'semua' ? 'Semua Tips' : CATEGORIES.find((c) => c.id === activeCategory)?.label}
            </h2>
            <span className="text-xs text-slate-400">{filteredTips.length} tips</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {filteredTips.map((tip) => {
              const Icon = tip.icon
              const diffConf = DIFFICULTY_CONFIG[tip.difficulty]
              return (
                <div key={tip.id} className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 p-5 hover:shadow-xl hover:border-emerald-200 transition-all">
                  <div className="flex items-start gap-4">
                    <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border', tip.categoryColor.replace('text-', 'bg-').replace('700', '50'), 'border-current/10')}>
                      <Icon className={cn('h-6 w-6', tip.categoryColor.split(' ')[1])} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full', tip.categoryColor)}>
                          {tip.category}
                        </span>
                        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', diffConf.className)}>
                          {diffConf.label}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 leading-snug mb-1">{tip.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{tip.desc}</p>
                      {tip.duration && (
                        <div className="flex items-center gap-1.5 mt-3 text-[10px] text-slate-400">
                          <Clock className="h-3 w-3" /> {tip.duration}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* ── Weekly Challenge ─────────────────────────────── */}
        <motion.div variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.25 }}>
          <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6 shadow-lg shadow-amber-500/20">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 border border-white/20">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider">Tantangan Minggu Ini</span>
                </div>
                <h3 className="text-base font-bold">7 Hari Tanpa Minuman Manis</h3>
                <p className="text-sm text-amber-100 mt-1 leading-relaxed">
                  Coba hindari semua minuman bergula selama 7 hari. Rasakan perbedaannya pada energi dan berat badan Anda!
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-amber-200">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> 3 hari tersisa</span>
                  <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> 2,340 peserta</span>
                </div>
              </div>
              <button className="shrink-0 rounded-xl bg-white text-amber-700 px-5 py-2.5 text-sm font-bold hover:bg-amber-50 transition-colors shadow-md">
                Ikuti
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
