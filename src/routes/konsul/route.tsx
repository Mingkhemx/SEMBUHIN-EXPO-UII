import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Mic, Send, Stethoscope } from "lucide-react";
import { VoiceWave } from "@/components/VoiceWave";
import { motion, AnimatePresence } from "framer-motion";

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

type Msg = { role: "user" | "doc"; text: string };

const CANNED: Record<string, string> = {
  default:
    "Terima kasih sudah berbagi. Bisa ceritakan lebih detail kapan keluhan ini mulai muncul dan seberapa sering?",
  pusing:
    "Pusing yang kamu rasakan apakah berputar (vertigo) atau seperti tertekan? Coba istirahat cukup dan minum 2 gelas air sekarang.",
  demam:
    "Suhu tubuh berapa saat diukur? Saya sarankan kompres hangat dan paracetamol jika di atas 38°C. Jika 3 hari tidak turun, kita lanjut konsultasi tatap muka.",
  batuk:
    "Batuk berdahak atau kering? Konsumsi air hangat + madu, dan hindari minuman dingin sementara waktu.",
  mual:
    "Kapan terakhir makan? Coba makan porsi kecil, hindari makanan berminyak, dan minum jahe hangat.",
};

const reply = (s: string) => {
  const t = s.toLowerCase();
  for (const k in CANNED) if (t.includes(k)) return CANNED[k];
  return CANNED.default;
};

function Konsul() {
  const [mode, setMode] = useState<"chat" | "voice">("chat");
  const [messages, setMessages] = useState<Msg[]>([
    { role: "doc", text: "Halo! Saya Dr. Sembuhin, asisten kesehatan AI kamu. Apa yang bisa saya bantu hari ini?" },
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = (text?: string) => {
    const t = (text ?? input).trim();
    if (!t) return;
    setMessages((m) => [...m, { role: "user", text: t }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [...m, { role: "doc", text: reply(t) }]);
    }, 700);
  };

  return (
    <div className="space-y-6 pb-12">
      <header className="pt-4">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Konsul <span className="text-gradient">Dr. Sembuhin</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Dokter AI 24/7 — chat atau voice, kamu pilih.
        </p>
      </header>

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
            {m === "chat" ? "💬 Chat" : "🎙 Voice"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {mode === "chat" ? (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="glass-strong flex h-[60vh] min-h-[480px] flex-col overflow-hidden rounded-3xl"
          >
            <div className="flex items-center gap-3 border-b border-white/40 px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary shadow-glow">
                <Stethoscope className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="font-semibold">Dr. Sembuhin</div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online sekarang
                </div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-6">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      m.role === "user"
                        ? "bg-gradient-primary text-primary-foreground"
                        : "glass"
                    }`}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="border-t border-white/40 p-3">
              <div className="flex items-center gap-2 rounded-2xl bg-foreground/50 p-2 ring-1 ring-white/60">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Ketik keluhanmu..."
                  className="flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground/70"
                />
                <button
                  onClick={() => send()}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow transition-transform hover:scale-105"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5 px-1">
                {["Pusing & mual", "Demam tinggi", "Batuk pilek"].map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="rounded-full bg-foreground/50 px-3 py-1 text-xs text-muted-foreground hover:bg-white/80"
                  >
                    {q}
                  </button>
                ))}
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
                <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Voice Mode
                </div>
                <h2 className="mt-2 font-display text-3xl font-bold">
                  {listening ? "Mendengarkan kamu..." : "Tekan tombol untuk bicara"}
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Bicara natural dengan Dr. Sembuhin. Visualisasi gelombang akan menari mengikuti suara kamu.
                </p>
                <button
                  onClick={() => setListening((v) => !v)}
                  className={`mt-6 inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-semibold shadow-glow transition-all ${
                    listening
                      ? "bg-rose-500 text-foreground pulse-glow"
                      : "bg-gradient-primary text-primary-foreground hover:scale-105"
                  }`}
                >
                  <Mic className="h-5 w-5" />
                  {listening ? "Hentikan" : "Mulai bicara"}
                </button>
                <p className="mt-4 text-xs text-muted-foreground">
                  *Demo visualisasi. Voice AI nyata akan dihubungkan saat backend aktif.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
