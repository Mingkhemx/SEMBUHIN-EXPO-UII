import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Shield, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const BENEFITS = [
  {
    title: "Pengelolaan Pasien Mudah",
    subtitle: "Manajemen Janji Temu & Rekam Medis",
    desc: "Kelola jadwal praktik, konsultasi, dan rekam medis pasien secara digital dengan antarmuka yang intuitif dan profesional.",
    img: "/images/pengelolaan.jpg",
    badge: "FITUR MANAJEMEN"
  },
  {
    title: "Pendapatan Transparan",
    subtitle: "Penghasilan Optimal",
    desc: "Sistem pembayaran yang jelas dan transparan, dengan riwayat penghasilan yang dapat diakses kapan saja.",
    img: "/images/pendapatan.jpg",
    badge: "PENDAPATAN"
  },
  {
    title: "Jaringan Profesional",
    subtitle: "Komunitas Dokter",
    desc: "Terhubung dengan ribuan dokter spesialis dari berbagai bidang untuk kolaborasi dan pengembangan profesional.",
    img: "/images/jaringan-dokter.jpg",
    badge: "KOMUNITAS"
  },
  {
    title: "Dukungan Teknologi",
    subtitle: "AI & Digital Tools",
    desc: "Akses ke alat diagnostik berbasis AI, manajemen resep digital, dan fitur telemedicine terintegrasi.",
    img: "/images/penangan-pasien.jpg",
    badge: "TEKNOLOGI"
  }
];

export function HospitalCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const totalSlides = BENEFITS.length;
  const minSwipeDistance = 50;

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

  // Auto-scroll only if visible and not paused
  useEffect(() => {
    if (isPaused || !isInView) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalSlides);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, isInView, totalSlides]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) goTo(activeIndex + 1);
    if (isRightSwipe) goTo(activeIndex - 1);
  };

  const goTo = (index: number) => {
    setActiveIndex(((index % totalSlides) + totalSlides) % totalSlides);
  };

  const getVisibleCards = () => {
    const prev = ((activeIndex - 1) + totalSlides) % totalSlides;
    const next = (activeIndex + 1) % totalSlides;
    return [
      { ...BENEFITS[prev], position: 'left' as const, idx: prev },
      { ...BENEFITS[activeIndex], position: 'center' as const, idx: activeIndex },
      { ...BENEFITS[next], position: 'right' as const, idx: next },
    ];
  };

  const visibleCards = getVisibleCards();

  return (
    <div 
      ref={sectionRef}
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex items-center justify-center gap-4 md:gap-6 px-4 py-6 min-h-[480px]">
        {visibleCards.map((card) => {
          const isCenter = card.position === 'center';
          return (
            <div 
              key={`${card.title}-${card.position}`} 
              onClick={() => { if (!isCenter) goTo(card.idx); }} 
              className={cn(
                "flex-none flex flex-col rounded-2xl border bg-white overflow-hidden transition-all duration-500 ease-out cursor-pointer group",
                isCenter ? "w-full max-w-[400px] shadow-xl shadow-sky-200/40 border-sky-200/60 z-20 scale-100" : "hidden md:flex w-full max-w-[340px] shadow-md shadow-slate-200/40 border-slate-200/60 z-10 scale-[0.92] opacity-60 hover:opacity-80"
              )}
            >
              <div className={cn("relative w-full overflow-hidden", isCenter ? "h-56" : "h-44")}>
                <img src={card.img} alt={card.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-sky-700 shadow-sm">
                    <Shield className="h-3 w-3" /> {card.badge}
                  </span>
                </div>
              </div>
              <div className={cn("flex flex-col flex-1", isCenter ? "p-6" : "p-5")}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-sky-500/70 mb-1">{card.subtitle}</p>
                <h3 className={cn("font-bold text-slate-900 tracking-tight leading-tight group-hover:text-sky-600 transition-colors", isCenter ? "text-lg mb-2" : "text-base mb-1.5")}>{card.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4">{card.desc}</p>
                <Link 
                  to="/daftar-dokter" 
                  className={cn(
                    "w-full mt-auto rounded-xl bg-sky-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-sky-500 transition-all active:scale-[0.98] shadow-md shadow-sky-500/15 flex items-center justify-center gap-2",
                    isCenter ? "py-3.5" : "py-3"
                  )}
                >
                  Daftar Sekarang <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={() => goTo(activeIndex - 1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-30 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 shadow-lg text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button onClick={() => goTo(activeIndex + 1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-30 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 shadow-lg text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all">
        <ChevronRight className="h-5 w-5" />
      </button>
      <div className="flex flex-col items-center gap-3 mt-6">
        <div className="flex gap-1.5">{BENEFITS.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} className={cn("rounded-full transition-all duration-300", activeIndex === i ? "w-8 h-2 bg-sky-500" : "w-2 h-2 bg-slate-200 hover:bg-slate-300")} />
        ))}</div>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{activeIndex + 1} / {totalSlides}</span>
      </div>
    </div>
  );
}
