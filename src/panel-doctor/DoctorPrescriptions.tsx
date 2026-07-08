import { useState, useEffect, useCallback } from "react";
import {
  FileText, Plus, Search, CheckCircle, XCircle,
  Loader2, Trash2, Eye, X, User, Calendar,
} from "lucide-react";
import { DoctorLayout } from "@/panel-doctor/DoctorLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Medicine {
  name: string;
  dose: string;
  days: number | string;
}

interface Prescription {
  id: string;
  patient_id: string;
  patient: string;
  date: string;
  status: string;
  medicines: Medicine[];
  notes?: string;
}

// ─── Prescription Detail Modal ────────────────────────────────────────────────

function PrescriptionModal({
  presc,
  onClose,
}: {
  presc: Prescription;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
      />

      {/* Panel */}
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="relative w-full max-w-lg bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Resep Digital</p>
              <p className="text-[14px] font-bold text-slate-900">#{presc.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <User className="h-3 w-3" /> Pasien
              </p>
              <p className="text-[14px] font-bold text-slate-900">{presc.patient}</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Tanggal
              </p>
              <p className="text-[13px] font-bold text-slate-900">
                {format(new Date(presc.date), "dd MMM yyyy", { locale: idLocale })}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border",
              presc.status === "Dispensed"
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : presc.status === "Pending"
                  ? "bg-amber-50 text-amber-700 border-amber-100"
                  : "bg-rose-50 text-rose-700 border-rose-100"
            )}>
              {presc.status === "Dispensed" ? "Sudah Diambil"
                : presc.status === "Pending" ? "Menunggu"
                : "Dibatalkan"}
            </span>
          </div>

          {/* Medicines */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Daftar Obat</p>
            <div className="space-y-2">
              {presc.medicines.map((med, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[14px] font-semibold text-slate-900">{med.name}</p>
                    <span className="text-[11px] text-slate-400 flex-shrink-0">{med.days} hari</span>
                  </div>
                  <p className="text-[12px] text-slate-500 mt-0.5">{med.dose}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {presc.notes && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Catatan</p>
              <p className="text-[13px] text-slate-600 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 leading-relaxed">
                {presc.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-[13px] font-semibold hover:bg-slate-800 transition-colors"
          >
            Tutup
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DoctorPrescriptions() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<{ id: string; full_name: string }[]>([]);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [viewPresc, setViewPresc] = useState<Prescription | null>(null);

  // Form state
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [newMedicines, setNewMedicines] = useState<Medicine[]>([{ name: "", dose: "", days: "" }]);
  const [newNotes, setNewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPrescriptions = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data: doc } = await supabase.from("doctors").select("id").eq("user_id", user.id).single();
      if (!doc) return;
      const res = await fetch(`http://127.0.0.1:5001/api/doctor/prescriptions?doctor_id=${doc.id}`);
      const data = await res.json();
      if (data.success) setPrescriptions(data.data);
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchPatients = useCallback(async () => {
    if (!user) return;
    try {
      const { data: doc } = await supabase.from("doctors").select("id").eq("user_id", user.id).single();
      if (!doc) return;
      const res = await fetch(`http://127.0.0.1:5001/api/doctor/patients?doctor_id=${doc.id}`);
      const data = await res.json();
      if (data.success) {
        setPatients(data.data.map((p: any) => ({ id: p.id, full_name: p.full_name || p.email })));
      }
    } catch (err) {
      console.error("Error fetching patients:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchPrescriptions();
    fetchPatients();
  }, [fetchPrescriptions, fetchPatients]);

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || newMedicines.some((m) => !m.name)) {
      toast.error("Pilih pasien dan isi minimal satu obat");
      return;
    }
    try {
      setIsSubmitting(true);
      const { data: doc } = await supabase.from("doctors").select("id").eq("user_id", user?.id).single();
      if (!doc) return;
      const res = await fetch("http://127.0.0.1:5001/api/doctor/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_id: doc.id,
          patient_id: selectedPatientId,
          medicines: newMedicines,
          notes: newNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Resep berhasil diterbitkan");
        setShowCreateModal(false);
        setSelectedPatientId("");
        setNewMedicines([{ name: "", dose: "", days: "" }]);
        setNewNotes("");
        fetchPrescriptions();
      } else {
        throw new Error(data.error || "Gagal menerbitkan resep");
      }
    } catch (err: any) {
      toast.error(err.message || "Koneksi gagal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkDone = async (prescId: string) => {
    setMarkingId(prescId);
    try {
      const { error } = await supabase
        .from("prescriptions")
        .update({ status: "Dispensed" })
        .eq("id", prescId);
      if (error) throw error;
      toast.success("Resep ditandai sudah diambil");
      fetchPrescriptions();
    } catch (err: any) {
      toast.error("Gagal mengubah status: " + err.message);
    } finally {
      setMarkingId(null);
    }
  };

  const addMedicineRow = () => setNewMedicines([...newMedicines, { name: "", dose: "", days: "" }]);
  const removeMedicineRow = (i: number) => setNewMedicines(newMedicines.filter((_, idx) => idx !== i));
  const updateMedicine = (i: number, field: keyof Medicine, value: string) => {
    const updated = [...newMedicines];
    updated[i] = { ...updated[i], [field]: value };
    setNewMedicines(updated);
  };

  const filtered = prescriptions.filter((p) =>
    p.patient.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DoctorLayout
      title="Resep"
      headerAction={
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 transition-all"
        >
          <Plus className="h-4 w-4" />
          Buat Resep Baru
        </button>
      }
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari resep berdasarkan nama pasien..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-sky-500 animate-spin" />
            <p className="text-slate-500 text-sm">Memuat data resep...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">Belum ada resep</p>
            <p className="text-slate-400 text-sm mt-1">Daftar resep yang Anda buat akan muncul di sini.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((presc) => (
              <div
                key={presc.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-semibold text-slate-900">{presc.patient}</h3>
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
                            presc.status === "Dispensed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : presc.status === "Pending"
                                ? "bg-amber-50 text-amber-700 border-amber-100"
                                : "bg-rose-50 text-rose-700 border-rose-100"
                          )}>
                            {presc.status === "Dispensed" ? "Sudah Diambil"
                              : presc.status === "Pending" ? "Menunggu"
                              : "Dibatalkan"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">
                          {format(new Date(presc.date), "dd MMM yyyy, HH:mm", { locale: idLocale })}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Daftar Obat</p>
                      {presc.medicines.map((med, i) => (
                        <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                          <p className="font-medium text-slate-900 text-sm">{med.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{med.dose} · {med.days} hari</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:ml-4 flex-shrink-0">
                    <button
                      onClick={() => setViewPresc(presc)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-all"
                    >
                      <Eye className="h-4 w-4" />
                      Lihat Resep
                    </button>
                    {presc.status === "Pending" && (
                      <button
                        onClick={() => handleMarkDone(presc.id)}
                        disabled={markingId === presc.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {markingId === presc.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <CheckCircle className="h-4 w-4" />}
                        Tandai Selesai
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Prescription Detail Modal ── */}
      <AnimatePresence>
        {viewPresc && (
          <PrescriptionModal presc={viewPresc} onClose={() => setViewPresc(null)} />
        )}
      </AnimatePresence>

      {/* ── Create Prescription Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Buat Resep Digital</h2>
                <p className="text-sm text-slate-500">Isi detail obat untuk pasien Anda</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreatePrescription} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Pasien</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-sm"
                  required
                >
                  <option value="">-- Pilih Pasien Konsultasi --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.full_name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700">Daftar Obat</label>
                  <button type="button" onClick={addMedicineRow} className="text-sky-600 hover:text-sky-700 text-xs font-bold flex items-center gap-1">
                    <Plus className="h-3.5 w-3.5" /> Tambah Obat
                  </button>
                </div>
                {newMedicines.map((med, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50 relative group">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <input
                          placeholder="Nama Obat (cth: Amoxicillin 500mg)"
                          value={med.name}
                          onChange={(e) => updateMedicine(idx, "name", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none text-sm"
                          required
                        />
                      </div>
                      <input
                        placeholder="Dosis (cth: 3x1 sesudah makan)"
                        value={med.dose}
                        onChange={(e) => updateMedicine(idx, "dose", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none text-sm"
                        required
                      />
                      <input
                        placeholder="Durasi (hari)"
                        type="number"
                        value={med.days}
                        onChange={(e) => updateMedicine(idx, "days", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none text-sm"
                        required
                      />
                    </div>
                    {newMedicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicineRow(idx)}
                        className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Catatan Tambahan (Opsional)</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Instruksi khusus untuk pasien..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-sm h-24 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Memproses...</>
                ) : (
                  <><CheckCircle className="h-5 w-5" /> Terbitkan Resep Digital</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </DoctorLayout>
  );
}
