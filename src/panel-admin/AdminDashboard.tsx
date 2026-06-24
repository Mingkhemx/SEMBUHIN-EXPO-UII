/**
 * AdminDashboard — Overview & key metrics for the Admin Panel.
 */

import { motion } from "framer-motion";
import {
  Users,
  Stethoscope,
  Clock,
  MessageSquare,
  CheckCircle2,
  XCircle,
  UserPlus,
  Activity,
  Eye,
} from "lucide-react";
import { AdminLayout, AdminStatCard, StatusBadge } from "@/panel-admin/AdminLayout";

// ─── Animation helpers ────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay },
});

// ─── Mock data ────────────────────────────────────────────────────────────────

const DOCTOR_REQUESTS = [
  { name: "dr. Andi Wijaya", specialty: "Kardiologi", date: "10 Jun 2025", status: "pending" },
  { name: "dr. Maya Sari", specialty: "Dermatologi", date: "11 Jun 2025", status: "pending" },
  { name: "dr. Rizky A.", specialty: "Neurologi", date: "5 Jun 2025", status: "approved" },
];

const RECENT_USERS = [
  { name: "Anisa Rahma", email: "anisa@email.com", joined: "12 Jan 2025", status: "active" },
  { name: "Budi Santoso", email: "budi@email.com", joined: "15 Jan 2025", status: "active" },
  { name: "Citra Dewi", email: "citra@email.com", joined: "20 Jan 2025", status: "inactive" },
  { name: "Dimas P.", email: "dimas@email.com", joined: "1 Feb 2025", status: "active" },
  { name: "Eka Putri", email: "eka@email.com", joined: "5 Feb 2025", status: "active" },
];

const ACTIVITY_TIMELINE = [
  {
    icon: CheckCircle2,
    color: "text-emerald-400",
    label: "dr. Maya Sari disetujui",
    time: "2 menit lalu",
  },
  {
    icon: UserPlus,
    color: "text-sky-400",
    label: "User baru: Fajar Nugraha daftar",
    time: "14 menit lalu",
  },
  {
    icon: MessageSquare,
    color: "text-violet-400",
    label: "Chat baru dimulai — Konsul Umum",
    time: "31 menit lalu",
  },
  {
    icon: XCircle,
    color: "text-rose-400",
    label: "dr. Tono D. ditolak verifikasinya",
    time: "1 jam lalu",
  },
  {
    icon: Activity,
    color: "text-amber-400",
    label: "Lonjakan login — 84 sesi aktif",
    time: "2 jam lalu",
  },
];

// ─── Section wrapper with title ───────────────────────────────────────────────

function SectionCard({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      {...fadeUp(delay)}
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminDashboard() {
  return (
    <AdminLayout title="Dashboard" subtitle="Ringkasan aktivitas & statistik sistem Sembuhin">
      <div className="space-y-6">
        {/* ── Stats row ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            {
              label: "Total Users",
              value: "12,847",
              change: "8.2%",
              positive: true,
              icon: <Users className="h-5 w-5" />,
              color: "bg-sky-500/10 text-sky-400",
            },
            {
              label: "Total Dokter",
              value: "248",
              change: "3.1%",
              positive: true,
              icon: <Stethoscope className="h-5 w-5" />,
              color: "bg-violet-500/10 text-violet-400",
            },
            {
              label: "Permintaan Pending",
              value: "3",
              change: "3 baru",
              positive: false,
              icon: <Clock className="h-5 w-5" />,
              color: "bg-amber-500/10 text-amber-400",
            },
            {
              label: "Chat Aktif",
              value: "89",
              change: "15%",
              positive: true,
              icon: <MessageSquare className="h-5 w-5" />,
              color: "bg-emerald-500/10 text-emerald-400",
            },
          ].map((stat, i) => (
            <motion.div key={stat.label} {...fadeUp(i * 0.07)}>
              <AdminStatCard {...stat} />
            </motion.div>
          ))}
        </div>

        {/* ── Main content: tables + timeline ─────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left column — 2/3 width */}
          <div className="xl:col-span-2 space-y-6">
            {/* Doctor Requests table */}
            <SectionCard title="Permintaan Dokter Terbaru" delay={0.15}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Nama
                      </th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Spesialisasi
                      </th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Tanggal Daftar
                      </th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {DOCTOR_REQUESTS.map((doc, i) => (
                      <tr
                        key={i}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-5 py-3.5 text-slate-900 font-medium">{doc.name}</td>
                        <td className="px-5 py-3.5 text-slate-600">{doc.specialty}</td>
                        <td className="px-5 py-3.5 text-slate-600">{doc.date}</td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={doc.status} />
                        </td>
                        <td className="px-5 py-3.5">
                          {doc.status === "pending" ? (
                            <div className="flex items-center gap-2">
                              <button className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors">
                                Approve
                              </button>
                              <button className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold hover:bg-rose-100 transition-colors">
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            {/* Recent Users table */}
            <SectionCard title="User Terbaru" delay={0.22}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Nama
                      </th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Bergabung
                      </th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {RECENT_USERS.map((user, i) => (
                      <tr
                        key={i}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-5 py-3.5 text-slate-900 font-medium">{user.name}</td>
                        <td className="px-5 py-3.5 text-slate-600">{user.email}</td>
                        <td className="px-5 py-3.5 text-slate-600">{user.joined}</td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={user.status} />
                        </td>
                        <td className="px-5 py-3.5">
                          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 text-xs font-semibold hover:bg-sky-100 transition-colors">
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>

          {/* Right column — 1/3 width: activity timeline */}
          <div>
            <SectionCard title="Aktivitas Sistem" delay={0.2}>
              <ul className="divide-y divide-slate-100">
                {ACTIVITY_TIMELINE.map((item, i) => (
                  <motion.li
                    key={i}
                    {...fadeUp(0.25 + i * 0.06)}
                    className="flex items-start gap-3 px-5 py-4"
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      <item.icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 leading-snug">{item.label}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{item.time}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </SectionCard>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
