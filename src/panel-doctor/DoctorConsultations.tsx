import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Calendar,
  Clock,
  Users,
  Search,
  Filter,
  Video,
  Phone,
  MessageSquare,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { DoctorLayout } from "@/panel-doctor/DoctorLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Consultation {
  id: string;
  doctor_id: string | null;
  patient_id: string;
  patient_name: string;
  patient_phone: string;
  patient_email: string | null;
  appointment_date: string;
  appointment_time: string;
  consultation_type: string;
  complaint: string | null;
  consultation_status: string;
  payment_status: string;
  created_at: string;
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function DoctorConsultations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  // Resolve doctor profile for the logged-in user
  useEffect(() => {
    if (!user) return;
    let active = true;

    (async () => {
      const { data, error: profileErr } = await supabase
        .from("doctors")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!active) return;
      if (profileErr) {
        console.warn("Gagal load profil dokter:", profileErr.message);
        setError("Akun Anda belum terhubung ke profil dokter. Hubungi admin.");
        setLoading(false);
        return;
      }
      setDoctorId(data.id);
    })();

    return () => { active = false; };
  }, [user]);

  // Fetch consultations + realtime
  useEffect(() => {
    if (!doctorId) return;
    let active = true;

    const fetchConsultations = async () => {
      const { data, error: fetchErr } = await supabase
        .from("consultations")
        .select("*")
        .eq("doctor_id", doctorId)
        .order("created_at", { ascending: false });

      if (!active) return;
      if (fetchErr) {
        console.error("Gagal fetch konsultasi:", fetchErr);
        setError(fetchErr.message);
      } else {
        setConsultations((data || []) as Consultation[]);
        setError(null);
      }
      setLoading(false);
    };

    fetchConsultations();

    // Realtime subscription
    const channel = supabase
      .channel("doctor-consultations-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "consultations",
          filter: `doctor_id=eq.${doctorId}`,
        },
        () => {
          fetchConsultations();
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [doctorId]);

  const filteredConsultations = consultations.filter((c) => {
    const matchesFilter = filter === "All" || c.consultation_status === filter;
    const matchesSearch =
      c.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.complaint || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Format date
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return "Hari Ini";
    if (diffDays === 1) return "Kemarin";
    if (diffDays === -1) return "Besok";
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  // Update consultation status
  const handleStatusChange = async (consultationId: string, newStatus: string) => {
    const { error } = await supabase
      .from("consultations")
      .update({ consultation_status: newStatus })
      .eq("id", consultationId);

    if (error) console.error("Gagal update status:", error);
  };

  return (
    <DoctorLayout title="Konsultasi">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari pasien atau gejala..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <Filter className="h-4 w-4 text-slate-500 flex-shrink-0" />
              {["All", "scheduled", "in_progress", "completed"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all capitalize ${
                    filter === status
                      ? "bg-sky-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {status.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        {error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        ) : loading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-sky-400" />
            <p className="text-sm text-slate-500">Memuat konsultasi...</p>
          </div>
        ) : filteredConsultations.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <p className="text-slate-500">Belum ada konsultasi.</p>
          </div>
        ) : (
          /* Consultations Table */
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Pasien
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Gejala
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Jenis
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Tanggal &amp; Waktu
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredConsultations.map((consult) => (
                    <tr key={consult.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                            <Users className="h-4 w-4 text-slate-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{consult.patient_name}</p>
                            <p className="text-xs text-slate-500">
                              {consult.patient_phone}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-600 max-w-[200px] truncate">
                        {consult.complaint || "-"}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
                            consult.consultation_type === "Video Call"
                              ? "bg-violet-50 text-violet-700 border border-violet-100"
                              : consult.consultation_type === "Voice Call"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : "bg-sky-50 text-sky-700 border border-sky-100"
                          }`}
                        >
                          {consult.consultation_type === "Video Call" ? (
                            <Video className="h-3.5 w-3.5" />
                          ) : consult.consultation_type === "Voice Call" ? (
                            <Phone className="h-3.5 w-3.5" />
                          ) : (
                            <MessageSquare className="h-3.5 w-3.5" />
                          )}
                          {consult.consultation_type}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <p className="text-slate-900">{formatDate(consult.appointment_date)}</p>
                          <p className="text-slate-500">{consult.appointment_time}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${
                            consult.consultation_status === "completed"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : consult.consultation_status === "in_progress"
                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                : "bg-slate-50 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {consult.consultation_status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {consult.consultation_status === "scheduled" && (
                          <button
                            onClick={() => handleStatusChange(consult.id, "in_progress")}
                            className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-all"
                          >
                            Mulai
                          </button>
                        )}
                        {consult.consultation_status === "in_progress" && (
                          <button
                            onClick={() =>
                              navigate({
                                to: "/doctor/chat",
                                search: { consultationId: consult.id },
                              })
                            }
                            className="px-3 py-2 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 transition-all"
                          >
                            Lanjutkan
                          </button>
                        )}
                        {consult.consultation_status === "in_progress" && (
                          <button
                            onClick={() => handleStatusChange(consult.id, "completed")}
                            className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-all ml-2"
                          >
                            Selesai
                          </button>
                        )}
                        {consult.consultation_status === "completed" && (
                          <button
                            onClick={() =>
                              navigate({
                                to: "/doctor/chat",
                                search: { consultationId: consult.id },
                              })
                            }
                            className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-all"
                          >
                            Detail
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </DoctorLayout>
  );
}
