import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
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
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

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
type ViewMode = 'feed' | 'category'

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

interface CommentData {
  id: string
  author: string
  avatar: string
  role: string
  content: string
  timeAgo: string
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
const CATEGORIES = [
  { id: 'umum', name: 'Umum', color: 'text-slate-600', bgColor: 'bg-slate-50 border-slate-100' },
  { id: 'diabetes', name: 'Diabetes', color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-100' },
  { id: 'hipertensi', name: 'Hipertensi', color: 'text-red-600', bgColor: 'bg-red-50 border-red-100' },
  { id: 'jantung', name: 'Kesehatan Jantung', color: 'text-rose-600', bgColor: 'bg-rose-50 border-rose-100' },
  { id: 'mental', name: 'Kesehatan Mental', color: 'text-violet-600', bgColor: 'bg-violet-50 border-violet-100' },
  { id: 'pencernaan', name: 'Pencernaan', color: 'text-amber-600', bgColor: 'bg-amber-50 border-amber-100' },
  { id: 'kulit', name: 'Kesehatan Kulit', color: 'text-pink-600', bgColor: 'bg-pink-50 border-pink-100' },
]

// Mock data removed in favor of real database data

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
  const { user, isDoctor } = useAuth()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)

  // Inline comments state
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null)
  const [postComments, setPostComments] = useState<Record<string, CommentData[]>>({})
  const [loadingComments, setLoadingComments] = useState<string | null>(null)
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})

  const [newPostTitle, setNewPostTitle] = useState('')
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostCategory, setNewPostCategory] = useState('Umum')

  const loadPosts = async () => {
    try {
      setLoading(true)
      const { data: dbPosts, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error

      if (dbPosts && dbPosts.length > 0) {
        const mappedPosts: Post[] = await Promise.all(dbPosts.map(async (p: any) => {
          let liked = false
          let saved = false
          
          if (user) {
            const { data: likeData } = await supabase.from('community_post_likes').select('user_id').eq('post_id', p.id).eq('user_id', user.id).maybeSingle()
            if (likeData) liked = true
            
            const { data: saveData } = await supabase.from('community_post_saves').select('user_id').eq('post_id', p.id).eq('user_id', user.id).maybeSingle()
            if (saveData) saved = true
          }

          const cat = CATEGORIES.find(c => c.name === p.category)
          const categoryColor = cat?.bgColor.replace('bg-', '').replace('border-', '') || 'bg-slate-100 text-slate-700'

          return {
            id: p.id,
            author: p.author_name,
            avatar: p.author_avatar || p.author_name.charAt(0),
            role: p.author_role,
            category: p.category,
            categoryColor,
            timeAgo: formatDistanceToNow(new Date(p.created_at), { addSuffix: true, locale: localeId }),
            title: p.title,
            content: p.content,
            likes: p.likes_count,
            comments: p.comments_count,
            views: p.views_count,
            liked,
            saved,
            aiVerified: p.ai_verified,
            doctorReply: p.doctor_reply,
          }
        }))
        setPosts(mappedPosts)
      } else if (dbPosts && dbPosts.length === 0) {
        setPosts([]) // DB is empty
      }
    } catch (err) {
      console.error('Error loading posts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const toggleComments = async (post: Post) => {
    const postId = post.id
    // Toggle: if already expanded, collapse it
    if (expandedPostId === postId) {
      setExpandedPostId(null)
      return
    }

    setExpandedPostId(postId)

    // Increment view count on open
    if (user && postId.includes('-')) {
      supabase.from('community_posts').update({ views_count: post.views + 1 }).eq('id', postId)
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, views: p.views + 1 } : p))
    }

    // If already loaded, don't reload
    if (postComments[postId]) return

    setLoadingComments(postId)
    try {
      const { data, error } = await supabase
        .from('community_post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
      if (error) throw error
      if (data) {
        setPostComments(prev => ({
          ...prev,
          [postId]: data.map(c => ({
            id: c.id,
            author: c.author_name,
            avatar: c.author_avatar || c.author_name.charAt(0),
            role: c.author_role,
            content: c.content,
            timeAgo: formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: localeId })
          }))
        }))
      }
    } catch (err) {
      console.error('Error loading comments:', err)
    } finally {
      setLoadingComments(null)
    }
  }

  const submitComment = async (postId: string) => {
    if (!user) return alert('Anda harus login untuk membalas.')
    const commentText = commentInputs[postId]?.trim()
    if (!commentText) return

    const post = posts.find(p => p.id === postId)
    if (!post) return

    const authorName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
    const authorAvatar = authorName.charAt(0).toUpperCase()
    const role = isDoctor ? 'doctor' : 'patient'

    try {
      const { data, error } = await supabase
        .from('community_post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          author_name: authorName,
          author_avatar: authorAvatar,
          author_role: role,
          content: commentText,
        })
        .select()
        .single()
      if (error) throw error

      const newCommentCount = post.comments + 1
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: newCommentCount } : p))
      await supabase.from('community_posts').update({ comments_count: newCommentCount }).eq('id', postId)

      if (data) {
        setPostComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), {
            id: data.id,
            author: data.author_name,
            avatar: data.author_avatar,
            role: data.author_role,
            content: data.content,
            timeAgo: 'Baru saja'
          }]
        }))
      }
      setCommentInputs(prev => ({ ...prev, [postId]: '' }))
    } catch (err) {
      console.error('Error submitting comment:', err)
      alert('Gagal mengirim balasan.')
    }
  }

  const filteredPosts = posts.filter((p) => {
    const matchCategory = !activeCategory || p.category === activeCategory
    const matchSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

  const toggleLike = async (id: string) => {
    if (!user) return alert('Anda harus login untuk menyukai postingan.')
    
    // Check if it's a mock post (id is usually simple number or not uuid format)
    const isMock = !id.includes('-')
    
    const post = posts.find(p => p.id === id)
    if (!post) return
    
    const isLiked = post.liked
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, liked: !isLiked, likes: isLiked ? p.likes - 1 : p.likes + 1 } : p))
    
    if (isMock) return // Don't try to sync mock data to DB
    
    try {
      if (isLiked) {
        await supabase.from('community_post_likes').delete().eq('post_id', id).eq('user_id', user.id)
        await supabase.from('community_posts').update({ likes_count: post.likes - 1 }).eq('id', id)
      } else {
        await supabase.from('community_post_likes').insert({ post_id: id, user_id: user.id })
        await supabase.from('community_posts').update({ likes_count: post.likes + 1 }).eq('id', id)
      }
    } catch (err) {
      console.error('Like error:', err)
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, liked: isLiked, likes: post.likes } : p))
    }
  }

  const toggleSave = async (id: string) => {
    if (!user) return alert('Anda harus login untuk menyimpan postingan.')
    
    const isMock = !id.includes('-')
    const post = posts.find(p => p.id === id)
    if (!post) return
    
    const isSaved = post.saved
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, saved: !isSaved } : p))
    
    if (isMock) return
    
    try {
      if (isSaved) {
        await supabase.from('community_post_saves').delete().eq('post_id', id).eq('user_id', user.id)
      } else {
        await supabase.from('community_post_saves').insert({ post_id: id, user_id: user.id })
      }
    } catch (err) {
      console.error('Save error:', err)
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, saved: isSaved } : p))
    }
  }

  const submitPost = async () => {
    if (!user) return alert('Anda harus login untuk membuat postingan.')
    if (!newPostTitle.trim() || !newPostContent.trim()) return

    const authorName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
    const authorAvatar = authorName.charAt(0).toUpperCase()
    const role = isDoctor ? 'doctor' : 'patient'

    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          author_name: authorName,
          author_avatar: authorAvatar,
          author_role: role,
          category: newPostCategory,
          title: newPostTitle,
          content: newPostContent,
        })
        .select()
        .single()
      
      if (error) throw error
      
      if (data) {
        const cat = CATEGORIES.find(c => c.name === data.category)
        const categoryColor = cat?.bgColor.replace('bg-', '').replace('border-', '') || 'bg-slate-100 text-slate-700'
        
        const newPost: Post = {
          id: data.id,
          author: data.author_name,
          avatar: data.author_avatar,
          role: data.author_role as 'patient' | 'doctor' | 'moderator',
          category: data.category,
          categoryColor,
          timeAgo: 'Baru saja',
          title: data.title,
          content: data.content,
          likes: 0,
          comments: 0,
          views: 0,
          liked: false,
          saved: false,
        }
        setPosts(prev => [newPost, ...prev])
      }
      
      setNewPostTitle('')
      setNewPostContent('')
      setShowCreatePost(false)
    } catch (err: any) {
      console.error('Submit post error:', err)
      alert(`Gagal menerbitkan postingan: ${err.message || 'Pastikan tabel community_posts sudah dibuat.'}`)
    }
  }

  return (
    <div className="relative z-10 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-14">

        {/* ── Hero Card ─────────────────────────────────────── */}
        <motion.div
          variants={fadeIn} initial="hidden" animate="visible"
          className="rounded-3xl shadow-2xl shadow-orange-500/25 overflow-hidden relative min-h-[360px]"
        >
          {/* Background image */}
          <img
            src="/images/komunitas.png"
            alt="Komunitas Pasien"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-900/90 via-amber-800/70 to-rose-700/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          <div className="relative z-10 p-8 sm:p-12 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-4 py-1.5 mb-5 backdrop-blur-sm">
              <Users className="h-3.5 w-3.5 text-orange-200" />
              <span className="text-xs font-semibold text-white/90 tracking-wide uppercase">Komunitas Pasien</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
              Saling Berbagi,<br className="hidden sm:block" /> Saling Menguatkan
            </h1>
            <p className="mt-3 text-base sm:text-lg text-orange-100 leading-relaxed max-w-lg">
              Berbagi pengalaman, bertanya, dan belajar bersama pasien lain. Dimoderasi dokter, klaim medis divalidasi AI.
            </p>

            {/* Quick stats */}
            <div className="flex items-center gap-8 mt-6">
              {[['15K+', 'Anggota'], ['6', 'Kategori'], ['24/7', 'Moderasi AI']].map(([v, l]) => (
                <div key={l}>
                  <div className="text-2xl font-bold text-white">{v}</div>
                  <div className="text-[10px] text-orange-200 uppercase tracking-widest">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

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

        {/* ── Create Post Modal Overlay ─────────────────────────────────── */}
        {showCreatePost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreatePost(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-base font-bold text-slate-800">Buat Postingan Baru</h3>
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="text-sm font-medium text-slate-700 w-24 shrink-0">Kategori</span>
                  <select
                    value={newPostCategory}
                    onChange={(e) => setNewPostCategory(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col gap-2">
                  <input
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="Judul postingan..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-colors"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Ceritakan pengalaman atau pertanyaan Anda secara detail..."
                    rows={6}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-colors resize-none"
                  />
                </div>
              </div>
              
              <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <Bot className="h-4 w-4 text-sky-500" />
                  <p className="text-[11px] font-medium">Klaim medis akan divalidasi oleh AI</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setShowCreatePost(false)}
                    className="flex-1 sm:flex-none rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={submitPost}
                    disabled={!newPostTitle.trim() || !newPostContent.trim()}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-600/20 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Send className="h-4 w-4" /> Publikasikan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
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
              const isActive = activeCategory === cat.name
              
              // Calculate real counts from backend data
              const catPosts = posts.filter(p => p.category === cat.name)
              const membersCount = new Set(catPosts.map(p => p.author)).size
              
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(isActive ? null : cat.name)}
                  className={cn(
                    'rounded-xl border p-3 text-center transition-all hover:shadow-md',
                    isActive ? 'bg-orange-50 border-orange-200 shadow-md ring-2 ring-orange-400/30' : 'bg-white border-slate-100 shadow-sm hover:border-orange-200'
                  )}
                >
                  <p className={cn('text-sm font-bold mt-1 mb-1', isActive ? 'text-orange-700' : 'text-slate-700')}>{cat.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{membersCount.toLocaleString()} anggota</p>
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

          {filteredPosts.map((post) => {
            const isExpanded = expandedPostId === post.id
            const comments = postComments[post.id] || []
            const isLoadingThis = loadingComments === post.id
            const commentInput = commentInputs[post.id] || ''
            return (
            <div key={post.id} className="rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 hover:shadow-xl transition-all overflow-hidden">
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
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-2">{post.title}</h3>
                  <p className={cn('text-sm text-slate-600 leading-relaxed mb-3', !isExpanded && 'line-clamp-3')}>{post.content}</p>
                </div>

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
                  <button onClick={() => toggleComments(post)} className={cn('flex items-center gap-1.5 text-xs font-medium transition-colors', isExpanded ? 'text-sky-500' : 'text-slate-400 hover:text-sky-500')}>
                    <MessageCircle className={cn('h-4 w-4', isExpanded && 'fill-current/20')} /> {post.comments}
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

              {/* ── Inline Comments ──────────────────────────── */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="border-t border-slate-100 bg-slate-50/60"
                >
                  <div className="p-4 space-y-3">
                    {/* Comment List */}
                    {isLoadingThis ? (
                      <div className="animate-pulse space-y-3">
                        {[1,2].map(i => (
                          <div key={i} className="flex gap-3">
                            <div className="h-8 w-8 bg-slate-200 rounded-xl shrink-0" />
                            <div className="flex-1 space-y-1.5">
                              <div className="h-3 bg-slate-200 rounded w-1/4" />
                              <div className="h-8 bg-slate-200 rounded" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : comments.length === 0 ? (
                      <div className="flex items-center gap-2 py-3 text-slate-400">
                        <MessageCircle className="h-4 w-4" />
                        <p className="text-xs">Belum ada balasan. Jadilah yang pertama!</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <div className={cn(
                              'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold',
                              comment.role === 'doctor' ? 'bg-emerald-100 text-emerald-700' : comment.role === 'moderator' ? 'bg-orange-100 text-orange-700' : 'bg-white text-slate-600 border border-slate-200'
                            )}>
                              {comment.avatar}
                            </div>
                            <div className="flex-1 bg-white rounded-xl px-3 py-2.5 border border-slate-100 shadow-sm">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-slate-800">{comment.author}</span>
                                <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded-full', ROLE_BADGES[comment.role]?.className)}>
                                  {ROLE_BADGES[comment.role]?.label}
                                </span>
                                <span className="text-[10px] text-slate-400 ml-auto">{comment.timeAgo}</span>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Input */}
                    <div className="flex gap-2 pt-1">
                      <textarea
                        value={commentInput}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(post.id) } }}
                        placeholder={user ? 'Tulis balasan... (Enter untuk kirim)' : 'Login untuk membalas'}
                        disabled={!user}
                        rows={1}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 resize-none disabled:opacity-50 placeholder:text-slate-400"
                      />
                      <button
                        onClick={() => submitComment(post.id)}
                        disabled={!user || !commentInput.trim()}
                        className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-3 py-2 shadow-sm transition-all active:scale-95 disabled:opacity-40"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )})
          }
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
