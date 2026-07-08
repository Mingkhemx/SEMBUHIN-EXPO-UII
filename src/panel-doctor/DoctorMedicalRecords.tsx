/**
 * DoctorMedicalRecords — Lihat rekam medis pasien dari panel dokter.
 * Dokter dapat mencari pasien dan menelusuri riwayat konsultasi & resep mereka.
 */

import { useState, useEffect, useCallback } from "react";
import {
  Search, Stethoscope, FileText, Microscope, Calendar,
  User, Activity, ChevronRight, X, Loader2, AlertCircle,
  RefreshCw, Pill, Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DoctorLayout } from "@/panel-doctor/DoctorLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Patient {
  id: string;
  full_name: string;
  email: string;
  date_of_birth?: string;
  gender?: string;
  avatar_url?: string;
}

type RecordType = "semua" | "konsultasi" | "resep";

interface MedicalRecord {
  id: string;
  type: "konsultasi" | "lab" | "resep";
  title: string;
  date: string;
  doctor?: string;
  facility?: string;
  status: string;
  summary: string;
  details: Record<string, string>;
}

interface Stats {
  total: number;
  konsultasi: number;
  lab: number;
  resep: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safeDate(d: string) {
  try { return parseISO(d); } catch { return new Date(); }
}

function typeConfig(type: MedicalRecord["type"]) {
  switch (type) {
    case "konsultasi": return { icon: Stethoscope, label: "Konsultasi", iconBg: "bg-sky-50 text-sky-600",    badge: "bg-sky-50 text-sky-700 border-sky-100"    };
    case "lab":        return { icon: Microscope,  label: "Lab",        iconBg: "bg-violet-50 text-violet-600", badge: "bg-violet-50 text-violet-700 border-violet-100" };
    case "resep":      return { icon: Pill,        label: "Resep",      iconBg: "bg-emerald-50 text-emerald-600", badge: "bg-emerald-50 text-emerald-700 border-emerald-100" };
  }
}

function calcAge(dob?: string): string {
  if (!dob) return "-";
  const diff = Date.now() - new Date(dob).getTime();
  return `${Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))} th`;
}

// ─── Record Detail Modal ───────────────────────────────────────────────────────

function RecordModal({ record, onClose }: { record: MedicalRecord; onClose: () => void }) {
  const cfg = typeConfig(record.type);
  const Icon = cfg.icon;
  return (
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="relative w-full max-w-xl bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", cfg.iconBg)}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <span className={cn("text-[10px] font-bold uppercase tracking-wider border px-1.5 py-0.5 rounded-md block w-fit mb-0.5", cfg.badge)}>
                {cfg.label}
              </span>
              <h3 className="text-[15px] font-bold text-slate-900">{record.title}</h3>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Tanggal</p>
              <p className="text-[14px] font-bold text-slate-900">
                {format(safeDate(record.date), "dd MMM yyyy", { locale: idLocale })}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Status</p>
              <p className="text-[13px] font-semibold text-slate-700 capitalize">{record.status}</p>
            </div>
          </div>

          {Object.keys(record.details).length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Detail</p>
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                {Object.entries(record.details).map(([k, v], i, arr) => (
                  <div key={k} className={cn("flex justify-between gap-4 px-4 py-3", i < arr.length - 1 && "border-b border-slate-50")}>
                    <span className="text-[12px] text-slate-500">{k}</span>
                    <span className="text-[12px] font-semibold text-slate-800 text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {record.summary && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Ringkasan</p>
              <p className="text-[13px] text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                {record.summary}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DoctorMedicalRecords() {
  const { user } = useAuth();
  const [doctorId, setDoctorId] = useState<string | null>(null);

  // Patient selection
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchPatient, setSearchPatient] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientsLoading, setPatientsLoading] = useState(true);

  // Records for selected patient
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, konsultasi: 0, lab: 0, resep: 0 });
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<RecordType>("semua");
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  // ── Resolve doctor ID ──
  useEffect(() => {
    if (!user) return;
    supabase.from("doctors").select("id").eq("user_id", user.id).single()
      .then(({ data }) => { if (data) setDoctorId(data.id); });
  }, [user]);

  // ── Fetch patients of this doctor ──
  const fetchPatients = useCallback(async () => {
    if (!doctorId) return;
    setPatientsLoading(true);
    try {
      const params = new URLSearchParams({ doctor_id: doctorId, per_page: "50" });
      if (searchPatient) params.set("search", searchPatient);
      const res = await fetch(`https://sembuhin-expo-uii-production.up.railway.app/api/doctor/patients?${params}`);
      const data = await res.json();
      if (data.success) setPatients(data.data);
    } catch (e) { console.error(e); }
    finally { setPatientsLoading(false); }
  }, [doctorId, searchPatient]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  // ── Fetch records when a patient is selected ──
  const fetchRecords = useCallback(async (patientId: string) => {
    setRecordsLoading(true);
    setRecordsError(null);
    try {
      const res = await fetch(`https://sembuhin-expo-uii-production.up.railway.app/api/patient/medical-records?patient_id=${patientId}`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.data);
        setStats(data.stats);
      } else {
        throw new Error(data.error || "Gagal mengambil data");
      }
    } catch (e: any) { setRecordsError(e.message); }
    finally { setRecordsLoading(false); }
  }, []);

  const handleSelectPatient = (p: Patient) => {
    setSelectedPatient(p);
    setActiveTab("semua");
    fetchRecords(p.id);
  };

  const filteredRecords = records.filter((r) =>
    activeTab === "semua" || r.type === activeTab
  );

  const TABS: { key: RecordType; label: string; count: number }[] = [
    { key: "semua",      label: "Semua",      count: stats.total      },
    { key: "konsultasi", label: "Konsultasi", count: stats.konsultasi },
    { key: "resep",      label: "Resep",      count: stats.resep      },
  ];

  return (
    <DoctorLayout title="Rekam Medis Pasien">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">

          {/* ── LEFT: Patient List ──────────────────────────────────── */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col h-fit lg:sticky lg:top-6">
            <div className="p-4 border-b border-slate-100">
              <p className="text-[13px] font-bold text-slate-700 mb-3">Pasien Saya</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama pasien..."
                  value={searchPatient}
                  onChange={(e) => setSearchPatient(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-[13px] focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>
            </div>

            <div className="overflow-y-auto max-h-[60vh]">
              {patientsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
                </div>
              ) : patients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <User className="h-8 w-8 text-slate-200 mb-2" />
                  <p className="text-[12px] text-slate-400">Belum ada pasien</p>
                </div>
              ) : (
                patients.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPatient(p)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-slate-50 last:border-0 transition-colors",
                      selectedPatient?.id === p.id
                        ? "bg-sky-50"
                        : "hover:bg-slate-50"
                    )}
                  >
                    <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 text-[12px] font-bold text-slate-600">
                      {(p.full_name || p.email)[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-[13px] font-semibold truncate",
                        selectedPatient?.id === p.id ? "text-sky-700" : "text-slate-900"
                      )}>
                        {p.full_name || "Tanpa Nama"}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{p.email}</p>
                    </div>
                    {selectedPatient?.id === p.id && (
                      <span className="h-2 w-2 rounded-full bg-sky-500 flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ── RIGHT: Records ──────────────────────────────────────── */}
          <div>
            {!selectedPatient ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center py-24 text-center px-6">
                <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                  <Activity className="h-7 w-7 text-slate-300" />
                </div>
                <p className="text-[15px] font-semibold text-slate-700 mb-1">Pilih Pasien</p>
                <p className="text-[13px] text-slate-400 max-w-xs">
                  Pilih salah satu pasien di daftar sebelah kiri untuk melihat rekam medisnya.
                </p>
              </div>
            ) : (
              <div>
                {/* Patient header */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-5">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[15px] font-bold text-slate-600 flex-shrink-0">
                      {(selectedPatient.full_name || selectedPatient.email)[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-[17px] font-bold text-slate-900">
                        {selectedPatient.full_name || "Tanpa Nama"}
                      </h2>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                        <span className="text-[12px] text-slate-400">{selectedPatient.email}</span>
                        {selectedPatient.date_of_birth && (
                          <span className="text-[12px] text-slate-400">
                            {calcAge(selectedPatient.date_of_birth)}
                          </span>
                        )}
                        {selectedPatient.gender && (
                          <span className="text-[12px] text-slate-400 capitalize">{selectedPatient.gender}</span>
                        )}
                      </div>
                    </div>
                    {/* Stats chips */}
                    <div className="hidden sm:flex items-center gap-2">
                      {[
                        { label: "Konsultasi", value: stats.konsultasi, color: "bg-sky-50 text-sky-700 border-sky-100" },
                        { label: "Resep",      value: stats.resep,      color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
                      ].map((s) => (
                        <div key={s.label} className={cn("border rounded-xl px-3 py-1.5 text-center", s.color)}>
                          <p className="text-[15px] font-bold leading-none">{s.value}</p>
                          <p className="text-[10px] mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-hide">
                  {TABS.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all",
                        activeTab === tab.key
                          ? "bg-slate-900 text-white"
                          : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                      )}
                    >
                      {tab.label}
                      <span className={cn(
                        "text-[11px] px-1.5 py-0.5 rounded-md font-bold",
                        activeTab === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                      )}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Records */}
                {recordsLoading ? (
                  <div className="bg-white border border-slate-200 rounded-2xl flex items-center justify-center py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                  </div>
                ) : recordsError ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
                    <AlertCircle className="h-8 w-8 text-rose-400 mx-auto mb-2" />
                    <p className="text-[13px] text-slate-600 mb-3">{recordsError}</p>
                    <button
                      onClick={() => fetchRecords(selectedPatient.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-[12px] font-semibold rounded-xl mx-auto hover:bg-slate-800 transition-colors"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Coba Lagi
                    </button>
                  </div>
                ) : filteredRecords.length === 0 ? (
                  <div className="bg-white border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center py-16 text-center">
                    <FileText className="h-8 w-8 text-slate-200 mb-2" />
                    <p className="text-[13px] text-slate-400">Belum ada rekam medis untuk kategori ini.</p>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    <div className="space-y-3">
                      {filteredRecords.map((record, i) => {
                        const cfg = typeConfig(record.type);
                        const Icon = cfg.icon;
                        return (
                          <motion.button
                            key={record.id}
                            layout
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ delay: i * 0.03 }}
                            onClick={() => setSelectedRecord(record)}
                            className="w-full group bg-white border border-slate-200 rounded-2xl p-4 text-left hover:border-slate-300 hover:shadow-sm transition-all"
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0", cfg.iconBg)}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="text-[14px] font-semibold text-slate-900">{record.title}</span>
                                  <span className={cn("text-[10px] font-bold uppercase tracking-wider border px-1.5 py-0.5 rounded-md", cfg.badge)}>
                                    {cfg.label}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-[12px] text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {format(safeDate(record.date), "dd MMM yyyy", { locale: idLocale })}
                                  </span>
                                  <span className="capitalize">{record.status}</span>
                                </div>
                                {record.summary && (
                                  <p className="text-[12px] text-slate-400 mt-1 line-clamp-1">{record.summary}</p>
                                )}
                              </div>
                              <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all flex-shrink-0">
                                <ChevronRight className="h-4 w-4" />
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </AnimatePresence>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Record Detail Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <RecordModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
        )}
      </AnimatePresence>
    </DoctorLayout>
  );
}
