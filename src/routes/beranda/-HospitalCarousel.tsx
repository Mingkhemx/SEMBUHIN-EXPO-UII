import { useMemo, useState, useEffect, useRef } from "react";
import { MapPin, ChevronLeft, ChevronRight, Star, Clock, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const HOSPITALS = [
  {
    name: "RS Siloam AI Specialist",
    loc: "Sektor Selatan",
    distance: "2.1 km",
    desc: "Spesialis bedah robotik dan sistem diagnosis berbasis kecerdasan buatan.",
    img: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    badge: "PUSAT AI",
    openHours: "24 Jam",
  },
  {
    name: "Mitra Keluarga Genomic",
    loc: "Sektor Utara",
    distance: "4.5 km",
    desc: "Pusat terapi gen dan pengobatan presisi dengan teknologi sekuensing DNA terbaru.",
    img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    badge: "GENOMIK",
    openHours: "24 Jam",
  },
  {
    name: "RS Pondok Indah Robotic",
    loc: "Sektor Barat",
    distance: "1.8 km",
    desc: "Fasilitas rehabilitasi medis tercanggih dengan bantuan eksoskeleton robotik.",
    img: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    badge: "ROBOTIK",
    openHours: "24 Jam",
  },
  {
    name: "RS Mayapada Neuro Center",
    loc: "Pusat Kota",
    distance: "3.2 km",
    desc: "Pusat saraf digital untuk pemulihan kognitif dan bedah saraf minimal invasif.",
    img: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    badge: "NEURO",
    openHours: "24 Jam",
  },
  {
    name: "Premier Bintaro Bio Lab",
    loc: "Bintaro",
    distance: "5.4 km",
    desc: "Laboratorium biometrik canggih untuk deteksi dini penyakit degeneratif.",
    img: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    badge: "BIO LAB",
    openHours: "06:00 – 22:00",
  },
  {
    name: "RS Pusat Pertamina AI",
    loc: "Kebayoran",
    distance: "0.8 km",
    desc: "Pelayanan gawat darurat terintegrasi dengan jaringan asisten AI Sembuhin.",
    img: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=800",
    rating: 4.6,
    badge: "EMERGENCY",
    openHours: "24 Jam",
  },
];

export function HospitalCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const totalSlides = HOSPITALS.length;

  // Auto-slide
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalSlides);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, totalSlides]);

  const goTo = (index: number) => {
    setActiveIndex(((index % totalSlides) + totalSlides) % totalSlides);
  };

  // Get 3 visible cards: previous, active, next
  const getVisibleCards = () => {
    const prev = ((activeIndex - 1) + totalSlides) % totalSlides;
    const next = (activeIndex + 1) % totalSlides;
    return [
      { ...HOSPITALS[prev], position: 'left' as const, idx: prev },
      { ...HOSPITALS[activeIndex], position: 'center' as const, idx: activeIndex },
      { ...HOSPITALS[next], position: 'right' as const, idx: next },
    ];
  };

  const visibleCards = getVisibleCards();

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Cards Container */}
      <div className="flex items-center justify-center gap-4 md:gap-6 px-4 py-6 min-h-[480px]">
        {visibleCards.map((card) => {
          const isCenter = card.position === 'center';
          return (
            <div
              key={`${card.name}-${card.position}`}
              onClick={() => {
                if (!isCenter) goTo(card.idx);
              }}
              className={cn(
                "flex-none flex flex-col rounded-2xl border bg-white overflow-hidden transition-all duration-500 ease-out cursor-pointer group",
                isCenter
                  ? "w-full max-w-[400px] shadow-xl shadow-sky-200/40 border-sky-200/60 z-20 scale-100"
                  : "hidden md:flex w-full max-w-[340px] shadow-md shadow-slate-200/40 border-slate-200/60 z-10 scale-[0.92] opacity-60 hover:opacity-80"
              )}
            >
              {/* Image */}
              <div className={cn("relative w-full overflow-hidden", isCenter ? "h-56" : "h-44")}>
                <img
                  src={card.img}
                  alt={card.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* Badge */}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-sky-700 shadow-sm">
                    <Shield className="h-3 w-3" /> {card.badge}
                  </span>
                </div>

                {/* Rating */}
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-sm text-[10px] font-bold text-white">
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" /> {card.rating}
                  </span>
                </div>

                {/* Distance */}
                <div className="absolute bottom-3 left-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-white">
                    <MapPin className="h-3 w-3" /> {card.loc} • {card.distance}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className={cn("flex flex-col flex-1", isCenter ? "p-6" : "p-5")}>
                <h3 className={cn(
                  "font-bold text-slate-900 tracking-tight leading-tight group-hover:text-sky-600 transition-colors",
                  isCenter ? "text-lg mb-2" : "text-base mb-1.5"
                )}>
                  {card.name}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
                  {card.desc}
                </p>

                <div className="mt-auto flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                    <Clock className="h-3 w-3" /> {card.openHours}
                  </div>
                </div>

                {/* CTA */}
                <button className={cn(
                  "w-full mt-4 rounded-xl bg-sky-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-sky-500 transition-all active:scale-[0.98] shadow-md shadow-sky-500/15",
                  isCenter ? "py-3.5" : "py-3"
                )}>
                  Reservasi
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => goTo(activeIndex - 1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-30 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 shadow-lg text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => goTo(activeIndex + 1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-30 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 shadow-lg text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Indicators */}
      <div className="flex flex-col items-center gap-3 mt-6">
        <div className="flex gap-1.5">
          {HOSPITALS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                "rounded-full transition-all duration-300",
                activeIndex === i ? "w-8 h-2 bg-sky-500" : "w-2 h-2 bg-slate-200 hover:bg-slate-300"
              )}
            />
          ))}
        </div>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          {activeIndex + 1} / {totalSlides}
        </span>
      </div>
    </div>
  );
}
