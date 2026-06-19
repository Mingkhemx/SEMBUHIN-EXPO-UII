import { ArrowRight, Clock, ArrowUpRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const BLOGS = [
  {
    tag: "Biometrik",
    tagColor: "bg-sky-500",
    accentGlass: "from-sky-900/80 via-sky-800/60 to-sky-700/40",
    title: "Mengoptimalkan Health Twin 3D Anda untuk Pencegahan Penyakit Genetik",
    excerpt: "Pelajari bagaimana data biometrik real-time dapat memprediksi risiko penyakit genetik sebelum gejala muncul.",
    date: "24 Apr 2026",
    readTime: "5 menit",
    img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800",
    featured: true,
  },
  {
    tag: "Farmasi",
    tagColor: "bg-emerald-500",
    accentGlass: "from-emerald-900/80 via-emerald-800/60 to-emerald-700/40",
    title: "Nanobot Medis: Apa yang Perlu Anda Ketahui Tentang Suplemen Masa Depan",
    excerpt: "Teknologi nanobot kini hadir untuk pengiriman suplemen langsung ke sel tubuh Anda.",
    date: "22 Apr 2026",
    readTime: "4 menit",
    img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800",
    featured: false,
  },
  {
    tag: "Neuro",
    tagColor: "bg-violet-500",
    accentGlass: "from-violet-900/80 via-violet-800/60 to-violet-700/40",
    title: "Panduan Meditasi Frekuensi Delta dengan Bantuan AI Sembuhin",
    excerpt: "AI Sembuhin kini bisa memandu sesi meditasi frekuensi delta untuk pemulihan lebih cepat.",
    date: "18 Apr 2026",
    readTime: "6 menit",
    img: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=800",
    featured: false,
  },
  {
    tag: "Analitik",
    tagColor: "bg-amber-500",
    accentGlass: "from-amber-900/80 via-amber-800/60 to-amber-700/40",
    title: "Memahami Metrik Biometrik Real-Time Anda di Dashboard Holografik",
    excerpt: "Dashboard holografik Sembuhin kini hadir dengan visualisasi metrik kesehatan yang lebih intuitif.",
    date: "15 Apr 2026",
    readTime: "3 menit",
    img: "https://images.unsplash.com/photo-1511295742362-92c96b12add7?auto=format&fit=crop&q=80&w=800",
    featured: false,
  },
];

export function BlogSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const blobY = useTransform(scrollYProgress, [0, 1], [100, -100]);
  
  const featured = BLOGS[0];
  const rest = BLOGS.slice(1);

  return (
    <section ref={sectionRef} className="px-4 max-w-7xl mx-auto mt-32 mb-24 relative">
      {/* Ambient */}
      <motion.div style={{ y: blobY }} className="absolute -top-20 left-1/3 w-[500px] h-[400px] rounded-full bg-gradient-to-r from-sky-200/20 via-cyan-100/15 to-transparent blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 border border-sky-200 text-sky-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            Neural Archive
          </div>
          <h2 className="font-display text-4xl font-bold sm:text-5xl text-foreground tracking-tighter leading-[0.95]">
            Sinkronisasi <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-sky-400 to-cyan-400">
              Pengetahuan Medis
            </span>
          </h2>
          <p className="mt-3 text-muted-foreground text-base max-w-md leading-relaxed">
            Artikel & riset terkini langsung dari jaringan medis global Sembuhin.
          </p>
        </div>
        <button className="hidden sm:flex items-center gap-2 text-sky-600 hover:text-sky-500 font-semibold text-sm transition-all hover:gap-3 group shrink-0">
          Akses Arsip
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-2 gap-5" style={{ height: "clamp(520px, 60vh, 640px)" }}>

        {/* Featured Card — spans 7 cols, 2 rows */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-7 lg:row-span-2 group relative rounded-[2rem] overflow-hidden cursor-pointer shadow-xl border border-white/20"
        >
          {/* Background photo */}
          <img
            src={featured.img}
            alt={featured.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-8">
            {/* Tag + meta */}
            <div className="flex items-center gap-3 mb-4">
              <span className={`${featured.tagColor} text-white text-[9px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full`}>
                {featured.tag}
              </span>
              <span className="flex items-center gap-1 text-white/50 text-[10px]">
                <Clock className="w-3 h-3" /> {featured.readTime}
              </span>
              <span className="text-white/30 text-[10px]">{featured.date}</span>
            </div>

            {/* Title */}
            <h3 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight mb-3 group-hover:text-sky-200 transition-colors duration-300">
              {featured.title}
            </h3>

            {/* Excerpt */}
            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-lg">
              {featured.excerpt}
            </p>

            {/* Read button */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-bold hover:bg-white/25 transition-all">
                Baca Selengkapnya <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </motion.div>

        {/* 3 smaller cards */}
        {rest.map((blog, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="lg:col-span-5 group relative rounded-[1.5rem] overflow-hidden cursor-pointer shadow-lg border border-white/20"
          >
            {/* Background photo */}
            <img
              src={blog.img}
              alt={blog.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

            {/* Tag */}
            <div className="absolute top-4 left-4">
              <span className={`${blog.tagColor} text-white text-[9px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full shadow`}>
                {blog.tag}
              </span>
            </div>

            {/* Glass text card */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 group-hover:bg-white/18 transition-all duration-300">
                <h3 className="font-display text-sm font-bold text-white leading-snug mb-2.5 group-hover:text-sky-200 transition-colors duration-300 line-clamp-2">
                  {blog.title}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-white/45 text-[10px]">
                    <Clock className="w-3 h-3" />
                    <span>{blog.readTime}</span>
                    <span>·</span>
                    <span>{blog.date}</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/80 transition-colors duration-300" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mobile — view all */}
      <button className="w-full sm:hidden mt-8 py-3.5 rounded-xl glass border border-sky-200/50 text-foreground font-semibold text-sm flex items-center justify-center gap-2">
        Akses Semua Arsip <ArrowRight className="w-4 h-4" />
      </button>
    </section>
  );
}
