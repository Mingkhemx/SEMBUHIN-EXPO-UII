import { useState } from "react";
import { motion } from "framer-motion";
import {
  Star,
  Clock,
  TrendingUp,
  UserPlus,
  CheckCircle,
  AlertCircle,
  ClipboardList,
} from "lucide-react";
import { DoctorLayout } from "@/panel-doctor/DoctorLayout";

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
  {
    label: "Total Konsultasi",
    value: "248",
    icon: ClipboardList,
    color: "bg-sky-50 text-sky-700 border-sky-100",
    trend: "+12% dari bulan lalu",
    trendUp: true,
  },
  {
    label: "Tingkat Kepuasan",
    value: "4.8/5",
    icon: Star,
    color: "bg-amber-50 text-amber-700 border-amber-100",
    trend: "+0.2 dari bulan lalu",
    trendUp: true,
  },
  {
    label: "Rata-rata Durasi",
    value: "24 mnt",
    icon: Clock,
    color: "bg-violet-50 text-violet-700 border-violet-100",
    trend: "-2 mnt dari bulan lalu",
    trendUp: false,
  },
  {
    label: "Pasien Baru",
    value: "45",
    icon: UserPlus,
    color: "bg-emerald-50 text-emerald-700 border-emerald-100",
    trend: "+8 dari bulan lalu",
    trendUp: true,
  },
];

// Weekly bar chart data (Mon–Sun)
const WEEKLY_DATA = [
  { day: "Sen", value: 8, max: 15 },
  { day: "Sel", value: 12, max: 15 },
  { day: "Rab", value: 15, max: 15 },
  { day: "Kam", value: 10, max: 15 },
  { day: "Jum", value: 13, max: 15 },
  { day: "Sab", value: 6, max: 15 },
  { day: "Min", value: 4, max: 15 },
];

const TOP_DIAGNOSES = [
  { name: "Demam & ISPA", count: 45, pct: 85 },
  { name: "Hipertensi", count: 32, pct: 61 },
  { name: "Diabetes", count: 28, pct: 53 },
  { name: "Dermatitis", count: 21, pct: 40 },
  { name: "Migrain", count: 18, pct: 34 },
];

const RECENT_ACTIVITIES = [
  {
    id: 1,
    icon: CheckCircle,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
    title: "Konsultasi dengan Aurelia Putri selesai",
    time: "2 jam lalu",
  },
  {
    id: 2,
    icon: ClipboardList,
    iconColor: "text-sky-600",
    iconBg: "bg-sky-50",
    title: "Resep baru diterbitkan untuk Budi Santoso",
    time: "4 jam lalu",
  },
  {
    id: 3,
    icon: UserPlus,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50",
    title: "Pasien baru terdaftar: Citra Dewi",
    time: "6 jam lalu",
  },
  {
    id: 4,
    icon: AlertCircle,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
    title: "Jadwal konsultasi Dimas Pratama berubah",
    time: "1 hari lalu",
  },
  {
    id: 5,
    icon: CheckCircle,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
    title: "Laporan bulanan Juni 2026 tersedia",
    time: "2 hari lalu",
  },
];

const PERIODS = ["7 Hari", "30 Hari", "3 Bulan"] as const;
type Period = (typeof PERIODS)[number];

// ─── Component ────────────────────────────────────────────────────────────────

export function DoctorAnalytics() {
  const [activePeriod, setActivePeriod] = useState<Period>("7 Hari");

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
          {STATS.map((stat, i) => (
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
              {WEEKLY_DATA.map((bar, i) => (
                <div key={bar.day} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs font-medium text-slate-700">{bar.value}</span>
                  <motion.div
                    className="w-full rounded-t-md bg-sky-500"
                    style={{ height: 0 }}
                    animate={{ height: `${(bar.value / bar.max) * 112}px` }}
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
              {TOP_DIAGNOSES.map((diag, i) => (
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
            {RECENT_ACTIVITIES.map((activity) => (
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
