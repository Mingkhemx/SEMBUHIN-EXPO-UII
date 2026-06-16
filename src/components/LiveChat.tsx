import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  MessageCircle, X, Send, Bot, User, Phone, Calendar,
  FileText, Sparkles, Stethoscope, ChevronDown, Heart,
  Shield, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
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
  const [unread, setUnread]      = useState(1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: "user",
      timestamp: new Date(),
    };
    setMessages(p => [...p, userMsg]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setMessages(p => [
        ...p,
        { id: (Date.now() + 1).toString(), text: getBotResponse(text), sender: "bot", timestamp: new Date() },
      ]);
      setIsTyping(false);
    }, 1400);
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
            className="fixed right-6 z-50 w-[calc(100vw-3rem)] max-w-[400px] rounded-3xl overflow-hidden"
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
                      <span className="text-[11px] text-white/75">Online • Respons instan</span>
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

                {/* trust badges */}
                <div className="relative mt-3 flex items-center gap-3">
                  {[
                    { icon: Shield, label: "Terenkripsi" },
                    { icon: Clock,  label: "24/7 Aktif" },
                    { icon: Heart,  label: "Kesehatan" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold text-white/90">
                      <Icon className="h-3 w-3" /> {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Messages ────────────────────────────────────── */}
              <div
                className="overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide"
                style={{
                  height: 300,
                  minHeight: 300,
                  maxHeight: 300,
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
                      <div className={cn(
                        "max-w-[78%] rounded-2xl px-3.5 py-2.5",
                        msg.sender === "user"
                          ? "rounded-br-sm bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-md shadow-sky-500/20"
                          : "rounded-bl-sm bg-white border border-sky-100/80 text-foreground shadow-sm"
                      )}>
                        <p className="text-[13px] leading-relaxed">{msg.text}</p>
                        <p className={cn("text-[10px] mt-1 select-none",
                          msg.sender === "user" ? "text-white/60" : "text-muted-foreground")}>
                          {fmt(msg.timestamp)}
                        </p>
                      </div>
                      {msg.sender === "user" && (
                        <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 text-white mb-0.5">
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
                      <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                        <Bot className="h-3.5 w-3.5" />
                      </div>
                      <div className="rounded-2xl rounded-bl-sm bg-white border border-sky-100 px-4 py-3 shadow-sm">
                        <div className="flex gap-1.5 items-center">
                          {[0, 0.18, 0.36].map(delay => (
                            <motion.span
                              key={delay}
                              animate={{ y: [0, -5, 0] }}
                              transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut", delay }}
                              className="h-1.5 w-1.5 rounded-full bg-sky-400"
                            />
                          ))}
                        </div>
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
                    className="flex-1 rounded-2xl border border-sky-200 bg-sky-50/50 px-4 py-2.5 text-[13px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400 transition-all"
                  />
                  <motion.button
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => send(input)}
                    disabled={!input.trim()}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
