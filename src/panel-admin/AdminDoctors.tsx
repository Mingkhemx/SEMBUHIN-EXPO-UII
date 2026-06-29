/**
 * AdminDoctors — Manajemen & Verifikasi Dokter
 * Tersambung ke Supabase: tabel doctor_registrations & doctors
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Check, X, Eye, UserX, Search, UserCheck, Loader2, RefreshCw, AlertCircle, ZoomIn, ZoomOut, RotateCw, Download, CheckCircle, XCircle, AlertTriangle, UserPlus, Mail, Phone, MapPin, Star, Calendar, Award, Users, Clock, ShieldCheck } from "lucide-react";
import { AdminLayout, StatusBadge } from "@/panel-admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { Avatar } from "@/components/Avatar";

// ─── Types ────────────────────────────────────────────────────────────────────

type RegistrationStatus = "pending" | "approved" | "rejected";

type DoctorRegistration = {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  license_number: string;
  hospital?: string;
  practice_location?: string;
  experience_years: string;
  status: RegistrationStatus;
  created_at: string;
  notes?: string;
  // Link ke auth user (jika dokter mendaftar saat login)
  user_id?: string | null;
  // Dokumen paths (private storage)
  ktp_path?: string;
  str_path?: string;
  sip_path?: string;
  diploma_path?: string;
  cv_path?: string;
};

type ActiveDoctor = {
  id: string;
  name: string;
  specialty: string;
  email: string;
  hospital: string;
  is_active: boolean;
  joined_at: string;
  total_patients: number;
  rating: number;
  avatar_url?: string | null;
  phone?: string;
  license_number?: string;
  description?: string;
  available?: string;
};

// ─── Document Viewer Overlay ──────────────────────────────────────────────────

type DocViewer = {
  url: string;
  label: string;
  isPdf: boolean;
};

function DocumentViewerOverlay({
  viewer,
  onClose,
}: {
  viewer: DocViewer;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.85)" }}
        onClick={onClose}
      >
        {/* Panel */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-3 bg-slate-800 border-b border-slate-700 flex-shrink-0">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-sky-400" />
              <span className="text-white text-sm font-semibold">{viewer.label}</span>
              <span className="text-slate-400 text-xs ml-1">
                {viewer.isPdf ? "PDF" : "Gambar"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {!viewer.isPdf && (
                <>
                  <button
                    onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                    className="p-2 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Perkecil"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="text-slate-400 text-xs w-10 text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                    className="p-2 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Perbesar"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="p-2 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Putar"
                  >
                    <RotateCw className="h-4 w-4" />
                  </button>
                  <div className="w-px h-5 bg-slate-700 mx-1" />
                </>
              )}
              <a
                href={viewer.url}
                download
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </a>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-rose-600 text-slate-300 hover:text-white transition-colors ml-1"
                title="Tutup (Esc)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-950 min-h-0">
            {viewer.isPdf ? (
              <iframe
                src={viewer.url}
                className="w-full h-full min-h-[70vh]"
                title={viewer.label}
              />
            ) : (
              <div className="overflow-auto w-full h-full flex items-center justify-center p-4">
                <img
                  src={viewer.url}
                  alt={viewer.label}
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: "transform 0.2s ease",
                    maxWidth: "100%",
                    maxHeight: "75vh",
                    objectFit: "contain",
                    borderRadius: "8px",
                  }}
                  draggable={false}
                />
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="px-5 py-2 bg-slate-800 border-t border-slate-700 flex-shrink-0">
            <p className="text-slate-500 text-xs text-center">
              Klik di luar atau tekan <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 text-[10px] font-mono">Esc</kbd> untuk menutup
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

type Tab = "all" | "pending" | "rejected";

// ─── Confirm Modal ────────────────────────────────────────────────────────────

// Data tambahan yang diisi admin saat approve dokter
type ApproveDoctorData = {
  category: string;
  available: string;
  badge: string;
  description: string;
  price: number;
  avatar_url: string;
};

type ConfirmAction = {
  type: "approve" | "reject";
  reg: DoctorRegistration;
};

// Daftar kategori spesialisasi untuk dropdown
const SPECIALTY_CATEGORIES = [
  "Jantung", "Saraf", "Mental", "Kanker", "Kulit", "Tulang",
  "Anak", "Umum", "Kandungan", "Mata", "THT", "Gigi", "Paru-paru",
];

const BADGE_OPTIONS = [
  "Terverifikasi", "Top Rated", "Senior Expert", "Most Booked",
  "Spesialis Bulan Ini", "Highly Rated",
];

function ConfirmModal({
  action,
  onConfirm,
  onCancel,
  loading,
}: {
  action: ConfirmAction;
  onConfirm: (notes: string, approveData?: ApproveDoctorData) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [notes, setNotes] = useState("");
  const isReject = action.type === "reject";

  // Approve-specific form fields
  const [category, setCategory] = useState("");
  const [available, setAvailable] = useState("Senin – Jumat");
  const [badge, setBadge] = useState("Terverifikasi");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("150000");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Derive category from specialty if empty
  const derivedCategory = category || (() => {
    const spec = action.reg.specialty.toLowerCase();
    if (spec.includes("jantung") || spec.includes("kardiovaskular") || spec.includes("penyakit dalam")) return "Jantung";
    if (spec.includes("saraf") || spec.includes("neurologi")) return "Saraf";
    if (spec.includes("psikolog") || spec.includes("mental")) return "Mental";
    if (spec.includes("onkologi") || spec.includes("kanker")) return "Kanker";
    if (spec.includes("dermatologi") || spec.includes("kulit")) return "Kulit";
    if (spec.includes("ortopedi") || spec.includes("tulang")) return "Tulang";
    if (spec.includes("pediatr") || spec.includes("anak")) return "Anak";
    if (spec.includes("kandungan") || spec.includes("obstetri") || spec.includes("ginekologi")) return "Kandungan";
    if (spec.includes("mata")) return "Mata";
    if (spec.includes("tht") || spec.includes("telinga") || spec.includes("hidung")) return "THT";
    if (spec.includes("gigi")) return "Gigi";
    if (spec.includes("paru")) return "Paru-paru";
    return "Umum";
  })();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[998] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 16 }}
        transition={{ duration: 0.18 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className={`h-14 w-14 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
          isReject ? "bg-rose-50" : "bg-emerald-50"
        }`}>
          {isReject
            ? <XCircle className="h-7 w-7 text-rose-500" />
            : <CheckCircle className="h-7 w-7 text-emerald-500" />
          }
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-900 text-center mb-1">
          {isReject ? "Tolak Pendaftaran Dokter?" : "Setujui Pendaftaran Dokter"}
        </h3>
        <p className="text-slate-500 text-sm text-center mb-2">
          <span className="font-semibold text-slate-700">{action.reg.name}</span>
          {" · "}{action.reg.specialty}
        </p>

        {/* User link status */}
        {!isReject && (
          <div className={`mx-auto mb-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
            action.reg.user_id
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}>
            {action.reg.user_id ? (
              <><UserCheck className="h-3.5 w-3.5" /> Akun terhubung — dokter bisa login ke panel</>
            ) : (
              <><AlertTriangle className="h-3.5 w-3.5" /> Belum terhubung ke akun — dokter perlu mendaftar dulu</>
            )}
          </div>
        )}

        {/* ── Approve-specific fields ── */}
        {!isReject && (
          <div className="mb-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data Profil Dokter</p>

            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Kategori Spesialisasi</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
              >
                <option value="">— Otomatis dari spesialisasi —</option>
                {SPECIALTY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Badge */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Badge</label>
              <select
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
              >
                {BADGE_OPTIONS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Available schedule */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Jadwal Praktek</label>
              <input
                type="text"
                value={available}
                onChange={(e) => setAvailable(e.target.value)}
                placeholder="Senin – Jumat"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            {/* Price */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Biaya Konsultasi (Rp)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="150000"
                min="0"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                {Number(price || 0).toLocaleString("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 })}
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Deskripsi Singkat</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder={`Profil singkat ${action.reg.name}...`}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 resize-none"
              />
            </div>

            {/* Avatar URL */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Avatar URL (opsional)</label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                {action.reg.user_id
                  ? "Kosongkan untuk menggunakan foto profil akun dokter secara otomatis"
                  : "Kosongkan untuk menggunakan avatar default"}
              </p>
            </div>
          </div>
        )}

        {/* Notes input */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-slate-700 block mb-2">
            {isReject ? "Alasan penolakan *" : "Catatan untuk dokter (opsional)"}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder={isReject
              ? "Jelaskan alasan penolakan kepada dokter..."
              : "Pesan selamat datang atau instruksi tambahan..."
            }
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 resize-none"
          />
          {isReject && !notes.trim() && (
            <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Alasan penolakan wajib diisi
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-60"
          >
            Batal
          </button>
          <button
            onClick={() => {
              if (isReject) {
                onConfirm(notes);
              } else {
                onConfirm(notes, {
                  category: derivedCategory,
                  available: available || "Senin – Jumat",
                  badge: badge || "Terverifikasi",
                  description: description || `Dokter spesialis ${action.reg.specialty} dengan pengalaman ${action.reg.experience_years} tahun.`,
                  price: Number(price) || 0,
                  avatar_url: avatarUrl || "",
                });
              }
            }}
            disabled={loading || (isReject && !notes.trim())}
            className={`flex-1 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
              isReject
                ? "bg-rose-500 hover:bg-rose-600 text-white"
                : "bg-emerald-500 hover:bg-emerald-600 text-white"
            }`}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isReject ? (
              <><XCircle className="h-4 w-4" /> Tolak</>
            ) : (
              <><CheckCircle className="h-4 w-4" /> Setujui</>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminDoctors() {
  const [activeTab, setActiveTab] = useState<Tab>("all");

  // Data state
  const [pendingList, setPendingList] = useState<DoctorRegistration[]>([]);
  const [rejectedList, setRejectedList] = useState<DoctorRegistration[]>([]);
  const [doctorsList, setDoctorsList] = useState<ActiveDoctor[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [docViewer, setDocViewer] = useState<DocViewer | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  // ── Fetch data dari Supabase ──────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Ambil registrasi pending & rejected paralel
      const [pendingRes, rejectedRes, doctorsRes] = await Promise.all([
        supabase
          .from("doctor_registrations")
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: false }),
        supabase
          .from("doctor_registrations")
          .select("*")
          .eq("status", "rejected")
          .order("created_at", { ascending: false }),
        supabase
          .from("doctors")
          .select("*")
          .order("joined_at", { ascending: false }),
      ]);

      if (pendingRes.error) throw pendingRes.error;
      if (rejectedRes.error) throw rejectedRes.error;
      // doctors table mungkin belum ada entri, tidak throw
      if (doctorsRes.error && doctorsRes.error.code !== "PGRST116") {
        console.warn("doctors table:", doctorsRes.error.message);
      }

      setPendingList(pendingRes.data ?? []);
      setRejectedList(rejectedRes.data ?? []);
      setDoctorsList(doctorsRes.data ?? []);
    } catch (err: any) {
      setError(err.message ?? "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Real-time subscription ────────────────────────────────────────────────

  useEffect(() => {
    const channel = supabase
      .channel("doctor_registrations_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "doctor_registrations" },
        () => {
          fetchData(); // refresh saat ada perubahan
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  // ── Approve ───────────────────────────────────────────────────────────────

  async function handleApprove(reg: DoctorRegistration) {
    setConfirmAction({ type: "approve", reg });
  }

  async function doApprove(reg: DoctorRegistration, notes: string, approveData: ApproveDoctorData) {
    setActionLoading(reg.id);
    try {
      const { error: updateErr } = await supabase
        .from("doctor_registrations")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          notes: notes || null,
        })
        .eq("id", reg.id);

      if (updateErr) throw updateErr;

      // Jika dokter punya user_id (mendaftar saat login), ambil avatar dari auth metadata
      let finalAvatarUrl = approveData.avatar_url || null;
      if (reg.user_id) {
        try {
          // Ambil user metadata untuk mendapatkan avatar dari profil akun
          const { data: userData } = await supabase.auth.admin.getUserById(reg.user_id);
          const userAvatar = userData?.user?.user_metadata?.avatar_url;
          if (userAvatar && !approveData.avatar_url) {
            finalAvatarUrl = userAvatar; // Gunakan avatar dari profil akun jika admin tidak isi
          }
        } catch {
          // Tidak bisa mengakses admin API — gunakan avatar yang diisi admin
        }
      }

      // Insert ke tabel doctors — dengan semua field profil
      const { error: insertErr } = await supabase.from("doctors").insert([{
        registration_id: reg.id,
        name: reg.name,
        email: reg.email,
        phone: reg.phone,
        specialty: reg.specialty,
        license_number: reg.license_number,
        hospital: reg.practice_location ?? reg.hospital ?? null,
        experience_years: String(reg.experience_years),
        is_active: true,
        total_patients: 0,
        rating: 0,
        // Link ke auth user
        user_id: reg.user_id || null,
        // Field profil yang diisi admin saat approve
        category: approveData.category,
        available: approveData.available,
        badge: approveData.badge,
        description: approveData.description,
        price: approveData.price,
        avatar_url: finalAvatarUrl,
      }]);

      // 23505 = unique email violation — skip (dokter sudah ada)
      if (insertErr && insertErr.code !== "23505") throw insertErr;

      // Set role "doctor" di user metadata agar dokter bisa login ke /doctor panel
      if (reg.user_id) {
        try {
          const { data: userData } = await supabase.auth.admin.getUserById(reg.user_id);
          if (userData?.user) {
            const existingMeta = userData.user.user_metadata || {};
            await supabase.auth.admin.updateUserById(reg.user_id, {
              user_metadata: {
                ...existingMeta,
                role: "doctor",
                doctor_id: reg.id,  // referensi ke doctors.id untuk lookup cepat
              },
            });
          }
        } catch (metaErr) {
          console.warn("Gagal set role doctor di user metadata:", metaErr);
          // Non-fatal — dokter tetap terdaftar, role bisa di-set manual nanti
        }
      }

      setConfirmAction(null);
      await fetchData();
    } catch (err: any) {
      setError(err.message ?? "Gagal menyetujui pendaftaran");
    } finally {
      setActionLoading(null);
    }
  }

  // ── Reject ────────────────────────────────────────────────────────────────

  async function handleReject(reg: DoctorRegistration) {
    setConfirmAction({ type: "reject", reg });
  }

  async function doReject(reg: DoctorRegistration, notes: string) {
    setActionLoading(reg.id);
    try {
      const { error: updateErr } = await supabase
        .from("doctor_registrations")
        .update({
          status: "rejected",
          reviewed_at: new Date().toISOString(),
          notes,
        })
        .eq("id", reg.id);

      if (updateErr) throw updateErr;

      setConfirmAction(null);
      await fetchData();
    } catch (err: any) {
      setError(err.message ?? "Gagal menolak pendaftaran");
    } finally {
      setActionLoading(null);
    }
  }

  // ── Open document via signed URL → overlay (private bucket) ─────────────

  async function openDocument(path: string | undefined, label: string) {
    if (!path) return;
    try {
      const { data, error } = await supabase.storage
        .from("doctor-documents")
        .createSignedUrl(path, 300); // URL berlaku 5 menit

      if (error) throw error;

      const isPdf = path.toLowerCase().endsWith(".pdf");
      setDocViewer({ url: data.signedUrl, label, isPdf });
    } catch (err: any) {
      setError(`Gagal membuka ${label}: ${err.message}`);
    }
  }

  // ── Deactivate doctor ──────────────────────────────────────────────────────

  async function handleDeactivate(doctorId: string) {
    setActionLoading(doctorId);
    try {
      const { error: updateErr } = await supabase
        .from("doctors")
        .update({ is_active: false })
        .eq("id", doctorId);

      if (updateErr) throw updateErr;

      await fetchData();
    } catch (err: any) {
      setError(err.message ?? "Gagal menonaktifkan dokter");
    } finally {
      setActionLoading(null);
    }
  }

  // ── Activate doctor ────────────────────────────────────────────────────────

  async function handleActivate(doctorId: string) {
    setActionLoading(doctorId);
    try {
      const { error: updateErr } = await supabase
        .from("doctors")
        .update({ is_active: true })
        .eq("id", doctorId);

      if (updateErr) throw updateErr;

      await fetchData();
    } catch (err: any) {
      setError(err.message ?? "Gagal mengaktifkan dokter");
    } finally {
      setActionLoading(null);
    }
  }

  // ── Doctor detail modal state ──────────────────────────────────────────────
  const [viewDoctor, setViewDoctor] = useState<ActiveDoctor | null>(null);

  // ── Tab counts ────────────────────────────────────────────────────────────

  const tabs = [
    { id: "all" as Tab, label: "Semua Dokter", count: doctorsList.length },
    { id: "pending" as Tab, label: "Pending Verifikasi", count: pendingList.length },
    { id: "rejected" as Tab, label: "Ditolak", count: rejectedList.length },
  ];

  const filteredDoctors = doctorsList.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AdminLayout
      title="Manajemen Dokter"
      subtitle="Verifikasi dan kelola akun dokter mitra"
      headerAction={
        <button
          onClick={fetchData}
          className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl px-4 py-2 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      }
    >
      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-rose-500 hover:text-rose-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-white border border-slate-200 rounded-2xl w-fit mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
              activeTab === tab.id
                ? "bg-sky-600 text-white shadow-lg"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
            ].join(" ")}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={[
                  "ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                  activeTab === tab.id
                    ? "bg-white/20 text-white"
                    : tab.id === "pending"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-600",
                ].join(" ")}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading global */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      )}

      {/* ── Tab content ─────────────────────────────────────────────────── */}
      {!loading && (
        <AnimatePresence mode="wait">
          {/* PENDING */}
          {activeTab === "pending" && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {pendingList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                  <UserCheck className="h-12 w-12 mb-3 text-emerald-400/40" />
                  <p className="font-semibold text-slate-600">Semua permintaan sudah ditinjau</p>
                  <p className="text-sm mt-1">Tidak ada pendaftaran yang tertunda</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  <AnimatePresence>
                    {pendingList.map((reg) => (
                      <motion.div
                        key={reg.id}
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, y: -16 }}
                        transition={{ duration: 0.22 }}
                        className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors shadow-sm"
                      >
                        {/* Header */}
                        <div className="p-5 pb-4 flex items-start gap-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-sky-100 to-indigo-100 flex items-center justify-center text-sky-700 text-xl font-bold flex-shrink-0 ring-2 ring-slate-200">
                            {reg.name.split(" ").slice(-1)[0]?.[0] ?? "D"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-slate-900 font-bold text-sm truncate">{reg.name}</h3>
                            <p className="text-sky-600 text-xs font-medium mt-0.5">
                              {reg.specialty}
                            </p>
                            <p className="text-slate-500 text-[11px] mt-1">
                              STR:{" "}
                              <span className="text-slate-600 font-mono">{reg.license_number}</span>
                            </p>
                          </div>
                          <span className="flex-shrink-0 px-2 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Pending
                          </span>
                        </div>

                        {/* Details */}
                        <div className="px-5 pb-4 border-b border-slate-200">
                          <div className="space-y-1.5 mb-3">
                            <div className="flex gap-2 text-xs">
                              <span className="text-slate-500 w-20 flex-shrink-0">Email</span>
                              <span className="text-slate-700 font-medium truncate">{reg.email}</span>
                            </div>
                            <div className="flex gap-2 text-xs">
                              <span className="text-slate-500 w-20 flex-shrink-0">Telepon</span>
                              <span className="text-slate-700 font-medium">{reg.phone}</span>
                            </div>
                            <div className="flex gap-2 text-xs">
                              <span className="text-slate-500 w-20 flex-shrink-0">RS / Klinik</span>
                              <span className="text-slate-700 font-medium truncate">{reg.practice_location ?? reg.hospital ?? "-"}</span>
                            </div>
                            <div className="flex gap-2 text-xs">
                              <span className="text-slate-500 w-20 flex-shrink-0">Pengalaman</span>
                              <span className="text-slate-700 font-medium">
                                {reg.experience_years} tahun
                              </span>
                            </div>
                            <div className="flex gap-2 text-xs">
                              <span className="text-slate-500 w-20 flex-shrink-0">Daftar</span>
                              <span className="text-slate-700 font-medium">
                                {formatDate(reg.created_at)}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { label: "KTP", path: reg.ktp_path },
                              { label: "STR", path: reg.str_path },
                              { label: "SIP", path: reg.sip_path },
                              { label: "Ijazah", path: reg.diploma_path },
                              { label: "CV", path: reg.cv_path },
                            ]
                              .filter((d) => d.path)
                              .map((doc) => (
                                <button
                                  key={doc.label}
                                  onClick={() => openDocument(doc.path, doc.label)}
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-700 text-[11px] font-medium hover:bg-sky-100 transition-colors"
                                  title={`Lihat ${doc.label}`}
                                >
                                  <FileText className="h-3 w-3" />
                                  {doc.label}
                                </button>
                              ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="p-4 flex gap-2">
                          <button
                            onClick={() => handleApprove(reg)}
                            disabled={actionLoading === reg.id}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {actionLoading === reg.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(reg)}
                            disabled={actionLoading === reg.id}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 rounded-xl py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {actionLoading === reg.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <X className="h-3.5 w-3.5" />
                            )}
                            Tolak
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}

          {/* ALL DOCTORS */}
          {activeTab === "all" && (
            <motion.div
              key="all"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-slate-900 font-bold text-sm">Semua Dokter Aktif</h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {filteredDoctors.length} dokter terdaftar
                  </p>
                </div>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari dokter..."
                    className="bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl pl-9 pr-4 py-2 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-colors"
                  />
                </div>
              </div>

              {filteredDoctors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                  <UserCheck className="h-12 w-12 mb-3 text-slate-200" />
                  <p className="font-semibold text-slate-600">Belum ada dokter aktif</p>
                  <p className="text-sm mt-1">Approve pendaftaran untuk menambah dokter</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        {["Dokter", "Spesialisasi", "RS / Klinik", "Status", "Bergabung", "Pasien", "Aksi"].map(
                          (h) => (
                            <th
                              key={h}
                              className={[
                                "text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3",
                                h === "Aksi" ? "text-right" : h === "Status" ? "text-center" : "text-left",
                              ].join(" ")}
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDoctors.map((doc) => (
                        <tr
                          key={doc.id}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={doc.avatar_url}
                                name={doc.name}
                                className="h-10 w-10 border border-slate-200"
                                textClassName="text-sm"
                                rounded="rounded-xl"
                              />
                              <div>
                                <span className="text-sm font-semibold text-slate-900 block">
                                  {doc.name}
                                </span>
                                <span className="text-xs text-slate-500">{doc.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-slate-600">{doc.specialty}</td>
                          <td className="px-5 py-3.5 text-sm text-slate-600 max-w-[160px] truncate">
                            {doc.hospital ?? "-"}
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <StatusBadge status={doc.is_active ? "active" : "inactive"} />
                          </td>
                          <td className="px-5 py-3.5 text-sm text-slate-600">
                            {formatDate(doc.joined_at)}
                          </td>
                          <td className="px-5 py-3.5 text-sm font-semibold text-slate-700">
                            {doc.total_patients.toLocaleString("id-ID")}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setViewDoctor(doc)}
                                className="flex items-center gap-1.5 text-xs font-medium text-sky-600 hover:text-sky-700 px-3 py-1.5 rounded-lg hover:bg-sky-50 transition-colors"
                              >
                                <Eye className="h-3.5 w-3.5" /> Lihat
                              </button>
                              {doc.is_active ? (
                                <button
                                  onClick={() => handleDeactivate(doc.id)}
                                  disabled={actionLoading === doc.id}
                                  className="flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-60"
                                >
                                  {actionLoading === doc.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <UserX className="h-3.5 w-3.5" />
                                  )}
                                  Nonaktifkan
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleActivate(doc.id)}
                                  disabled={actionLoading === doc.id}
                                  className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors disabled:opacity-60"
                                >
                                  {actionLoading === doc.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <UserPlus className="h-3.5 w-3.5" />
                                  )}
                                  Aktifkan
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* REJECTED */}
          {activeTab === "rejected" && (
            <motion.div
              key="rejected"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {rejectedList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                  <X className="h-12 w-12 mb-3 text-rose-500/30" />
                  <p className="font-semibold text-slate-600">Tidak ada dokter yang ditolak</p>
                  <p className="text-sm mt-1">Semua penolakan akan muncul di sini</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {rejectedList.map((reg) => (
                    <div
                      key={reg.id}
                      className="bg-white border border-rose-200 rounded-2xl overflow-hidden"
                    >
                      <div className="p-5 flex items-start gap-4">
                        <Avatar
                          src={null}
                          name={reg.name}
                          className="h-14 w-14 border-2 border-rose-100 ring-2 ring-rose-50"
                          textClassName="text-xl"
                          rounded="rounded-xl"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-slate-900 font-bold text-sm truncate">{reg.name}</h3>
                          <p className="text-rose-600 text-xs font-medium mt-0.5">{reg.specialty}</p>
                          <p className="text-slate-500 text-[11px] mt-1">
                            STR:{" "}
                            <span className="text-slate-600 font-mono">{reg.license_number}</span>
                          </p>
                          <p className="text-slate-500 text-[11px]">{reg.email}</p>
                          <p className="text-slate-400 text-[11px] mt-0.5">
                            {formatDate(reg.created_at)}
                          </p>
                        </div>
                        <span className="flex-shrink-0 px-2 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Ditolak
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* ── Confirm Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {confirmAction && (
          <ConfirmModal
            action={confirmAction}
            loading={actionLoading === confirmAction.reg.id}
            onCancel={() => setConfirmAction(null)}
            onConfirm={(notes, approveData) => {
              if (confirmAction.type === "approve") doApprove(confirmAction.reg, notes, approveData!);
              else doReject(confirmAction.reg, notes);
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Document Viewer Overlay ──────────────────────────────────────── */}
      {docViewer && (
        <DocumentViewerOverlay
          viewer={docViewer}
          onClose={() => setDocViewer(null)}
        />
      )}

      {/* ── Doctor Detail Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {viewDoctor && (
          <DoctorDetailModal
            doctor={viewDoctor}
            onClose={() => setViewDoctor(null)}
            onActivate={() => { handleActivate(viewDoctor.id); setViewDoctor(null); }}
            onDeactivate={() => { handleDeactivate(viewDoctor.id); setViewDoctor(null); }}
            actionLoading={actionLoading === viewDoctor.id}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}

// ─── Doctor Detail Modal ───────────────────────────────────────────────────────

function DoctorDetailModal({
  doctor,
  onClose,
  onActivate,
  onDeactivate,
  actionLoading,
}: {
  doctor: ActiveDoctor;
  onClose: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  actionLoading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-[32px] shadow-2xl max-w-2xl w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Cover */}
        <div className="relative h-40 bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all z-10"
          >
            <X className="h-5 w-5" />
          </button>
          
          {/* Status Badge Over Cover */}
          <div className="absolute top-6 left-6">
            <StatusBadge status={doctor.is_active ? "active" : "inactive"} />
          </div>

          {/* Profile Picture */}
          <div className="absolute -bottom-16 left-8">
            <div className="p-1.5 bg-white rounded-[32px] shadow-xl">
              <Avatar
                src={doctor.avatar_url}
                name={doctor.name}
                className="h-32 w-32 border-4 border-white"
                textClassName="text-4xl"
                rounded="rounded-[24px]"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-20 pb-8 px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                {doctor.name}
                <ShieldCheck className="h-6 w-6 text-sky-500" />
              </h2>
              <p className="text-sky-600 font-semibold flex items-center gap-1.5 mt-1">
                <Award className="h-4 w-4" />
                {doctor.specialty}
              </p>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-bold">{doctor.rating}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-300" />
                <div className="flex items-center gap-1 text-slate-500">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">{doctor.total_patients} Pasien</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {doctor.is_active ? (
                <button
                  onClick={onDeactivate}
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-2xl text-sm font-bold bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-all disabled:opacity-60 inline-flex items-center gap-2"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="h-4 w-4" />}
                  Nonaktifkan
                </button>
              ) : (
                <button
                  onClick={onActivate}
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-2xl text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition-all disabled:opacity-60 inline-flex items-center gap-2"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  Aktifkan
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bio Section */}
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Bio Singkat</h4>
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  "{doctor.description || `Dokter spesialis ${doctor.specialty} yang berkomitmen memberikan pelayanan terbaik bagi pasien Sembuhin.`}"
                </p>
              </div>
              
              <div className="p-5 rounded-3xl bg-sky-50/50 border border-sky-100/50">
                <h4 className="text-[11px] font-bold text-sky-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  Jadwal Praktik
                </h4>
                <p className="text-sm font-semibold text-slate-700">
                  {doctor.available || "Senin – Jumat (08:00 - 17:00)"}
                </p>
              </div>
            </div>

            {/* Info Grid */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-sky-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Email</p>
                  <p className="text-sm font-medium text-slate-700">{doctor.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">RS / Klinik</p>
                  <p className="text-sm font-medium text-slate-700">{doctor.hospital || "-"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">No. STR / Lisensi</p>
                  <p className="text-sm font-mono font-medium text-slate-700">{doctor.license_number || "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Bergabung Sejak</p>
                  <p className="text-sm font-medium text-slate-700">
                    {new Date(doctor.joined_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
