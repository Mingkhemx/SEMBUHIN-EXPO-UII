import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import {
  BookOpen,
  Search,
  Clock,
  User,
  ChevronRight,
  Eye,
  Heart,
  Brain,
  Activity,
  Apple,
  Moon,
  Dumbbell,
  Flame,
  Shield,
  TrendingUp,
  ArrowLeft,
  Bookmark,
  Share2,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/artikel')({
  head: () => ({
    meta: [
      { title: 'Artikel Kesehatan — Sembuhin' },
      { name: 'description', content: 'Kumpulan riset dan artikel medis terpercaya untuk kesehatan Anda.' },
    ],
  }),
  component: ArtikelPage,
})

/* ─── Types ──────────────────────────────────────────────────────── */
type ViewMode = 'list' | 'detail'

interface Article {
  id: string
  title: string
  excerpt: string
  content: string
  category: string
  categoryColor: string
  author: string
  authorRole: string
  date: string
  readTime: string
  views: number
  featured?: boolean
  imageEmoji: string
}

/* ─── Mock Data ──────────────────────────────────────────────────── */
const CATEGORIES = [
  { id: 'semua', label: 'Semua', icon: BookOpen },
  { id: 'jantung', label: 'Jantung', icon: Heart },
  { id: 'nutrisi', label: 'Nutrisi', icon: Apple },
  { id: 'mental', label: 'Mental Health', icon: Brain },
  { id: 'olahraga', label: 'Olahraga', icon: Dumbbell },
  { id: 'tidur', label: 'Tidur', icon: Moon },
  { id: 'diabetes', label: 'Diabetes', icon: Activity },
]

const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Panduan Lengkap Menjaga Kesehatan Jantung di Usia 30-an',
    excerpt: 'Memasuki usia 30-an, risiko penyakit kardiovaskular mulai meningkat. Pelajari langkah-langkah pencegahan yang efektif berdasarkan riset terkini.',
    content: 'Penyakit jantung masih menjadi penyebab kematian nomor satu di dunia. Memasuki usia 30-an, metabolisme tubuh mulai melambat dan risiko penumpukan plak di pembuluh darah meningkat. Berikut panduan lengkap yang bisa Anda terapkan:\n\n1. Olahraga kardio minimal 150 menit per minggu\n2. Konsumsi ikan berlemak (salmon, sarden) 2-3x seminggu\n3. Batasi garam kurang dari 5 gram per hari\n4. Kelola stres dengan meditasi atau yoga\n5. Cek tekanan darah secara rutin\n6. Hindari rokok dan batasi alkohol\n7. Tidur 7-9 jam setiap malam\n\nStudi dari American Heart Association (2024) menunjukkan bahwa kombinasi olahraga teratur dan pola makan Mediterania dapat menurunkan risiko penyakit jantung hingga 40%.',
    category: 'jantung',
    categoryColor: 'bg-red-100 text-red-700',
    author: 'Dr. Ahmad Fauzi, Sp.JP',
    authorRole: 'Kardiolog',
    date: '10 Feb 2026',
    readTime: '8 min',
    views: 2450,
    featured: true,
    imageEmoji: '❤️',
  },
  {
    id: '2',
    title: '5 Makanan yang Terbukti Menurunkan Kolesterol Jahat',
    excerpt: 'Kolesterol LDL yang tinggi bisa meningkatkan risiko stroke dan serangan jantung. Simak daftar makanan yang terbukti secara ilmiah menurunkan LDL.',
    content: 'Kolesterol LDL (low-density lipoprotein) dikenal sebagai "kolesterol jahat" karena dapat menumpuk di dinding arteri. Berikut 5 makanan yang terbukti menurunkan LDL:\n\n1. Oatmeal - mengandung beta-glucan yang mengikat kolesterol\n2. Kacang almond - kaya sterol tumbuhan\n3. Alpukat - lemak tak jenuh tunggal menurunkan LDL\n4. Ikan berlemak - omega-3 meningkatkan HDL\n5. Kacang kedelai - protein nabati pengganti daging merah\n\nKonsumsi rutin selama 6 minggu dapat menurunkan LDL hingga 10-15%.',
    category: 'nutrisi',
    categoryColor: 'bg-emerald-100 text-emerald-700',
    author: 'Ns. Siti Rahma, S.Gz',
    authorRole: 'Ahli Gizi Klinis',
    date: '8 Feb 2026',
    readTime: '5 min',
    views: 1890,
    imageEmoji: '🥗',
  },
  {
    id: '3',
    title: 'Mengenal Burnout: Tanda, Penyebab, dan Cara Mengatasinya',
    excerpt: 'Burnout bukan sekadar lelah biasa. Kenali gejala fisik dan mentalnya, serta strategi berbasis CBT untuk pulih.',
    content: 'WHO secara resmi mengklasifikasikan burnout sebagai fenomena okupasional dalam ICD-11. Burnout ditandai oleh tiga dimensi:\n\n1. Kelelahan emosional dan fisik yang kronis\n2. Sinisme atau jarak mental dari pekerjaan\n3. Penurunan efikasi profesional\n\nGejala fisik: sakit kepala, insomnia, gangguan pencernaan, penurunan imunitas.\n\nStrategi pemulihan berbasis CBT:\n- Identifikasi dan tantang pikiran negatif tentang pekerjaan\n- Tetapkan batasan yang jelas antara kerja dan istirahat\n- Praktikkan self-compassion\n- Cari dukungan sosial dan profesional\n\nJika gejala berlanjut lebih dari 2 minggu, konsultasi dengan psikolog sangat disarankan.',
    category: 'mental',
    categoryColor: 'bg-violet-100 text-violet-700',
    author: 'Dr. Maya Putri, M.Psi',
    authorRole: 'Psikolog Klinis',
    date: '5 Feb 2026',
    readTime: '7 min',
    views: 3120,
    imageEmoji: '🧠',
  },
  {
    id: '4',
    title: 'HIIT vs Steady-State Cardio: Mana yang Lebih Efektif?',
    excerpt: 'Dua pendekatan olahraga ini memiliki manfaat berbeda. Temukan mana yang paling cocok untuk tujuan kebugaran Anda.',
    content: 'High-Intensity Interval Training (HIIT) dan steady-state cardio masing-masing memiliki keunggulan:\n\nHIIT:\n- Lebih hemat waktu (20-30 menit)\n- Afterburn effect (EPOC) membakar kalori pasca-latihan\n- Meningkatkan VO2 max lebih cepat\n\nSteady-State Cardio:\n- Lebih aman untuk pemula\n- Risiko cedera lebih rendah\n- Cocok untuk endurance training\n\nRekomendasi: kombinasi keduanya 3-4x seminggu memberikan hasil optimal.',
    category: 'olahraga',
    categoryColor: 'bg-amber-100 text-amber-700',
    author: 'Coach Rendy, S.Or',
    authorRole: 'Sports Science',
    date: '3 Feb 2026',
    readTime: '6 min',
    views: 1560,
    imageEmoji: '🏃',
  },
  {
    id: '5',
    title: 'Sleep Hygiene: 10 Kebiasaan untuk Tidur Lebih Berkualitas',
    excerpt: 'Kualitas tidur sama pentingnya dengan durasi. Terapkan sleep hygiene untuk tidur yang lebih nyenyak dan menyegarkan.',
    content: 'Sleep hygiene mengacu pada kebiasaan dan lingkungan yang mendukung tidur berkualitas:\n\n1. Tidur dan bangun di jam yang sama setiap hari\n2. Hindari kafein 6 jam sebelum tidur\n3. Matikan layar 1 jam sebelum tidur\n4. Suhu kamar 18-22°C\n5. Kamar gelap dan sunyi\n6. Hindari makan berat 2 jam sebelum tidur\n7. Olahraga teratur (tapi tidak terlalu dekat jam tidur)\n8. Gunakan tempat tidur hanya untuk tidur\n9. Teknik relaksasi sebelum tidur\n10. Batasi nap siang maksimal 20 menit',
    category: 'tidur',
    categoryColor: 'bg-indigo-100 text-indigo-700',
    author: 'Dr. Lisa Permata, Sp.KJ',
    authorRole: 'Spesialis Tidur',
    date: '1 Feb 2026',
    readTime: '5 min',
    views: 2100,
    imageEmoji: '😴',
  },
  {
    id: '6',
    title: 'Diabetes Tipe 2: Perubahan Gaya Hidup yang Bisa Membalikkan Kondisi',
    excerpt: 'Riset terbaru menunjukkan diabetes tipe 2 stadium awal bisa direversal dengan perubahan gaya hidup yang tepat.',
    content: 'Studi DiRECT (2023) menunjukkan bahwa penurunan berat badan 10-15 kg pada pasien diabetes tipe 2 stadium awal dapat menghasilkan remisi pada 46% kasus.\n\nLangkah-langkah yang terbukti:\n1. Diet rendah kalori (800-1200 kkal/hari) selama 3-5 bulan\n2. Aktivitas fisik 150 menit/minggu\n3. Penggantian makanan olahan dengan whole foods\n4. Monitoring gula darah mandiri\n5. Dukungan behavioral therapy\n\nKonsultasikan dengan dokter sebelum memulai program reversi diabetes.',
    category: 'diabetes',
    categoryColor: 'bg-sky-100 text-sky-700',
    author: 'Dr. Hendra Wijaya, Sp.PD',
    authorRole: 'Spesialis Penyakit Dalam',
    date: '28 Jan 2026',
    readTime: '9 min',
    views: 4230,
    imageEmoji: '🩸',
  },
]

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

/* ─── Component ──────────────────────────────────────────────────── */
function ArtikelPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [activeCategory, setActiveCategory] = useState('semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [savedArticles, setSavedArticles] = useState<string[]>([])

  const filteredArticles = ARTICLES.filter((a) => {
    const matchCategory = activeCategory === 'semua' || a.category === activeCategory
    const matchSearch = !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

  const featuredArticle = filteredArticles.find((a) => a.featured)
  const regularArticles = filteredArticles.filter((a) => !a.featured)

  const toggleSave = (id: string) => {
    setSavedArticles((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id])
  }

  const openArticle = (article: Article) => {
    setSelectedArticle(article)
    setViewMode('detail')
  }

  const backToList = () => {
    setViewMode('list')
    setSelectedArticle(null)
  }

  return (
    <div className="relative z-10 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-14">

        {/* ── Hero ──────────────────────────────────────────────── */}
        <motion.header variants={fadeIn} initial="hidden" animate="visible" className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-100/80 border border-sky-200/60 px-4 py-1.5 mb-5">
            <BookOpen className="h-3.5 w-3.5 text-sky-600" />
            <span className="text-xs font-semibold text-sky-700 tracking-wide uppercase">Edukasi Kesehatan</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
            Artikel Kesehatan
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-500 leading-relaxed max-w-lg">
            Kumpulan riset dan artikel medis terpercaya yang ditulis oleh dokter dan ahli kesehatan untuk Anda.
          </p>
        </motion.header>

        {/* ═══════════════════ LIST VIEW ═══════════════════ */}
        {viewMode === 'list' && (
          <motion.div key="list" variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="space-y-8">

            {/* Search */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari artikel tentang kesehatan..."
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
                        ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/20'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:bg-sky-50'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {cat.label}
                  </button>
                )
              })}
            </div>

            {/* Featured Article */}
            {featuredArticle && (
              <button
                onClick={() => openArticle(featuredArticle)}
                className="w-full rounded-2xl bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800 text-white p-6 sm:p-8 shadow-lg shadow-sky-600/20 hover:shadow-xl transition-all text-left group"
              >
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex h-28 w-28 sm:h-36 sm:w-36 shrink-0 items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-5xl sm:text-6xl">
                    {featuredArticle.imageEmoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20">Artikel Pilihan</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold leading-tight group-hover:underline">{featuredArticle.title}</h2>
                    <p className="text-sm text-sky-100 mt-2 leading-relaxed line-clamp-2">{featuredArticle.excerpt}</p>
                    <div className="flex items-center gap-4 mt-4 text-xs text-sky-200">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> {featuredArticle.author}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {featuredArticle.date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {featuredArticle.readTime}</span>
                    </div>
                  </div>
                </div>
              </button>
            )}

            {/* Article Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">
                  {activeCategory === 'semua' ? 'Semua Artikel' : CATEGORIES.find((c) => c.id === activeCategory)?.label}
                </h2>
                <span className="text-xs text-slate-400">{filteredArticles.length} artikel</span>
              </div>

              {regularArticles.length === 0 && !featuredArticle && (
                <div className="rounded-2xl bg-white border border-white/60 shadow-lg p-12 text-center">
                  <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-600">Tidak ada artikel ditemukan</p>
                  <p className="text-xs text-slate-400 mt-1">Coba kata kunci atau kategori lain.</p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                {regularArticles.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => openArticle(article)}
                    className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 hover:shadow-xl hover:border-sky-200 transition-all text-left group overflow-hidden"
                  >
                    {/* Article thumbnail placeholder */}
                    <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-4xl border-b border-slate-100">
                      {article.imageEmoji}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full', article.categoryColor)}>
                          {article.category}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-sky-700 transition-colors line-clamp-2">{article.title}</h3>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">{article.excerpt}</p>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-3 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {article.readTime}</span>
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {article.views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleSave(article.id) }}
                            className={cn('p-1 rounded transition-colors', savedArticles.includes(article.id) ? 'text-sky-500' : 'text-slate-300 hover:text-sky-500')}
                          >
                            <Bookmark className={cn('h-3.5 w-3.5', savedArticles.includes(article.id) && 'fill-current')} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════ DETAIL VIEW ═══════════════════ */}
        {viewMode === 'detail' && selectedArticle && (
          <motion.div key="detail" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Back button */}
            <button onClick={backToList} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar
            </button>

            {/* Article Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full', selectedArticle.categoryColor)}>
                  {selectedArticle.category}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">{selectedArticle.title}</h1>
              <p className="text-base text-slate-500 leading-relaxed">{selectedArticle.excerpt}</p>

              {/* Author + Meta */}
              <div className="flex items-center gap-4 flex-wrap pt-2">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-sm">
                    {selectedArticle.author.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{selectedArticle.author}</p>
                    <p className="text-[11px] text-slate-400">{selectedArticle.authorRole}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400 ml-auto">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {selectedArticle.date}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {selectedArticle.readTime}</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {selectedArticle.views.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Article Cover */}
            <div className="h-48 sm:h-64 rounded-2xl bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 border border-sky-200/50 flex items-center justify-center text-7xl">
              {selectedArticle.imageEmoji}
            </div>

            {/* Actions bar */}
            <div className="flex items-center gap-3 py-3 border-y border-slate-100">
              <button
                onClick={() => toggleSave(selectedArticle.id)}
                className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all',
                  savedArticles.includes(selectedArticle.id) ? 'bg-sky-50 border-sky-200 text-sky-700' : 'bg-white border-slate-200 text-slate-600 hover:border-sky-300'
                )}
              >
                <Bookmark className={cn('h-3.5 w-3.5', savedArticles.includes(selectedArticle.id) && 'fill-current')} />
                {savedArticles.includes(selectedArticle.id) ? 'Tersimpan' : 'Simpan'}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:border-sky-300 transition-all">
                <Share2 className="h-3.5 w-3.5" /> Bagikan
              </button>
            </div>

            {/* Article Content */}
            <div className="prose prose-slate prose-sm max-w-none">
              {selectedArticle.content.split('\n\n').map((para, i) => (
                <p key={i} className="text-sm text-slate-700 leading-relaxed mb-4">{para}</p>
              ))}
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-slate-100">
              <span className="text-xs font-medium text-slate-400">Tags:</span>
              {['kesehatan', selectedArticle.category, 'edukasi', 'gaya hidup'].map((tag) => (
                <span key={tag} className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Related articles */}
            <div className="pt-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Artikel Terkait</h3>
              <div className="grid sm:grid-cols-3 gap-3">
                {ARTICLES.filter((a) => a.category === selectedArticle.category && a.id !== selectedArticle.id).slice(0, 3).map((article) => (
                  <button key={article.id} onClick={() => { setSelectedArticle(article); window.scrollTo(0, 0) }} className="rounded-xl bg-white border border-white/60 shadow-sm hover:shadow-md transition-all text-left p-4 group">
                    <div className="text-2xl mb-2">{article.imageEmoji}</div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-sky-700 transition-colors line-clamp-2">{article.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{article.readTime} • {article.date}</p>
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
