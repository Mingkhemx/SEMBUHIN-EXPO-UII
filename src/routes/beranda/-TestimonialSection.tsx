import { Star } from "lucide-react";
import { useRef } from "react";

const TESTIMONIALS = [
  {
    text: "Saya mengalami takikardia jam 2 pagi. AI Sembuhin langsung mendeteksi anomali dari smartwatch saya dan menghubungkan dokter spesialis.",
    name: "Rina Marlina",
    role: "Arsitek Sistem",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
    rating: 5,
    tag: "Konsultasi AI",
  },
  {
    text: "Melihat organ jantung saya sendiri berdetak secara 3D di layar lewat Health Twin adalah pengalaman yang luar biasa.",
    name: "Budi Hartono",
    role: "Analis Data",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
    rating: 5,
    tag: "Health Twin",
  },
  {
    text: "Resep holografik langsung dikirim ke apotek. Obat tiba dalam 12 menit. Ini bukan sekadar aplikasi medis biasa.",
    name: "Sari Dewi",
    role: "Desainer UX",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    rating: 5,
    tag: "Apotek Digital",
  },
  {
    text: "Fitur cek jantung real-time benar-benar menyelamatkan saya. Deteksi dini aritmia membuat saya bisa langsung ke dokter.",
    name: "Fajar Nugroho",
    role: "Software Engineer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    rating: 5,
    tag: "Cek Jantung",
  },
  {
    text: "Konsultasi dokter spesialis tengah malam tanpa perlu antri. Responsnya cepat dan sangat informatif.",
    name: "Amelia Putri",
    role: "Dokter Umum",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200",
    rating: 5,
    tag: "Konsultasi Dokter",
  },
  {
    text: "Platform terbaik yang pernah saya gunakan. Integrasi data kesehatan saya sangat seamless.",
    name: "Dian Pratiwi",
    role: "Product Manager",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=200",
    rating: 5,
    tag: "Health Twin",
  },
  {
    text: "Pengiriman obat dengan drone adalah inovasi nyata. Sembuhin benar-benar memahami kebutuhan pengguna modern.",
    name: "Rizki Ramadhan",
    role: "Startup Founder",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    rating: 5,
    tag: "Apotek Digital",
  },
  {
    text: "Resep digital saya tersimpan aman dan bisa diakses kapan saja. Tidak perlu khawatir kehilangan kertas resep lagi.",
    name: "Nita Susanti",
    role: "Ibu Rumah Tangga",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    rating: 5,
    tag: "Resep Digital",
  },
];

// Duplicate for seamless infinite loop
const ROW_1 = [...TESTIMONIALS.slice(0, 4), ...TESTIMONIALS.slice(0, 4)];
const ROW_2 = [...TESTIMONIALS.slice(4), ...TESTIMONIALS.slice(4)];

// ─── Single Card ─────────────────────────────────────────────────────────────

function TestiCard({ t }: { t: (typeof TESTIMONIALS)[0] }) {
  return (
    <div className="shrink-0 w-[320px] glass-strong rounded-2xl p-6 border border-sky-100/60 shadow-md flex flex-col gap-4 hover:border-sky-200/80 hover:shadow-lg transition-all duration-300">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-3.5 h-3.5 ${
                s <= t.rating
                  ? "fill-amber-400 text-amber-400"
                  : "text-sky-100"
              }`}
            />
          ))}
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-sky-100 text-sky-600 border border-sky-200">
          {t.tag}
        </span>
      </div>

      {/* Quote */}
      <p className="text-sm text-foreground/80 leading-relaxed flex-1">
        "{t.text}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-3 border-t border-sky-100/40">
        <img
          src={t.avatar}
          alt={t.name}
          className="w-9 h-9 rounded-full object-cover ring-2 ring-sky-200/60"
        />
        <div>
          <div className="text-sm font-bold text-foreground leading-tight">{t.name}</div>
          <div className="text-[10px] text-muted-foreground">{t.role}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Marquee Row ─────────────────────────────────────────────────────────────

function MarqueeRow({
  items,
  direction = "left",
  speed = 35,
}: {
  items: (typeof TESTIMONIALS)[0][];
  direction?: "left" | "right";
  speed?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="overflow-hidden relative"
      onMouseEnter={() => {
        if (trackRef.current) trackRef.current.style.animationPlayState = "paused";
      }}
      onMouseLeave={() => {
        if (trackRef.current) trackRef.current.style.animationPlayState = "running";
      }}
    >
      <div
        ref={trackRef}
        className="flex gap-4"
        style={{
          animation: `marquee-${direction} ${speed}s linear infinite`,
          width: "max-content",
        }}
      >
        {/* Render twice for seamless loop */}
        {[...items, ...items].map((t, i) => (
          <TestiCard key={i} t={t} />
        ))}
      </div>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

export function TestimonialSection() {
  return (
    <section className="relative mt-24 mb-24 overflow-hidden">
      {/* Ambient */}
      <div className="absolute -top-20 left-1/4 w-[600px] h-[300px] rounded-full bg-sky-200/20 blur-[90px] pointer-events-none" />
      <div className="absolute -bottom-10 right-1/4 w-[500px] h-[250px] rounded-full bg-violet-200/15 blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-12 px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 border border-sky-200 text-sky-600 text-[10px] font-bold uppercase tracking-widest mb-4">
          Dipercaya Pengguna
        </div>
        <h2 className="font-display text-4xl font-bold sm:text-5xl text-foreground tracking-tight mb-4">
          Cerita Nyata dari{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-sky-400">
            Pengguna Kami
          </span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto text-lg leading-relaxed">
          Jutaan pengguna telah merasakan perbedaan nyata dengan ekosistem kesehatan Sembuhin.
        </p>
      </div>

      {/* Rows — pakai mask-image agar edge fade blend sempurna dengan background apapun */}
      <div
        className="mb-4"
        style={{
          maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      >
        <MarqueeRow items={ROW_1} direction="left" speed={40} />
      </div>

      <div
        style={{
          maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      >
        <MarqueeRow items={ROW_2} direction="right" speed={35} />
      </div>

    </section>
  );
}
