import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
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
import { supabase } from "@/lib/supabase";
import { Avatar } from "@/components/Avatar";

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

// Tipe satu dokter di UI
interface Doctor {
  id: string;
  name: string;
  spec: string;
  category: string;
  hospital: string;
  experience: string;
  rating: number;
  reviews: number;
  available: string;
  badge: string;
  img: string;
  accent: string;
  accentLight: string;
  price: string;
  desc: string;
}

// Palet aksen yang diputar agar tiap dokter punya warna berbeda
const ACCENTS = [
  { accent: "from-sky-500 to-cyan-400", light: "bg-sky-50 text-sky-600 border-sky-200" },
  { accent: "from-violet-500 to-purple-400", light: "bg-violet-50 text-violet-600 border-violet-200" },
  { accent: "from-rose-400 to-pink-400", light: "bg-rose-50 text-rose-600 border-rose-200" },
  { accent: "from-emerald-500 to-teal-400", light: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  { accent: "from-amber-400 to-orange-400", light: "bg-amber-50 text-amber-600 border-amber-200" },
  { accent: "from-blue-500 to-sky-400", light: "bg-blue-50 text-blue-600 border-blue-200" },
  { accent: "from-pink-400 to-rose-400", light: "bg-pink-50 text-pink-600 border-pink-200" },
  { accent: "from-teal-500 to-cyan-400", light: "bg-teal-50 text-teal-600 border-teal-200" },
  { accent: "from-fuchsia-400 to-purple-400", light: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200" },
];

// Format angka Rupiah: 150000 -> "Rp 150.000"
function formatRupiah(n: number): string {
  return "Rp " + (n || 0).toLocaleString("id-ID");
}

// Map baris dari tabel `doctors` ke tipe UI `Doctor`.
// field `price` tersimpan sebagai integer (Rupiah) di DB.
function mapDbDoctor(row: any, index: number): Doctor {
  const palette = ACCENTS[index % ACCENTS.length];
  const expYears = Number(row.experience_years) || 0;
  return {
    id: String(row.id),
    name: row.name || "Dokter",
    spec: row.specialty || "Spesialis",
    category: row.category || "Umum",
    hospital: row.hospital || "Rumah Sakit",
    experience: expYears ? `${expYears} Tahun` : "-",
    rating: Number(row.rating) || 0,
    reviews: Number(row.total_patients) || 0,
    available: row.available || "Senin – Jumat",
    badge: row.badge || "Terverifikasi",
    img: row.avatar_url || "", // kosong → avatar inisial akan dipakai
    accent: palette.accent,
    accentLight: palette.light,
    price: formatRupiah(Number(row.price) || 0),
    desc: row.description || `Konsultasi dengan ${row.name || "dokter spesialis"}.`,
  };
}

const SORT_OPTIONS = ["Rating Tertinggi", "Ulasan Terbanyak", "Pengalaman Terlama"];

// ─── Component ────────────────────────────────────────────────────────────────

function DokterPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0]);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // State data dokter dari Supabase
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch dokter aktif dari tabel `doctors`
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setFetchError(null);
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .eq("is_active", true)
        .order("rating", { ascending: false });

      if (!active) return;

      if (error) {
        // Tabel belum ada / error
        console.warn("Gagal memuat dokter dari Supabase:", error.message);
        setDoctors([]);
        setFetchError(error.message);
      } else if (data && data.length > 0) {
        setDoctors(data.map((row, i) => mapDbDoctor(row, i)));
      } else {
        // Tabel ada tapi kosong
        setDoctors([]);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  // Bangun daftar kategori dinamis dari data yang dimuat
  const categories = useMemo(() => {
    const set = new Set<string>(doctors.map((d) => d.category).filter(Boolean));
    return ["Semua", ...Array.from(set)];
  }, [doctors]);

  const filtered = useMemo(() => {
    let list = [...doctors];

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
  }, [doctors, search, activeCategory, sortBy]);

  return (
    <div className="space-y-10 pb-24">
      {/* ── Page Header Card ── */}
      <div className="pt-6 relative">
        {/* Ambient */}
        <div className="absolute -top-20 -left-40 w-[500px] h-[300px] rounded-full bg-sky-200/20 blur-[90px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[250px] rounded-full bg-violet-200/15 blur-[80px] pointer-events-none" />

        <div className="rounded-[2rem] border border-sky-100/60 shadow-xl relative z-10 overflow-hidden min-h-[360px]">
          {/* Background image full */}
          <img
            src="/images/doctor.jpg"
            alt="Dokter"
            className="absolute inset-0 w-full h-full object-cover object-[center_30%]"
          />
          {/* Gradient overlay — gelap di kiri agar teks terbaca, transparan ke kanan */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Text Content */}
          <div className="relative z-10 p-8 lg:p-12 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/30 text-white text-[10px] font-bold uppercase tracking-widest mb-4 backdrop-blur-sm">
              <Stethoscope className="w-3 h-3" />
              Direktori Dokter
            </div>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tighter leading-[0.95]">
              Semua <span className="text-sky-300">Dokter</span> <br />
              Spesialis
            </h1>
            <p className="mt-4 text-white/75 text-sm md:text-base max-w-lg leading-relaxed">
              {doctors.length} dokter spesialis terverifikasi siap mendampingi kesehatan Anda.
            </p>

            {/* Quick stats */}
            <div className="flex items-center gap-8 mt-6">
              {[
                ["500+", "Dokter Aktif"],
                ["4.8", "Avg Rating"],
                ["24/7", "Tersedia"],
              ].map(([v, l]) => (
                <div key={l}>
                  <div className="text-xl md:text-2xl font-bold font-display text-white">{v}</div>
                  <div className="text-[10px] text-white/60 uppercase tracking-widest">{l}</div>
                </div>
              ))}
            </div>
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
                {categories.map((cat) => (
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
      {!loading && doctors.length > 0 && (
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
      )}

      {/* ── Doctor Grid ── */}
      {loading ? (
        // Skeleton loading
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-pulse"
            >
              <div className="h-60 bg-slate-200" />
              <div className="p-6 space-y-3">
                <div className="h-4 w-24 bg-slate-200 rounded-full" />
                <div className="h-5 w-40 bg-slate-200 rounded" />
                <div className="h-3 w-32 bg-slate-200 rounded" />
                <div className="h-8 w-28 bg-slate-200 rounded mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : fetchError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          <p className="font-semibold mb-1">⚠️ Gagal memuat data dokter</p>
          <p className="text-rose-600 text-xs">{fetchError}</p>
          <p className="text-rose-600 text-xs mt-2">
            Pastikan tabel <code className="font-mono bg-rose-100 px-1 rounded">doctors</code> sudah dibuat.
            Jalankan file <code className="font-mono bg-rose-100 px-1 rounded">supabase-doctors-columns.sql</code> dan{" "}
            <code className="font-mono bg-rose-100 px-1 rounded">supabase-consultations.sql</code> di SQL Editor.
          </p>
        </div>
      ) : doctors.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-24 text-center"
        >
          <div className="text-6xl mb-4">👨‍⚕️</div>
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">
            Belum Ada Dokter Tersedia
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Saat ini belum ada dokter yang terdaftar di platform. Dokter akan muncul di sini
            setelah pendaftaran mereka disetujui oleh admin.
          </p>
        </motion.div>
      ) : (
        filtered.length === 0 ? (
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
              Cari dengan kata kunci lain atau ubah filter.
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
        )
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

// ─── Avatar: foto atau inisial ───────────────────────────────────────────────
// Wrapper Avatar yang menambahkan props textClassName (ukuran inisial) sesuai
// konteks card/modal.
function DoctorAvatar({
  doc,
  className = "",
  textClassName = "",
}: {
  doc: Doctor;
  className?: string;
  textClassName?: string;
}) {
  return (
    <Avatar
      src={doc.img}
      name={doc.name}
      className={className}
      textClassName={textClassName}
      rounded=""
    />
  );
}

function DoctorCard({
  doc,
  onView,
}: {
  doc: Doctor;
  onView: () => void;
}) {
  const navigate = useNavigate();
  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col">
      {/* Photo */}
      <div className="relative h-60 overflow-hidden">
        <DoctorAvatar
          doc={doc}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
          textClassName="text-6xl tracking-tight"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Badge */}
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide border-0 backdrop-blur-md bg-white/95 shadow-sm ${doc.accentLight}`}>
            {doc.badge}
          </span>
        </div>

        {/* Rating */}
        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-sm">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-slate-800">{doc.rating}</span>
          <span className="text-[10px] text-slate-500">({doc.reviews})</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        {/* Specialty pill */}
        <div className={`inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider mb-3 ${doc.accentLight} px-3 py-1.5 rounded-full border-0 w-fit`}>
          <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${doc.accent}`} />
          {doc.spec}
        </div>

        <h3 className="font-display text-xl font-bold text-slate-900 tracking-tight mb-2 leading-tight">
          {doc.name}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="line-clamp-1">{doc.hospital}</span>
        </div>

        <div className="flex items-center gap-5 mb-4 mt-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            {doc.available}
          </div>
          <div className="text-xs text-slate-500">
            Pengalaman <span className="font-semibold text-slate-900">{doc.experience}</span>
          </div>
        </div>

        <div className="mb-4">
          <span className="text-2xl font-bold font-display text-slate-900">
            {doc.price}
          </span>
          <span className="text-xs text-slate-400 ml-1">/konsultasi</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-slate-100">
          <button
            onClick={onView}
            className="flex-1 py-3 rounded-xl text-sm font-semibold bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all border border-slate-200"
          >
            Lihat Profil
          </button>
          <button 
            className={`flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${doc.accent} shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all`}
            onClick={() => navigate({ to: '/booking', search: { doctorId: doc.id, doctorName: doc.name, doctorSpec: doc.spec, doctorHospital: doc.hospital, doctorExperience: doc.experience, doctorImg: doc.img, doctorAccent: doc.accent, doctorPrice: doc.price } })}
          >
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
  doc: Doctor;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header photo */}
        <div className="relative h-64 overflow-hidden">
          <DoctorAvatar
            doc={doc}
            className="w-full h-full object-cover object-top"
            textClassName="text-7xl tracking-tight"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge */}
          <div className="absolute top-4 left-4">
            <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-white/95 shadow-sm ${doc.accentLight}`}>
              {doc.badge}
            </span>
          </div>

          {/* Name overlay */}
          <div className="absolute bottom-6 left-6">
            <div className={`text-[10px] font-semibold uppercase tracking-wider mb-2 text-white/80`}>
              {doc.spec}
            </div>
            <h2 className="text-2xl font-bold font-display text-white tracking-tight">{doc.name}</h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-7">
          {/* Description */}
          <p className="text-slate-600 leading-relaxed">{doc.desc}</p>

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
                className="bg-slate-50 rounded-xl p-4 border border-slate-100"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${doc.accent} flex items-center justify-center shrink-0`}>
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    {label}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-800 leading-tight pl-9">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${doc.accent} flex items-center justify-center shrink-0`}>
                <span className="text-white text-xs">💲</span>
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Biaya Konsultasi
              </span>
            </div>
            <p className="text-2xl font-bold font-display text-slate-900 leading-tight pl-9">
              {doc.price}
            </p>
          </div>

          {/* Stars visual */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-5 h-5 ${
                  s <= Math.round(doc.rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-200"
                }`}
              />
            ))}
            <span className="ml-2 text-sm font-bold text-slate-800">{doc.rating}</span>
            <span className="text-sm text-slate-500">({doc.reviews} ulasan)</span>
          </div>

          {/* CTA */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl text-sm font-semibold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-all"
            >
              Tutup
            </button>
            <button
              className={`flex-1 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${doc.accent} shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all inline-flex items-center justify-center gap-2`}
              onClick={() => navigate({ to: '/booking', search: { doctorId: doc.id, doctorName: doc.name, doctorSpec: doc.spec, doctorHospital: doc.hospital, doctorExperience: doc.experience, doctorImg: doc.img, doctorAccent: doc.accent, doctorPrice: doc.price } })}
            >
              Buat Janji Temu <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
