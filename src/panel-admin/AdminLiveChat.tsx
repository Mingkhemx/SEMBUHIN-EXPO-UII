/**
 * AdminLiveChat — Monitor & balas semua sesi live chat user-dokter
 */

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Send, CheckCircle, ArrowRightLeft, Info, MessageSquare } from "lucide-react";
import { AdminLayout } from "@/panel-admin/AdminLayout";

// ─── Types ────────────────────────────────────────────────────────────────────

type Sender = "user" | "doctor" | "admin";
type SessionStatus = "active" | "waiting" | "done";

type ChatMessage = {
  id: number;
  sender: Sender;
  text: string;
  time: string;
};

type ChatSession = {
  id: number;
  user: { name: string };
  doctor: { name: string; specialty: string } | null;
  status: SessionStatus;
  lastMessage: string;
  time: string;
  unread: number;
  messages: ChatMessage[];
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_SESSIONS: ChatSession[] = [
  {
    id: 1,
    user: { name: "Anisa Rahma" },
    doctor: { name: "dr. Sarah Wijaya", specialty: "Kardiologi" },
    status: "active",
    lastMessage: "Dok, saya masih demam setelah minum obat...",
    time: "14:32",
    unread: 2,
    messages: [
      { id: 1, sender: "user", text: "Dok, saya sudah minum obat tapi masih demam", time: "14:25" },
      {
        id: 2,
        sender: "doctor",
        text: "Sudah berapa lama demamnya? Berapa suhu badannya?",
        time: "14:27",
      },
      { id: 3, sender: "user", text: "Sudah 2 hari, suhu 38.5 derajat", time: "14:29" },
      { id: 4, sender: "user", text: "Dok, saya masih demam setelah minum obat...", time: "14:32" },
    ],
  },
  {
    id: 2,
    user: { name: "Budi Santoso" },
    doctor: { name: "dr. Budi Santoso", specialty: "Umum" },
    status: "active",
    lastMessage: "Nyeri dadanya sudah berkurang dok",
    time: "13:55",
    unread: 0,
    messages: [
      { id: 1, sender: "user", text: "Dok, saya merasakan nyeri di dada kiri", time: "13:40" },
      {
        id: 2,
        sender: "doctor",
        text: "Apakah nyerinya menjalar ke lengan atau punggung?",
        time: "13:42",
      },
      { id: 3, sender: "user", text: "Nyeri dadanya sudah berkurang dok", time: "13:55" },
    ],
  },
  {
    id: 3,
    user: { name: "Citra Dewi" },
    doctor: { name: "dr. Siti Rahayu", specialty: "Dermatologi" },
    status: "active",
    lastMessage: "Kulitnya masih gatal dan kemerahan...",
    time: "12:17",
    unread: 1,
    messages: [
      { id: 1, sender: "user", text: "Dok, kulit saya gatal-gatal sejak kemarin", time: "12:10" },
      { id: 2, sender: "doctor", text: "Apakah ada ruam atau bintik-bintik merah?", time: "12:13" },
      { id: 3, sender: "user", text: "Kulitnya masih gatal dan kemerahan...", time: "12:17" },
    ],
  },
  {
    id: 4,
    user: { name: "Dimas Pratama" },
    doctor: { name: "dr. Ahmad Fauzi", specialty: "Neurologi" },
    status: "active",
    lastMessage: "Pusingnya hilang timbul sejak pagi",
    time: "11:48",
    unread: 3,
    messages: [
      { id: 1, sender: "user", text: "Dok, kepala saya sakit banget", time: "11:30" },
      { id: 2, sender: "doctor", text: "Di bagian mana kepalanya sakit?", time: "11:35" },
      { id: 3, sender: "user", text: "Bagian belakang kepala", time: "11:40" },
      { id: 4, sender: "user", text: "Dan juga terasa mual", time: "11:43" },
      { id: 5, sender: "user", text: "Pusingnya hilang timbul sejak pagi", time: "11:48" },
    ],
  },
  {
    id: 5,
    user: { name: "Eka Putri" },
    doctor: null,
    status: "waiting",
    lastMessage: "Butuh bantuan segera",
    time: "11:02",
    unread: 1,
    messages: [
      { id: 1, sender: "user", text: "Halo, saya butuh dokter segera", time: "11:00" },
      { id: 2, sender: "user", text: "Butuh bantuan segera", time: "11:02" },
    ],
  },
  {
    id: 6,
    user: { name: "Fandi Ahmad" },
    doctor: { name: "dr. Budi Santoso", specialty: "Umum" },
    status: "done",
    lastMessage: "Terima kasih dok, sudah membaik",
    time: "10:30",
    unread: 0,
    messages: [
      { id: 1, sender: "user", text: "Dok saya sudah minum obat yang diresepkan", time: "10:15" },
      { id: 2, sender: "doctor", text: "Bagus, bagaimana kondisinya sekarang?", time: "10:20" },
      { id: 3, sender: "user", text: "Terima kasih dok, sudah membaik", time: "10:30" },
      {
        id: 4,
        sender: "doctor",
        text: "Baik, jaga kesehatan ya. Jangan lupa minum obat teratur.",
        time: "10:31",
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_DOT: Record<SessionStatus, string> = {
  active: "bg-emerald-400",
  waiting: "bg-amber-400",
  done: "bg-slate-300",
};

const STATUS_LABEL: Record<SessionStatus, string> = {
  active: "Aktif",
  waiting: "Menunggu",
  done: "Selesai",
};

const STATUS_TEXT: Record<SessionStatus, string> = {
  active: "text-emerald-600",
  waiting: "text-amber-600",
  done: "text-slate-400",
};

type Filter = "all" | SessionStatus;

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminLiveChat() {
  const [sessions, setSessions] = useState<ChatSession[]>(INITIAL_SESSIONS);
  const [selectedId, setSelectedId] = useState<number>(INITIAL_SESSIONS[0].id);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [adminReply, setAdminReply] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selected = sessions.find((s) => s.id === selectedId) ?? sessions[0];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected.messages.length]);

  const filteredSessions = sessions.filter((s) => {
    const matchFilter = filter === "all" || s.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      s.user.name.toLowerCase().includes(q) || (s.doctor?.name.toLowerCase().includes(q) ?? false);
    return matchFilter && matchSearch;
  });

  function sendAdminReply() {
    const text = adminReply.trim();
    if (!text) return;
    const now = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    const newMsg: ChatMessage = {
      id: Date.now(),
      sender: "admin",
      text,
      time: now,
    };
    setSessions((prev) =>
      prev.map((s) =>
        s.id === selectedId
          ? { ...s, messages: [...s.messages, newMsg], lastMessage: text, time: now }
          : s,
      ),
    );
    setAdminReply("");
  }

  function markDone() {
    setSessions((prev) =>
      prev.map((s) => (s.id === selectedId ? { ...s, status: "done", unread: 0 } : s)),
    );
  }

  const filterTabs: { id: Filter; label: string }[] = [
    { id: "all", label: "Semua" },
    { id: "active", label: "Aktif" },
    { id: "waiting", label: "Menunggu" },
    { id: "done", label: "Selesai" },
  ];

  return (
    <AdminLayout
      title="Live Chat"
      subtitle="Monitor dan balas percakapan user–dokter secara real-time"
    >
      <div className="flex gap-4 h-[calc(100vh-9.5rem)] overflow-hidden">
        {/* ── LEFT: session list ─────────────────────────────────────────── */}
        <div className="w-72 xl:w-80 flex-shrink-0 flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-slate-200">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari percakapan..."
                className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-sky-400 transition-colors"
              />
            </div>
          </div>

          {/* Filter pills */}
          <div className="px-3 py-2.5 border-b border-slate-100 flex gap-1.5">
            {filterTabs.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={[
                  "text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors",
                  filter === f.id
                    ? "bg-sky-600 text-white"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Session items */}
          <div className="flex-1 overflow-y-auto">
            {filteredSessions.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                <MessageSquare className="h-7 w-7 mb-2" />
                <p className="text-sm">Tidak ada sesi</p>
              </div>
            )}
            {filteredSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setSelectedId(session.id)}
                className={[
                  "w-full text-left px-4 py-3.5 border-b border-slate-100 hover:bg-slate-50 transition-colors",
                  selectedId === session.id
                    ? "bg-sky-50 border-l-2 border-l-sky-500"
                    : "border-l-2 border-l-transparent",
                ].join(" ")}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar with status dot */}
                  <div className="relative flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-100 to-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                      {session.user.name[0]}
                    </div>
                    <span
                      className={[
                        "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white",
                        STATUS_DOT[session.status],
                      ].join(" ")}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-semibold text-slate-900 truncate">
                        {session.user.name}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-2 flex-shrink-0">
                        {session.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mb-1">
                      {session.doctor ? `↔ ${session.doctor.name}` : "↔ Menunggu Dokter"}
                    </p>
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs text-slate-500 truncate flex-1">
                        {session.lastMessage}
                      </p>
                      {session.unread > 0 && (
                        <span className="flex-shrink-0 h-4 min-w-[16px] px-1 rounded-full bg-sky-500 text-white text-[9px] font-bold flex items-center justify-center">
                          {session.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── RIGHT: chat detail ─────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden min-w-0">
          {/* Chat header */}
          <div className="px-5 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-100 to-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                  {selected.user.name[0]}
                </div>
                <span
                  className={[
                    "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white",
                    STATUS_DOT[selected.status],
                  ].join(" ")}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900">{selected.user.name}</span>
                  <span className="text-slate-300 text-xs">↔</span>
                  <span className="text-sm font-semibold text-sky-600 truncate">
                    {selected.doctor?.name ?? "Menunggu Dokter"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selected.doctor?.specialty ?? "Belum ada dokter"}
                  {" · "}
                  <span className={STATUS_TEXT[selected.status]}>
                    {STATUS_LABEL[selected.status]}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={markDone}
                disabled={selected.status === "done"}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Tandai Selesai
              </button>
              <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 transition-colors">
                <ArrowRightLeft className="h-3.5 w-3.5" />
                Alihkan Dokter
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
            {selected.messages.map((msg) => {
              if (msg.sender === "admin") {
                // Admin message — centered pill
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-center"
                  >
                    <div className="bg-violet-100 border border-violet-200 text-violet-700 text-xs px-4 py-2 rounded-xl text-center max-w-sm">
                      <span className="font-bold text-violet-700">Admin: </span>
                      {msg.text}
                      <span className="text-violet-500 ml-2">{msg.time}</span>
                    </div>
                  </motion.div>
                );
              }

              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={["flex", isUser ? "justify-start" : "justify-end"].join(" ")}
                >
                  <div
                    className={[
                      "max-w-[70%] px-4 py-2.5 rounded-2xl",
                      isUser
                        ? "bg-white border border-slate-200 text-slate-700 rounded-tl-none"
                        : "bg-sky-500 text-white rounded-tr-none",
                    ].join(" ")}
                  >
                    {!isUser && (
                      <p className="text-[10px] font-semibold text-sky-100 mb-1">
                        {selected.doctor?.name ?? "Dokter"}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p
                      className={[
                        "text-[10px] mt-1",
                        isUser ? "text-slate-400" : "text-sky-100/80",
                      ].join(" ")}
                    >
                      {msg.time}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Admin reply section */}
          <div className="px-5 pb-5 pt-3 bg-white border-t border-slate-200">
            {/* Info note */}
            <div className="flex items-center gap-2 mb-2.5">
              <Info className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" />
              <p className="text-[11px] text-slate-500">
                <span className="text-violet-600 font-semibold">Balas sebagai Admin</span>
                {" — "}Pesan admin akan terlihat oleh kedua pihak
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={adminReply}
                onChange={(e) => setAdminReply(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendAdminReply()}
                placeholder="Tulis pesan sebagai admin..."
                className="flex-1 bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-400 transition-colors"
              />
              <button
                onClick={sendAdminReply}
                disabled={!adminReply.trim()}
                className="bg-sky-600 hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-4 py-2.5 transition-colors flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
