import { useState, useEffect, useCallback } from "react";
import {
  FileText, Plus, Search, CheckCircle, XCircle,
  Loader2, Trash2, Eye, X, User, Calendar, AlertCircle,
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
  dosage: string;
  quantity: number;
  unit: string;
  frequency: string;
  duration: string;
  notes?: string;
  image?: string;
}

interface Prescription {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_email?: string;
  doctor_id: string;
  date: string;
  status: string;
  medicines: Medicine[];
  notes?: string;
  diagnosis?: string;
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
              <p className="text-[14px] font-bold text-slate-900">{presc.patient_name}</p>
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

          {/* Diagnosis */}
          {presc.diagnosis && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Diagnosis</p>
              <p className="text-[13px] text-slate-600 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 leading-relaxed">
                {presc.diagnosis}
              </p>
            </div>
          )}

          {/* Medicines */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Daftar Obat ({presc.medicines.length})</p>
            <div className="space-y-2">
              {presc.medicines.map((med, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-[14px] font-semibold text-slate-900">{med.name}</p>
                      <p className="text-[12px] text-slate-500 mt-0.5">{med.dosage}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-[11px]">
                    <span className="bg-white px-2 py-1 rounded border border-slate-100"><strong>Qty:</strong> {med.quantity} {med.unit}</span>
                    <span className="bg-white px-2 py-1 rounded border border-slate-100"><strong>Frek:</strong> {med.frequency}</span>
                    <span className="bg-white px-2 py-1 rounded border border-slate-100"><strong>Durasi:</strong> {med.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {presc.notes && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Catatan</p>
              <p className="text-[13px] text-slate-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 leading-relaxed">
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
  const [diagnosis, setDiagnosis] = useState("");
  const [newMedicines, setNewMedicines] = useState<Medicine[]>([
    { name: "", dosage: "", quantity: 1, unit: "tablet", frequency: "", duration: "" }
  ]);
  const [newNotes, setNewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctorName, setDoctorName] = useState("Loading...");

  // Get doctor ID
  const getDoctorId = async () => {
    if (!user) return null;
    const { data: doc } = await supabase
      .from("doctors")
      .select("id")
      .eq("user_id", user.id)
      .single();
    return doc?.id || null;
  };

  // Fetch prescriptions
  const fetchPrescriptions = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const doctorId = await getDoctorId();
      if (!doctorId) return;

      const { data: prescData, error: prescError } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("doctor_id", doctorId)
        .order("created_at", { ascending: false });

      if (prescError) throw prescError;

      // Fetch patient details in batch
      if (prescData && prescData.length > 0) {
        const patientIds = [...new Set(prescData.map(p => p.patient_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", patientIds);

        const profileMap: Record<string, { full_name: string; email?: string }> = {};
        if (profilesData) {
          profilesData.forEach(p => {
            profileMap[p.id] = {
              full_name: p.full_name || "Pasien",
              email: p.email
            };
          });
        }

        const transformed: Prescription[] = prescData.map(p => ({
          id: p.id,
          patient_id: p.patient_id,
          patient_name: profileMap[p.patient_id]?.full_name || "Pasien",
          patient_email: profileMap[p.patient_id]?.email,
          doctor_id: p.doctor_id,
          date: p.created_at,
          status: p.status,
          medicines: p.medicines || [],
          notes: p.notes,
          diagnosis: p.diagnosis,
        }));

        setPrescriptions(transformed);
      } else {
        setPrescriptions([]);
      }
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
      toast.error("Gagal memuat resep");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch patients - SIMPLIFIED VERSION
  const fetchPatients = useCallback(async () => {
    if (!user) return;
    try {
      console.log("🔍 Fetching patients...");
      
      // Fetch ALL profiles without any filter first
      const { data: allProfiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, role");

      if (profileError) {
        console.error("❌ Error fetching profiles:", profileError);
        return;
      }

      console.log("✅ Fetched profiles:", allProfiles?.length || 0);

      if (allProfiles && allProfiles.length > 0) {
        // Filter out doctors and admins manually
        const regularUsers = allProfiles.filter(
          p => p.role !== "doctor" && p.role !== "admin"
        );

        console.log("👥 Regular users:", regularUsers.length);

        const patientList = regularUsers.map(p => ({
          id: p.id,
          full_name: p.full_name || p.email || "User",
        }));

        setPatients(patientList);
        console.log("✅ Patients loaded:", patientList);
      } else {
        console.warn("⚠️ No profiles found in database");
        setPatients([]);
      }
    } catch (err) {
      console.error("❌ Catch error fetching patients:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchPrescriptions();
    fetchPatients();
    fetchDoctorName();
  }, [fetchPrescriptions, fetchPatients]);

  // Fetch current doctor name
  const fetchDoctorName = async () => {
    if (!user) return;
    try {
      const doctorId = await getDoctorId();
      if (!doctorId) return;

      const { data: doctor } = await supabase
        .from("doctors")
        .select("user_id")
        .eq("id", doctorId)
        .single();

      if (doctor?.user_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", doctor.user_id)
          .single();

        setDoctorName(profile?.full_name || "Dokter");
      }
    } catch (err) {
      console.error("Error fetching doctor name:", err);
    }
  };

  // Create prescription
  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || newMedicines.some((m) => !m.name)) {
      toast.error("Pilih pasien dan isi minimal satu obat");
      return;
    }

    try {
      setIsSubmitting(true);
      const doctorId = await getDoctorId();
      if (!doctorId) throw new Error("Doctor not found");

      const prescriptionData = {
        doctor_id: doctorId,
        patient_id: selectedPatientId,
        medicines: newMedicines,
        diagnosis: diagnosis || null,
        notes: newNotes || null,
        status: "Pending",
        // Auto-populate doctor info saat buat resep
        doctor_name: doctorName,
        doctor_specialty: "Umum", // TODO: get from doctor profile
      };

      const { error } = await supabase
        .from("prescriptions")
        .insert([prescriptionData]);

      if (error) throw error;

      toast.success("Resep berhasil diterbitkan");
      setShowCreateModal(false);
      setSelectedPatientId("");
      setDiagnosis("");
      setNewMedicines([
        { name: "", dosage: "", quantity: 1, unit: "tablet", frequency: "", duration: "" }
      ]);
      setNewNotes("");
      fetchPrescriptions();
    } catch (err: any) {
      toast.error(err.message || "Gagal menerbitkan resep");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mark as dispensed
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

  // Medicine helpers
  const addMedicineRow = () =>
    setNewMedicines([
      ...newMedicines,
      { name: "", dosage: "", quantity: 1, unit: "tablet", frequency: "", duration: "" }
    ]);

  const removeMedicineRow = (i: number) =>
    setNewMedicines(newMedicines.filter((_, idx) => idx !== i));

  const updateMedicine = (i: number, field: keyof Medicine, value: any) => {
    const updated = [...newMedicines];
    updated[i] = { ...updated[i], [field]: value };
    setNewMedicines(updated);
  };

  const filtered = prescriptions.filter((p) =>
    p.patient_name.toLowerCase().includes(searchQuery.toLowerCase())
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
                          <h3 className="font-semibold text-slate-900">{presc.patient_name}</h3>
                          <span
                            className={cn(
                              "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
                              presc.status === "Dispensed"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : presc.status === "Pending"
                                  ? "bg-amber-50 text-amber-700 border-amber-100"
                                  : "bg-rose-50 text-rose-700 border-rose-100"
                            )}
                          >
                            {presc.status === "Dispensed"
                              ? "Sudah Diambil"
                              : presc.status === "Pending"
                                ? "Menunggu"
                                : "Dibatalkan"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">
                          {format(new Date(presc.date), "dd MMM yyyy, HH:mm", {
                            locale: idLocale,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Daftar Obat ({presc.medicines.length})
                      </p>
                      {presc.medicines.slice(0, 2).map((med, i) => (
                        <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                          <p className="font-medium text-slate-900 text-sm">{med.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {med.dosage} · {med.frequency} · {med.duration}
                          </p>
                        </div>
                      ))}
                      {presc.medicines.length > 2 && (
                        <p className="text-xs text-slate-500 italic">
                          +{presc.medicines.length - 2} obat lainnya
                        </p>
                      )}
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
                        {markingId === presc.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
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
              {/* Doctor Name - Locked */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Dokter Penanggung Jawab
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={doctorName}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-semibold cursor-not-allowed text-sm"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">
                    TERKUNCI
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  ✓ Resep ini akan tercatat atas nama Anda sebagai dokter penanggung jawab
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Pilih Pasien
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-sm"
                  required
                >
                  <option value="">-- Pilih Pasien --</option>
                  {patients.length === 0 && (
                    <option disabled>Loading patients...</option>
                  )}
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1.5">
                  {patients.length > 0 
                    ? `${patients.length} pasien tersedia` 
                    : "Sedang memuat daftar pasien..."}
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Diagnosis (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Cth: Sakit Kepala Migrain"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-sm"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700">Daftar Obat</label>
                  <button
                    type="button"
                    onClick={addMedicineRow}
                    className="text-sky-600 hover:text-sky-700 text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> Tambah Obat
                  </button>
                </div>
                {newMedicines.map((med, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50 relative group"
                  >
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
                        placeholder="Dosis (cth: 2 tablet)"
                        value={med.dosage}
                        onChange={(e) => updateMedicine(idx, "dosage", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none text-sm"
                        required
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          placeholder="Qty"
                          type="number"
                          min="1"
                          value={med.quantity}
                          onChange={(e) => updateMedicine(idx, "quantity", parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none text-sm"
                          required
                        />
                        <select
                          value={med.unit}
                          onChange={(e) => updateMedicine(idx, "unit", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none text-sm"
                        >
                          <option>tablet</option>
                          <option>kaplet</option>
                          <option>ml</option>
                          <option>tetes</option>
                          <option>sachet</option>
                        </select>
                      </div>
                      <input
                        placeholder="Frekuensi (cth: 3x1 sehari)"
                        value={med.frequency}
                        onChange={(e) => updateMedicine(idx, "frequency", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none text-sm"
                        required
                      />
                      <input
                        placeholder="Durasi (cth: 7 hari)"
                        value={med.duration}
                        onChange={(e) => updateMedicine(idx, "duration", e.target.value)}
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
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Catatan Tambahan (Opsional)
                </label>
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
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" /> Terbitkan Resep Digital
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </DoctorLayout>
  );
}
