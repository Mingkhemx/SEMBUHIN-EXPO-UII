import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  Search,
  Send,
  Phone,
  Video,
  CheckCheck,
  Check,
  Smile,
  Paperclip,
  MoreVertical,
  Users,
  FileText,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { DoctorLayout } from "@/panel-doctor/DoctorLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Consultation {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_phone: string;
  consultation_status: string;
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

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDayLabel(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Hari ini";
  if (diff === 1) return "Kemarin";
  return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" });
}

function formatRelative(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function defaultAvatar(name: string) {
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

// ─── Component ──────────────────────────────────────────────────────────────────

export function DoctorChat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const searchParams = useSearch({ from: "/doctor/chat" }) as { consultationId?: string };

  // Consultations list (patients sidebar)
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  // UI state
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(
    searchParams.consultationId || null
  );
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">(
    searchParams.consultationId ? "chat" : "list"
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedConsultation = consultations.find((c) => c.id === selectedConsultationId) ?? null;
  const currentMessages = selectedConsultationId
    ? (messages[selectedConsultationId] ?? [])
    : [];

  // ── Resolve doctor profile ──
  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("doctors")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (!active) return;
      if (data) setDoctorId(data.id);
    })();
    return () => { active = false; };
  }, [user]);

  // ── Fetch consultations & messages ──
  useEffect(() => {
    if (!doctorId) return;
    let active = true;

    (async () => {
      setLoading(true);
      // Fetch consultations with in_progress or completed status (paid)
      const { data, error } = await supabase
        .from("consultations")
        .select("id, patient_id, patient_name, patient_phone, consultation_status, created_at")
        .eq("doctor_id", doctorId)
        .in("consultation_status", ["scheduled", "in_progress", "completed"])
        .order("created_at", { ascending: false });

      if (!active) return;

      if (error || !data) {
        setLoading(false);
        return;
      }

      setConsultations(data as Consultation[]);

      // Fetch messages for each consultation
      const msgPromises = data.map((c) =>
        supabase
          .from("consultation_messages")
          .select("*")
          .eq("consultation_id", c.id)
          .order("created_at", { ascending: true })
          .limit(100)
      );

      const msgResults = await Promise.all(msgPromises);
      if (!active) return;

      const msgMap: Record<string, ChatMessage[]> = {};
      msgResults.forEach((result, i) => {
        msgMap[data[i].id] = (result.data || []) as ChatMessage[];
      });
      setMessages(msgMap);
      setLoading(false);
    })();

    return () => { active = false; };
  }, [doctorId]);

  // ── Realtime subscription for messages ──
  useEffect(() => {
    if (!doctorId || consultations.length === 0) return;

    const channel = supabase
      .channel("doctor-chat-realtime")
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

          const belongsToUs = consultations.some((c) => c.id === newMsg.consultation_id);
          if (!belongsToUs) return;

          // Mark patient messages as read
          if (newMsg.sender_type === "patient") {
            await supabase.rpc("mark_messages_read", {
              p_consultation_id: newMsg.consultation_id,
              p_as_sender_type: "doctor",
            });
          }

          setMessages((prev) => {
            const existing = prev[newMsg.consultation_id] || [];
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
  }, [doctorId, consultations.length]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [currentMessages]);

  const filteredConsultations = consultations.filter((c) =>
    c.patient_name.toLowerCase().includes(searchQuery.toLowerCase())
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
      sender_type: "doctor",
      message_text: text,
    });

    if (error) {
      console.error("Gagal kirim pesan:", error);
      setInput(text);
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
    // Update URL
    navigate({
      to: "/doctor/chat",
      search: { consultationId: consultationId },
    });
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  // Group messages by day
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

  // Get last message + unread count for sidebar
  const getLastMessage = (consultationId: string) => {
    const msgs = messages[consultationId] || [];
    return msgs.length > 0 ? msgs[msgs.length - 1] : null;
  };

  const getUnreadCount = (consultationId: string) => {
    if (consultationId === selectedConsultationId) return 0;
    return (messages[consultationId] || []).filter(
      (m) => m.sender_type === "patient" && m.read_at === null
    ).length;
  };

  return (
    <DoctorLayout title="Chat Pasien">
      {/* Split panel — patients list + chat area */}
      <div className="flex h-full -m-4 lg:-m-6">

        {/* Patients List */}
        <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-white flex-shrink-0"
          style={{ display: mobileView === "chat" ? "none" : undefined }}
        >
          {/* Search */}
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari pasien..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
            </div>
          </div>

          {/* Patients List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-5 w-5 animate-spin text-sky-400" />
              </div>
            ) : filteredConsultations.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
                Belum ada pasien
              </div>
            ) : (
              filteredConsultations.map((c) => {
                const lastMsg = getLastMessage(c.id);
                const unread = getUnreadCount(c.id);
                const isActive = selectedConsultationId === c.id;

                return (
                  <button
                    key={c.id}
                    onClick={() => openChat(c.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-slate-50 ${
                      isActive
                        ? "bg-sky-50 border-r-4 border-r-sky-500"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${defaultAvatar(c.patient_name)} flex items-center justify-center border border-white shadow-sm`}>
                        <Users className="h-5 w-5 text-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-sm font-semibold truncate ${
                            isActive ? "text-sky-700" : "text-slate-900"
                          }`}
                        >
                          {c.patient_name}
                        </span>
                        {lastMsg && (
                          <span className="text-[10px] text-slate-400 flex-shrink-0">
                            {formatRelative(lastMsg.created_at)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <span className="text-xs text-slate-500 truncate">
                          {lastMsg
                            ? (lastMsg.sender_type === "doctor" ? "Anda: " : "") + lastMsg.message_text
                            : `Konsultasi ${c.consultation_status.replace("_", " ")}`}
                        </span>
                        {unread > 0 && (
                          <span className="flex-shrink-0 h-5 min-w-[20px] px-1 rounded-full bg-sky-500 text-white text-[10px] font-bold flex items-center justify-center">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50"
          style={{ display: mobileView === "list" ? "none" : undefined }}
        >
          {selectedConsultation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white flex-shrink-0">
                <div className="flex items-center gap-3">
                  {/* Back button (mobile) */}
                  <button
                    onClick={() => setMobileView("list")}
                    className="md:hidden p-2 -ml-1 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors flex-shrink-0"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>

                  <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${defaultAvatar(selectedConsultation.patient_name)} flex items-center justify-center border border-white shadow-sm`}>
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{selectedConsultation.patient_name}</h3>
                    <p className="text-xs text-slate-500">
                      {selectedConsultation.patient_phone} ·{" "}
                      <span className="capitalize">{selectedConsultation.consultation_status.replace("_", " ")}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-lg hover:bg-sky-50 text-slate-500 hover:text-sky-600 transition-colors">
                    <Phone className="h-4 w-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-sky-50 text-slate-500 hover:text-sky-600 transition-colors">
                    <Video className="h-4 w-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-sky-100 text-slate-500 transition-colors">
                    <FileText className="h-4 w-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-sky-100 text-slate-500 transition-colors">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-5 space-y-2 bg-slate-50"
              >
                {currentMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                    <Users className="h-10 w-10 opacity-40" />
                    <p className="text-sm">Belum ada pesan. Mulai percakapan dengan pasien.</p>
                  </div>
                )}

                {groupedMessages.map((group) => (
                  <div key={group.date}>
                    <div className="flex justify-center my-4">
                      <span className="text-[10px] text-slate-400 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                        {formatDayLabel(group.messages[0].created_at)}
                      </span>
                    </div>
                    {group.messages.map((msg) => {
                      const isDoctor = msg.sender_type === "doctor";
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-2 mb-1 ${isDoctor ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`flex flex-col gap-0.5 max-w-[70%] ${
                              isDoctor ? "items-end" : "items-start"
                            }`}
                          >
                            <div
                              className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                isDoctor
                                  ? "bg-sky-500 text-white rounded-br-md"
                                  : "bg-white border border-slate-200 text-slate-900 rounded-bl-md"
                              }`}
                            >
                              {msg.message_text}
                            </div>

                            <div
                              className={`flex items-center gap-1 px-1 ${
                                isDoctor ? "flex-row" : "flex-row-reverse"
                              }`}
                            >
                              {isDoctor &&
                                (msg.read_at ? (
                                  <CheckCheck className="h-3 w-3 text-sky-400" />
                                ) : (
                                  <CheckCheck className="h-3 w-3 text-slate-400" />
                                ))}
                              <span className="text-[10px] text-slate-400">{formatTime(msg.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}

                {sending && (
                  <div className="flex justify-end mb-1">
                    <div className="bg-sky-400 text-white rounded-2xl rounded-br-md px-4 py-3 shadow-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="px-4 py-3 border-t border-slate-200 bg-white flex-shrink-0">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all">
                  <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0">
                    <Smile className="h-5 w-5" />
                  </button>

                  <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0">
                    <Paperclip className="h-5 w-5" />
                  </button>

                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Ketik pesan untuk ${selectedConsultation.patient_name}...`}
                    className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none py-1.5 min-w-0"
                  />

                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || sending}
                    className={`flex-shrink-0 h-9 w-9 rounded-lg flex items-center justify-center transition-all ${
                      input.trim() && !sending
                        ? "bg-sky-500 text-white hover:bg-sky-600 hover:shadow-md hover:shadow-sky-500/20"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            // No patient selected
            <div className="flex-1 flex flex-col items-center justify-center gap-6 bg-slate-50">
              <div className="h-24 w-24 rounded-3xl bg-sky-50 flex items-center justify-center border border-sky-100">
                <Users className="h-12 w-12 text-sky-400" />
              </div>
              <div className="text-center max-w-sm">
                <h3 className="text-lg font-semibold text-slate-900">Pilih Pasien</h3>
                <p className="text-sm text-slate-500 mt-2">
                  Pilih pasien dari daftar di sebelah kiri untuk memulai percakapan
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </DoctorLayout>
  );
}
