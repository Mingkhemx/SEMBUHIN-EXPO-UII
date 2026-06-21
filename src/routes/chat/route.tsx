import { createFileRoute } from "@tanstack/react-router";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/chat")({
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

interface Doctor {
  id: string;
  name: string;
  spec: string;
  category: string;
  img: string;
  online: boolean;
  lastSeen: string;
  badge: string;
  accent: string;
  accentFrom: string;
  accentTo: string;
  iconBg: string;
  iconColor: string;
  tagline: string;
  responses: string[];
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "doctor";
  timestamp: string;
  status: "sent" | "delivered" | "read";
}

type Conversations = Record<string, Message[]>;

// ─── Doctor Data ──────────────────────────────────────────────────────────────

const DOCTORS: Doctor[] = [
  {
    id: "dr-sarah",
    name: "Dr. Sarah Wijaya",
    spec: "Bedah Kardiovaskular",
    category: "Jantung",
    img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=200",
    online: true,
    lastSeen: "Online",
    badge: "Spesialis",
    accent: "from-sky-500 to-cyan-400",
    accentFrom: "from-sky-500",
    accentTo: "to-cyan-400",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
    tagline: "Spesialis Jantung & Pembuluh Darah",
    responses: [
      "Halo! Saya Dr. Sarah. Ada yang bisa saya bantu hari ini?",
      "Terima kasih sudah menghubungi saya. Bisa ceritakan keluhan Anda lebih detail?",
      "Saya mengerti. Sudah berapa lama keluhan ini berlangsung?",
      "Apakah ada riwayat penyakit jantung di keluarga Anda?",
      "Baik, saya sarankan untuk melakukan EKG dan cek darah lengkap terlebih dahulu.",
      "Untuk kondisi seperti ini, segera ke IGD jika nyeri dada semakin parah.",
      "Saya akan buatkan rujukan ke laboratorium untuk pemeriksaan lebih lanjut.",
      "Apakah Anda rutin berolahraga dan menjaga pola makan?",
      "Hindari makanan tinggi lemak jenuh dan garam. Perbanyak sayur dan buah.",
    ],
  },
  {
    id: "dr-budi",
    name: "Dr. Budi Santoso",
    spec: "Neurologi",
    category: "Saraf",
    img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200",
    online: true,
    lastSeen: "Online",
    badge: "Top Rated",
    accent: "from-violet-500 to-purple-400",
    accentFrom: "from-violet-500",
    accentTo: "to-purple-400",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    tagline: "Spesialis Saraf & Neurologi",
    responses: [
      "Selamat datang! Saya Dr. Budi, spesialis neurologi. Ada yang bisa saya bantu?",
      "Bisa ceritakan lebih lanjut gejala yang Anda rasakan?",
      "Apakah sakit kepala Anda terasa berdenyut atau seperti ditekan?",
      "Sudah periksa tekanan darah belakangan ini?",
      "Saya sarankan untuk istirahat cukup dan hindari stres berlebihan.",
      "Untuk migrain, kita bisa mulai dengan terapi non-farmakologi terlebih dahulu.",
      "Mari kita jadwalkan pertemuan langsung untuk pemeriksaan neurologis lebih lengkap.",
      "Apakah keluhan ini mengganggu aktivitas sehari-hari Anda?",
    ],
  },
  {
    id: "dr-rina",
    name: "Dr. Rina Kusuma",
    spec: "Psikologi Klinis",
    category: "Mental Health",
    img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200",
    online: false,
    lastSeen: "1 jam lalu",
    badge: "Psikolog",
    accent: "from-rose-500 to-pink-400",
    accentFrom: "from-rose-500",
    accentTo: "to-pink-400",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    tagline: "Psikolog Klinis & Konselor",
    responses: [
      "Halo, saya Dr. Rina. Senang bisa berbicara dengan Anda. Ada yang ingin Anda ceritakan?",
      "Terima kasih sudah mempercayai saya. Ini adalah ruang aman untuk bercerita.",
      "Saya mendengar Anda. Perasaan seperti itu sangat wajar dialami.",
      "Sudah berapa lama Anda merasakan perasaan ini?",
      "Apakah ada pemicu tertentu yang membuat perasaan ini muncul?",
      "Mari kita coba teknik pernapasan sederhana untuk membantu menenangkan pikiran.",
      "Anda tidak sendirian dalam menghadapi ini. Kita akan lalui bersama.",
      "Boleh saya bertanya, bagaimana pola tidur dan makan Anda belakangan ini?",
    ],
  },
  {
    id: "dr-ahmad",
    name: "Dr. Ahmad Fauzi",
    spec: "Dokter Umum",
    category: "Umum",
    img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200",
    online: true,
    lastSeen: "Online",
    badge: "Umum",
    accent: "from-teal-500 to-emerald-400",
    accentFrom: "from-teal-500",
    accentTo: "to-emerald-400",
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
    tagline: "Dokter Umum & Layanan Primer",
    responses: [
      "Halo! Saya Dr. Ahmad. Silakan ceritakan keluhan Anda.",
      "Sudah berapa lama Anda merasakan gejala ini?",
      "Apakah disertai dengan demam atau gejala lain?",
      "Apakah Anda memiliki alergi terhadap obat-obatan tertentu?",
      "Saya akan resepkan obat untuk meredakan gejala Anda.",
      "Jika dalam 3 hari tidak membaik, segera kembali konsultasi.",
      "Pastikan istirahat cukup, minum air yang banyak, dan konsumsi makanan bergizi.",
      "Apakah ada riwayat penyakit bawaan seperti diabetes atau hipertensi?",
    ],
  },
  {
    id: "dr-siti",
    name: "Dr. Siti Rahayu",
    spec: "Dermatologi",
    category: "Kulit",
    img: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200",
    online: false,
    lastSeen: "30 menit lalu",
    badge: "Spesialis",
    accent: "from-amber-500 to-orange-400",
    accentFrom: "from-amber-500",
    accentTo: "to-orange-400",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    tagline: "Spesialis Kulit & Kelamin",
    responses: [
      "Halo! Saya Dr. Siti. Ada masalah kulit yang ingin Anda konsultasikan?",
      "Bisa kirimkan foto area yang bermasalah? Itu akan membantu diagnosis saya.",
      "Sudah berapa lama kondisi ini muncul?",
      "Apakah terasa gatal, perih, atau keduanya?",
      "Apakah ada perubahan setelah menggunakan produk perawatan baru?",
      "Untuk sementara, hindari paparan sinar matahari langsung dan gunakan pelembab.",
      "Saya sarankan pemeriksaan langsung agar bisa melihat kondisi kulit lebih detail.",
      "Apakah kondisi ini menyebar atau hanya di satu area tertentu?",
    ],
  },
  {
    id: "dr-hendra",
    name: "Dr. Hendra Pratama",
    spec: "Ortopedi",
    category: "Tulang & Sendi",
    img: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200",
    online: true,
    lastSeen: "Online",
    badge: "Spesialis",
    accent: "from-indigo-500 to-blue-400",
    accentFrom: "from-indigo-500",
    accentTo: "to-blue-400",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    tagline: "Spesialis Ortopedi & Traumatologi",
    responses: [
      "Halo! Saya Dr. Hendra, spesialis ortopedi. Ada keluhan sendi atau tulang?",
      "Di bagian mana Anda merasakan nyeri? Bisa tunjukkan lebih spesifik?",
      "Apakah nyeri ini muncul saat bergerak atau saat diam juga?",
      "Sudah berapa lama keluhan ini berlangsung?",
      "Apakah pernah mengalami cedera di area tersebut sebelumnya?",
      "Saya sarankan untuk sementara kurangi aktivitas yang membebani sendi tersebut.",
      "Kita perlu rontgen untuk melihat kondisi tulang lebih jelas.",
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

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

const STORAGE_KEY = "sembuhin_chat_v1";

function loadConversations(): Conversations {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveConversations(c: Conversations) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  } catch {
    /* ignore quota errors */
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

function ChatPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversations>(() => loadConversations());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedDoctor = DOCTORS.find((d) => d.id === selectedId) ?? null;
  const currentMessages = selectedId ? (conversations[selectedId] ?? []) : [];

  // Persist to localStorage
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [currentMessages, isTyping]);

  const filteredDoctors = DOCTORS.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.spec.toLowerCase().includes(search.toLowerCase()) ||
      d.category.toLowerCase().includes(search.toLowerCase()),
  );

  const getLastMsg = (doctorId: string) => {
    const msgs = conversations[doctorId];
    if (!msgs?.length) return null;
    return msgs[msgs.length - 1];
  };

  const getUnread = (doctorId: string) => {
    if (doctorId === selectedId) return 0;
    const msgs = conversations[doctorId];
    if (!msgs) return 0;
    let n = 0;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].sender === "doctor") n++;
      else break;
    }
    return n;
  };

  const sendMessage = useCallback(() => {
    if (!input.trim() || !selectedId) return;
    const text = input.trim();
    setInput("");

    const userMsg: Message = {
      id: genId(),
      text,
      sender: "user",
      timestamp: new Date().toISOString(),
      status: "sent",
    };

    setConversations((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] ?? []), userMsg],
    }));

    // Delivered status after 600ms
    setTimeout(() => {
      setConversations((prev) => ({
        ...prev,
        [selectedId]: (prev[selectedId] ?? []).map((m) =>
          m.id === userMsg.id ? { ...m, status: "delivered" as const } : m,
        ),
      }));
    }, 600);

    // Doctor typing
    const replyDelay = 1200 + Math.random() * 1200;
    setTimeout(() => setIsTyping(true), 900);

    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      setIsTyping(false);

      setConversations((prev) => {
        const msgs = prev[selectedId] ?? [];
        const doctor = DOCTORS.find((d) => d.id === selectedId);
        if (!doctor) return prev;

        const doctorMsgCount = msgs.filter((m) => m.sender === "doctor").length;
        const reply = doctor.responses[doctorMsgCount % doctor.responses.length];

        const doctorMsg: Message = {
          id: genId(),
          text: reply,
          sender: "doctor",
          timestamp: new Date().toISOString(),
          status: "read",
        };

        const updated = msgs.map((m) =>
          m.sender === "user" ? { ...m, status: "read" as const } : m,
        );

        return { ...prev, [selectedId]: [...updated, doctorMsg] };
      });
    }, replyDelay + 900);
  }, [input, selectedId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const openChat = (id: string) => {
    setSelectedId(id);
    setMobileView("chat");
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  // Group messages by day for date separators
  const groupedMessages = (() => {
    const groups: { date: string; messages: Message[] }[] = [];
    for (const msg of currentMessages) {
      const day = new Date(msg.timestamp).toDateString();
      const last = groups[groups.length - 1];
      if (last && last.date === day) {
        last.messages.push(msg);
      } else {
        groups.push({ date: day, messages: [msg] });
      }
    }
    return groups;
  })();

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
              {DOCTORS.filter((d) => d.online).length} online
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Konsultasi langsung dengan dokter & psikolog
          </p>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama atau spesialisasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 transition-all placeholder-slate-400"
            />
          </div>
        </div>

        {/* Doctor List */}
        <div className="flex-1 overflow-y-auto bg-white">
          {filteredDoctors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400">
              <Search className="h-8 w-8 opacity-40" />
              <p className="text-sm">Dokter tidak ditemukan</p>
            </div>
          ) : (
            filteredDoctors.map((doc) => {
              const lastMsg = getLastMsg(doc.id);
              const unread = getUnread(doc.id);
              const isActive = selectedId === doc.id;

              return (
                <motion.button
                  key={doc.id}
                  onClick={() => openChat(doc.id)}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-slate-50 transition-colors",
                    isActive ? "bg-sky-50 border-r-[3px] border-r-sky-500" : "hover:bg-slate-50",
                  )}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={doc.img}
                      alt={doc.name}
                      className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <span
                      className={cn(
                        "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white",
                        doc.online ? "bg-emerald-500" : "bg-slate-300",
                      )}
                    />
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
                        {doc.name}
                      </span>
                      {lastMsg && (
                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                          {formatLastSeen(lastMsg.timestamp)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <span className="text-xs text-slate-500 truncate">
                        {lastMsg
                          ? (lastMsg.sender === "user" ? "Anda: " : "") + lastMsg.text
                          : doc.tagline}
                      </span>
                      {unread > 0 && (
                        <span className="flex-shrink-0 h-5 min-w-[20px] px-1 rounded-full bg-sky-500 text-white text-[10px] font-bold flex items-center justify-center">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })
          )}
        </div>

        {/* Login notice */}
        {!user && (
          <div className="px-4 py-3 bg-amber-50 border-t border-amber-100">
            <p className="text-xs text-amber-700 text-center font-medium">
              🔐 Login untuk menyimpan riwayat chat
            </p>
          </div>
        )}
      </div>

      {/* ── RIGHT CHAT AREA ─────────────────────────────────────────── */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0",
          mobileView === "list" ? "hidden md:flex" : "flex",
        )}
      >
        {selectedDoctor ? (
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

              <img
                src={selectedDoctor.img}
                alt={selectedDoctor.name}
                className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-800 truncate">{selectedDoctor.name}</h3>
                <p className="text-xs truncate">
                  {selectedDoctor.online ? (
                    <span className="text-emerald-600 font-medium">● Online</span>
                  ) : (
                    <span className="text-slate-400">Terakhir aktif {selectedDoctor.lastSeen}</span>
                  )}
                  <span className="text-slate-400"> · {selectedDoctor.spec}</span>
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
                  <div
                    className={cn(
                      "h-20 w-20 rounded-3xl flex items-center justify-center shadow-lg bg-gradient-to-br",
                      selectedDoctor.accent,
                    )}
                  >
                    <img
                      src={selectedDoctor.img}
                      alt=""
                      className="h-16 w-16 rounded-2xl object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-700 text-base">{selectedDoctor.name}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{selectedDoctor.tagline}</p>
                    <span
                      className={cn(
                        "inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full border",
                        selectedDoctor.iconBg,
                        selectedDoctor.iconColor,
                        "border-current/20",
                      )}
                    >
                      {selectedDoctor.badge}
                    </span>
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
                      {formatDayLabel(group.messages[0].timestamp)}
                    </span>
                  </div>

                  {/* Messages */}
                  <AnimatePresence initial={false}>
                    {group.messages.map((msg, i) => {
                      const isUser = msg.sender === "user";
                      const prevMsg = group.messages[i - 1];
                      const showAvatar = !isUser && (!prevMsg || prevMsg.sender !== "doctor");

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
                                <img
                                  src={selectedDoctor.img}
                                  alt=""
                                  className="h-7 w-7 rounded-full object-cover border-2 border-white shadow-sm"
                                />
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
                              {msg.text}
                            </div>

                            {/* Timestamp + status */}
                            <div
                              className={cn(
                                "flex items-center gap-1 px-1",
                                isUser ? "flex-row" : "flex-row-reverse",
                              )}
                            >
                              {isUser &&
                                (msg.status === "read" ? (
                                  <CheckCheck className="h-3 w-3 text-sky-400" />
                                ) : msg.status === "delivered" ? (
                                  <CheckCheck className="h-3 w-3 text-slate-400" />
                                ) : (
                                  <Check className="h-3 w-3 text-slate-400" />
                                ))}
                              <span className="text-[10px] text-slate-400">
                                {formatTime(msg.timestamp)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="flex gap-2 items-end mt-1"
                  >
                    <img
                      src={selectedDoctor.img}
                      alt=""
                      className="h-7 w-7 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                    />
                    <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                      <div className="flex gap-1.5 items-center h-4">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="block h-2 w-2 rounded-full bg-slate-400"
                            animate={{ y: [0, -5, 0] }}
                            transition={{
                              duration: 0.7,
                              delay: i * 0.15,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
                  placeholder={`Kirim pesan ke ${selectedDoctor.name.split(" ").slice(1).join(" ")}...`}
                  className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none py-1.5 min-w-0"
                />

                <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0">
                  <Paperclip className="h-5 w-5" />
                </button>

                <motion.button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  whileTap={input.trim() ? { scale: 0.9 } : undefined}
                  className={cn(
                    "flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center transition-all",
                    input.trim()
                      ? "bg-sky-500 text-white hover:bg-sky-600 shadow-md shadow-sky-500/25"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed",
                  )}
                >
                  <Send className="h-4 w-4" />
                </motion.button>
              </div>

              <p className="text-[10px] text-slate-400 text-center mt-2">
                🔒 Pesan terenkripsi · Dijawab oleh tenaga medis terverifikasi Sembuhin
              </p>
            </div>
          </>
        ) : (
          /* ── Empty / No doctor selected ── */
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
                <h3 className="text-xl font-bold text-slate-700">Pilih Dokter untuk Konsultasi</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Pilih dokter atau psikolog di sebelah kiri untuk memulai sesi konsultasi secara
                  langsung
                </p>
              </div>

              {/* Category pills */}
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { label: "Jantung", icon: <Heart className="h-3 w-3" />, color: "sky" },
                  { label: "Saraf", icon: <Brain className="h-3 w-3" />, color: "violet" },
                  { label: "Mental Health", icon: <Sparkles className="h-3 w-3" />, color: "rose" },
                  { label: "Umum", icon: <Stethoscope className="h-3 w-3" />, color: "teal" },
                  { label: "Kulit", icon: <Leaf className="h-3 w-3" />, color: "amber" },
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
                  💬 Chat tersimpan otomatis — riwayat konsultasi bisa dibuka kapan saja
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
