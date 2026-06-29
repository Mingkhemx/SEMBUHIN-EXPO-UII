/**
 * AdminLiveChat — Monitor & balas semua sesi live chat user-dokter
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Send, CheckCircle, Info, MessageSquare, Loader2 } from "lucide-react";
import { AdminLayout } from "@/panel-admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

// ─── Types ────────────────────────────────────────────────────────────────────

type Sender = "patient" | "doctor" | "admin";
type SessionStatus = "scheduled" | "in_progress" | "completed";

interface ChatMessage {
  id: string;
  consultation_id: string;
  sender_id: string;
  sender_type: Sender;
  message_text: string;
  read_at: string | null;
  created_at: string;
}

interface ChatSession {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_phone: string;
  consultation_status: SessionStatus;
  created_at: string;
  lastMessage?: ChatMessage | null;
  unreadCount: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_DOT: Record<SessionStatus, string> = {
  in_progress: "bg-emerald-400",
  scheduled: "bg-amber-400",
  completed: "bg-slate-300",
};

const STATUS_LABEL: Record<SessionStatus, string> = {
  in_progress: "Aktif",
  scheduled: "Terjadwal",
  completed: "Selesai",
};

const STATUS_TEXT: Record<SessionStatus, string> = {
  in_progress: "text-emerald-600",
  scheduled: "text-amber-600",
  completed: "text-slate-400",
};

type Filter = "all" | SessionStatus;

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminLiveChat() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [adminReply, setAdminReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selected = sessions.find((s) => s.id === selectedId) ?? null;
  const currentMessages = selectedId ? (messages[selectedId] ?? []) : [];

  // Fetch initial sessions
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const { data: consultations, error: consultError } = await supabase
        .from("consultations")
        .select(`
          id, 
          patient_id, 
          patient_name, 
          patient_phone, 
          consultation_status, 
          created_at
        `)
        .eq('type', 'support')
        .order("created_at", { ascending: false });

      if (consultError) throw consultError;

      // Fetch last messages and unread counts for all sessions
      const { data: allMessages, error: msgError } = await supabase
        .from("consultation_messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (msgError) throw msgError;

      const msgMap: Record<string, ChatMessage[]> = {};
      allMessages.forEach(msg => {
        if (!msgMap[msg.consultation_id]) msgMap[msg.consultation_id] = [];
        msgMap[msg.consultation_id].push(msg as ChatMessage);
      });
      
      const sessionData: ChatSession[] = consultations.map((c) => {
        const msgs = msgMap[c.id] || [];
        
        return {
          ...c,
          lastMessage: msgs.length > 0 ? msgs[msgs.length - 1] : null,
          unreadCount: msgs.filter(m => m.sender_type !== "admin" && !m.read_at).length
        };
      });

      setSessions(sessionData);
      setMessages(msgMap);
      if (sessionData.length > 0 && !selectedId) {
        setSelectedId(sessionData[0].id);
      }
    } catch (err) {
      console.error("Gagal memuat sesi chat:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Real-time subscriptions
  useEffect(() => {
    const messageChannel = supabase
      .channel("admin-chat-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "consultation_messages" },
        async (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages(prev => ({
            ...prev,
            [newMsg.consultation_id]: [...(prev[newMsg.consultation_id] || []), newMsg]
          }));
          
          setSessions(prev => prev.map(s => 
            s.id === newMsg.consultation_id 
              ? { 
                  ...s, 
                  lastMessage: newMsg, 
                  unreadCount: newMsg.sender_type !== "admin" ? s.unreadCount + 1 : s.unreadCount 
                } 
              : s
          ));

          // Mark as read if it's the current session
          if (newMsg.consultation_id === selectedId && newMsg.sender_type !== "admin") {
            await supabase.rpc("mark_messages_read", {
              p_consultation_id: newMsg.consultation_id,
              p_as_sender_type: "admin",
            });
          }
        }
      )
      .subscribe();

    const sessionChannel = supabase
      .channel("admin-chat-sessions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "consultations" },
        () => {
          fetchSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(sessionChannel);
    };
  }, [fetchSessions]);

  // Mark as read when switching sessions
  useEffect(() => {
    if (selectedId) {
      supabase.rpc("mark_messages_read", {
        p_consultation_id: selectedId,
        p_as_sender_type: "admin",
      });
      
      setSessions(prev => prev.map(s => 
        s.id === selectedId ? { ...s, unreadCount: 0 } : s
      ));
    }
  }, [selectedId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages.length]);

  const filteredSessions = sessions.filter((s) => {
    const matchFilter = filter === "all" || s.consultation_status === filter;
    const q = search.toLowerCase();
    const matchSearch = s.patient_name.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  async function sendAdminReply() {
    if (!adminReply.trim() || !selectedId || !user || sending) return;
    const text = adminReply.trim();
    setAdminReply("");
    setSending(true);

    try {
      const { error } = await supabase.from("consultation_messages").insert({
        consultation_id: selectedId,
        sender_id: user.id,
        sender_type: "admin",
        message_text: text,
      });

      if (error) throw error;
    } catch (err) {
      console.error("Gagal kirim pesan admin:", err);
      setAdminReply(text);
    } finally {
      setSending(false);
    }
  }

  async function markDone() {
    if (!selectedId) return;
    try {
      const { error } = await supabase
        .from("consultations")
        .update({ consultation_status: "completed" })
        .eq("id", selectedId);
      
      if (error) throw error;
      fetchSessions();
    } catch (err) {
      console.error("Gagal update status:", err);
    }
  }

  const filterTabs: { id: Filter; label: string }[] = [
    { id: "all", label: "Semua" },
    { id: "in_progress", label: "Aktif" },
    { id: "scheduled", label: "Terjadwal" },
    { id: "completed", label: "Selesai" },
  ];

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "";
    return format(new Date(dateStr), "HH:mm", { locale: idLocale });
  };

  return (
    <AdminLayout
      title="Live Chat Bantuan"
      subtitle="Berikan bantuan langsung kepada user secara real-time"
    >
      <div className="flex gap-4 h-[calc(100vh-9.5rem)] overflow-hidden">
        {/* ── LEFT: session list ─────────────────────────────────────────── */}
        <div className="w-72 xl:w-80 flex-shrink-0 flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Search */}
          <div className="p-3 border-b border-slate-200">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari percakapan..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all"
              />
            </div>
          </div>

          {/* Filter pills */}
          <div className="px-3 py-2.5 border-b border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            {filterTabs.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={[
                  "text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap uppercase tracking-wider border",
                  filter === f.id
                    ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50 border-transparent",
                ].join(" ")}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Session items */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
                <p className="text-xs font-medium">Memuat percakapan...</p>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <MessageSquare className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">Tidak ada sesi ditemukan</p>
              </div>
            ) : (
              filteredSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedId(session.id)}
                  className={[
                    "w-full text-left px-4 py-4 border-b border-slate-100 hover:bg-slate-50 transition-all relative",
                    selectedId === session.id
                      ? "bg-sky-50/50"
                      : "",
                  ].join(" ")}
                >
                  {selectedId === session.id && (
                    <motion.div
                      layoutId="active-session"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500 rounded-r-full"
                    />
                  )}
                  <div className="flex items-start gap-3">
                    {/* Avatar with status dot */}
                    <div className="relative flex-shrink-0">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-50 to-indigo-50 border border-slate-200 flex items-center justify-center text-sm font-bold text-sky-700 shadow-sm">
                        {session.patient_name[0]}
                      </div>
                      <span
                        className={[
                          "absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm",
                          STATUS_DOT[session.consultation_status],
                        ].join(" ")}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {session.patient_name}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-2 font-medium">
                          {formatTime(session.lastMessage?.created_at || session.created_at)}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium truncate mb-1 flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        Percakapan Bantuan
                      </p>
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs truncate flex-1 ${session.unreadCount > 0 ? "font-bold text-slate-700" : "text-slate-500"}`}>
                          {session.lastMessage?.message_text || "Belum ada pesan"}
                        </p>
                        {session.unreadCount > 0 && (
                          <span className="flex-shrink-0 h-4.5 min-w-[18px] px-1.5 rounded-full bg-sky-500 text-white text-[9px] font-extrabold flex items-center justify-center shadow-sm shadow-sky-500/30">
                            {session.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── RIGHT: chat detail ─────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden min-w-0 shadow-sm">
          {selected ? (
            <>
              {/* Chat header */}
              <div className="px-5 py-4 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shadow-sm shadow-slate-100/50 z-10">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative flex-shrink-0">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50 border border-slate-200 flex items-center justify-center text-lg font-bold text-sky-700 shadow-sm">
                      {selected.patient_name[0]}
                    </div>
                    <span
                      className={[
                        "absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full border-2 border-white shadow-sm",
                        STATUS_DOT[selected.consultation_status],
                      ].join(" ")}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-extrabold text-slate-900">{selected.patient_name}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-2">
                      Layanan Bantuan Admin
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className={STATUS_TEXT[selected.consultation_status]}>
                        {STATUS_LABEL[selected.consultation_status]}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={markDone}
                    disabled={selected.consultation_status === "completed"}
                    className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Tandai Selesai
                  </button>
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 bg-slate-50/50">
                {currentMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                    <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                      <MessageSquare className="h-8 w-8 opacity-20" />
                    </div>
                    <p className="text-sm font-medium">Belum ada percakapan</p>
                  </div>
                )}
                {currentMessages.map((msg) => {
                  const isAdmin = msg.sender_type === "admin";
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={cn("flex w-full", isAdmin ? "justify-end" : "justify-start")}
                    >
                      <div className={cn(
                        "flex flex-col max-w-[70%]",
                        isAdmin ? "items-end" : "items-start"
                      )}>
                        {/* Bubble */}
                        <div
                          className={cn(
                            "px-4 py-3 shadow-sm relative group transition-all",
                            isAdmin 
                              ? "bg-sky-500 text-white rounded-[22px] rounded-tr-none" 
                              : "bg-white border border-slate-200 text-slate-700 rounded-[22px] rounded-tl-none"
                          )}
                        >
                          <p className="text-[13px] leading-relaxed font-medium whitespace-pre-wrap">
                            {msg.message_text}
                          </p>
                          
                          {/* Status & Time inside bubble */}
                          <div className={cn(
                            "flex items-center gap-1 mt-1.5",
                            isAdmin ? "justify-end text-sky-100" : "justify-start text-slate-400"
                          )}>
                            <span className="text-[9px] font-mono font-medium uppercase tracking-tighter">
                              {formatTime(msg.created_at)}
                            </span>
                            {isAdmin && (
                              <div className="flex">
                                <CheckCircle className={cn("h-2.5 w-2.5", msg.read_at ? "text-emerald-300" : "text-sky-200")} />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Sender Label (Subtle) */}
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-widest mt-1.5 px-1",
                          isAdmin ? "text-sky-500" : "text-slate-400"
                        )}>
                          {isAdmin ? "Anda (Admin)" : selected.patient_name}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Admin reply section */}
              <div className="px-6 pb-6 pt-4 bg-white border-t border-slate-200 z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-5 w-5 rounded-lg bg-violet-100 flex items-center justify-center">
                    <Info className="h-3 w-3 text-violet-600" />
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    <span className="text-violet-700 font-bold uppercase tracking-wider">Balas sebagai Admin</span>
                    {" — "}Pesan Anda akan langsung terkirim ke user
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 relative group">
                    <input
                      type="text"
                      value={adminReply}
                      onChange={(e) => setAdminReply(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendAdminReply()}
                      placeholder="Tulis pesan bantuan sebagai admin..."
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-400 transition-all"
                    />
                  </div>
                  <button
                    onClick={sendAdminReply}
                    disabled={!adminReply.trim() || sending}
                    className="bg-sky-600 hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl px-6 py-3 transition-all flex-shrink-0 shadow-lg shadow-sky-600/20 flex items-center gap-2"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Kirim
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 bg-slate-50/50">
              <div className="h-24 w-24 rounded-[32px] bg-sky-50 border border-sky-100 flex items-center justify-center shadow-inner">
                <MessageSquare className="h-12 w-12 text-sky-300" />
              </div>
              <div className="text-center max-w-xs">
                <h3 className="text-xl font-bold text-slate-900">Pilih Percakapan</h3>
                <p className="text-sm text-slate-500 mt-2 font-medium">
                  Pilih sesi konsultasi dari daftar di sebelah kiri untuk memantau atau memberikan bantuan.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
