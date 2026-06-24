import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import {
  Video,
  Play,
  Clock,
  Eye,
  Search,
  ChevronRight,
  ArrowLeft,
  BookOpen,
  Heart,
  Brain,
  Dumbbell,
  Shield,
  AlertTriangle,
  Apple,
  Moon,
  ThumbsUp,
  Share2,
  Bookmark,
  List,
  Flame,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/video-edukasi')({
  head: () => ({
    meta: [
      { title: 'Video Edukasi — Sembuhin' },
      { name: 'description', content: 'Konten visual interaktif mengenai pencegahan penyakit dan kesehatan.' },
    ],
  }),
  component: VideoEdukasiPage,
})

/* ─── Types ──────────────────────────────────────────────────────── */
interface VideoItem {
  id: string
  title: string
  desc: string
  category: string
  categoryColor: string
  duration: string
  views: number
  youtubeId: string
  thumbnailEmoji: string
  author: string
  publishedDate: string
  featured?: boolean
}

/* ─── Mock Data ──────────────────────────────────────────────────── */
const CATEGORIES = [
  { id: 'semua', label: 'Semua', icon: List },
  { id: 'jantung', label: 'Jantung', icon: Heart },
  { id: 'nutrisi', label: 'Nutrisi', icon: Apple },
  { id: 'mental', label: 'Mental Health', icon: Brain },
  { id: 'olahraga', label: 'Olahraga', icon: Dumbbell },
  { id: 'pencegahan', label: 'Pencegahan', icon: Shield },
  { id: 'first-aid', label: 'First Aid', icon: AlertTriangle },
]

const VIDEOS: VideoItem[] = [
  {
    id: '2',
    title: 'Panduan Diet Mediterania untuk Pemula',
    desc: 'Diet Mediterania terbukti menurunkan risiko penyakit jantung 30%. Video ini menjelaskan langkah demi langkah memulai diet sehat ini.',
    category: 'nutrisi',
    categoryColor: 'bg-emerald-100 text-emerald-700',
    duration: '8:45',
    views: 23100,
    youtubeId: 'fR3NxCR9z2U',
    thumbnailEmoji: '🥗',
    author: 'Ns. Siti Rahma, S.Gz',
    publishedDate: '2 Feb 2026',
  },
  {
    id: '3',
    title: 'Teknik Pernapasan 4-7-8 untuk Mengatasi Cemas',
    desc: 'Tutorial lengkap teknik pernapasan 4-7-8 yang terbukti menurunkan kecemasan dalam hitungan menit. Ikuti bersama-sama!',
    category: 'mental',
    categoryColor: 'bg-violet-100 text-violet-700',
    duration: '6:20',
    views: 67800,
    youtubeId: '1vx8iUvfyCY',
    thumbnailEmoji: '🧘',
    author: 'Dr. Maya Putri, M.Psi',
    publishedDate: '28 Jan 2026',
  },
  {
    id: '4',
    title: 'Olahraga 15 Menit Tanpa Alat di Rumah',
    desc: 'Workout full-body yang bisa dilakukan di rumah tanpa peralatan. Cocok untuk pemula dan yang sibuk.',
    category: 'olahraga',
    categoryColor: 'bg-amber-100 text-amber-700',
    duration: '15:00',
    views: 89400,
    youtubeId: 'ml6cT4AZdqI',
    thumbnailEmoji: '💪',
    author: 'Coach Rendy, S.Or',
    publishedDate: '25 Jan 2026',
  },
  {
    id: '8',
    title: 'Yoga Pagi 20 Menit untuk Energi Sepanjang Hari',
    desc: 'Sesi yoga pagi yang gentle untuk membangunkan tubuh dan pikiran. Cocok untuk semua level.',
    category: 'olahraga',
    categoryColor: 'bg-amber-100 text-amber-700',
    duration: '20:00',
    views: 41200,
    youtubeId: 'v7AYKMP6rOE',
    thumbnailEmoji: '🧘‍♀️',
    author: 'Instruktur Sari',
    publishedDate: '12 Jan 2026',
  },
  {
    id: '10',
    title: 'Mengenal Gejala Diabetes dan Cara Mencegahnya',
    desc: 'Diabetes adalah silent killer. Kenali gejala awalnya dan bagaimana pola makan serta gaya hidup bisa mencegahnya.',
    category: 'nutrisi',
    categoryColor: 'bg-emerald-100 text-emerald-700',
    duration: '14:20',
    views: 52100,
    youtubeId: 'X9ivR4y03DE',
    thumbnailEmoji: '🍏',
    author: 'Dr. Linda Wahyuni',
    publishedDate: '8 Jan 2026',
  },
  {
    id: '11',
    title: 'Relaksasi Mendalam: Menghilangkan Stres dan Cemas',
    desc: 'Sesi meditasi terbimbing untuk membantu Anda melepaskan ketegangan, menenangkan pikiran, dan mencapai relaksasi total setelah hari yang panjang.',
    category: 'mental',
    categoryColor: 'bg-violet-100 text-violet-700',
    duration: '10:00',
    views: 125000,
    youtubeId: 'i5g5k6WBlm8',
    thumbnailEmoji: '�',
    author: 'Psikolog Anita Permadi',
    publishedDate: '5 Jan 2026',
  },
]

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

/* ─── Helper Components ──────────────────────────────────────────── */
function VideoThumbnail({ video, className }: { video: VideoItem, className?: string }) {
  const [error, setError] = useState(false)

  return (
    <div className={cn('relative bg-slate-100 flex items-center justify-center overflow-hidden', className)}>
      {!error ? (
        <img
          src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
          alt={video.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 z-10"
          onError={() => setError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-200 z-10">
          <span className="text-4xl mb-2">{video.thumbnailEmoji}</span>
          <Video className="h-6 w-6 text-slate-400" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all flex items-center justify-center z-20">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="h-5 w-5 text-blue-600 ml-0.5" />
        </div>
      </div>
      <span className="absolute bottom-2 right-2 text-[10px] font-bold text-white bg-black/70 px-1.5 py-0.5 rounded z-30">
        {video.duration}
      </span>
    </div>
  )
}

/* ─── Component ──────────────────────────────────────────────────── */
function VideoEdukasiPage() {
  const [activeCategory, setActiveCategory] = useState('semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null)
  const [savedVideos, setSavedVideos] = useState<string[]>([])

  const filteredVideos = VIDEOS.filter((v) => {
    const matchCategory = activeCategory === 'semua' || v.category === activeCategory
    const matchSearch = !searchQuery || v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.desc.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

  const toggleSave = (id: string) => {
    setSavedVideos((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id])
  }

  const formatViews = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString()

  return (
    <div className="relative z-10 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-14">

        {/* ── Hero Card ──────────────────────────────────────────────── */}
        {!selectedVideo && (
          <motion.div
            variants={fadeIn} initial="hidden" animate="visible"
            className="rounded-3xl shadow-2xl shadow-blue-500/25 overflow-hidden relative min-h-[300px]"
          >
            {/* Background image from Unsplash (medical/video concept) */}
            <img
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80"
              alt="Video Edukasi"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-indigo-800/70 to-violet-700/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            <div className="relative z-10 p-8 sm:p-12 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-4 py-1.5 mb-5 backdrop-blur-sm">
                <Video className="h-3.5 w-3.5 text-blue-200" />
                <span className="text-xs font-semibold text-white/90 tracking-wide uppercase">Video Edukasi</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
                Belajar Lewat Video
              </h1>
              <p className="mt-3 text-base sm:text-lg text-blue-100 leading-relaxed max-w-lg">
                Konten visual interaktif dari dokter dan ahli kesehatan. Belajar tentang pencegahan penyakit dan gaya hidup sehat.
              </p>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════ VIDEO PLAYER ═══════════════════ */}
        {selectedVideo ? (
          <motion.div key="player" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <button onClick={() => setSelectedVideo(null)} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar
            </button>

            {/* Video Player */}
            <div className="rounded-2xl overflow-hidden bg-slate-900 shadow-2xl" style={{ aspectRatio: '16/9' }}>
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?rel=0&modestbranding=1`}
                title={selectedVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Video Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full', selectedVideo.categoryColor)}>
                  {selectedVideo.category}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">{selectedVideo.title}</h2>
              <div className="flex items-center gap-4 flex-wrap text-xs text-slate-400">
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {formatViews(selectedVideo.views)} views</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {selectedVideo.duration}</span>
                <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {selectedVideo.publishedDate}</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{selectedVideo.desc}</p>

              {/* Author + Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                    {selectedVideo.author.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{selectedVideo.author}</p>
                    <p className="text-[11px] text-slate-400">Instruktur</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                    <ThumbsUp className="h-3.5 w-3.5" /> Suka
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                    <Share2 className="h-3.5 w-3.5" /> Bagikan
                  </button>
                  <button
                    onClick={() => toggleSave(selectedVideo.id)}
                    className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors',
                      savedVideos.includes(selectedVideo.id) ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    <Bookmark className={cn('h-3.5 w-3.5', savedVideos.includes(selectedVideo.id) && 'fill-current')} />
                    {savedVideos.includes(selectedVideo.id) ? 'Tersimpan' : 'Simpan'}
                  </button>
                </div>
              </div>
            </div>

            {/* Related Videos */}
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Video Terkait</h3>
              <div className="grid sm:grid-cols-3 gap-3">
                {VIDEOS.filter((v) => v.category === selectedVideo.category && v.id !== selectedVideo.id).slice(0, 3).map((video) => (
                  <button key={video.id} onClick={() => { setSelectedVideo(video); window.scrollTo(0, 0) }} className="rounded-xl bg-white border border-white/60 shadow-sm hover:shadow-md transition-all text-left overflow-hidden group">
                    <VideoThumbnail video={video} className="h-24 text-3xl" />
                    <div className="p-3">
                      <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors line-clamp-2">{video.title}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{formatViews(video.views)} views</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          /* ═══════════════════ LIST VIEW ═══════════════════ */
          <motion.div key="list" variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="space-y-8">

            {/* Search */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari video edukasi..."
                className="flex-1 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            {/* Categories */}
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
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {cat.label}
                  </button>
                )
              })}
            </div>

            {/* Video Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">
                  {activeCategory === 'semua' ? 'Semua Video' : CATEGORIES.find((c) => c.id === activeCategory)?.label}
                </h2>
                <span className="text-xs text-slate-400">{filteredVideos.length} video</span>
              </div>

              {filteredVideos.length === 0 && (
                <div className="rounded-2xl bg-white border border-white/60 shadow-lg p-12 text-center">
                  <Video className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-600">Tidak ada video ditemukan</p>
                  <p className="text-xs text-slate-400 mt-1">Coba kata kunci atau kategori lain.</p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVideos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 hover:shadow-xl hover:border-blue-200 transition-all text-left overflow-hidden group"
                  >
                    <VideoThumbnail video={video} className="h-40 text-5xl border-b border-slate-100" />
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full', video.categoryColor)}>
                          {video.category}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">{video.title}</h3>
                      <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {formatViews(video.views)}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {video.duration}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2">{video.author}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
