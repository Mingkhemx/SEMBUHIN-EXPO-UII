import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Mic,
  MicOff,
  Send,
  Star,
  Sparkles,
  Zap,
  Crown,
  ChevronDown,
  Phone,
  PhoneOff,
} from "lucide-react";
import { VoiceWave } from "@/components/VoiceWave";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { useConversation } from "@elevenlabs/react";
import { useLanguage } from "@/contexts/LanguageContext";

/* ─── Model Config ─────────────────────────────────────────── */
type ModelId = "1.1" | "1.2" | "1.3";

interface ModelConfig {
  id: ModelId;
  name: string;
  badge: string;
  tag: string;
  limit: number; // 0 = unlimited
  description: string;
  icon: typeof Sparkles;
  accent: string;
  activeBg: string;
  glowColor: string;
}

const MODELS: ModelConfig[] = [
  {
    id: "1.1",
    name: "Sembuhin 1.1",
    badge: "Free",
    tag: "FREE",
    limit: 10,
    description: "Konsultasi dasar kesehatan umum",
    icon: Sparkles,
    accent: "from-emerald-400 to-emerald-500",
    activeBg: "bg-emerald-50 border-emerald-300 text-emerald-700",
    glowColor: "shadow-emerald-500/20",
  },
  {
    id: "1.2",
    name: "Sembuhin 1.2",
    badge: "Pro",
    tag: "PRO",
    limit: 50,
    description: "Analisis gejala mendalam & rekomendasi",
    icon: Zap,
    accent: "from-sky-400 to-blue-500",
    activeBg: "bg-sky-50 border-sky-300 text-sky-700",
    glowColor: "shadow-sky-500/20",
  },
  {
    id: "1.3",
    name: "Sembuhin 1.3",
    badge: "Ultra",
    tag: "ULTRA",
    limit: 0,
    description: "Diagnosis lengkap + rencana perawatan",
    icon: Crown,
    accent: "from-violet-400 to-purple-500",
    activeBg: "bg-violet-50 border-violet-300 text-violet-700",
    glowColor: "shadow-violet-500/20",
  },
];

export const Route = createFileRoute("/konsul")({
  head: () => ({
    meta: [
      { title: "Konsul Dokter AI — Sembuhin" },
      {
        name: "description",
        content: "Konsultasi dokter AI 24/7 dengan voice & chat. Visualisasi gelombang suara 3D.",
      },
      { property: "og:title", content: "Konsul Dokter AI — Sembuhin" },
      {
        property: "og:description",
        content: "Chat & voice consult dengan dokter virtual cerdas.",
      },
    ],
  }),
  component: Konsul,
});

type Msg = { id: string; role: "user" | "doc"; text: string; rating?: number };

// ─── ElevenLabs Voice Component ──────────────────────────────
function VoiceMode() {
  const { t } = useLanguage();
  const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID;
  const { user } = useAuth();

  const conversation = useConversation({
    onConnect: () => console.log("ElevenLabs connected"),
    onDisconnect: () => console.log("ElevenLabs disconnected"),
    onMessage: (msg) => console.log("Message:", msg),
    onError: (err) => console.error("ElevenLabs error:", err),
  });

  const isConnected = conversation.status === "connected";
  const isSpeaking = conversation.isSpeaking;

  const startCall = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({ agentId: AGENT_ID });
    } catch (err) {
      console.error("Failed to start session:", err);
    }
  }, [conversation, AGENT_ID]);

  const endCall = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
    <motion.div
      key="voice"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="glass-strong rounded-3xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/40">
        <div className="flex items-center gap-3">
          <img src="/gif_logo/icon.png" alt="Sembuhin AI" className="h-10 w-10 object-contain" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[15px]">Dr. Sembuhin AI</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                {t("konsul.voice_live")}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              {isConnected ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-600">
                    {isSpeaking ? t("konsul.speaking") : t("konsul.listening")}
                  </span>
                </>
              ) : (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  <span className="text-slate-500">{t("konsul.ready")}</span>
                </>
              )}
            </div>
          </div>
        </div>
        {isConnected && (
          <span className="text-xs font-mono text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            LIVE
          </span>
        )}
      </div>

      {/* Visualizer */}
      <div className="flex flex-col items-center justify-center py-12 px-6 gap-8">
        <div className="relative w-64 h-64">
          <VoiceWave active={isConnected && !isSpeaking} className="h-full w-full" />
          {/* AI speaking pulse */}
          {isSpeaking && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-32 w-32 rounded-full bg-violet-500/20 animate-ping" />
              <div className="absolute h-24 w-24 rounded-full bg-violet-500/30 animate-pulse" />
              <img src="/gif_logo/icon.png" alt="" className="absolute h-14 w-14 object-contain" />
            </div>
          )}
        </div>

        {/* Status text */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-slate-900">
            {!isConnected && t("konsul.press_start")}
            {isConnected && isSpeaking && t("konsul.ai_speaking")}
            {isConnected && !isSpeaking && t("konsul.please_speak")}
          </h3>
          <p className="text-slate-500 mt-2 text-sm">
            {!isConnected && t("konsul.voice_desc")}
            {isConnected && t("konsul.natural_speech")}
          </p>
        </div>

        {/* Call Button */}
        {!isConnected ? (
          <button
            onClick={startCall}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-lg shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 transition-all"
          >
            <Phone className="h-5 w-5" />
            {t("konsul.start_call")}
          </button>
        ) : (
          <button
            onClick={endCall}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-rose-500 text-white font-bold text-lg shadow-xl shadow-rose-500/30 hover:bg-rose-600 hover:scale-105 transition-all"
          >
            <PhoneOff className="h-5 w-5" />
            {t("konsul.end_call")}
          </button>
        )}

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span>{t("konsul.powered_by")}</span>
          <span className="font-semibold text-slate-600">{t("konsul.elevenlabs")}</span>
          <span>•</span>
          <span>{t("konsul.streaming")}</span>
        </div>
      </div>
    </motion.div>
  );
}

function Konsul() {
  const { t } = useLanguage();
  const [mode, setMode] = useState<"chat" | "voice">("chat");
  const [messages, setMessages] = useState<Msg[]>([
    { id: Date.now().toString(), role: "doc", text: t("konsul.welcome_message") },
  ]);
  const [input, setInput] = useState("");
  const [chatCount, setChatCount] = useState(0);
  const [selectedModel, setSelectedModel] = useState<ModelConfig>(MODELS[0]);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentTypingText, setCurrentTypingText] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const modelPickerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const chatLimit = selectedModel.limit;

  // Handle rating
  const handleRating = async (msgId: string, rating: number) => {
    setMessages((prev) => prev.map((msg) => (msg.id === msgId ? { ...msg, rating } : msg)));
  };

  useEffect(() => {
    if (user) {
      const today = new Date().toISOString().split("T")[0];
      supabase
        .from("chat_history")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", `${today}T00:00:00.000Z`)
        .then(({ count }) => setChatCount(count || 0));
    }
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modelPickerRef.current && !modelPickerRef.current.contains(e.target as Node)) {
        setShowModelPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const messageText = (text ?? input).trim();
    if (!messageText) return;
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    if (chatLimit > 0 && chatCount >= chatLimit) {
      setMessages((m) => [
        ...m,
        {
          id: Date.now().toString(),
          role: "doc",
          text: `${t("konsul.limit_reached")} **${chatLimit} ${t("konsul.chats_today")}**.`,
        },
      ]);
      return;
    }

    setMessages((m) => [...m, { id: Date.now().toString(), role: "user", text: messageText }]);
    setInput("");
    setIsTyping(true);
    // Save to chat_history (non-blocking, ignore if table doesn't exist)
    supabase
      .from("chat_history")
      .insert({ user_id: user.id, message: messageText, sender: "user" })
      .then(() => {});
    setChatCount((prev) => prev + 1);

    try {
      const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
      if (!API_KEY) throw new Error("API key tidak dikonfigurasi");
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Sembuhin AI",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          max_tokens: 1024,
          messages: [
            {
              role: "system",
              content:
                "Kamu adalah Dr. Sembuhin, asisten kesehatan AI profesional dari Sembuhin. HANYA jawab tentang kesehatan. Jawab dalam Bahasa Indonesia dengan format markdown yang rapi.",
            },
            { role: "user", content: messageText },
          ],
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "OpenRouter error");
      const botText = data.choices[0].message.content;

      setCurrentTypingText("");
      let i = 0;
      const botId = Date.now().toString();
      const typingInterval = setInterval(() => {
        if (i <= botText.length) {
          setCurrentTypingText(botText.substring(0, i));
          i++;
        } else {
          clearInterval(typingInterval);
          setMessages((m) => [...m, { id: botId, role: "doc", text: botText }]);
          setCurrentTypingText("");
          setIsTyping(false);
        }
      }, 20);
      await supabase
        .from("chat_history")
        .insert({ user_id: user.id, message: botText, sender: "doc" })
        .then(() => {});
    } catch (err: any) {
      console.error("AI error:", err.message);
      setMessages((m) => [
        ...m,
        { id: Date.now().toString(), role: "doc", text: t("konsul.error_message") },
      ]);
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="pt-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
              {t("konsul.title")} <span className="text-gradient">{t("konsul.title_accent")}</span>
            </h1>
            <p className="mt-2 text-muted-foreground">{t("konsul.subtitle")}</p>
            <p className="mt-1 text-xs text-amber-600 font-medium">{t("konsul.warning")}</p>
          </div>
          {/* Usage counter pill */}
          {user && (
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 px-4 py-2 text-xs font-medium text-slate-600 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {chatLimit > 0 ? (
                <span>
                  {t("konsul.remaining")} <strong>{chatLimit - chatCount}</strong> {t("konsul.of")}{" "}
                  {chatLimit} {t("konsul.chats_today")}
                </span>
              ) : (
                <span>
                  <strong>{t("konsul.unlimited")}</strong>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Mode tabs */}
        <div className="inline-flex glass rounded-full p-1">
          {(["chat", "voice"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                mode === m
                  ? "bg-gradient-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "chat" ? t("konsul.chat_tab") : t("konsul.voice_tab")}
            </button>
          ))}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {mode === "chat" ? (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="glass-strong flex h-[65vh] min-h-[520px] flex-col overflow-hidden rounded-3xl shadow-xl shadow-slate-900/5"
          >
            {/* ── Chat header bar ────────────────────────────── */}
            <div className="flex items-center justify-between border-b border-white/40 px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src="/gif_logo/icon.png"
                    alt="Sembuhin AI"
                    className="h-10 w-10 object-contain"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-400 border-2 border-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[15px]">Dr. Sembuhin AI</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${selectedModel.accent} px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide`}
                    >
                      {selectedModel.badge}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {t("konsul.online")} • {selectedModel.name} • {t("konsul.virtual_assistant")}
                  </div>
                </div>
              </div>
              {user && chatLimit > 0 && (
                <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-medium text-slate-600">
                  <span
                    className={`h-2 w-2 rounded-full ${chatCount >= chatLimit ? "bg-rose-400" : chatCount >= chatLimit * 0.8 ? "bg-amber-400" : "bg-emerald-400"}`}
                  />
                  {chatCount}/{chatLimit}
                </div>
              )}
            </div>

            {/* ── Messages area ──────────────────────────────── */}
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "doc" && (
                    <div className="flex-shrink-0">
                      <img
                        src="/gif_logo/icon.png"
                        alt="Sembuhin"
                        className="h-8 w-8 object-contain"
                      />
                    </div>
                  )}
                  <div className={`max-w-[80%] ${m.role === "user" ? "order-2" : ""}`}>
                    <div
                      className={`px-4 py-3 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-2xl rounded-br-md shadow-lg shadow-slate-900/10"
                          : "bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl rounded-bl-md shadow-md"
                      }`}
                    >
                      {m.role === "doc" ? (
                        <MarkdownRenderer text={m.text} />
                      ) : (
                        <p className="text-[13px]">{m.text}</p>
                      )}
                    </div>

                    {/* Rating */}
                    {m.role === "doc" && !m.rating && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-2 flex items-center gap-1 px-1"
                      >
                        <span className="text-[11px] text-muted-foreground mr-1">
                          {t("konsul.rating_question")}
                        </span>
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => handleRating(m.id, rating)}
                            className="transition-all duration-200 hover:scale-125"
                          >
                            <Star className="h-3.5 w-3.5 text-gray-300 hover:text-amber-400" />
                          </button>
                        ))}
                      </motion.div>
                    )}
                    {m.role === "doc" && m.rating && (
                      <div className="mt-2 flex items-center gap-1 px-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Star
                            key={rating}
                            className={`h-3.5 w-3.5 ${rating <= (m.rating ?? 0) ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {m.role === "user" && (
                    <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-lg shadow-slate-900/10">
                      <div className="h-3.5 w-3.5 rounded-full bg-white/20" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-end gap-3 justify-start"
                >
                  <div className="flex-shrink-0">
                    <img
                      src="/gif_logo/icon.png"
                      alt="Sembuhin"
                      className="h-8 w-8 object-contain"
                    />
                  </div>
                  <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl rounded-bl-md px-4 py-3 shadow-md">
                    {currentTypingText ? (
                      <MarkdownRenderer text={currentTypingText} />
                    ) : (
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: 0,
                            ease: "easeInOut",
                          }}
                          className="h-2.5 w-2.5 rounded-full bg-slate-400"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: 0.2,
                            ease: "easeInOut",
                          }}
                          className="h-2.5 w-2.5 rounded-full bg-slate-400"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: 0.4,
                            ease: "easeInOut",
                          }}
                          className="h-2.5 w-2.5 rounded-full bg-slate-400"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* ── Input area ─────────────────────────────────── */}
            <div className="border-t border-white/40 bg-white/60 backdrop-blur-sm px-4 pt-3 pb-3.5">
              {/* Quick suggestions */}
              <div className="mb-2.5 flex flex-wrap gap-1.5 px-0.5">
                {["Pusing & mual", "Demam tinggi", "Batuk pilek"].map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    disabled={chatLimit > 0 && chatCount >= chatLimit}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-500 transition-all hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input row — all-in-one */}
              <div className="relative" ref={modelPickerRef}>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition-all focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-slate-100 focus-within:shadow-md">
                  {/* Text input */}
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder={t("konsul.placeholder")}
                    disabled={chatLimit > 0 && chatCount >= chatLimit}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 disabled:opacity-50 min-w-0"
                  />

                  {/* Divider */}
                  <div className="h-5 w-px bg-slate-200 flex-shrink-0" />

                  {/* Model selector button — clean cloud pill */}
                  <button
                    onClick={() => setShowModelPicker((v) => !v)}
                    className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-medium text-slate-600 transition-all hover:bg-slate-200 flex-shrink-0"
                  >
                    <span>{selectedModel.name}</span>
                    <ChevronDown
                      className={`h-3 w-3 transition-transform ${showModelPicker ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Send button */}
                  <button
                    onClick={() => send()}
                    disabled={!input.trim() || (chatLimit > 0 && chatCount >= chatLimit)}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-md shadow-slate-900/15 transition-all hover:shadow-lg hover:shadow-slate-900/20 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Model picker popup — clean cloud */}
                <AnimatePresence>
                  {showModelPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full right-0 mb-2 w-64 rounded-2xl bg-white border border-slate-200/80 p-1.5 shadow-xl shadow-slate-900/8 z-50"
                    >
                      <p className="px-3.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        {t("konsul.ai_model_choice")}
                      </p>
                      {MODELS.map((model) => {
                        const isActive = selectedModel.id === model.id;
                        return (
                          <button
                            key={model.id}
                            onClick={() => {
                              setSelectedModel(model);
                              setShowModelPicker(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left transition-all ${
                              isActive ? "bg-slate-100" : "hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[13px] font-medium ${isActive ? "text-slate-900" : "text-slate-600"}`}
                                >
                                  {model.name}
                                </span>
                                {isActive && <span className="text-sky-500 text-xs">✓</span>}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {model.description}
                              </p>
                            </div>
                            <span className="text-[10px] font-medium text-slate-400 flex-shrink-0 ml-3">
                              {model.limit > 0 ? `${model.limit}${t("konsul.per_day")}` : "∞"}
                            </span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer info */}
              <div className="mt-2 flex items-center justify-between px-1">
                <p className="text-[10px] text-slate-400">
                  {t("konsul.encrypted")} {selectedModel.name}
                </p>
                {user && chatLimit > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="h-1 w-16 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          chatCount >= chatLimit
                            ? "bg-rose-400"
                            : chatCount >= chatLimit * 0.8
                              ? "bg-amber-400"
                              : "bg-emerald-400"
                        }`}
                        style={{ width: `${Math.min((chatCount / chatLimit) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {chatCount}/{chatLimit}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="voice"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="glass-strong rounded-3xl p-6 sm:p-10"
          >
            <div className="grid items-center gap-8 lg:grid-cols-2">
              <div className="relative mx-auto aspect-square w-full max-w-md">
                <VoiceWave active={listening} className="h-full w-full" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Voice Mode
                  </span>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Groq AI
                  </span>
                </div>
                <h2 className="mt-1 font-display text-3xl font-bold">
                  {listening
                    ? "Mendengarkan..."
                    : isTyping
                      ? currentTypingText.startsWith("🎙")
                        ? "Mentranskripsi..."
                        : "Memproses jawaban..."
                      : "Tekan tombol untuk bicara"}
                </h2>
                <p className="mt-3 text-muted-foreground text-sm">
                  {listening
                    ? "Bicara jelas dan tekan 'Hentikan' saat selesai."
                    : isTyping
                      ? currentTypingText || "Dr. Sembuhin sedang menyiapkan jawaban..."
                      : "Bicara natural dengan Dr. Sembuhin AI. Suara ditranskripsi & dijawab secara real-time."}
                </p>

                {/* Riwayat pesan voice */}
                {messages.length > 1 && (
                  <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                    {messages.slice(-4).map((m) => (
                      <div
                        key={m.id}
                        className={`text-xs rounded-xl px-3 py-2 ${
                          m.role === "user"
                            ? "bg-slate-800 text-white text-right ml-8"
                            : "bg-white border border-slate-200 text-slate-700 mr-8"
                        }`}
                      >
                        {m.text.length > 100 ? m.text.substring(0, 100) + "..." : m.text}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => (listening ? stopRecording() : startRecording())}
                  disabled={isTyping}
                  className={`mt-6 inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 font-semibold shadow-glow transition-all text-sm ${
                    listening
                      ? "bg-rose-500 text-white animate-pulse shadow-rose-300"
                      : isTyping
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-gradient-primary text-primary-foreground hover:scale-105"
                  }`}
                >
                  {isTyping ? (
                    <div className="h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                  {listening ? "⏹ Hentikan & Kirim" : isTyping ? "Memproses..." : "🎙 Mulai Bicara"}
                </button>

                <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
                  <span>🔊 Powered by</span>
                  <span className="font-semibold text-slate-600">Groq Whisper + Llama 3.3</span>
                  <span>•</span>
                  <span>TTS via Web Speech API</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
