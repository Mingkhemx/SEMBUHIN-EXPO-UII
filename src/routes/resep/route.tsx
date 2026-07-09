import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pill, ShoppingCart, Store, MapPin, Calendar, Clock,
  ChevronRight, ChevronDown, Star, Package, Truck, AlertCircle,
  Search, Filter, X, Check, Heart, Loader2, Stethoscope,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/resep")({
  head: () => ({
    meta: [
      { title: "Resep Obat — Sembuhin" },
      {
        name: "description",
        content: "Resep obat dari dokter. Beli sendiri di apotek atau melalui marketplace kesehatan.",
      },
    ],
  }),
  component: ResepPage,
});

/* ─── Types ─────────────────────────────────────────────────── */
type PurchaseOption = "apotek" | "marketplace";
type ResepStatus = "Pending" | "Dispensed" | "Cancelled";

interface Medicine {
  id?: string;
  name: string;
  dosage: string;
  quantity: number;
  unit: string;
  frequency: string;
  duration: string;
  notes?: string;
  image?: string;
}

interface Resep {
  id: string;
  doctorName: string;
  doctorId: string;
  doctorSpecialty: string;
  date: string;
  expiryDate?: string;
  status: ResepStatus;
  medicines: Medicine[];
  diagnosis?: string;
  notes?: string;
  rating?: number;
}

/* ─── Mock Data ─────────────────────────────────────────────── */
interface MedicineWithImage extends Medicine {
  image?: string;
}

interface ResepWithImages extends Resep {
  medicines: MedicineWithImage[];
}

/* ─── Component ─────────────────────────────────────────────── */
function ResepPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [reseps, setReseps] = useState<Resep[]>([]);
  const [selectedResep, setSelectedResep] = useState<Resep | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [purchaseOption, setPurchaseOption] = useState<PurchaseOption>("apotek");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | ResepStatus>("all");
  const [savedMedicines, setSavedMedicines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch prescriptions from Supabase
  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch prescriptions untuk patient ini
        const { data: prescriptions, error: prescError } = await supabase
          .from("prescriptions")
          .select(`
            id,
            status,
            medicines,
            notes,
            created_at,
            updated_at,
            doctor_id,
            doctors:doctor_id(
              id,
              user_id,
              specialization,
              profiles:user_id(full_name)
            )
          `)
          .eq("patient_id", user.id)
          .order("created_at", { ascending: false });

        if (prescError) throw prescError;

        if (!prescriptions) {
          setReseps([]);
          return;
        }

        // Transform data ke format Resep
        const transformed: Resep[] = prescriptions.map((p: any) => {
          const doctorData = p.doctors;
          const doctorName = doctorData?.profiles?.full_name || "Dr. Umum";
          const specialty = doctorData?.specialization || "Umum";
          const date = new Date(p.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          return {
            id: p.id,
            doctorName,
            doctorId: p.doctor_id,
            doctorSpecialty: specialty,
            date,
            status: p.status as ResepStatus,
            medicines: (p.medicines || []) as Medicine[],
            notes: p.notes,
          };
        });

        setReseps(transformed);
      } catch (err) {
        console.error("Error fetching prescriptions:", err);
        setError("Gagal memuat resep. Silahkan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, [user]);

  // Handle rating
  const handleRating = async (resepId: string, rating: number) => {
    setReseps(prev =>
      prev.map(r => r.id === resepId ? { ...r, rating } : r)
    );

    // Optionally update to Supabase if needed
    // await supabase.from("prescriptions").update({ rating }).eq("id", resepId);
  };

  // Filter reseps
  const filteredReseps = reseps.filter(r => {
    const matchesSearch = 
      r.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleBuyMedicine = (medicine: Medicine, option: PurchaseOption) => {
    setPurchaseOption(option);
    if (option === "marketplace") {
      navigate({ to: "/marketplace" });
    } else {
      alert(`Cari apotek terdekat untuk: ${medicine.name}`);
    }
  };

  return (
    <div className="relative z-10 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-12">

        {/* ── Hero Card with Image ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full overflow-hidden rounded-3xl shadow-2xl flex flex-col justify-end min-h-[340px]"
        >
          <img 
            src="/images/obat.jpg" 
            alt="Resep Obat" 
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
          
          <div className="relative p-7 sm:p-10 lg:p-12 z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 px-3 py-1.5 mb-5 w-fit">
              <Pill className="h-3 w-3 text-blue-300" />
              <span className="text-[11px] font-bold text-white/90 tracking-wider uppercase">Resep Obat</span>
              <span className="h-3.5 w-px bg-white/30 mx-1" />
              <span className="text-[11px] font-semibold text-blue-300">Dari Dokter Anda</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight drop-shadow-lg max-w-2xl">
              Kelola Resep Obat
            </h1>
            
            <p className="mt-4 text-sm sm:text-base text-white/80 leading-relaxed max-w-xl">
              Lihat resep dari dokter Anda. Beli sendiri di apotek terdekat atau pesan melalui marketplace kesehatan.
            </p>
          </div>
        </motion.div>

        {/* ── Search & Filter ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari resep atau dokter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all">
                <Filter className="h-4 w-4" />
                Status
              </button>
              <div className="absolute right-0 mt-2 w-40 rounded-xl shadow-lg border border-slate-200/50 bg-white opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                {(["all", "active", "expired"] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-all ${
                      filterStatus === status
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {status === "all" ? "Semua" : status === "active" ? "Aktif" : "Kadaluarsa"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Resep List ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {loading ? (
            <div className="text-center py-12 rounded-2xl bg-white border border-slate-100">
              <Loader2 className="h-8 w-8 text-slate-400 mx-auto mb-3 animate-spin" />
              <p className="text-slate-600 font-medium">Memuat resep...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 rounded-2xl bg-red-50 border border-red-200">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
              <p className="text-red-700 font-medium">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
              >
                Coba Lagi
              </button>
            </div>
          ) : filteredReseps.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 px-6 rounded-3xl bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 border border-blue-100 shadow-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <Pill className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2">Belum Ada Resep</h3>
              <p className="text-slate-600 max-w-sm mx-auto mb-6">
                Anda belum menerima resep dari dokter. Resep obat akan ditampilkan di sini setelah berkonsultasi dengan dokter.
              </p>
              
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate({ to: "/dokter" })}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                >
                  <Stethoscope className="h-4 w-4" />
                  Konsultasi dengan Dokter
                </motion.button>
                
                <p className="text-xs text-slate-500 mt-4">
                  💡 Tips: Setelah berkonsultasi, dokter akan memberikan resep yang langsung tersedia di halaman ini
                </p>
              </div>
            </motion.div>
          ) : (
            filteredReseps.map((resep, idx) => (
              <motion.div
                key={resep.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => {
                  setSelectedResep(resep);
                  setShowDetailModal(true);
                }}
                className="group rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md overflow-hidden cursor-pointer transition-all duration-300"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Resep Obat</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          resep.status === "Pending"
                            ? "bg-emerald-100 text-emerald-700"
                            : resep.status === "Dispensed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            resep.status === "Pending"
                              ? "bg-emerald-500"
                              : resep.status === "Dispensed"
                              ? "bg-blue-500"
                              : "bg-slate-400"
                          }`} />
                          {resep.status === "Pending" ? "Aktif" : resep.status === "Dispensed" ? "Selesai" : "Dibatalkan"}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 truncate">
                        {resep.doctorName}
                      </h3>
                      <p className="text-sm text-slate-600 mt-0.5">
                        {resep.doctorSpecialty}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-transform flex-shrink-0 mt-1" />
                  </div>

                  <div className="space-y-3">
                    <div className="px-3 py-2.5 rounded-lg bg-blue-50 border border-blue-100">
                      <p className="text-xs text-slate-600 font-medium uppercase tracking-wider">Tanggal</p>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">{resep.date}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5 text-slate-400" />
                        <span>{resep.medicines.length} obat</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

      </div>

      {/* ── Detail Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {showDetailModal && selectedResep && (
          <motion.div
            key="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetailModal(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
        )}
        {showDetailModal && selectedResep && (
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pointer-events-none"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="pointer-events-auto w-full max-w-2xl max-h-[90vh] rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-slate-100 px-5 sm:px-7 py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Resep Obat</p>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedResep.doctorName}</h2>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="h-5 w-5 text-slate-600" />
                </button>
              </div>

              {/* Content */}
              <div className="px-5 sm:px-7 py-6 space-y-6">
                {/* Doctor Info */}
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-600 font-medium uppercase tracking-wider">Dokter</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">{selectedResep.doctorName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-medium uppercase tracking-wider">Spesialisasi</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">{selectedResep.doctorSpecialty}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-medium uppercase tracking-wider">Tanggal Resep</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">{selectedResep.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-medium uppercase tracking-wider">Status</p>
                      <p className={`text-sm font-semibold mt-1 ${
                        selectedResep.status === "Pending" ? "text-emerald-700" :
                        selectedResep.status === "Dispensed" ? "text-blue-700" :
                        "text-slate-700"
                      }`}>
                        {selectedResep.status === "Pending" ? "Aktif" : selectedResep.status === "Dispensed" ? "Selesai" : "Dibatalkan"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedResep.notes && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-amber-900 uppercase tracking-wider">Catatan Dokter</p>
                        <p className="text-sm text-amber-800 mt-1.5">{selectedResep.notes}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Medicines */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Daftar Obat ({selectedResep.medicines.length})</h3>
                  {selectedResep.medicines.map((medicine, idx) => (
                    <div key={medicine.id} className="rounded-xl border border-slate-200 p-4 space-y-3 hover:border-blue-300 transition-colors overflow-hidden">
                      {/* Medicine header with image */}
                      <div className="flex items-start gap-3 mb-3">
                        {/* Medicine Image */}
                        {medicine.image && (
                          <div className="flex-shrink-0 h-20 w-20 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden">
                            <img 
                              src={medicine.image} 
                              alt={medicine.name}
                              className="h-full w-full object-contain p-1"
                            />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900">{medicine.name}</h4>
                          <p className="text-sm text-slate-600 mt-0.5">{medicine.dosage}</p>
                        </div>

                        <button
                          onClick={() => setSavedMedicines(prev => 
                            prev.includes(medicine.id) 
                              ? prev.filter(id => id !== medicine.id)
                              : [...prev, medicine.id]
                          )}
                          className={`flex-shrink-0 transition-all ${savedMedicines.includes(medicine.id) ? "text-red-500" : "text-slate-300"}`}
                        >
                          <Heart className="h-5 w-5" fill={savedMedicines.includes(medicine.id) ? "currentColor" : "none"} />
                        </button>
                      </div>

                      {/* Medicine details */}
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-xs">
                        <div className="px-2.5 py-1.5 rounded-lg bg-slate-100">
                          <p className="text-slate-600 font-medium">Jumlah</p>
                          <p className="font-bold text-slate-900">{medicine.quantity} {medicine.unit}</p>
                        </div>
                        <div className="px-2.5 py-1.5 rounded-lg bg-slate-100">
                          <p className="text-slate-600 font-medium">Frekuensi</p>
                          <p className="font-bold text-slate-900">{medicine.frequency}</p>
                        </div>
                        <div className="px-2.5 py-1.5 rounded-lg bg-slate-100">
                          <p className="text-slate-600 font-medium">Durasi</p>
                          <p className="font-bold text-slate-900">{medicine.duration}</p>
                        </div>
                        {medicine.notes && (
                          <div className="col-span-3 sm:col-span-1 px-2.5 py-1.5 rounded-lg bg-blue-50">
                            <p className="text-blue-700 font-bold text-[10px]">Catatan</p>
                          </div>
                        )}
                      </div>

                      {/* Buy buttons */}
                      <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleBuyMedicine(medicine, "apotek")}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all"
                        >
                          <Store className="h-4 w-4" />
                          <span>Cari di Apotek</span>
                        </button>
                        <button
                          onClick={() => handleBuyMedicine(medicine, "marketplace")}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          <span>Beli di Marketplace</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Rating */}
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">Resep ini membantu?</p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        onClick={() => handleRating(selectedResep.id, rating)}
                        className="transition-all hover:scale-125"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            rating <= (selectedResep.rating ?? 0)
                              ? "text-amber-400 fill-amber-400"
                              : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 border-t border-slate-100 bg-white px-5 sm:px-7 py-4 flex gap-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-all"
                >
                  Tutup
                </button>
                <button className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20">
                  Download Resep
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
