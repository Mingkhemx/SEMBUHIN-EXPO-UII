import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  MessageCircle, X, Send, Bot, User, Phone, Calendar,
  FileText, Sparkles, Stethoscope, ChevronDown, Heart,
  Shield, Clock, LogIn, Star, MessageSquare, Loader2,
  Headphones, CreditCard, Settings, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface ChatMessage {
  id: string;
  consultation_id: string;
  sender_id: string;
  sender_type: "patient" | "doctor" | "admin";
  message_text: string;
  read_at: string | null;
  created_at: string;
}

const QUICK_REPLIES = [
  { icon: User,        text: "Masalah Akun",      color: "from-sky-500 to-sky-600", bg: "bg-sky-50 hover:bg-sky-100 border-sky-200 hover:border-sky-300" },
  { icon: CreditCard,  text: "Kendala Pembayaran", color: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 hover:border-emerald-300" },
  { icon: AlertCircle, text: "Laporan Bug",       color: "from-violet-500 to-violet-600", bg: "bg-violet-50 hover:bg-violet-100 border-violet-200 hover:border-violet-300" },
  { icon: Headphones,  text: "Butuh Bantuan",     color: "from-amber-500 to-amber-600", bg: "bg-amber-50 hover:bg-amber-100 border-amber-200 hover:border-amber-300" },
];

const INITIAL_MESSAGES = [
  {
    id: "welcome-1",
    message_text: "Halo! 👋 Ada yang bisa kami bantu hari ini?",
    sender_type: "admin" as const,
    created_at: new Date().toISOString(),
  },
  {
    id: "welcome-2",
    message_text: "Anda dapat bertanya langsung kepada tim Admin kami di sini.",
    sender_type: "admin" as const,
    created_at: new Date().toISOString(),
  },
];

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
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load or create consultation
  const loadConsultation = useCallback(async () => {
    if (!user) return;
    
    try {
      // Find active consultation for this user (support type)
      const { data, error } = await supabase
        .from('consultations')
        .select('id')
        .eq('patient_id', user.id)
        .eq('type', 'support')
        .eq('consultation_status', 'in_progress')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setConsultationId(data.id);
        fetchMessages(data.id);
      }
    } catch (err) {
      console.error("Error loading consultation:", err);
    }
  }, [user]);

  const fetchMessages = async (id: string) => {
    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('consultation_messages')
        .select('*')
        .eq('consultation_id', id)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages([...INITIAL_MESSAGES, ...data]);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadConsultation();
    }
  }, [user, loadConsultation]);

  // Real-time subscription
  useEffect(() => {
    if (!consultationId) return;

    const channel = supabase
      .channel(`chat:${consultationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'consultation_messages',
          filter: `consultation_id=eq.${consultationId}`
        },
        (payload) => {
          const newMsg = payload.new as any;
          setMessages(prev => {
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          
          if (!isOpen && newMsg.sender_type !== 'patient') {
            setUnread(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [consultationId, isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const send = async (text: string) => {
    if (!text.trim() || !user || sending) return;
    
    const messageText = text.trim();
    setInput("");
    setSending(true);

    try {
      let currentId = consultationId;

      // 1. Create consultation if not exists
      if (!currentId) {
        // Prepare data for support consultation
        const consultData = {
          patient_id: user.id,
          patient_name: user.user_metadata?.full_name || user.email,
          patient_phone: user.user_metadata?.phone || "0000000000",
          consultation_status: 'in_progress',
          type: 'support',
          // Dummy values for required fields in case SQL hasn't been run yet
          doctor_name: 'Admin Support',
          appointment_date: new Date().toISOString().split('T')[0],
          appointment_time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          consultation_type: 'Chat'
        };

        const { data: newConsult, error: consultError } = await supabase
          .from('consultations')
          .insert(consultData)
          .select()
          .single();

        if (consultError) throw consultError;
        currentId = newConsult.id;
        setConsultationId(currentId);
      }

      // 2. Insert message
      const { error: msgError } = await supabase
        .from('consultation_messages')
        .insert({
          consultation_id: currentId,
          sender_id: user.id,
          sender_type: 'patient',
          message_text: messageText
        });

      if (msgError) throw msgError;

    } catch (err) {
      console.error("Error sending message:", err);
      setInput(messageText); // restore input on error
    } finally {
      setSending(false);
    }
  };

  const fmt = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

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
            <div
              className="flex flex-col rounded-3xl border border-white/60 overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(24px) saturate(160%)",
                height: "auto",
              }}
            >
              {/* ── Header ──────────────────────────────────────── */}
              <div className="relative overflow-hidden px-5 py-4"
                style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 60%, #0369a1 100%)" }}>
                <div className="absolute inset-0 opacity-[0.07]"
                  style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "18px 18px" }} />
                <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-8 w-20 h-12 rounded-full bg-sky-300/20 blur-xl pointer-events-none" />

                <div className="relative flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md">
                        <Headphones className="h-5 w-5 text-white" />
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-400 border-2 border-white">
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-sm leading-tight">Bantuan Admin</span>
                        <Shield className="h-3 w-3 text-white/80" />
                      </div>
                      <span className="text-[11px] text-white/75">
                        Online • Siap membantu
                      </span>
                    </div>
                  </div>

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
                <div className="px-6 py-8 text-center">
                  <div className="flex h-20 w-20 mx-auto mb-4 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                    <LogIn className="h-10 w-10" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">
                    Login untuk Chat
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Silakan login untuk mulai berkonsultasi dengan tim Admin kami jika Anda membutuhkan bantuan.
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
                      {messages.map(msg => {
                        const isPatient = msg.sender_type === "patient";
                        return (
                          <motion.div
                            key={msg.id}
                            variants={msgVariants}
                            initial="hidden"
                            animate="visible"
                            className={cn("flex items-end gap-2", isPatient ? "justify-end" : "justify-start")}
                          >
                            {!isPatient && (
                              <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-xl bg-sky-100 text-sky-600 mb-0.5">
                                <Headphones className="h-3.5 w-3.5" />
                              </div>
                            )}
                            <div className="max-w-[78%]">
                              <div className={cn(
                                "px-3.5 py-2.5 rounded-2xl",
                                isPatient
                                  ? "rounded-br-sm bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                                  : "rounded-bl-sm bg-white border border-sky-100 shadow-md"
                              )}>
                                <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.message_text}</p>
                                <p className={cn("text-[10px] mt-1 select-none",
                                  isPatient ? "text-white/60" : "text-muted-foreground")}>
                                  {fmt(msg.created_at)}
                                </p>
                              </div>
                            </div>
                            {isPatient && (
                              <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 text-white mb-0.5 shadow-lg">
                                <User className="h-3.5 w-3.5" />
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {messages.length === 2 && !loadingMessages && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {QUICK_REPLIES.map((r, i) => (
                          <motion.button
                            key={i}
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
                      </div>
                    )}

                    {sending && (
                      <div className="flex justify-end">
                        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl rounded-br-sm bg-sky-500/20 text-sky-700">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span className="text-xs">Mengirim...</span>
                        </div>
                      </div>
                    )}

                    <div ref={bottomRef} />
                  </div>

                  <div className="px-4 pt-3 pb-4 bg-white border-t border-sky-100/80">
                    <div className="flex items-center gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && send(input)}
                        placeholder="Tanya admin bantuan…"
                        disabled={sending}
                        className="flex-1 rounded-2xl border border-sky-200 bg-sky-50/50 px-4 py-2.5 text-[13px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <motion.button
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => send(input)}
                        disabled={!input.trim() || sending}
                        aria-label="Kirim"
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-md shadow-sky-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <Send className="h-4 w-4" />
                      </motion.button>
                    </div>
                    <p className="mt-2.5 text-center text-[10px] text-muted-foreground/60 select-none">
                      🔒 Terhubung langsung dengan tim Admin Sembuhin
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
