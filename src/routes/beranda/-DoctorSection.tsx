"use client";

import { useRef, useState, useEffect } from "react";
import { ArrowRight, ChevronRight, Star, MapPin, Clock, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { Avatar } from "@/components/Avatar";

// Palet aksen
const ACCENTS = [
  { accent: "from-sky-500 to-cyan-400", light: "bg-sky-50 text-sky-600 border-sky-200" },
  { accent: "from-violet-500 to-purple-400", light: "bg-violet-50 text-violet-600 border-violet-200" },
  { accent: "from-rose-400 to-pink-400", light: "bg-rose-50 text-rose-500 border-rose-200" },
  { accent: "from-emerald-500 to-teal-400", light: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  { accent: "from-amber-400 to-orange-400", light: "bg-amber-50 text-amber-600 border-amber-200" },
];

type Doctor = {
  id: string;
  name: string;
  spec: string;
  hospital: string;
  experience: string;
  rating: number;
  reviews: number;
  available: string;
  badge: string;
  img: string;
  accent: string;
  accentLight: string;
  desc: string;
};

function mapDbDoctor(row: any, index: number): Doctor {
  const palette = ACCENTS[index % ACCENTS.length];
  const expYears = Number(row.experience_years) || 0;
  return {
    id: String(row.id),
    name: row.name || "Dokter",
    spec: row.specialty || "Spesialis",
    hospital: row.hospital || "Rumah Sakit",
    experience: expYears ? `${expYears} Tahun` : "-",
    rating: Number(row.rating) || 0,
    reviews: Number(row.total_patients) || 0,
    available: row.available || "Senin – Jumat",
    badge: row.badge || "Terverifikasi",
    img: row.avatar_url || "",
    accent: palette.accent,
    accentLight: palette.light,
    desc: row.description || `Dokter spesialis ${row.specialty || "medis"} dengan pengalaman ${expYears} tahun.`,
  };
}

export function DoctorSection() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const doctorRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const active = doctors[activeIdx];

  // Fetch dokter dari DB
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("doctors")
        .select("*")
        .eq("is_active", true)
        .order("rating", { ascending: false })
        .limit(5);
      if (!mounted) return;
      if (data && data.length > 0) {
        setDoctors(data.map((row, i) => mapDbDoctor(row, i)));
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  // Check if section is visible in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Auto-scroll only if visible, not paused, and has data
  useEffect(() => {
    if (isPaused || !isInView || doctors.length === 0) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % doctors.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, isInView, doctors.length]);

  // Sync timeline scroll
  useEffect(() => {
    const activeDoctor = doctorRefs.current[activeIdx];
    if (activeDoctor && timelineRef.current) {
      const container = timelineRef.current;
      const containerRect = container.getBoundingClientRect();
      const doctorRect = activeDoctor.getBoundingClientRect();
      const scrollLeft = container.scrollLeft + doctorRect.left - containerRect.left - (containerRect.width / 2) + (doctorRect.width / 2);

      container.scrollTo({
        left: scrollLeft,
        behavior: "smooth"
      });
    }
  }, [activeIdx]);

  const scrollTimeline = (dir: "left" | "right") => {
    if (!timelineRef.current) return;
    timelineRef.current.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  // Jika loading atau tidak ada data, tampilkan minimal skeleton
  if (loading) return null;

  if (doctors.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="relative mt-20 mb-40 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Ambient background glow */}
      <div className="absolute -top-40 left-1/3 w-[600px] h-[400px] rounded-full bg-sky-200/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] rounded-full bg-violet-200/15 blur-[90px] pointer-events-none" />

      <div className="px-4 max-w-7xl mx-auto">
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 text-sky-600 font-bold text-[10px] uppercase tracking-[0.6em] mb-4"
            >
              <div className="w-10 h-px bg-sky-400/40" />
              Pilihan Spesialis
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-5xl md:text-6xl font-bold text-foreground tracking-tighter leading-[0.95]"
            >
              Temui Dokter <br />
              <span className="text-sky-600">Spesialis Terbaik</span>
            </motion.h2>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-8 shrink-0"
          >
            {[["500+", "Dokter"], ["4.9", "Rating"], ["15+", "RS Mitra"]].map(([v, l]) => (
              <div key={l} className="text-right">
                <div className="text-2xl font-bold text-foreground font-display">{v}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Timeline Track ── */}
      <div className="relative px-4 max-w-7xl mx-auto mb-10">
        {/* Scroll buttons */}
        <button
          onClick={() => scrollTimeline("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full glass-strong border border-sky-200/50 flex items-center justify-center text-foreground/60 hover:text-sky-600 transition-all shadow-md"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => scrollTimeline("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full glass-strong border border-sky-200/50 flex items-center justify-center text-foreground/60 hover:text-sky-600 transition-all shadow-md"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Scrollable timeline */}
        <div
          ref={timelineRef}
          className="flex items-center gap-0 overflow-x-auto scrollbar-hide px-10 py-6 relative"
        >
          {/* Connecting line */}
          <div className="absolute top-1/2 left-10 right-10 h-px bg-gradient-to-r from-transparent via-sky-300/40 to-transparent -translate-y-1/2 pointer-events-none" />

          {doctors.map((doc, idx) => (
            <div key={doc.id} className="flex items-center shrink-0">
              {/* Node */}
              <button
                ref={(el: HTMLButtonElement | null) => { doctorRefs.current[idx] = el; }}
                onClick={() => setActiveIdx(idx)}
                className="relative flex flex-col items-center group"
              >
                {/* Active indicator line going up */}
                <div
                  className={`absolute -top-6 left-1/2 -translate-x-1/2 w-px h-5 transition-all duration-500 ${
                    activeIdx === idx ? "bg-sky-500 opacity-100" : "bg-transparent"
                  }`}
                />

                {/* Photo circle */}
                <div
                  className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full border-2 overflow-hidden transition-all duration-500 shadow-lg ${
                    activeIdx === idx
                      ? "border-sky-500 scale-110 shadow-sky-300/40"
                      : "border-sky-200/50 grayscale opacity-60 hover:opacity-90 hover:grayscale-0 hover:scale-105"
                  }`}
                >
                  <Avatar
                    src={doc.img}
                    name={doc.name}
                    className="!w-full !h-full"
                    textClassName="text-lg"
                  />
                  {activeIdx === idx && (
                    <div className="absolute inset-0 ring-2 ring-sky-400/50 rounded-full" />
                  )}
                </div>

                {/* Number dot below */}
                <div
                  className={`mt-3 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all duration-300 ${
                    activeIdx === idx
                      ? "bg-sky-500 text-white scale-110"
                      : "bg-sky-100 text-sky-400 group-hover:bg-sky-200"
                  }`}
                >
                  {idx + 1}
                </div>

                {/* Name below dot */}
                <div
                  className={`mt-1.5 text-[10px] font-semibold text-center whitespace-nowrap transition-colors duration-300 max-w-[80px] leading-tight ${
                    activeIdx === idx ? "text-sky-600" : "text-muted-foreground"
                  }`}
                >
                  {doc.name.replace(/^(dr\.?|drs\.?)\s*/i, "")}
                </div>
              </button>

              {/* Spacer between nodes */}
              {idx < doctors.length - 1 && (
                <div className="w-16 md:w-24 h-px bg-gradient-to-r from-sky-300/30 to-sky-300/30 shrink-0 -mt-10" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Active Doctor Detail Card ── */}
      <div className="px-4 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="glass-strong rounded-[2rem] border border-sky-100/60 shadow-2xl overflow-hidden"
          >
            <div className="flex flex-col lg:flex-row">
              {/* Left — Photo */}
              <div className="relative lg:w-[380px] shrink-0 h-64 lg:h-auto min-h-[300px] overflow-hidden">
                <Avatar
                  src={active.img}
                  name={active.name}
                  rounded=""
                  className="absolute inset-0 w-full h-full"
                  textClassName="text-7xl"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-white/10" />

                {/* Badge */}
                <div className="absolute top-5 left-5">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border backdrop-blur-sm bg-white/90 ${active.accentLight}`}>
                    {active.badge}
                  </span>
                </div>

                {/* Rating overlay on photo (mobile) */}
                <div className="absolute bottom-5 left-5 lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-foreground">{active.rating}</span>
                  <span className="text-[10px] text-muted-foreground">({active.reviews})</span>
                </div>
              </div>

              {/* Right — Info */}
              <div className="flex-1 p-8 lg:p-12 flex flex-col justify-between">
                <div>
                  {/* Specialty */}
                  <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 ${active.accentLight} px-3 py-1 rounded-full border`}>
                    <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${active.accent}`} />
                    {active.spec}
                  </div>

                  {/* Name */}
                  <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight mb-2">
                    {active.name}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-xl">
                    {active.desc}
                  </p>

                  {/* Meta info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="flex items-center gap-3 glass rounded-xl px-4 py-3 border border-sky-100/50">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${active.accent} flex items-center justify-center shrink-0`}>
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Rumah Sakit</div>
                        <div className="text-xs font-semibold text-foreground leading-tight mt-0.5">{active.hospital}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 glass rounded-xl px-4 py-3 border border-sky-100/50">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${active.accent} flex items-center justify-center shrink-0`}>
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Jadwal</div>
                        <div className="text-xs font-semibold text-foreground leading-tight mt-0.5">{active.available}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 glass rounded-xl px-4 py-3 border border-sky-100/50">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${active.accent} flex items-center justify-center shrink-0`}>
                        <Star className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Rating</div>
                        <div className="text-xs font-semibold text-foreground leading-tight mt-0.5">{active.rating} / 5 · {active.reviews} ulasan</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-6 border-t border-sky-100/40">
                  {/* Navigation dots */}
                  <div className="flex items-center gap-1.5 mr-auto">
                    {doctors.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveIdx(i)}
                        className={`rounded-full transition-all duration-300 ${
                          i === activeIdx
                            ? "w-6 h-2 bg-sky-500"
                            : "w-2 h-2 bg-sky-200 hover:bg-sky-300"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl glass border border-sky-200/60 text-foreground text-sm font-semibold hover:bg-white/80 hover:border-sky-300/60 transition-all">
                      Lihat Profil
                    </button>
                    <button className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 bg-gradient-to-r ${active.accent} shadow-sky-400/20`}>
                      Buat Janji <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── View All ── */}
      <div className="mt-12 text-center px-4">
        <Link
          to="/dokter"
          className="group inline-flex items-center gap-2 text-sky-600 font-bold text-sm hover:gap-3 transition-all"
        >
          Lihat Semua Dokter
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}
