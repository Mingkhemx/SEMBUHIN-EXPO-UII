import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  MessageSquare, FileText, Calendar, Users, Stethoscope,
  CheckCircle, Clock, Loader2, AlertCircle, TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { DoctorLayout } from "@/panel-doctor/DoctorLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface DashboardStats {
  todayConsultations: number;
  totalPatients: number;
  completedToday: number;
  unreadMessages: number;
}

interface RecentConsultation {
  id: string;
  patient_name: string;
  patient_phone: string;
  complaint: string | null;
  appointment_time: string;
  appointment_date: string;
  consultation_status: string;
  consultation_type: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    todayConsultations: 0,
    totalPatients: 0,
    completedToday: 0,
    unreadMessages: 0,
  });
  const [recentConsultations, setRecentConsultations] = useState<RecentConsultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ── Resolve doctor ID ──
  useEffect(() => {
    if (!user) return;
    supabase
      .from("doctors")
      .select("id, total_patients")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setDoctorId(data.id);
      });
  }, [user]);

  // ── Fetch dashboard data ──
  const fetchData = useCallback(async () => {
    if (!doctorId) return;
    setLoading(true);

    const today = new Date().toISOString().split("T")[0];

    // Semua query paralel
    const [consultationsRes, doctorRes, unreadRes] = await Promise.all([
      // Konsultasi hari ini
      supabase
        .from("consultations")
        .select("id, patient_name, patient_phone, complaint, appointment_time, appointment_date, consultation_status, consultation_type")
        .eq("doctor_id", doctorId)
        .eq("appointment_date", today)
        .order("appointment_time", { ascending: true }),

      // Total pasien dari tabel doctors
      supabase
        .from("doctors")
        .select("total_patients")
        .eq("id", doctorId)
        .single(),

      // Pesan belum dibaca dari pasien
      supabase
        .from("consultation_messages")
        .select("id", { count: "exact", head: true })
        .eq("sender_type", "patient")
        .is("read_at", null)
        .in(
          "consultation_id",
          (
            await supabase
              .from("consultations")
              .select("id")
              .eq("doctor_id", doctorId)
          ).data?.map((c) => c.id) ?? []
        ),
    ]);

    const todayList = (consultationsRes.data ?? []) as RecentConsultation[];
    const completedToday = todayList.filter((c) => c.consultation_status === "completed").length;

    setRecentConsultations(todayList.slice(0, 8));
    setStats({
      todayConsultations: todayList.length,
      totalPatients: doctorRes.data?.total_patients ?? 0,
      completedToday,
      unreadMessages: unreadRes.count ?? 0,
    });
    setLoading(false);
  }, [doctorId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Realtime: refresh saat ada perubahan consultations ──
  useEffect(() => {
    if (!doctorId) return;
    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", {
        event: "*", schema: "public", table: "consultations",
        filter: `doctor_id=eq.${doctorId}`,
      }, fetchData)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "consultation_messages",
      }, fetchData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [doctorId, fetchData]);

  // ── Update status konsultasi ──
  const handleStatusChange = async (consultationId: string, newStatus: string) => {
    setActionLoading(consultationId);
    const { error } = await supabase
      .from("consultations")
      .update({ consultation_status: newStatus })
      .eq("id", consultationId);

    if (error) console.error("Gagal update status:", error);
    else fetchData();
    setActionLoading(null);
  };

  const STAT_CARDS = [
    {
      label: "Konsultasi Hari Ini",
      value: stats.todayConsultations,
      icon: Calendar,
      color: "text-sky-600",
      bg: "bg-sky-50",
      border: "border-sky-100",
    },
    {
      label: "Total Pasien",
      value: stats.totalPatients,
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      label: "Selesai Hari Ini",
      value: stats.completedToday,
      icon: CheckCircle,
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-100",
    },
    {
      label: "Pesan Belum Dibaca",
      value: stats.unreadMessages,
      icon: MessageSquare,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
  ];

  return (
    <DoctorLayout title="Dashboard">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_CARDS.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`h-10 w-10 rounded-lg ${stat.bg} ${stat.border} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-300" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                )}
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {loading ? "—" : stat.value}
              </p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Consultations Today */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Konsultasi Hari Ini</h2>
              <p className="text-sm text-slate-500">
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric"
                })}
              </p>
            </div>
            <Link
              to="/doctor/consultations"
              className="text-sm font-medium text-sky-600 hover:text-sky-700 hover:bg-sky-50 px-3 py-1.5 rounded-lg transition-all"
            >
              Lihat Semua
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-sky-400" />
            </div>
          ) : recentConsultations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
              <Calendar className="h-10 w-10 opacity-30" />
              <p className="text-sm">Belum ada konsultasi hari ini</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    {["Pasien", "Gejala", "Waktu", "Status", "Aksi"].map((h) => (
                      <th key={h} className={`py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${h === "Aksi" ? "text-right" : "text-left"}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentConsultations.map((consult) => (
                    <tr key={consult.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-sm font-bold text-slate-600 flex-shrink-0">
                            {consult.patient_name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{consult.patient_name}</p>
                            <p className="text-xs text-slate-400">{consult.patient_phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-600 max-w-[160px] truncate">
                        {consult.complaint || "-"}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {consult.appointment_time}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          consult.consultation_status === "completed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : consult.consultation_status === "in_progress"
                              ? "bg-amber-50 text-amber-700 border border-amber-100"
                              : "bg-slate-50 text-slate-600 border border-slate-200"
                        }`}>
                          {consult.consultation_status === "completed" && <CheckCircle className="h-3 w-3" />}
                          {consult.consultation_status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {consult.consultation_status === "scheduled" && (
                            <button
                              onClick={() => handleStatusChange(consult.id, "in_progress")}
                              disabled={actionLoading === consult.id}
                              className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 transition-all disabled:opacity-60 flex items-center gap-1"
                            >
                              {actionLoading === consult.id
                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                : <Stethoscope className="h-3 w-3" />}
                              Mulai
                            </button>
                          )}
                          {consult.consultation_status === "in_progress" && (
                            <>
                              <button
                                onClick={() => navigate({ to: "/doctor/chat", search: { consultationId: consult.id } })}
                                className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 text-xs font-semibold hover:bg-sky-100 border border-sky-200 transition-all flex items-center gap-1"
                              >
                                <MessageSquare className="h-3 w-3" />
                                Chat
                              </button>
                              <button
                                onClick={() => handleStatusChange(consult.id, "completed")}
                                disabled={actionLoading === consult.id}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-all disabled:opacity-60 flex items-center gap-1"
                              >
                                {actionLoading === consult.id
                                  ? <Loader2 className="h-3 w-3 animate-spin" />
                                  : <CheckCircle className="h-3 w-3" />}
                                Selesai
                              </button>
                            </>
                          )}
                          {consult.consultation_status === "completed" && (
                            <button
                              onClick={() => navigate({ to: "/doctor/chat", search: { consultationId: consult.id } })}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-all flex items-center gap-1"
                            >
                              <AlertCircle className="h-3 w-3" />
                              Detail
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
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Buat Resep", icon: FileText, color: "bg-violet-600", hover: "hover:bg-violet-700", path: "/doctor/prescriptions" },
            { label: "Semua Konsultasi", icon: Stethoscope, color: "bg-sky-600", hover: "hover:bg-sky-700", path: "/doctor/consultations" },
            { label: "Chat Pasien", icon: MessageSquare, color: "bg-emerald-600", hover: "hover:bg-emerald-700", path: "/doctor/chat" },
          ].map((action, index) => (
            <Link key={index} to={action.path}>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`w-full flex items-center justify-center gap-2 p-4 rounded-xl text-white font-medium transition-all shadow-sm hover:shadow-md ${action.color} ${action.hover}`}
              >
                <action.icon className="h-5 w-5" />
                <span>{action.label}</span>
              </motion.button>
            </Link>
          ))}
        </div>

      </div>
    </DoctorLayout>
  );
}
