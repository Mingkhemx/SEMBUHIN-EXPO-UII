import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pill, ShoppingCart, Store, MapPin, Calendar, Clock,
  ChevronRight, ChevronDown, Star, Package, Truck, AlertCircle,
  Search, Filter, X, Check, Heart,
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
type ResepStatus = "active" | "expired" | "used";

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  quantity: number;
  unit: string;
  frequency: string;
  duration: string;
  notes?: string;
}

interface Resep {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  expiryDate: string;
  status: ResepStatus;
  medicines: Medicine[];
  diagnosis: string;
  notes?: string;
  rating?: number;
}

/* ─── Mock Data ─────────────────────────────────────────────── */
const MOCK_RESEPS: Resep[] = [
  {
    id: "1",
    doctorName: "Dr. Budi Santoso, Sp.PD",
    doctorSpecialty: "Penyakit Dalam",
    date: "15 Feb 2026",
    expiryDate: "15 May 2026",
    status: "active",
    diagnosis: "Demam Tifoid",
    notes: "Minum dengan air hangat setelah makan pagi, siang, dan malam",
    medicines: [
      { id: "m1", name: "Kloramfenikol", dosage: "500mg", quantity: 30, unit: "tablet", frequency: "3x sehari", duration: "7 hari" },
      { id: "m2", name: "Paracetamol", dosage: "500mg", quantity: 30, unit: "tablet", frequency: "2x sehari", duration: "3 hari" },
      { id: "m3", name: "Vitamin C", dosage: "500mg", quantity: 14, unit: "tablet", frequency: "1x sehari", duration: "2 minggu" },
    ],
  },
  {
    id: "2",
    doctorName: "Dr. Siti Nur Azizah, Sp.KK",
    doctorSpecialty: "Dermatologi",
    date: "10 Feb 2026",
    expiryDate: "10 Apr 2026",
    status: "active",
    diagnosis: "Dermatitis Atopik",
    notes: "Oleskan krim pada area kulit yang terkena, hindari faktor pemicu",
    medicines: [
      { id: "m4", name: "Mometason", dosage: "0.1%", quantity: 1, unit: "tube 10g", frequency: "2x sehari", duration: "2 minggu" },
      { id: "m5", name: "Cetirizine", dosage: "10mg", quantity: 14, unit: "tablet", frequency: "1x malam", duration: "2 minggu" },
    ],
  },
  {
    id: "3",
    doctorName: "Dr. Ahmad Rifai, Sp.THT",
    doctorSpecialty: "Telinga Hidung Tenggorokan",
    date: "01 Feb 2026",
    expiryDate: "01 Mar 2026",
    status: "expired",
    diagnosis: "Sinusitis Kronis",
    medicines: [
      { id: "m6", name: "Amoxicillin", dosage: "500mg", quantity: 21, unit: "kaplet", frequency: "3x sehari", duration: "7 hari" },
    ],
  },
];

/* ─── Component ─────────────────────────────────────────────── */
function ResepPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [reseps, setReseps] = useState<Resep[]>(MOCK_RESEPS);
  const [selectedResep, setSelectedResep] = useState<Resep | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [purchaseOption, setPurchaseOption] = useState<PurchaseOption>("apotek");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | ResepStatus>("all");
  const [savedMedicines, setSavedMedicines] = useState<string[]>([]);

  // Handle rating
  const handleRating = (resepId: string, rating: number) => {
    setReseps(prev =>
      prev.map(r => r.id === resepId ? { ...r, rating } : r)
    );
  };

  // Filter reseps
  const filteredReseps = reseps.filter(r => {
    const matchesSearch = 
      r.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleBuyMedicine = (medicine: Medicine, option: PurchaseOption) => {
    setPurchaseOption(option);
    if (option === "marketplace") {
      navigate({ to: "/marketplace" });
    } else {
      // Show nearby pharmacies
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
            src="/images/resep.jpg" 
            alt="Resep Obat" 
            className="absolute inset-0 w-full h-full object-cover object-center"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
          
          <div className="relative p-7 sm:p-10 lg:p-12">
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
          {filteredReseps.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-white border border-slate-100">
              <Pill className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">Belum ada resep</p>
              <p className="text-sm text-slate-500 mt-1">Resep obat dari dokter Anda akan muncul di sini</p>
            </div>
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
                          resep.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${resep.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                          {resep.status === "active" ? "Aktif" : "Kadaluarsa"}
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
                      <p className="text-xs text-slate-600 font-medium uppercase tracking-wider">Diagnosis</p>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">{resep.diagnosis}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{resep.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>Berlaku hingga {resep.expiryDate}</span>
                      </div>
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
                      <p className="text-xs text-slate-600 font-medium uppercase tracking-wider">Spesialisasi</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">{selectedResep.doctorSpecialty}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-medium uppercase tracking-wider">Diagnosis</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">{selectedResep.diagnosis}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-medium uppercase tracking-wider">Tanggal Resep</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">{selectedResep.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-medium uppercase tracking-wider">Berlaku Hingga</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">{selectedResep.expiryDate}</p>
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
                    <div key={medicine.id} className="rounded-xl border border-slate-200 p-4 space-y-3 hover:border-blue-300 transition-colors">
                      {/* Medicine header */}
                      <div className="flex items-start justify-between gap-3">
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
