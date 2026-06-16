import { Link, useMatchRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Stethoscope, BookOpen, HeartPulse, Video, ShoppingBag, AlertTriangle, SmilePlus, Users, FolderOpen, ScanLine, Smile, Globe, ChevronDown } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

export function Header() {
  const matchRoute = useMatchRoute();
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('id');
  const langRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'id', label: 'Indonesia', flag: '🇮🇩', short: 'ID' },
    { code: 'en', label: 'English', flag: '🇬🇧', short: 'EN' },
    { code: 'ms', label: 'Melayu', flag: '🇲🇾', short: 'MY' },
    { code: 'zh', label: '中文 (Chinese)', flag: '🇨🇳', short: 'ZH' },
    { code: 'ja', label: '日本語 (Japanese)', flag: '🇯🇵', short: 'JA' },
    { code: 'ko', label: '한국어 (Korean)', flag: '🇰🇷', short: 'KO' },
    { code: 'ar', label: 'العربية (Arabic)', flag: '🇸🇦', short: 'AR' },
  ];

  const currentLang = languages.find((l) => l.code === selectedLang) || languages[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  
  // Check if any Pelayanan Kesehatan routes are active
  const isPelayananActive = 
    matchRoute({ to: "/dokter" }) ||
    matchRoute({ to: "/twin" }) ||
    matchRoute({ to: "/cek-jantung" });
  
  // Check if any Edukasi Kesehatan routes are active (currently all point to /)
  // You can update these paths when you create specific routes
  const isEdukasiActive = matchRoute({ to: "/artikel" }) || matchRoute({ to: "/tips-sehat" }) || matchRoute({ to: "/video-edukasi" });
  
  // Check if Beranda is active
  const isBerandaActive = matchRoute({ to: "/beranda" });
  
  // Check if Chatbot AI is active
  const isChatbotActive = matchRoute({ to: "/konsul" });
  
  // Check if Apotekin is active
  const isApotekinActive = matchRoute({ to: "/marketplace" });
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 backdrop-blur-sm w-full">
      <div className="bg-white/80 backdrop-blur-md mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 shadow-sm border-b border-sky-100/60">
        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <img
            src="gif_logo/logo.png"
            alt="Sembuhin"
            className="h-16 w-auto object-contain"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center md:flex">
          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              {/* Beranda */}
              <NavigationMenuItem>
                <Link 
                  to="/" 
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "bg-transparent text-foreground hover:text-foreground hover:bg-sky-100/60 transition-all duration-300 rounded-full px-5 font-semibold relative overflow-hidden",
                    isBerandaActive && "text-sky-600 bg-sky-100/80"
                  )}
                >
                  Beranda
                  {isBerandaActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              </NavigationMenuItem>

              {/* Pelayanan Kesehatan Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={cn(
                  "bg-transparent text-foreground hover:text-foreground hover:bg-sky-100/60 data-[state=open]:bg-sky-100/80 data-[state=open]:text-sky-600 rounded-full px-5 font-semibold transition-all duration-300 relative overflow-hidden",
                  isPelayananActive && "text-sky-600 bg-sky-100/80"
                )}>
                  Pelayanan Kesehatan
                  {isPelayananActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[500px] gap-2 p-5 md:w-[640px] md:grid-cols-2 lg:w-[720px] glass-strong rounded-3xl">
                    <ListItem to="/dokter" title="Konsultasi Dokter" icon={<Stethoscope className="h-4 w-4" />} color="sky">
                      Temukan & buat janji dengan dokter spesialis terpercaya.
                    </ListItem>
                    <ListItem to="/cek-jantung" title="Cek Jantung" icon={<HeartPulse className="h-4 w-4" />} color="rose">
                      Pantau detak jantung real-time terhubung langsung dari HP Anda.
                    </ListItem>
                    <ListItem to="/symptom-triage" title="AI Symptom Triage" icon={<AlertTriangle className="h-4 w-4" />} color="amber">
                      Input gejala, AI klasifikasikan urgensi: darurat, perlu dokter, atau self-care.
                    </ListItem>
                    <ListItem to="/mental-health" title="Mental Health Care" icon={<SmilePlus className="h-4 w-4" />} color="violet">
                      Screening PHQ-9 & GAD-7 + modul CBT berbasis AI terhubung ke psikolog.
                    </ListItem>
                    <ListItem to="/komunitas-pasien" title="Komunitas Pasien" icon={<Users className="h-4 w-4" />} color="orange">
                      Forum per kondisi medis, dimoderasi dokter, klaim medis divalidasi AI.
                    </ListItem>
                    <ListItem to="/rekam-medis" title="Rekam Medis Mandiri" icon={<FolderOpen className="h-4 w-4" />} color="teal">
                      Riwayat konsultasi, lab & resep tersimpan di akunmu, ekspor PDF kapan saja.
                    </ListItem>
                    <ListItem to="/dermatologi" title="Dermatologi AI Scan" icon={<ScanLine className="h-4 w-4" />} color="pink">
                      Foto area kulit bermasalah, AI pre-screening awal sebelum ke dermatologis.
                    </ListItem>
                    <ListItem to="/mood-check" title="Mood Check" icon={<Smile className="h-4 w-4" />} color="cyan">
                      Cek mood via kamera. AI analisis ekspresi wajah untuk mengetahui kondisi emosional Anda.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Edukasi Kesehatan Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={cn(
                  "bg-transparent text-foreground hover:text-foreground hover:bg-sky-100/60 data-[state=open]:bg-sky-100/80 data-[state=open]:text-sky-600 rounded-full px-5 font-semibold transition-all duration-300 relative overflow-hidden",
                  isEdukasiActive && "text-sky-600 bg-sky-100/80"
                )}>
                  Edukasi Kesehatan
                  {isEdukasiActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-5 md:w-[500px] md:grid-cols-2 lg:w-[600px] glass-strong rounded-3xl">
                    <ListItem to="/artikel" title="Artikel Kesehatan" icon={<BookOpen className="h-4 w-4" />}>
                      Kumpulan riset dan artikel medis terpercaya untuk Anda.
                    </ListItem>
                    <ListItem to="/tips-sehat" title="Tips Hidup Sehat" icon={<HeartPulse className="h-4 w-4" />}>
                      Panduan nutrisi dan pola hidup sehat harian.
                    </ListItem>
                    <ListItem to="/video-edukasi" title="Video Edukasi" icon={<Video className="h-4 w-4" />}>
                      Konten visual interaktif mengenai pencegahan penyakit.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Chatbot AI */}
              <NavigationMenuItem>
                <Link 
                  to="/konsul" 
                  className={cn(
                    navigationMenuTriggerStyle(), 
                    "bg-transparent text-foreground hover:text-foreground hover:bg-sky-100/60 rounded-full px-5 font-semibold relative transition-all duration-300 overflow-hidden",
                    isChatbotActive && "text-sky-600 bg-sky-100/80"
                  )}
                >
                  Chatbot AI
                  {isChatbotActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              </NavigationMenuItem>

              {/* Apotekin */}
              <NavigationMenuItem>
                <Link 
                  to="/marketplace" 
                  className={cn(
                    navigationMenuTriggerStyle(), 
                    "bg-transparent text-foreground hover:text-foreground hover:bg-sky-100/60 rounded-full px-5 font-semibold relative transition-all duration-300 overflow-hidden",
                    isApotekinActive && "text-sky-600 bg-sky-100/80"
                  )}
                >
                  Apotekin
                  {isApotekinActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Right Actions: Language + Divider + Login */}
        <div className="hidden md:flex items-center gap-3">
          {/* Vertical Divider */}
          <div className="h-6 w-px bg-slate-200" />

          {/* Language Selector */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm text-xs font-bold text-slate-600 hover:bg-white hover:border-slate-300 transition-all shadow-sm"
              title={currentLang.label}
            >
              <Globe className="h-3.5 w-3.5 text-slate-400" />
              <span>{currentLang.short}</span>
              <ChevronDown className={cn("h-3 w-3 text-slate-400 transition-transform duration-200", langOpen && "rotate-180")} />
            </button>

            {/* Dropdown */}
            {langOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 py-2 z-50 overflow-hidden"
              >
                <div className="px-4 py-2 border-b border-slate-100 mb-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pilih Bahasa</p>
                </div>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { setSelectedLang(lang.code); setLangOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors",
                      selectedLang === lang.code
                        ? "bg-sky-50 text-sky-700"
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <div className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold border",
                      selectedLang === lang.code
                        ? "bg-sky-600 text-white border-sky-600"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    )}>
                      {lang.short}
                    </div>
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.label}</span>
                    {selectedLang === lang.code && (
                      <span className="ml-auto text-sky-500">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Login/Register */}
          <Link
            to="/auth"
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-600 to-sky-500 px-5 py-2 text-sm font-bold text-white shadow-md shadow-sky-500/20 transition-all duration-200 hover:shadow-lg hover:shadow-sky-500/30 hover:from-sky-500 hover:to-sky-400 active:scale-[0.97]"
          >
            Login / Register
          </Link>
        </div>

        {/* Mobile menu trigger - briefly simplified as requested navigation is complex for mobile without a sheet */}
        <div className="md:hidden flex items-center gap-2">
          <Link to="/marketplace" className="p-2 text-foreground/70"><ShoppingBag className="h-5 w-5" /></Link>
          <button className="p-2 text-foreground/70"><Activity className="h-5 w-5" /></button>
        </div>
      </div>
    </header>
  );
}

const colorMap: Record<string, { icon: string; title: string; hover: string }> = {
  sky:     { icon: "bg-sky-100 text-sky-600",     title: "text-sky-700",     hover: "hover:border-sky-200" },
  rose:    { icon: "bg-rose-100 text-rose-600",   title: "text-rose-700",   hover: "hover:border-rose-200" },
  amber:   { icon: "bg-amber-100 text-amber-600", title: "text-amber-700",  hover: "hover:border-amber-200" },
  cyan:    { icon: "bg-cyan-100 text-cyan-600",   title: "text-cyan-700",   hover: "hover:border-cyan-200" },
  emerald: { icon: "bg-emerald-100 text-emerald-600", title: "text-emerald-700", hover: "hover:border-emerald-200" },
  violet:  { icon: "bg-violet-100 text-violet-600", title: "text-violet-700", hover: "hover:border-violet-200" },
  indigo:  { icon: "bg-indigo-100 text-indigo-600", title: "text-indigo-700", hover: "hover:border-indigo-200" },
  orange:  { icon: "bg-orange-100 text-orange-600", title: "text-orange-700", hover: "hover:border-orange-200" },
  teal:    { icon: "bg-teal-100 text-teal-600",   title: "text-teal-700",   hover: "hover:border-teal-200" },
  pink:    { icon: "bg-pink-100 text-pink-600",   title: "text-pink-700",   hover: "hover:border-pink-200" },
};

function ListItem({ className, title, children, icon, to, color = "sky", ...props }: any) {
  const c = colorMap[color] ?? colorMap.sky;
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          to={to}
          activeProps={{ className: "bg-white border-slate-200 shadow-sm" }}
          className={cn(
            "block select-none space-y-1 rounded-xl p-3 leading-none no-underline outline-none transition-all duration-300 bg-white hover:bg-slate-50 focus:bg-slate-50 border border-transparent hover:scale-[1.02] hover:shadow-sm",
            c.hover,
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-2 text-sm font-bold leading-none">
            <div className={cn("flex h-6 w-6 items-center justify-center rounded-md transition-transform duration-300", c.icon)}>
              {icon}
            </div>
            <span className={c.title}>{title}</span>
          </div>
          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
