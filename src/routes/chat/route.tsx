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
    <div className="px-6 pt-24 pb-4">
      <div className="relative z-1items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-medium shadow-sm"
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
    </div>
  );
}
