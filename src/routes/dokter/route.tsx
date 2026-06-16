import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ArrowRight,
  Search,
  Star,
  MapPin,
  Clock,
  Filter,
  X,
  Stethoscope,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/dokter")({
  head: () => ({
    meta: [
      { title: "Dokter Spesialis — Sembuhin" },
      {
        name: "description",
        content:
          "Temukan dokter spesialis terbaik. Cari berdasarkan spesialisasi, rumah sakit, atau jadwal praktek.",
      },
    ],
  }),
  component: DokterPage,
});

// ─── Data ────────────────────────────────────────────────────────────────────

const ALL_DOCTORS = [
  {
    id: "01",
    name: "Dr. Sarah Wijaya",
    spec: "Bedah Kardiovaskular",
    category: "Jantung",
    hospital: "RS Jantung Harapan Kita",
    experience: "12 Tahun",
    rating: 4.9,
    reviews: 318,
    available: "Senin – Jumat",
    badge: "Spesialis Bulan Ini",
    img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=800",
    accent: "from-sky-500 to-cyan-400",
    accentLight: "bg-sky-50 text-sky-600 border-sky-200",
    desc: "Pakar kardiologi dengan pengalaman klinis internasional selama 12+ tahun. Ahli dalam prosedur jantung kompleks dan intervensi non-invasif.",
  },
  {
    id: "02",
    name: "Dr. Budi Santoso",
    spec: "Neurologi",
    category: "Saraf",
    hospital: "RSUPN Dr. Cipto Jakarta",
    experience: "9 Tahun",
    rating: 4.8,
    reviews: 204,
    available: "Selasa – Sabtu",
    badge: "Top Rated",
    img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=800",
    accent: "from-violet-500 to-purple-400",
    accentLight: "bg-violet-50 text-violet-600 border-violet-200",
    desc: "Spesialis saraf berpengalaman dalam penanganan stroke, epilepsi, dan gangguan neurodegeneratif dengan pendekatan berbasis riset terkini.",
  },
  {
    id: "03",
    name: "Dr. Elena Putri",
    spec: "Psikologi Klinis",
    category: "Mental",
    hospital: "Klinik Kesehatan Mental Sehat",
    experience: "7 Tahun",
    rating: 4.9,
    reviews: 276,
    available: "Setiap Hari",
    badge: "Most Booked",
    img: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=800",
    accent: "from-rose-400 to-pink-400",
    accentLight: "bg-rose-50 text-rose-500 border-rose-200",
    desc: "Psikolog klinis yang berfokus pada terapi CBT, manajemen stres, dan kesehatan mental holistik untuk pasien dari segala usia.",
  },
  {
    id: "04",
    name: "Dr. Thomas Muller",
    spec: "Onkologi",
    category: "Kanker",
    hospital: "RS Kanker Dharmais",
    experience: "15 Tahun",
    rating: 4.7,
    reviews: 189,
    available: "Senin – Kamis",
    badge: "Senior Expert",
    img: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=800",
    accent: "from-emerald-500 to-teal-400",
    accentLight: "bg-emerald-50 text-emerald-600 border-emerald-200",
    desc: "Konsultan onkologi senior dengan keahlian khusus dalam terapi target dan imunoterapi kanker stadium lanjut.",
  },
  {
    id: "05",
    name: "Dr. Ayu Lestari",
    spec: "Dermatologi",
    category: "Kulit",
    hospital: "Klinik Kulit Premier",
    experience: "8 Tahun",
    rating: 4.9,
    reviews: 412,
    available: "Rabu – Minggu",
    badge: "Highly Rated",
    img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800",
    accent: "from-amber-400 to-orange-400",
    accentLight: "bg-amber-50 text-amber-600 border-amber-200",
    desc: "Dermatologis berpengalaman dalam perawatan kulit medis dan estetika, spesialisasi acne, hiperpigmentasi, dan anti-aging.",
  },
  {
    id: "06",
    name: "Dr. Rizky Pratama",
    spec: "Ortopedi",
    category: "Tulang",
    hospital: "RS Ortopedi Prof. Dr. Soeharso",
    experience: "11 Tahun",
    rating: 4.8,
    reviews: 231,
    available: "Senin – Sabtu",
    badge: "Specialist",
    img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800",
    accent: "from-blue-500 to-sky-400",
    accentLight: "bg-blue-50 text-blue-600 border-blue-200",
    desc: "Ahli bedah ortopedi dengan fokus pada rekonstruksi sendi lutut dan bahu, serta penanganan cedera olahraga.",
  },
  {
    id: "07",
    name: "Dr. Nadia Halim",
    spec: "Pediatri",
    category: "Anak",
    hospital: "RSAB Harapan Kita",
    experience: "6 Tahun",
    rating: 5.0,
    reviews: 356,
    available: "Setiap Hari",
    badge: "Perfect Score",
    img: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?auto=format&fit=crop&q=80&w=800",
    accent: "from-pink-400 to-rose-400",
    accentLight: "bg-pink-50 text-pink-600 border-pink-200",
    desc: "Dokter anak yang hangat dan berpengalaman dalam menangani tumbuh kembang anak, imunisasi, dan penyakit infeksi pada bayi hingga remaja.",
  },
  {
    id: "08",
    name: "Dr. Hendra Setiawan",
    spec: "Penyakit Dalam",
    category: "Umum",
    hospital: "RSUD Dr. Soetomo",
    experience: "14 Tahun",
    rating: 4.7,
    reviews: 298,
    available: "Senin – Jumat",
    badge: "Experienced",
    img: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=800",
    accent: "from-teal-500 to-cyan-400",
    accentLight: "bg-teal-50 text-teal-600 border-teal-200",
    desc: "Internist berpengalaman dalam penanganan diabetes, hipertensi, penyakit ginjal, dan keluhan penyakit dalam kompleks lainnya.",
  },
  {
    id: "09",
    name: "Dr. Siti Rahayu",
    spec: "Obstetri & Ginekologi",
    category: "Kandungan",
    hospital: "RS Bunda Jakarta",
    experience: "10 Tahun",
    rating: 4.9,
    reviews: 445,
    available: "Selasa – Sabtu",
    badge: "Top OB-GYN",
    img: "https://images.unsplash.com/photo-1643297654416-05795d62e39c?auto=format&fit=crop&q=80&w=800",
    accent: "from-fuchsia-400 to-purple-400",
    accentLight: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200",
    desc: "Spesialis kandungan dengan pengalaman luas dalam kehamilan risiko tinggi, persalinan normal, dan bedah laparoskopi ginekologi.",
  },
];

const CATEGORIES = ["Semua", "Jantung", "Saraf", "Mental", "Kanker", "Kulit", "Tulang", "Anak", "Umum", "Kandungan"];
const SORT_OPTIONS = ["Rating Tertinggi", "Ulasan Terbanyak", "Pengalaman Terlama"];

// ─── Component ────────────────────────────────────────────────────────────────

function DokterPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0]);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<(typeof ALL_DOCTORS)[0] | null>(null);

  const filtered = useMemo(() => {
    let list = [...ALL_DOCTORS];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.spec.toLowerCase().includes(q) ||
          d.hospital.toLowerCase().includes(q)
      );
    }

    if (activeCategory !== "Semua") {
      list = list.filter((d) => d.category === activeCategory);
    }

    list.sort((a, b) => {
      if (sortBy === "Rating Tertinggi") return b.rating - a.rating;
      if (sortBy === "Ulasan Terbanyak") return b.reviews - a.reviews;
      // Pengalaman Terlama
      return parseInt(b.experience) - parseInt(a.experience);
    });

    return list;
  }, [search, activeCategory, sortBy]);

  return (
    <div className="space-y-10 pb-24">
      {/* ── Page Header ── */}
      <div className="pt-6 relative">
        {/* Ambient */}
        <div className="absolute -top-20 -left-40 w-[500px] h-[300px] rounded-full bg-sky-200/20 blur-[90px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[250px] rounded-full bg-violet-200/15 blur-[80px] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 pt-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 border border-sky-200 text-sky-600 text-[10px] font-bold uppercase tracking-widest mb-4">
              <Stethoscope className="w-3 h-3" />
              Direktori Dokter
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground tracking-tighter leading-[0.95]">
              Semua <span className="text-sky-600">Dokter</span> <br />
              Spesialis
            </h1>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl leading-relaxed">
              {ALL_DOCTORS.length} dokter spesialis terverifikasi siap mendampingi kesehatan Anda.
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-6 shrink-0">
            {[
              ["500+", "Dokter Aktif"],
              ["4.8", "Avg Rating"],
              ["24/7", "Tersedia"],
            ].map(([v, l]) => (
              <div key={l} className="text-center">
                <div className="text-2xl font-bold font-display text-foreground">{v}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="glass-strong rounded-2xl p-4 border border-sky-100/60 shadow-md flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama dokter, spesialisasi, atau rumah sakit…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/70 border border-sky-100/60 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-300 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white/70 border border-sky-100/60 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-sky-400/40 cursor-pointer min-w-[180px]"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilter((v) => !v)}
          className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border transition-all ${
            showFilter
              ? "bg-sky-500 text-white border-sky-500"
              : "bg-white/70 text-foreground border-sky-100/60 hover:border-sky-300"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* ── Category Filter Pills ── */}
      <AnimatePresence>
        {showFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass rounded-2xl p-5 border border-sky-100/50">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                Spesialisasi
              </div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                      activeCategory === cat
                        ? "bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-300/30"
                        : "bg-white/70 text-foreground border-sky-100/60 hover:border-sky-300 hover:bg-sky-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Result Count ── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Menampilkan{" "}
          <span className="font-semibold text-foreground">{filtered.length}</span> dokter
          {activeCategory !== "Semua" && (
            <>
              {" "}·{" "}
              <button
                onClick={() => setActiveCategory("Semua")}
                className="text-sky-600 font-semibold hover:underline inline-flex items-center gap-1"
              >
                {activeCategory} <X className="w-3 h-3" />
              </button>
            </>
          )}
        </p>
      </div>

      {/* ── Doctor Grid ── */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-24 text-center"
        >
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">
            Tidak Ditemukan
          </h3>
          <p className="text-muted-foreground">
            Coba cari dengan kata kunci lain atau ubah filter.
          </p>
          <button
            onClick={() => { setSearch(""); setActiveCategory("Semua"); }}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 text-white font-semibold text-sm hover:bg-sky-600 transition-all"
          >
            Reset Pencarian
          </button>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((doc, idx) => (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
              >
                <DoctorCard doc={doc} onView={() => setSelectedDoctor(doc)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Modal Detail ── */}
      <AnimatePresence>
        {selectedDoctor && (
          <DoctorModal doc={selectedDoctor} onClose={() => setSelectedDoctor(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Doctor Card ─────────────────────────────────────────────────────────────

function DoctorCard({
  doc,
  onView,
}: {
  doc: (typeof ALL_DOCTORS)[0];
  onView: () => void;
}) {
  return (
    <div className="group glass-strong rounded-[1.75rem] overflow-hidden border border-sky-100/60 shadow-md hover:shadow-xl hover:border-sky-200/80 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col">
      {/* Photo */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={doc.img}
          alt={doc.name}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Badge */}
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border backdrop-blur-sm bg-white/90 ${doc.accentLight}`}>
            {doc.badge}
          </span>
        </div>

        {/* Rating */}
        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-foreground">{doc.rating}</span>
          <span className="text-[10px] text-muted-foreground">({doc.reviews})</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        {/* Specialty pill */}
        <div className={`inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.15em] mb-3 ${doc.accentLight} px-2.5 py-1 rounded-full border w-fit`}>
          <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${doc.accent}`} />
          {doc.spec}
        </div>

        <h3 className="font-display text-xl font-bold text-foreground tracking-tight mb-1">
          {doc.name}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="line-clamp-1">{doc.hospital}</span>
        </div>

        <div className="flex items-center gap-4 mb-5 mt-auto">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3 shrink-0" />
            {doc.available}
          </div>
          <div className="text-xs text-muted-foreground">
            Pengalaman <span className="font-semibold text-foreground">{doc.experience}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-sky-100/40">
          <button
            onClick={onView}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold glass border border-sky-200/50 text-foreground hover:bg-white/80 hover:border-sky-300/60 transition-all"
          >
            Lihat Profil
          </button>
          <button className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r ${doc.accent} shadow shadow-sky-300/20 hover:scale-105 active:scale-95 transition-all`}>
            Buat Janji
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Doctor Modal ─────────────────────────────────────────────────────────────

function DoctorModal({
  doc,
  onClose,
}: {
  doc: (typeof ALL_DOCTORS)[0];
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong rounded-[2rem] border border-sky-100/60 shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header photo */}
        <div className="relative h-64 overflow-hidden">
          <img
            src={doc.img}
            alt={doc.name}
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-white transition-all shadow"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Badge */}
          <div className="absolute top-4 left-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border bg-white/90 backdrop-blur-sm ${doc.accentLight}`}>
              {doc.badge}
            </span>
          </div>

          {/* Name overlay */}
          <div className="absolute bottom-5 left-6">
            <div className={`text-[9px] font-bold uppercase tracking-widest mb-1.5 text-white/80`}>
              {doc.spec}
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{doc.name}</h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          {/* Description */}
          <p className="text-muted-foreground leading-relaxed">{doc.desc}</p>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: MapPin, label: "Rumah Sakit", value: doc.hospital },
              { icon: Clock, label: "Jadwal Praktek", value: doc.available },
              {
                icon: Star,
                label: "Rating",
                value: `${doc.rating} / 5 · ${doc.reviews} ulasan`,
              },
              { icon: Stethoscope, label: "Pengalaman", value: doc.experience },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="glass rounded-xl p-4 border border-sky-100/50"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${doc.accent} flex items-center justify-center shrink-0`}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">
                    {label}
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground leading-tight pl-8">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Stars visual */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-5 h-5 ${
                  s <= Math.round(doc.rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-sky-100"
                }`}
              />
            ))}
            <span className="ml-2 text-sm font-bold text-foreground">{doc.rating}</span>
            <span className="text-sm text-muted-foreground">({doc.reviews} ulasan)</span>
          </div>

          {/* CTA */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl text-sm font-semibold glass border border-sky-200/50 text-foreground hover:bg-white/80 transition-all"
            >
              Tutup
            </button>
            <button
              className={`flex-1 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${doc.accent} shadow-lg shadow-sky-300/20 hover:scale-105 active:scale-95 transition-all inline-flex items-center justify-center gap-2`}
            >
              Buat Janji Temu <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
