import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Search, Download, Calendar, User, Activity,
  FileText, Microscope, Stethoscope, X,
  Loader2, AlertCircle, ChevronRight, RefreshCw,
  Heart, Pill,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const Route = createFileRoute("/rekam-medis")({
  head: () => ({
    meta: [
      { title: "Rekam Medis — Sembuhin" },
      { name: "description", content: "Riwayat kesehatan lengkap Anda." },
    ],
  }),
  component: MedicalRecordsPage,
});

// ─── Types ─────────────────────────────────────────────────────────────────────

type RecordType = "semua" | "konsultasi" | "lab" | "resep";

interface MedicalRecord {
  id: string;
  type: "konsultasi" | "lab" | "resep";
  title: string;
  date: string;
  doctor?: string;
  facility?: string;
  status: "selesai" | "diproses" | "pending" | "dibatalkan";
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

function safeDate(dateStr: string) {
  try { return parseISO(dateStr); } catch { return new Date(); }
}

function typeConfig(type: MedicalRecord["type"]) {
  switch (type) {
    case "konsultasi": return {
      icon: Stethoscope,
      label: "Konsultasi",
      dot: "bg-sky-500",
      badge: "bg-sky-50 text-sky-700 border-sky-100",
      iconBg: "bg-sky-50 text-sky-600",
    };
    case "lab": return {
      icon: Microscope,
      label: "Lab",
      dot: "bg-violet-500",
      badge: "bg-violet-50 text-violet-700 border-violet-100",
      iconBg: "bg-violet-50 text-violet-600",
    };
    case "resep": return {
      icon: Pill,
      label: "Resep",
      dot: "bg-emerald-500",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
      iconBg: "bg-emerald-50 text-emerald-600",
    };
  }
}

function statusConfig(status: MedicalRecord["status"]) {
  switch (status) {
    case "selesai":   return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "diproses":  return "bg-amber-50 text-amber-700 border-amber-100";
    case "pending":   return "bg-amber-50 text-amber-700 border-amber-100";
    case "dibatalkan": return "bg-rose-50 text-rose-700 border-rose-100";
  }
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function RecordModal({ record, onClose }: { record: MedicalRecord; onClose: () => void }) {
  const cfg = typeConfig(record.type);
  const Icon = cfg.icon;

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
        className="relative w-full max-w-2xl bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", cfg.iconBg)}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className={cn("text-[11px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded-md w-fit mb-1", cfg.badge)}>
                {cfg.label}
              </p>
              <h2 className="text-lg font-bold text-slate-900 leading-snug">{record.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Meta row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Tanggal</p>
              <p className="text-[15px] font-bold text-slate-900">
                {format(safeDate(record.date), "dd MMM yyyy", { locale: idLocale })}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {format(safeDate(record.date), "HH:mm", { locale: idLocale })}
              </p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Status</p>
              <span className={cn("inline-flex items-center gap-1.5 text-[13px] font-semibold px-2.5 py-1 rounded-lg border", statusConfig(record.status))}>
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                <span className="capitalize">{record.status}</span>
              </span>
            </div>
          </div>

          {/* Doctor / Facility */}
          {(record.doctor || record.facility) && (
            <div className="flex flex-wrap gap-3">
              {record.doctor && (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-[13px] font-medium text-slate-700">{record.doctor}</span>
                </div>
              )}
              {record.facility && (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5">
                  <Activity className="h-4 w-4 text-slate-400" />
                  <span className="text-[13px] font-medium text-slate-700">{record.facility}</span>
                </div>
              )}
            </div>
          )}

          {/* Details */}
          {Object.keys(record.details).length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Detail Pemeriksaan</p>
              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                {Object.entries(record.details).map(([key, value], i, arr) => (
                  <div
                    key={key}
                    className={cn(
                      "flex items-start justify-between gap-4 px-4 py-3.5",
                      i < arr.length - 1 && "border-b border-slate-50"
                    )}
                  >
                    <span className="text-[13px] text-slate-500 flex-shrink-0">{key}</span>
                    <span className="text-[13px] font-semibold text-slate-800 text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {record.summary && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Ringkasan</p>
              <p className="text-[14px] text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4">
                {record.summary}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 flex gap-3">
          {record.type === "resep" ? (
            <Link
              to="/resep"
              search={{ id: record.id }}
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 text-white text-[13px] font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
              <FileText className="h-4 w-4" />
              Lihat Resep Digital
            </Link>
          ) : (
            <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 text-white text-[13px] font-bold rounded-xl hover:bg-slate-800 transition-colors">
              <Download className="h-4 w-4" />
              Unduh Dokumen
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function MedicalRecordsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<RecordType>("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, konsultasi: 0, lab: 0, resep: 0 });

  const fetchRecords = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`https://sembuhin-expo-uii-production.up.railway.app/api/patient/medical-records?patient_id=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.data);
        setStats(data.stats);
      } else {
        throw new Error(data.error || "Gagal mengambil data");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, [user]);

  const filtered = useMemo(() => records.filter((r) => {
    const matchTab = activeTab === "semua" || r.type === activeTab;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || r.title.toLowerCase().includes(q) ||
      r.summary.toLowerCase().includes(q) ||
      r.doctor?.toLowerCase().includes(q);
    return matchTab && matchSearch;
  }), [records, activeTab, searchQuery]);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 pb-20">
        <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Loader2 className="h-7 w-7 text-slate-400 animate-spin" />
        </div>
        <p className="text-[15px] text-slate-500 font-medium">Memuat riwayat medis...</p>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center pb-20">
        <div className="h-14 w-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
          <AlertCircle className="h-7 w-7 text-rose-500" />
        </div>
        <div>
          <h2 className="text-[17px] font-bold text-slate-900 mb-1">Gagal Memuat Data</h2>
          <p className="text-[14px] text-slate-500 max-w-sm">{error}</p>
        </div>
        <button
          onClick={fetchRecords}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-[13px] font-semibold rounded-xl hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="h-4 w-4" /> Coba Lagi
        </button>
      </div>
    );
  }

  const TABS: { key: RecordType; label: string; count: number }[] = [
    { key: "semua",     label: "Semua",      count: stats.total      },
    { key: "konsultasi",label: "Konsultasi", count: stats.konsultasi },
    { key: "lab",       label: "Lab",        count: stats.lab        },
    { key: "resep",     label: "Resep",      count: stats.resep      },
  ];

  return (
    <div className="min-h-screen pb-24">

      {/* ── HERO CARD ──────────────────────────────────────────────── */}
      <div className="px-4 pt-28 pb-0 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative rounded-3xl overflow-hidden mb-6"
          style={{ background: "linear-gradient(145deg, oklch(0.17 0.04 250), oklch(0.13 0.05 260))", minHeight: 220 }}
        >
          {/* Blobs */}
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-violet-500/8 blur-3xl pointer-events-none" />
          {/* Grid lines */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.035]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "52px 52px" }} />

          {/* Floating stat chips — desktop only */}
          <div className="absolute top-6 right-6 flex-col gap-2 hidden md:flex">
            {[
              { icon: Stethoscope, label: "Konsultasi",  value: stats.konsultasi, color: "text-sky-400"    },
              { icon: Microscope,  label: "Lab",         value: stats.lab,        color: "text-violet-400" },
              { icon: Pill,        label: "Resep",       value: stats.resep,      color: "text-emerald-400"},
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center gap-2.5 bg-white/5 border border-white/8 backdrop-blur-sm rounded-xl px-3.5 py-2">
                <span className="h-6 w-6 rounded-lg bg-white/8 flex items-center justify-center flex-shrink-0">
                  <Icon className={cn("h-3.5 w-3.5", color)} />
                </span>
                <span className="text-[12px] font-medium text-white/60">{label}</span>
                <span className={cn("ml-auto text-[13px] font-bold", color)}>{value}</span>
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="relative px-8 py-10 md:py-12 max-w-lg">
            <div className="inline-flex items-center gap-2 bg-white/8 border border-white/10 rounded-full px-3.5 py-1.5 mb-5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400" />
              </span>
              <span className="text-[11px] font-bold text-white/60 tracking-widest uppercase">Rekam Medis Mandiri</span>
            </div>

            <h1 className="text-[2.25rem] sm:text-[2.75rem] font-bold text-white leading-[1.05] tracking-tight mb-3">
              Riwayat<br />Kesehatanmu.
            </h1>
            <p className="text-[14px] text-white/45 leading-relaxed mb-7 max-w-sm">
              Semua riwayat konsultasi, hasil lab, dan resep tersimpan aman dan bisa diakses kapan saja.
            </p>

            {/* Bottom row — stats inline + export */}
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { label: "Total",      value: stats.total,      dot: "bg-sky-400"     },
                { label: "Konsultasi", value: stats.konsultasi, dot: "bg-emerald-400" },
                { label: "Resep",      value: stats.resep,      dot: "bg-violet-400"  },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1.5 bg-white/6 border border-white/8 rounded-xl px-3 py-1.5">
                  <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
                  <span className="text-[12px] font-bold text-white/80">{s.value}</span>
                  <span className="text-[11px] text-white/40">{s.label}</span>
                </div>
              ))}
              <button className="ml-auto flex items-center gap-2 px-4 py-2 bg-white text-slate-900 text-[12px] font-bold rounded-xl hover:bg-slate-100 transition-colors">
                <Download className="h-3.5 w-3.5" /> Ekspor PDF
              </button>
            </div>
          </div>
        </motion.div>

        {/* Search + Tabs row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari konsultasi, dokter, atau obat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-[14px] placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide mb-5">
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
      </div>

      {/* ── RECORDS LIST ───────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 bg-white border border-dashed border-slate-200 rounded-3xl text-center"
            >
              <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                <Heart className="h-7 w-7 text-slate-300" />
              </div>
              <p className="text-[15px] font-semibold text-slate-700 mb-1">Belum ada rekam medis</p>
              <p className="text-[13px] text-slate-400">Riwayat akan muncul setelah Anda berkonsultasi.</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filtered.map((record, i) => {
                const cfg = typeConfig(record.type);
                const Icon = cfg.icon;
                return (
                  <motion.button
                    key={record.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSelectedRecord(record)}
                    className="w-full group bg-white border border-slate-100 rounded-2xl p-5 text-left hover:border-slate-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0", cfg.iconBg)}>
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-[15px] font-semibold text-slate-900">{record.title}</h3>
                          <span className={cn("text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded-md", cfg.badge)}>
                            {cfg.label}
                          </span>
                          <span className={cn("text-[10px] font-semibold border px-2 py-0.5 rounded-md capitalize", statusConfig(record.status))}>
                            {record.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-[12px] text-slate-400 mb-2">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(safeDate(record.date), "dd MMM yyyy", { locale: idLocale })}
                          </span>
                          {record.doctor && (
                            <span className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5" />
                              {record.doctor}
                            </span>
                          )}
                        </div>

                        {record.summary && (
                          <p className="text-[13px] text-slate-500 line-clamp-1">{record.summary}</p>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className="flex-shrink-0 h-8 w-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:border-slate-900 group-hover:text-white transition-all">
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <RecordModal
            record={selectedRecord}
            onClose={() => setSelectedRecord(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
