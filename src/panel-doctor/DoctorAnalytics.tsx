import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Star,
  Clock,
  TrendingUp,
  UserPlus,
  CheckCircle,
  AlertCircle,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { DoctorLayout } from "@/panel-doctor/DoctorLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AnalyticsData {
  stats: {
    label: string;
    value: string;
    trend: string;
    trendUp: boolean;
    icon: any;
    color: string;
  }[];
  weekly_data: { day: string; value: number; max: number }[];
  top_diagnoses: { name: string; count: number; pct: number }[];
  activities: {
    id: string;
    type: string;
    title: string;
    time: string;
    icon: any;
    iconColor: string;
    iconBg: string;
  }[];
}

const PERIODS = ["7 Hari", "30 Hari", "3 Bulan"] as const;
type Period = (typeof PERIODS)[number];

// ─── Component ────────────────────────────────────────────────────────────────

export function DoctorAnalytics() {
  const { user } = useAuth();
  const [activePeriod, setActivePeriod] = useState<Period>("7 Hari");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    stats: [
      {
        label: "Total Konsultasi",
        value: "0",
        trend: "0%",
        trendUp: true,
        icon: ClipboardList,
        color: "bg-sky-50 text-sky-700 border-sky-100",
      },
      {
        label: "Tingkat Kepuasan",
        value: "0/5",
        trend: "0",
        trendUp: true,
        icon: Star,
        color: "bg-amber-50 text-amber-700 border-amber-100",
      },
      {
        label: "Rata-rata Durasi",
        value: "0 mnt",
        trend: "0 mnt",
        trendUp: false,
        icon: Clock,
        color: "bg-violet-50 text-violet-700 border-violet-100",
      },
      {
        label: "Pasien Baru",
        value: "0",
        trend: "0",
        trendUp: true,
        icon: UserPlus,
        color: "bg-emerald-50 text-emerald-700 border-emerald-100",
      },
    ],
    weekly_data: [
      { day: "Sen", value: 0, max: 15 },
      { day: "Sel", value: 0, max: 15 },
      { day: "Rab", value: 0, max: 15 },
      { day: "Kam", value: 0, max: 15 },
      { day: "Jum", value: 0, max: 15 },
      { day: "Sab", value: 0, max: 15 },
      { day: "Min", value: 0, max: 15 },
    ],
    top_diagnoses: [],
    activities: [],
  });

  const fetchAnalytics = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      console.log("📊 Fetching doctor analytics from Supabase for user:", user.id);
      
      // 1. Get doctor_id
      const { data: doc, error: docError } = await supabase
        .from("doctors")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (docError) throw docError;

      if (!doc) {
        setLoading(false);
        return;
      }

      console.log("📊 Doctor ID found:", doc.id);

      // 2. Fetch consultations count
      const { count: totalConsultations, error: consultError } = await supabase
        .from("consultations")
        .select("*", { count: "exact", head: true })
        .eq("doctor_id", doc.id);

      if (consultError) throw consultError;

      // 3. Fetch rating (average from consultations with rating)
      let avgRating = 0;
      try {
        const { data: ratedConsultations, error: ratingError } = await supabase
          .from("consultations")
          .select("rating")
          .eq("doctor_id", doc.id)
          .not("rating", "is", null)
          .gt("rating", 0);

        if (!ratingError && ratedConsultations && ratedConsultations.length > 0) {
          const sum = ratedConsultations.reduce((acc: number, c: any) => acc + (c.rating || 0), 0);
          avgRating = Math.round((sum / ratedConsultations.length) * 10) / 10;
        }
      } catch (e) {
        console.log("📊 Rating query failed, using default 0");
      }

      // 4. Fetch recent consultations for activities
      const { data: recentConsultations, error: recentError } = await supabase
        .from("consultations")
        .select("*")
        .eq("doctor_id", doc.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentError) throw recentError;

      // Build stats
      const statsWithIcons = [
        {
          label: "Total Konsultasi",
          value: totalConsultations || 0,
          icon: ClipboardList,
          color: "bg-sky-50 text-sky-700 border-sky-100",
        },
        {
          label: "Rating Rata-rata",
          value: avgRating > 0 ? `${avgRating}/5` : "N/A",
          icon: Star,
          color: "bg-amber-50 text-amber-700 border-amber-100",
        },
        {
          label: "Total Pasien",
          value: "0", // Would need to count unique patients
          icon: UserPlus,
          color: "bg-emerald-50 text-emerald-700 border-emerald-100",
        },
        {
          label: "Respon Rata-rata",
          value: "< 1 jam",
          icon: Clock,
          color: "bg-violet-50 text-violet-700 border-violet-100",
        },
      ];

      // Build activities
      const activitiesWithIcons = (recentConsultations || []).map((c: any) => ({
        ...c,
        icon: CheckCircle,
        iconColor: "text-emerald-600",
        iconBg: "bg-emerald-50",
        type: "consultation",
        label: `Konsultasi dengan ${c.patient_name || "Pasien"}`,
        time: formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: idLocale }),
      }));

      console.log("📊 Analytics fetched:", { totalConsultations, avgRating, activities: activitiesWithIcons.length });

      setAnalytics({
        stats: statsWithIcons,
        activities: activitiesWithIcons,
      });
    } catch (err: any) {
      console.error("❌ Error fetching analytics:", err);
      setError(err.message || "Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <DoctorLayout title="Analitik">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <Loader2 className="h-8 w-8 text-sky-500 animate-spin" />
          <p className="text-slate-500 text-sm">Memuat data analitik...</p>
        </div>
      </DoctorLayout>
    );
  }

  if (error) {
    return (
      <DoctorLayout title="Analitik">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-center px-4">
          <AlertCircle className="h-10 w-10 text-rose-500" />
          <p className="text-slate-900 font-semibold">Gagal Memuat Data</p>
          <p className="text-slate-500 text-sm max-w-xs">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-2 px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout
      title="Analitik"
      headerAction={
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {PERIODS.map((period) => (
            <button
              key={period}
              onClick={() => setActivePeriod(period)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activePeriod === period
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      }
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {analytics.stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
              className="bg-white border border-slate-200 rounded-xl p-4"
            >
              <div className={`inline-flex p-2 rounded-lg border mb-3 ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5 mb-2">{stat.label}</p>
              <div
                className={`inline-flex items-center gap-1 text-xs font-medium ${
                  stat.trendUp ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                <TrendingUp className={`h-3 w-3 ${!stat.trendUp ? "rotate-180" : ""}`} />
                {stat.trend}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bar Chart + Top Diagnoses Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Weekly Consultation Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm font-semibold text-slate-900">Konsultasi Mingguan</p>
                <p className="text-xs text-slate-500 mt-0.5">Jumlah konsultasi per hari</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="inline-block w-3 h-3 rounded-sm bg-sky-500" />
                Konsultasi
              </div>
            </div>

            {/* Bar Chart */}
            <div className="flex items-end gap-3 h-36">
              {analytics.weekly_data.map((bar, i) => (
                <div key={bar.day} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs font-medium text-slate-700">{bar.value}</span>
                  <motion.div
                    className="w-full rounded-t-md bg-sky-500"
                    style={{ height: 0 }}
                    animate={{ height: `${(bar.value / Math.max(bar.max, 1)) * 112}px` }}
                    transition={{ duration: 0.5, delay: 0.35 + i * 0.06, ease: "easeOut" }}
                  />
                  <span className="text-xs text-slate-500">{bar.day}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Diagnoses */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.38 }}
            className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5"
          >
            <p className="text-sm font-semibold text-slate-900 mb-1">Top Diagnosis</p>
            <p className="text-xs text-slate-500 mb-4">Berdasarkan frekuensi</p>

            <div className="space-y-3">
              {analytics.top_diagnoses.map((diag, i) => (
                <div key={diag.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400 w-4">{i + 1}</span>
                      <span className="text-sm text-slate-700">{diag.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-900">{diag.count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-sky-500 rounded-full"
                      style={{ width: 0 }}
                      animate={{ width: `${diag.pct}%` }}
                      transition={{ duration: 0.6, delay: 0.45 + i * 0.07, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-white border border-slate-200 rounded-xl overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-200">
            <p className="text-sm font-semibold text-slate-900">Aktivitas Terbaru</p>
          </div>
          <ul className="divide-y divide-slate-100">
            {(analytics.activities || []).map((activity) => (
              <li
                key={activity.id}
                className="px-5 py-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors"
              >
                <div
                  className={`mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${activity.iconBg}`}
                >
                  <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">{activity.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </DoctorLayout>
  );
}
