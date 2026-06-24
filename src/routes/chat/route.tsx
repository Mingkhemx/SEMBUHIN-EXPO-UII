import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Send,
  Phone,
  Video,
  ArrowLeft,
  CheckCheck,
  Check,
  Smile,
  Paperclip,
  MoreVertical,
  MessageCircle,
  Stethoscope,
  Brain,
  Heart,
  Leaf,
  Sparkles,
  Users,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/chat")({
  validateSearch: (s: any) => ({
    consultationId: s.consultationId as string | undefined,
  }),
  head: () => ({
    meta: [
      { title: "Chat Dokter — Sembuhin" },
      {
        name: "description",
        content: "Chat langsung dengan dokter dan psikolog terpercaya Sembuhin.",
      },
    ],
  }),
  component: ChatPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface Consultation {
  id: string;
  doctor_id: string | null;
  patient_id: string;
  doctor_name: string;
  doctor_specialty: string | null;
  doctor_hospital: string | null;
  doctor_avatar_url: string | null;
  appointment_date: string;
  appointment_time: string;
  consultation_type: string;
  complaint: string | null;
  consultation_status: string;
  payment_status: string;
  created_at: string;
}

interface ChatMessage {
  id: string;
  consultation_id: string;
  sender_id: string;
  sender_type: "patient" | "doctor";
  message_text: string;
  read_at: string | null;
  created_at: string;
}

interface DoctorListItem {
  consultation: Consultation;
  lastMessage: ChatMessage | null;
  unreadCount: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatLastSeen(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays === 1) return "kemarin";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function formatDayLabel(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Hari ini";
  if (diff === 1) return "Kemarin";
  return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" });
}

function defaultAvatar(name: string) {
  // Generate a consistent gradient based on name
  const colors = [
    "from-sky-500 to-cyan-400",
    "from-violet-500 to-purple-400",
    "from-rose-500 to-pink-400",
    "from-teal-500 to-emerald-400",
    "from-amber-500 to-orange-400",
  ];
  const idx = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  return colors[idx];
}

// ─── Main Component ───────────────────────────────────────────────────────────

function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const searchParams = useSearch({ from: "/chat" }) as { consultationId?: string };

  // Consultations list
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [consultationMessages, setConsultationMessages] = useState<Record<string, ChatMessage[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(
    searchParams.consultationId || null
  );
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">(
    searchParams.consultationId ? "chat" : "list"
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentMessages = selectedConsultationId
    ? (consultationMessages[selectedConsultationId] ?? [])
    : [];

  const selectedConsultation = consultations.find((c) => c.id === selectedConsultationId) ?? null;

  // ── Fetch consultations & messages ──
  useEffect(() => {
    if (!user || authLoading) return;
    let active = true;

    (async () => {
      setLoading(true);
      setError(null);

      // Fetch all paid consultations for this patient
      const { data, error: fetchErr } = await supabase
        .from("consultations")
        .select("*")
        .eq("patient_id", user.id)
        .eq("payment_status", "paid")
        .order("created_at", { ascending: false });

      if (!active) return;

      if (fetchErr) {
        console.warn("Gagal memuat konsultasi:", fetchErr.message);
        setError("Gagal memuat konsultasi. Pastikan tabel sudah dibuat.");
        setLoading(false);
        return;
      }

      const cons = data || [];
      setConsultations(cons);

      // Fetch messages for each consultation (last 50 each)
      const messagePromises = cons.map((c) =>
        supabase
          .from("consultation_messages")
          .select("*")
          .eq("consultation_id", c.id)
          .order("created_at", { ascending: true })
          .limit(50)
      );

      const messageResults = await Promise.all(messagePromises);
      if (!active) return;

      const msgMap: Record<string, ChatMessage[]> = {};
      messageResults.forEach((result, i) => {
        msgMap[cons[i].id] = (result.data || []) as ChatMessage[];
      });
      setConsultationMessages(msgMap);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [user, authLoading]);

  // ── Realtime: subscribe to new messages for all patient consultations ──
  useEffect(() => {
    if (!user || consultations.length === 0) return;

    const channel = supabase
      .channel("patient-chat-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "consultation_messages",
        },
        async (payload) => {
          const newMsg = payload.new as ChatMessage;
          if (!newMsg) return;

          // Only process messages for our consultations
          const belongsToUs = consultations.some((c) => c.id === newMsg.consultation_id);
          if (!belongsToUs) return;

          // Mark messages from doctor as read
          if (newMsg.sender_type === "doctor") {
            await supabase.rpc("mark_messages_read", {
              p_consultation_id: newMsg.consultation_id,
              p_as_sender_type: "patient",
            });
          }

          // Append to local state
          setConsultationMessages((prev) => {
            const existing = prev[newMsg.consultation_id] || [];
            // Avoid duplicate
            if (existing.some((m) => m.id === newMsg.id)) return prev;
            return {
              ...prev,
              [newMsg.consultation_id]: [...existing, newMsg],
            };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, consultations.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [currentMessages]);

  // ── Build doctor list items (grouped by doctor, show latest message) ──
  const doctorListItems: DoctorListItem[] = consultations.map((c) => {
    const msgs = consultationMessages[c.id] || [];
    const lastMessage = msgs.length > 0 ? msgs[msgs.length - 1] : null;
    const unreadCount = msgs.filter(
      (m) => m.sender_type === "doctor" && m.read_at === null
    ).length;
    return { consultation: c, lastMessage, unreadCount };
  });

  const filteredDoctors = doctorListItems.filter(
    (item) =>
      item.consultation.doctor_name.toLowerCase().includes(search.toLowerCase()) ||
      (item.consultation.doctor_specialty || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.consultation.complaint || "").toLowerCase().includes(search.toLowerCase())
  );

  // ── Send message ──
  const sendMessage = useCallback(async () => {
    if (!input.trim() || !selectedConsultationId || !user || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);

    const { error } = await supabase.from("consultation_messages").insert({
      consultation_id: selectedConsultationId,
      sender_id: user.id,
      sender_type: "patient",
      message_text: text,
    });

    if (error) {
      console.error("Gagal kirim pesan:", error);
      setInput(text); // restore
    }

    setSending(false);
  }, [input, selectedConsultationId, user, sending]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const openChat = (consultationId: string) => {
    setSelectedConsultationId(consultationId);
    setMobileView("chat");
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  // Group messages by day for date separators
  const groupedMessages = (() => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    for (const msg of currentMessages) {
      const day = new Date(msg.created_at).toDateString();
      const last = groups[groups.length - 1];
      if (last && last.date === day) {
        last.messages.push(msg);
      } else {
        groups.push({ date: day, messages: [msg] });
      }
    }
    return groups;
  })();

  // ── Auth guard ──
  if (!user && !authLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="h-20 w-20 rounded-3xl bg-sky-50 flex items-center justify-center border border-sky-100">
          <MessageCircle className="h-10 w-10 text-sky-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-700">Login untuk Chat</h3>
        <p className="text-sm text-slate-500">Silakan login untuk melihat dan membalas pesan konsultasi.</p>
        <button
          onClick={() => navigate({ to: "/auth" })}
          className="px-6 py-3 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600 transition-all"
        >
          Login / Register
        </button>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex h-[calc(100vh-7.5rem)] overflow-hidden rounded-2xl border border-slate-200/80 shadow-2xl shadow-slate-200/40 bg-white -mx-4">
      {/* ── LEFT SIDEBAR ────────────────────────────────────────────── */}
      <div
        className={cn(
          "flex flex-col w-full md:w-[320px] lg:w-[360px] flex-shrink-0 border-r border-slate-100",
          mobileView === "chat" ? "hidden md:flex" : "flex",
        )}
      >
        {/* Sidebar Header */}
        <div className="px-5 pt-5 pb-4 bg-gradient-to-br from-sky-50 via-cyan-50 to-white border-b border-slate-100">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-bold text-slate-800">Pesan</h2>
            <span className="text-xs font-medium text-sky-600 bg-sky-50 border border-sky-100 px-2.5 py-1 rounded-full">
              {filteredDoctors.length} konsultasi
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Chat langsung dengan dokter setelah pembayaran
          </p>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama dokter atau keluhan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 transition-all placeholder-slate-400"
            />
          </div>
        </div>

        {/* Doctor/Consultation List */}
        <div className="flex-1 overflow-y-auto bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-sky-400" />
              <p className="text-sm text-slate-400">Memuat konsultasi...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 px-6 text-center">
              <p className="text-sm text-rose-500">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-xs px-4 py-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400">
              <Search className="h-8 w-8 opacity-40" />
              <p className="text-sm">Belum ada konsultasi yang dibayar</p>
              <button
                onClick={() => navigate({ to: "/dokter" })}
                className="text-xs px-4 py-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors mt-2"
              >
                Pilih Dokter →
              </button>
            </div>
          ) : (
            filteredDoctors.map((item) => {
              const { consultation: c, lastMessage, unreadCount } = item;
              const isActive = selectedConsultationId === c.id;
              const doctorAvatar = c.doctor_avatar_url;

              return (
                <motion.button
                  key={c.id}
                  onClick={() => openChat(c.id)}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-slate-50 transition-colors",
                    isActive ? "bg-sky-50 border-r-[3px] border-r-sky-500" : "hover:bg-slate-50",
                  )}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {doctorAvatar ? (
                      <img
                        src={doctorAvatar}
                        alt={c.doctor_name}
                        className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div
                        className={cn(
                          "h-12 w-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm shadow-sm",
                          defaultAvatar(c.doctor_name)
                        )}
                      >
                        {c.doctor_name.replace(/^(Dr\.\s*)?/, "").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={cn(
                          "text-sm font-semibold truncate",
                          isActive ? "text-sky-700" : "text-slate-800",
                        )}
                      >
                        {c.doctor_name}
                      </span>
                      {lastMessage && (
                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                          {formatLastSeen(lastMessage.created_at)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <span className="text-xs text-slate-500 truncate">
                        {lastMessage
                          ? (lastMessage.sender_type === "patient" ? "Anda: " : "") + lastMessage.message_text
                          : c.consultation_type + " · " + c.doctor_specialty}
                      </span>
                      {unreadCount > 0 && (
                        <span className="flex-shrink-0 h-5 min-w-[20px] px-1 rounded-full bg-sky-500 text-white text-[10px] font-bold flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      </div>

      {/* ── RIGHT CHAT AREA ─────────────────────────────────────────── */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0",
          mobileView === "list" ? "hidden md:flex" : "flex",
        )}
      >
        {selectedConsultation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white shadow-sm z-10">
              {/* Back button (mobile) */}
              <button
                onClick={() => setMobileView("list")}
                className="md:hidden p-2 -ml-1 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors flex-shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              {selectedConsultation.doctor_avatar_url ? (
                <img
                  src={selectedConsultation.doctor_avatar_url}
                  alt={selectedConsultation.doctor_name}
                  className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                />
              ) : (
                <div
                  className={cn(
                    "h-10 w-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0",
                    defaultAvatar(selectedConsultation.doctor_name)
                  )}
                >
                  {selectedConsultation.doctor_name.replace(/^(Dr\.\s*)?/, "").slice(0, 2).toUpperCase()}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-800 truncate">{selectedConsultation.doctor_name}</h3>
                <p className="text-xs truncate">
                  <span className="text-emerald-600 font-medium">● Online</span>
                  <span className="text-slate-400"> · {selectedConsultation.doctor_specialty || "Dokter"}</span>
                </p>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  className="p-2 rounded-xl hover:bg-sky-50 text-slate-500 hover:text-sky-600 transition-colors"
                  title="Telepon"
                >
                  <Phone className="h-4 w-4" />
                </button>
                <button
                  className="p-2 rounded-xl hover:bg-sky-50 text-slate-500 hover:text-sky-600 transition-colors"
                  title="Video Call"
                >
                  <Video className="h-4 w-4" />
                </button>
                <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-5 space-y-1 bg-gradient-to-b from-slate-50/80 to-sky-50/20"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 50%, rgba(186,230,253,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(165,243,252,0.06) 0%, transparent 50%)",
              }}
            >
              {/* Empty state */}
              {currentMessages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-12 gap-4"
                >
                  <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-sky-100 to-cyan-100 flex items-center justify-center shadow-inner border border-sky-200/50">
                    <Users className="h-10 w-10 text-sky-400" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-700 text-base">{selectedConsultation.doctor_name}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{selectedConsultation.doctor_specialty || "Dokter Spesialis"}</p>
                    {selectedConsultation.complaint && (
                      <span className="inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full border bg-slate-50 text-slate-600 border-slate-200">
                        Keluhan: {selectedConsultation.complaint}
                      </span>
                    )}
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-2xl px-5 py-3 shadow-sm text-center max-w-xs">
                    <p className="text-xs text-slate-500">
                      👋 Mulai konsultasi dengan mengirim pesan pertamamu
                    </p>
                  </div>
                  {/* Quick start prompts */}
                  <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                    {[
                      "Dokter, saya ingin konsultasi",
                      "Saya punya keluhan...",
                      "Halo dok, ada yang ingin saya tanyakan",
                    ].map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => {
                          setInput(prompt);
                          inputRef.current?.focus();
                        }}
                        className="text-xs px-3 py-1.5 rounded-full bg-white border border-sky-200 text-sky-600 hover:bg-sky-50 transition-colors shadow-sm"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Grouped Messages */}
              {groupedMessages.map((group) => (
                <div key={group.date}>
                  {/* Date separator */}
                  <div className="flex justify-center my-4">
                    <span className="text-[10px] text-slate-400 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                      {formatDayLabel(group.messages[0].created_at)}
                    </span>
                  </div>

                  {/* Messages */}
                  <AnimatePresence initial={false}>
                    {group.messages.map((msg, i) => {
                      const isUser = msg.sender_type === "patient";
                      const prevMsg = group.messages[i - 1];
                      const showAvatar = !isUser && (!prevMsg || prevMsg.sender_type !== "doctor");

                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                          className={cn(
                            "flex gap-2 mb-1",
                            isUser ? "justify-end" : "justify-start",
                          )}
                        >
                          {/* Doctor avatar */}
                          {!isUser && (
                            <div className="flex-shrink-0 self-end mb-0.5">
                              {showAvatar ? (
                                selectedConsultation.doctor_avatar_url ? (
                                  <img
                                    src={selectedConsultation.doctor_avatar_url}
                                    alt=""
                                    className="h-7 w-7 rounded-full object-cover border-2 border-white shadow-sm"
                                  />
                                ) : (
                                  <div
                                    className={cn(
                                      "h-7 w-7 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[9px] font-bold",
                                      defaultAvatar(selectedConsultation.doctor_name)
                                    )}
                                  >
                                    {selectedConsultation.doctor_name.replace(/^(Dr\.\s*)?/, "").slice(0, 1)}
                                  </div>
                                )
                              ) : (
                                <div className="h-7 w-7" />
                              )}
                            </div>
                          )}

                          <div
                            className={cn(
                              "flex flex-col gap-0.5 max-w-[72%]",
                              isUser ? "items-end" : "items-start",
                            )}
                          >
                            <div
                              className={cn(
                                "px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                                isUser
                                  ? "bg-sky-500 text-white rounded-br-md"
                                  : "bg-white border border-slate-100 text-slate-700 rounded-bl-md",
                              )}
                            >
                              {msg.message_text}
                            </div>

                            {/* Timestamp + status */}
                            <div
                              className={cn(
                                "flex items-center gap-1 px-1",
                                isUser ? "flex-row" : "flex-row-reverse",
                              )}
                            >
                              {isUser &&
                                (msg.read_at ? (
                                  <CheckCheck className="h-3 w-3 text-sky-400" />
                                ) : (
                                  <Check className="h-3 w-3 text-slate-400" />
                                ))}
                              <span className="text-[10px] text-slate-400">
                                {formatTime(msg.created_at)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ))}

              {/* Sending indicator */}
              {sending && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2 items-end mt-1 justify-end"
                >
                  <div className="bg-sky-400 text-white rounded-2xl rounded-br-md px-4 py-3 shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Bar */}
            <div className="px-4 py-3 border-t border-slate-100 bg-white">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-400/20 transition-all">
                <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0">
                  <Smile className="h-5 w-5" />
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Kirim pesan ke ${selectedConsultation.doctor_name.split(" ").slice(1).join(" ")}...`}
                  className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none py-1.5 min-w-0"
                />

                <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0">
                  <Paperclip className="h-5 w-5" />
                </button>

                <motion.button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  whileTap={input.trim() && !sending ? { scale: 0.9 } : undefined}
                  className={cn(
                    "flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center transition-all",
                    input.trim() && !sending
                      ? "bg-sky-500 text-white hover:bg-sky-600 shadow-md shadow-sky-500/25"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed",
                  )}
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </motion.button>
              </div>

              <p className="text-[10px] text-slate-400 text-center mt-2">
                🔒 Pesan terenkripsi · Dijawab oleh tenaga medis terverifikasi Sembuhin
              </p>
            </div>
          </>
        ) : (
          /* ── Empty / No consultation selected ── */
          <div className="flex-1 flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-sky-50/40 to-white px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-5 text-center max-w-sm"
            >
              <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-sky-100 to-cyan-100 flex items-center justify-center shadow-inner border border-sky-200/50">
                <MessageCircle className="h-12 w-12 text-sky-400" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-700">Pilih Konsultasi</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Chat tersedia setelah pembayaran berhasil. Pilih konsultasi di sebelah kiri untuk memulai chat dengan dokter.
                </p>
              </div>

              {/* Category pills */}
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { label: "Jantung", icon: <Heart className="h-3 w-3" /> },
                  { label: "Saraf", icon: <Brain className="h-3 w-3" /> },
                  { label: "Mental Health", icon: <Sparkles className="h-3 w-3" /> },
                  { label: "Umum", icon: <Stethoscope className="h-3 w-3" /> },
                  { label: "Kulit", icon: <Leaf className="h-3 w-3" /> },
                ].map((cat) => (
                  <span
                    key={cat.label}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-medium shadow-sm"
                  >
                    {cat.icon}
                    {cat.label}
                  </span>
                ))}
              </div>

              <div className="bg-sky-50 border border-sky-100 rounded-2xl px-5 py-3 w-full">
                <p className="text-xs text-sky-700 font-medium">
                  💬 Pesan tersimpan otomatis — riwayat konsultasi bisa dibaca kapan saja
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
