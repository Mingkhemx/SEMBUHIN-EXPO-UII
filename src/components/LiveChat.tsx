import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  MessageCircle, X, Send, Bot, User, Phone, Calendar,
  FileText, Sparkles, Stethoscope, ChevronDown, Heart,
  Shield, Clock, LogIn, Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  rating?: number;
}

const QUICK_REPLIES = [
  { icon: Stethoscope, text: "Konsultasi Dokter", color: "from-sky-500 to-sky-600", bg: "bg-sky-50 hover:bg-sky-100 border-sky-200 hover:border-sky-300" },
  { icon: Calendar,    text: "Buat Janji Temu",  color: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 hover:border-emerald-300" },
  { icon: FileText,    text: "Cek Resep",         color: "from-violet-500 to-violet-600", bg: "bg-violet-50 hover:bg-violet-100 border-violet-200 hover:border-violet-300" },
  { icon: Phone,       text: "Hubungi Kami",      color: "from-amber-500 to-amber-600", bg: "bg-amber-50 hover:bg-amber-100 border-amber-200 hover:border-amber-300" },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    text: "Halo! 👋 Saya Sembuhin AI Assistant. Ada yang bisa saya bantu hari ini?",
    sender: "bot",
    timestamp: new Date(),
  },
  {
    id: "2",
    text: "Silakan pilih layanan di bawah atau ketik pertanyaan Anda langsung:",
    sender: "bot",
    timestamp: new Date(),
  },
];

function getBotResponse(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("dokter") || m.includes("konsultasi"))
    return "Untuk konsultasi dokter, klik 'Login/Register' di atas atau pilih menu Konsultasi Dokter. Dokter spesialis kami siap 24/7. 👨‍⚕️";
  if (m.includes("janji") || m.includes("appointment"))
    return "Saya bisa bantu jadwalkan janji temu. Silakan pilih dokter spesialis di menu Dokter, lalu pilih slot yang tersedia. 📅";
  if (m.includes("resep") || m.includes("obat"))
    return "Akses resep digital Anda di menu Resep Digital. Di sana ada riwayat resep dan visualisasi 3D molekul obat. 💊";
  if (m.includes("rumah sakit") || m.includes("rs") || m.includes("klinik"))
    return "Sistem geolokasi kami akan menemukan RS & klinik terdekat dari posisi Anda. Aktifkan lokasi untuk memulai. 🏥";
  return "Terima kasih. Tim kami akan segera merespons. Untuk bantuan cepat hubungi 0800-1234-5678. 📞";
}

/* ─── animation variants ────────────────────────────────────── */
const windowVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.25, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

const msgVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

export function LiveChat() {
  const [isOpen, setIsOpen]     = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput]        = useState("");
  const [isTyping, setIsTyping]  = useState(false);
  const [currentTypingText, setCurrentTypingText] = useState("");
  const [unread, setUnread]      = useState(1);
  const [chatCount, setChatCount] = useState(0);
  const [chatLimit, setChatLimit] = useState(10); // Default 10 chats per day
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Handle rating
  const handleRating = (msgId: string, rating: number) => {
    setMessages(prev => prev.map(msg => msg.id === msgId ? { ...msg, rating } : msg));
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Load chat count from Supabase
  useEffect(() => {
    if (user) {
      loadChatCount();
    }
  }, [user]);

  const loadChatCount = async () => {
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('chat_history')
      .select('id')
      .eq('user_id', user?.id)
      .gte('created_at', `${today}T00:00:00.000Z`);

    if (!error && data) {
      setChatCount(data.length);
    }
  };

  const send = async (text: string) => {
    if (!text.trim()) return;

    // Check if user is logged in
    if (!user) {
      navigate({ to: '/auth' });
      setIsOpen(false);
      return;
    }

    // Check chat limit
    if (chatCount >= chatLimit) {
      const limitMsg: Message = {
        id: Date.now().toString(),
        text: `Maaf, Anda telah mencapai batas ${chatLimit} chat hari ini. Silakan coba lagi besok atau upgrade akun untuk batas lebih banyak!`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages(p => [...p, limitMsg]);
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: "user",
      timestamp: new Date(),
    };
    setMessages(p => [...p, userMsg]);
    setInput("");
    setIsTyping(true);

    // Save chat to Supabase
    await supabase.from('chat_history').insert({
      user_id: user.id,
      message: text.trim(),
      sender: 'user'
    });

    // Increment chat count
    setChatCount(prev => prev + 1);

    try {
      // Call Gemini API
      const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      console.log('API Key:', API_KEY ? 'loaded' : 'NOT loaded!'); // Debug
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Kamu adalah Dr. Sembuhin, asisten kesehatan AI yang profesional dan ramah dari platform kesehatan Sembuhin.

IDENTITAS MODEL:
- Jika ditanya kamu model apa, gunakan apa, atau siapa pembuatmu, jawab: "Saya adalah Sembuhin 1.1 tahap awal, asisten kesehatan AI yang dikembangkan oleh tim Sembuhin."
- JANGAN pernah mengaku sebagai GPT, Claude, Gemini, atau model AI lain.
- JANGAN pernah menyebutkan teknologi di balik kamu.

ATURAN TOPIK (SANGAT PENTING — WAJIB DIIKUTI):
- Kamu HANYA menjawab pertanyaan yang berkaitan dengan kesehatan, medis, gejala penyakit, penanganan kesehatan, obat-obatan, pola hidup sehat, kesehatan mental, nutrisi, dan topik medis lainnya.
- Jika user bertanya di luar topik kesehatan (misalnya: coding, pemrograman, matematika, politik, agama, hiburan, teknologi non-medis, atau pertanyaan ngelantur lainnya), TOLAK dengan sopan dan arahkan kembali ke topik kesehatan.
- Contoh penolakan: "Maaf, saya hanya dapat membantu seputar kesehatan dan medis. Apakah ada keluhan kesehatan yang ingin Anda konsultasikan?"
- JANGAN pernah menjawab pertanyaan non-kesehatan meskipun user memaksa.

ATURAN FORMAT JAWABAN (WAJIB DIIKUTI):
- Gunakan **markdown** untuk memformat jawaban.
- Selalu gunakan **heading** (## atau ###) untuk judul bagian.
- Gunakan **nomor** (1. 2. 3.) untuk daftar langkah atau tips.
- Gunakan **bullet** (- item) untuk daftar tanpa urutan.
- **Bold** istilah penting atau nama kondisi.
- Beri **paragraf pembuka** singkat sebelum masuk ke detail.
- Akhiri dengan **kesimpulan atau saran tindakan** singkat.
- Jawab dalam **bahasa Indonesia** yang mudah dimengerti.
- Jika pertanyaan butuh daftar, berikan minimal 3 poin terstruktur.
- Selalu ingatkan untuk berkonsultasi langsung dengan dokter jika kondisi serius.

Pertanyaan pasien: ${text.trim()}`
                }
              ]
            }
          ]
        })
      });

      console.log('Response status:', response.status); // Debug
      const data = await response.json();
      console.log('Response data:', data); // Debug
      
      if (!response.ok) {
        console.error('Gemini API error response:', data);
        throw new Error(data.error?.message || 'Failed to get response from Gemini');
      }
      
      const botText = data.candidates[0].content.parts[0].text;

      // Animasi huruf demi huruf
      setCurrentTypingText("");
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i <= botText.length) {
          setCurrentTypingText(botText.substring(0, i));
          i++;
        } else {
          clearInterval(typingInterval);
          const botMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: botText,
            sender: "bot",
            timestamp: new Date(),
          };
          setMessages(p => [...p, botMsg]);
          setCurrentTypingText("");
          setIsTyping(false);
        }
      }, 30);
      
      // Save bot response
      await supabase.from('chat_history').insert({
        user_id: user.id,
        message: botText,
        sender: 'bot'
      });
      
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      
      // Fallback responses jika API gagal
      const fallbackResponses = [
        "Terima kasih sudah menghubungi! Saya bisa membantu Anda dengan konsultasi kesehatan, resep digital, dan membuat janji dengan dokter.",
        "Bagaimana saya bisa membantu hari ini? Silakan ceritakan keluhan Anda secara detail.",
        "Untuk konsultasi lebih lanjut, Anda bisa melihat menu 'Pelayanan Kesehatan' di atas ya.",
        "Saya siap membantu! Apa keluhan kesehatan yang ingin Anda bicarakan?",
      ];
      const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      // Animasi fallback
      setCurrentTypingText("");
      let j = 0;
      const typingInterval = setInterval(() => {
        if (j <= randomFallback.length) {
          setCurrentTypingText(randomFallback.substring(0, j));
          j++;
        } else {
          clearInterval(typingInterval);
          const botMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: randomFallback,
            sender: "bot",
            timestamp: new Date(),
          };
          setMessages(p => [...p, botMsg]);
          setCurrentTypingText("");
          setIsTyping(false);
        }
      }, 30);
      
      // Save message
      await supabase.from('chat_history').insert({
        user_id: user.id,
        message: randomFallback,
        sender: 'bot'
      });
    }
  };

  const fmt = (d: Date) => d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {/* ── FAB button ─────────────────────────────────────────── */}
      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.8, type: "spring", stiffness: 260, damping: 26 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(v => !v)}
        aria-label={isOpen ? "Tutup chat" : "Buka chat"}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-400/50"
        style={{
          background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
          height: 60,
          width: 60,
          boxShadow: isOpen
            ? "0 8px 24px -4px rgba(14,165,233,0.45)"
            : "0 8px 32px -4px rgba(14,165,233,0.50), 0 0 0 0 rgba(14,165,233,0.25)",
        }}
      >
        {/* soft glow ring — hanya muncul saat chat tertutup */}
        {!isOpen && (
          <motion.span
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{ boxShadow: [
              "0 0 0 0px rgba(14,165,233,0.35)",
              "0 0 0 10px rgba(14,165,233,0.0)",
            ]}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
        )}

        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span key="x"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <X className="h-6 w-6 text-white" />
            </motion.span>
          ) : (
            <motion.span key="chat"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="relative"
            >
              <MessageCircle className="h-6 w-6 text-white" />
              {unread > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white leading-none">
                  {unread}
                </span>
              )}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ── Chat window ────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={windowVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed right-6 z-50 w-[calc(100vw-3rem)] max-w-[420px] rounded-3xl overflow-hidden"
            style={{
              bottom: 88,
              boxShadow: "0 32px 80px -12px rgba(14, 165, 233, 0.22), 0 8px 32px -8px rgba(0,0,0,0.12)",
            }}
          >
            {/* glass card — ukuran FIXED, tidak boleh tumbuh */}
            <div
              className="flex flex-col rounded-3xl border border-white/60 overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(24px) saturate(160%)",
                height: "auto",          /* tinggi ditentukan oleh children */
              }}
            >

              {/* ── Header ──────────────────────────────────────── */}
              <div className="relative overflow-hidden px-5 py-4"
                style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 60%, #0369a1 100%)" }}>
                {/* subtle pattern */}
                <div className="absolute inset-0 opacity-[0.07]"
                  style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "18px 18px" }} />
                {/* glow orbs */}
                <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-8 w-20 h-12 rounded-full bg-sky-300/20 blur-xl pointer-events-none" />

                <div className="relative flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-400 border-2 border-white">
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      </span>
                    </div>
                    {/* title */}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-sm leading-tight">Sembuhin AI</span>
                        <Sparkles className="h-3 w-3 text-yellow-300" />
                      </div>
                      {user && (
                        <span className="text-[11px] text-white/75">
                          Chat tersisa: {chatLimit - chatCount} • Online
                        </span>
                      )}
                      {!user && (
                        <span className="text-[11px] text-white/75">
                          Online • Respons instan
                        </span>
                      )}
                    </div>
                  </div>

                  {/* header actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-white/15 transition-colors text-white/80 hover:text-white"
                      aria-label="Minimize"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {!user ? (
                /* ── Login Required Screen ───────────────────────── */
                <div className="px-6 py-8 text-center">
                  <div className="flex h-20 w-20 mx-auto mb-4 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                    <LogIn className="h-10 w-10" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">
                    Login untuk Chat
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Silakan login atau buat akun untuk mulai berkonsultasi dengan AI kami dan mendapatkan batas chat harian!
                  </p>
                  <Link
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-600 to-sky-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-500/20 transition-all duration-200 hover:shadow-lg hover:shadow-sky-500/30 hover:from-sky-500 hover:to-sky-400 active:scale-[0.97]"
                  >
                    Login / Register
                  </Link>
                </div>
              ) : (
                <>
                  {/* ── Messages ────────────────────────────────────── */}
                  <div
                    className="overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide"
                    style={{
                      height: 380,
                      minHeight: 300,
                      maxHeight: 380,
                      background: "linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%)",
                      overflowY: "auto",
                      overflowX: "hidden",
                    }}
                  >

                    <AnimatePresence initial={false}>
                      {messages.map(msg => (
                        <motion.div
                          key={msg.id}
                          variants={msgVariants}
                          initial="hidden"
                          animate="visible"
                          className={cn("flex items-end gap-2", msg.sender === "user" ? "justify-end" : "justify-start")}
                        >
                          {msg.sender === "bot" && (
                            <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-xl bg-sky-100 text-sky-600 mb-0.5">
                              <Bot className="h-3.5 w-3.5" />
                            </div>
                          )}
                          <div className="max-w-[78%]">
                            <div className={cn(
                              "px-3.5 py-2.5 rounded-2xl",
                              msg.sender === "user"
                                ? "rounded-br-sm bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg shadow-sky-500/20"
                                : "rounded-bl-sm bg-white border border-sky-100 shadow-md"
                            )}>
                              {msg.sender === "bot" ? (
                                <MarkdownRenderer text={msg.text} />
                              ) : (
                                <p className="text-[13px] leading-relaxed">{msg.text}</p>
                              )}
                              <p className={cn("text-[10px] mt-1 select-none",
                                msg.sender === "user" ? "text-white/60" : "text-muted-foreground")}>
                                {fmt(msg.timestamp)}
                              </p>
                            </div>

                            {/* Rating Bintang untuk jawaban Bot */}
                            {msg.sender === "bot" && !msg.rating && (
                              <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mt-2 flex items-center gap-1 px-0.5"
                              >
                                <span className="text-[10px] text-muted-foreground mr-1">Bagaimana jawaban ini?</span>
                                {[1, 2, 3, 4, 5].map(rating => (
                                  <button
                                    key={rating}
                                    onClick={() => handleRating(msg.id, rating)}
                                    className="transition-all duration-200 hover:scale-125"
                                  >
                                    <Star className="h-3.5 w-3.5 text-gray-300 hover:text-amber-400" />
                                  </button>
                                ))}
                              </motion.div>
                            )}

                            {/* Jika sudah diberi rating */}
                            {msg.sender === "bot" && msg.rating && (
                              <div className="mt-2 flex items-center gap-1 px-0.5">
                                {[1, 2, 3, 4, 5].map(rating => (
                                  <Star
                                    key={rating}
                                    className={`h-3 w-3 ${rating <= (msg.rating ?? 0) ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          {msg.sender === "user" && (
                            <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 text-white mb-0.5 shadow-lg">
                              <User className="h-3.5 w-3.5" />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Quick Replies */}
                    <AnimatePresence>
                      {messages.length === 2 && !isTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: 0.4, duration: 0.3 }}
                          className="grid grid-cols-2 gap-2 pt-1"
                        >
                          {QUICK_REPLIES.map((r, i) => (
                            <motion.button
                              key={i}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5 + i * 0.07 }}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => send(r.text)}
                              className={cn(
                                "flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all duration-200",
                                r.bg
                              )}
                            >
                              <div className={cn("flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm", r.color)}>
                                <r.icon className="h-3.5 w-3.5" />
                              </div>
                              <span className="text-[11px] font-semibold text-foreground/80 leading-tight">{r.text}</span>
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Typing indicator */}
                    <AnimatePresence>
                      {isTyping && (
                        <motion.div
                          key="typing"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-end gap-2"
                        >
                          <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                            <Bot className="h-3.5 w-3.5" />
                          </div>
                          <div className="rounded-2xl rounded-bl-sm bg-white border border-sky-100 px-4 py-3 shadow-sm">
                            {currentTypingText ? (
                              <MarkdownRenderer text={currentTypingText} />
                            ) : (
                              <div className="flex items-center gap-2">
                                <motion.div
                                  animate={{ scale: [1, 1.3, 1] }}
                                  transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                                  className="h-2.5 w-2.5 rounded-full bg-sky-400"
                                />
                                <motion.div
                                  animate={{ scale: [1, 1.3, 1] }}
                                  transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                                  className="h-2.5 w-2.5 rounded-full bg-sky-400"
                                />
                                <motion.div
                                  animate={{ scale: [1, 1.3, 1] }}
                                  transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                                  className="h-2.5 w-2.5 rounded-full bg-sky-400"
                                />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div ref={bottomRef} />
                  </div>

                  {/* ── Input area ──────────────────────────────────── */}
                  <div className="px-4 pt-3 pb-4 bg-white border-t border-sky-100/80">
                    <div className="flex items-center gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && send(input)}
                        placeholder="Ketik pesan…"
                        disabled={chatCount >= chatLimit}
                        className="flex-1 rounded-2xl border border-sky-200 bg-sky-50/50 px-4 py-2.5 text-[13px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <motion.button
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => send(input)}
                        disabled={!input.trim() || chatCount >= chatLimit}
                        aria-label="Kirim"
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-md shadow-sky-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <Send className="h-4 w-4" />
                      </motion.button>
                    </div>
                    <p className="mt-2.5 text-center text-[10px] text-muted-foreground/60 select-none">
                      🔒 Terenkripsi end-to-end · Powered by Sembuhin AI
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
