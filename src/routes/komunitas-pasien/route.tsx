import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import {
  Users,
  Heart,
  MessageCircle,
  ThumbsUp,
  Search,
  Plus,
  ShieldCheck,
  Stethoscope,
  Bot,
  ChevronRight,
  ArrowLeft,
  TrendingUp,
  Clock,
  Eye,
  Bookmark,
  Send,
  X,
  Filter,
  Award,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/komunitas-pasien')({
  head: () => ({
    meta: [
      { title: 'Komunitas Pasien — Sembuhin' },
      { name: 'description', content: 'Forum per kondisi medis, dimoderasi dokter, klaim medis divalidasi AI.' },
    ],
  }),
  component: KomunitasPasienPage,
})

/* ─── Types ──────────────────────────────────────────────────────── */
type ViewMode = 'feed' | 'category' | 'post-detail'

interface Post {
  id: string
  author: string
  avatar: string
  role: 'patient' | 'doctor' | 'moderator'
  category: string
  categoryColor: string
  timeAgo: string
  title: string
  content: string
  likes: number
  comments: number
  views: number
  liked: boolean
  saved: boolean
  aiVerified?: boolean
  doctorReply?: boolean
}

interface Category {
  id: string
  name: string
  icon: typeof Heart
  color: string
  bgColor: string
  members: number
  posts: number
}

/* ─── Mock Data ──────────────────────────────────────────────────── */
const CATEGORIES: Category[] = [
  { id: 'diabetes', name: 'Diabetes', icon: TrendingUp, color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-100', members: 2840, posts: 456 },
  { id: 'hipertensi', name: 'Hipertensi', icon: Heart, color: 'text-red-600', bgColor: 'bg-red-50 border-red-100', members: 3120, posts: 512 },
  { id: 'jantung', name: 'Kesehatan Jantung', icon: Heart, color: 'text-rose-600', bgColor: 'bg-rose-50 border-rose-100', members: 1890, posts: 298 },
  { id: 'mental', name: 'Kesehatan Mental', icon: Users, color: 'text-violet-600', bgColor: 'bg-violet-50 border-violet-100', members: 4250, posts: 789 },
  { id: 'pencernaan', name: 'Pencernaan', icon: Stethoscope, color: 'text-amber-600', bgColor: 'bg-amber-50 border-amber-100', members: 1560, posts: 234 },
  { id: 'kulit', name: 'Kesehatan Kulit', icon: Eye, color: 'text-pink-600', bgColor: 'bg-pink-50 border-pink-100', members: 2100, posts: 345 },
]

const POSTS: Post[] = [
  {
    id: '1',
    author: 'Rina Sari',
    avatar: 'RS',
    role: 'patient',
    category: 'Diabetes',
    categoryColor: 'bg-blue-100 text-blue-700',
    timeAgo: '2 jam lalu',
    title: 'Tips menjaga gula darah tetap stabil saat puasa',
    content: 'Saya sudah 3 bulan menjalani puasa Senin-Kamis dan alhamdulillah gula darah lebih terkontrol. Kuncinya: sahur dengan karbo kompleks, kurangi gorengan, dan jalan kaki 15 menit setelah berbuka. Ada yang punya pengalaman serupa?',
    likes: 45,
    comments: 12,
    views: 234,
    liked: false,
    saved: false,
    aiVerified: true,
    doctorReply: true,
  },
  {
    id: '2',
    author: 'Dr. Maya Putri',
    avatar: 'MP',
    role: 'doctor',
    category: 'Hipertensi',
    categoryColor: 'bg-red-100 text-red-700',
    timeAgo: '5 jam lalu',
    title: 'Penjelasan: Apakah tekanan darah 130/85 sudah normal?',
    content: 'Banyak pasien bertanya apakah TD 130/85 sudah bisa disebut normal. Jawabannya: ini masuk kategori "elevated" menurut AHA 2017. Target optimal adalah < 130/80 untuk pasien dengan risiko kardiovaskular. Tetap jaga pola makan rendah garam dan olahraga teratur.',
    likes: 89,
    comments: 23,
    views: 567,
    liked: true,
    saved: true,
    aiVerified: true,
    doctorReply: false,
  },
  {
    id: '3',
    author: 'Budi Hartono',
    avatar: 'BH',
    role: 'patient',
    category: 'Kesehatan Mental',
    categoryColor: 'bg-violet-100 text-violet-700',
    timeAgo: '8 jam lalu',
    title: 'Perjalanan 6 bulan mengatasi anxiety disorder',
    content: 'Mau berbagi cerita. Setahun lalu saya tidak bisa tidur karena cemas berlebihan. Setelah konsultasi psikolog + rutin CBT mandiri + olahraga, sekarang jauh lebih baik. Yang paling membantu: teknik grounding 5-4-3-2-1 dan journaling setiap pagi.',
    likes: 156,
    comments: 34,
    views: 890,
    liked: false,
    saved: false,
    aiVerified: true,
    doctorReply: true,
  },
  {
    id: '4',
    author: 'Dewi Lestari',
    avatar: 'DL',
    role: 'patient',
    category: 'Kesehatan Jantung',
    categoryColor: 'bg-rose-100 text-rose-700',
    timeAgo: '1 hari lalu',
    title: 'Pengalaman pasang ring jantung — apa yang perlu disiapkan?',
    content: 'Suami saya dijadwalkan PCI minggu depan. Ada yang pernah menjalani prosedur ini? Mohon share pengalamannya: persiapan, selama prosedur, dan pemulihan. Terima kasih.',
    likes: 34,
    comments: 18,
    views: 445,
    liked: false,
    saved: true,
    doctorReply: true,
  },
  {
    id: '5',
    author: 'Moderator',
    avatar: '✓',
    role: 'moderator',
    category: 'Pencernaan',
    categoryColor: 'bg-amber-100 text-amber-700',
    timeAgo: '2 hari lalu',
    title: '⚠️ Hati-hati: klaim "jus seledri menyembuhkan GERD" tidak terbukti ilmiah',
    content: 'Tim AI kami mendeteksi beberapa posting yang mengklaim jus seledri bisa menyembuhkan GERD. Berdasarkan tinjauan literatur medis, tidak ada bukti klinis yang mendukung klaim ini. GERD memerlukan penanganan medis yang tepat. Silakan konsultasi dengan dokter.',
    likes: 212,
    comments: 45,
    views: 1234,
    liked: false,
    saved: false,
    aiVerified: true,
  },
]

const ROLE_BADGES: Record<string, { label: string; className: string }> = {
  patient: { label: 'Pasien', className: 'bg-slate-100 text-slate-600' },
  doctor: { label: 'Dokter', className: 'bg-emerald-100 text-emerald-700' },
  moderator: { label: 'Moderator', className: 'bg-orange-100 text-orange-700' },
}

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

/* ─── Component ──────────────────────────────────────────────────── */
function KomunitasPasienPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('feed')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activePost, setActivePost] = useState<Post | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [posts, setPosts] = useState<Post[]>(POSTS)
  const [newPostTitle, setNewPostTitle] = useState('')
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostCategory, setNewPostCategory] = useState('Diabetes')

  const filteredPosts = posts.filter((p) => {
    const matchCategory = !activeCategory || p.category === activeCategory
    const matchSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

  const toggleLike = (id: string) => {
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p))
  }

  const toggleSave = (id: string) => {
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, saved: !p.saved } : p))
  }

  const submitPost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return
    const post: Post = {
      id: Date.now().toString(),
      author: 'Anda',
      avatar: 'AN',
      role: 'patient',
      category: newPostCategory,
      categoryColor: CATEGORIES.find((c) => c.name === newPostCategory)?.bgColor.replace('bg-', '').replace('border-', '') || 'bg-slate-100 text-slate-700',
      timeAgo: 'Baru saja',
      title: newPostTitle,
      content: newPostContent,
      likes: 0,
      comments: 0,
      views: 0,
      liked: false,
      saved: false,
    }
    setPosts((prev) => [post, ...prev])
    setNewPostTitle('')
    setNewPostContent('')
    setShowCreatePost(false)
  }

  return (
    <div className="relative z-10 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-14">

        {/* ── Hero ──────────────────────────────────────────────── */}
        <motion.header variants={fadeIn} initial="hidden" animate="visible" className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-100/80 border border-orange-200/60 px-4 py-1.5 mb-5">
            <Users className="h-3.5 w-3.5 text-orange-600" />
            <span className="text-xs font-semibold text-orange-700 tracking-wide uppercase">Komunitas Pasien</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
            Forum Komunitas Pasien
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-500 leading-relaxed max-w-lg">
            Berbagi pengalaman, bertanya, dan belajar bersama pasien lain. Dimoderasi dokter, klaim medis divalidasi AI.
          </p>
        </motion.header>

        {/* ── Search & Create ──────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari topik, pertanyaan, atau diskusi..."
              className="flex-1 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowCreatePost(!showCreatePost)}
            className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            Buat Post
          </button>
        </div>

        {/* ── Create Post Form ─────────────────────────────────── */}
        {showCreatePost && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Buat Postingan Baru</h3>
              <button onClick={() => setShowCreatePost(false)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Kategori:</span>
              <select value={newPostCategory} onChange={(e) => setNewPostCategory(e.target.value)} className="text-xs font-medium border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500/30">
                {CATEGORIES.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <input value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} placeholder="Judul postingan..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400" />
            <textarea value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} placeholder="Ceritakan pengalaman atau pertanyaan Anda..." rows={4} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 resize-none" />
            <div className="flex items-center gap-3">
              <button onClick={submitPost} disabled={!newPostTitle.trim() || !newPostContent.trim()} className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <Send className="h-4 w-4" /> Publikasikan
              </button>
              <p className="text-[10px] text-slate-400">Klaim medis akan otomatis divalidasi AI</p>
            </div>
          </motion.div>
        )}

        {/* ── Categories ───────────────────────────────────────── */}
        <motion.div variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Filter className="h-5 w-5 text-slate-400" />
              Kategori
            </h2>
            {activeCategory && (
              <button onClick={() => setActiveCategory(null)} className="text-xs font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1">
                <X className="h-3 w-3" /> Hapus filter
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              const isActive = activeCategory === cat.name
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(isActive ? null : cat.name)}
                  className={cn(
                    'rounded-xl border p-3 text-center transition-all hover:shadow-md',
                    isActive ? cn(cat.bgColor, 'shadow-md ring-2 ring-orange-400/30') : 'bg-white border-white/60 shadow-sm hover:border-orange-200'
                  )}
                >
                  <Icon className={cn('h-5 w-5 mx-auto mb-1.5', cat.color)} />
                  <p className={cn('text-xs font-bold', isActive ? 'text-slate-800' : 'text-slate-700')}>{cat.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{cat.members.toLocaleString()} anggota</p>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* ── Feed ─────────────────────────────────────────────── */}
        <motion.div variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.15 }} className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              {activeCategory ? `Diskusi: ${activeCategory}` : 'Feed Terbaru'}
            </h2>
            <span className="text-xs text-slate-400">{filteredPosts.length} postingan</span>
          </div>

          {filteredPosts.length === 0 && (
            <div className="rounded-2xl bg-white border border-white/60 shadow-lg p-12 text-center">
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600">Belum ada postingan</p>
              <p className="text-xs text-slate-400 mt-1">Jadilah yang pertama memulai diskusi!</p>
            </div>
          )}

          {filteredPosts.map((post) => (
            <div key={post.id} className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 hover:shadow-xl transition-all">
              <div className="p-5">
                {/* Post Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                    post.role === 'doctor' ? 'bg-emerald-100 text-emerald-700' : post.role === 'moderator' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'
                  )}>
                    {post.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-800">{post.author}</span>
                      <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', ROLE_BADGES[post.role].className)}>
                        {post.role === 'doctor' && <Stethoscope className="h-2.5 w-2.5 inline mr-0.5" />}
                        {ROLE_BADGES[post.role].label}
                      </span>
                      <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', post.categoryColor)}>
                        {post.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{post.timeAgo}</p>
                  </div>
                </div>

                {/* Post Content */}
                <h3 className="text-sm font-bold text-slate-800 mb-2">{post.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-3 line-clamp-3">{post.content}</p>

                {/* Badges */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {post.aiVerified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
                      <Bot className="h-2.5 w-2.5" /> Tervalidasi AI
                    </span>
                  )}
                  {post.doctorReply && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      <Stethoscope className="h-2.5 w-2.5" /> Dijawab Dokter
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
                  <button onClick={() => toggleLike(post.id)} className={cn('flex items-center gap-1.5 text-xs font-medium transition-colors', post.liked ? 'text-orange-600' : 'text-slate-400 hover:text-orange-500')}>
                    <ThumbsUp className={cn('h-4 w-4', post.liked && 'fill-current')} /> {post.likes}
                  </button>
                  <button className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-sky-500 transition-colors">
                    <MessageCircle className="h-4 w-4" /> {post.comments}
                  </button>
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Eye className="h-3.5 w-3.5" /> {post.views}
                  </span>
                  <div className="flex-1" />
                  <button onClick={() => toggleSave(post.id)} className={cn('transition-colors', post.saved ? 'text-orange-500' : 'text-slate-400 hover:text-orange-500')}>
                    <Bookmark className={cn('h-4 w-4', post.saved && 'fill-current')} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Info ─────────────────────────────────────────────── */}
        <div className="flex gap-3 rounded-xl bg-white/80 border border-slate-200/80 p-4 shadow-sm">
          <AlertTriangle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 leading-relaxed">
            Semua klaim medis dalam forum divalidasi oleh sistem AI. Postingan yang mengandung informasi medis yang tidak akurat akan ditandai oleh moderator. Selalu konsultasikan kondisi Anda dengan dokter profesional.
          </p>
        </div>
      </div>
    </div>
  )
}
