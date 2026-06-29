/**
 * AdminDashboard — Overview & key metrics for the Admin Panel.
 */

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
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
  RefreshCcw,
} from "lucide-react";
import { AdminLayout, AdminStatCard, StatusBadge } from "@/panel-admin/AdminLayout";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
  totalUsers: number;
  totalDoctors: number;
  pendingRequests: number;
  activeChats: number;
  userChange: string;
  doctorChange: string;
}

interface DoctorRequest {
  id: string;
  full_name: string;
  specialty: string;
  created_at: string;
  status: string;
}

interface RecentUser {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  is_active: boolean;
}

interface SystemActivity {
  id: string;
  type: 'success' | 'info' | 'error' | 'warning';
  label: string;
  time: string;
  icon: any;
  color: string;
}

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
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalDoctors: 0,
    pendingRequests: 0,
    activeChats: 0,
    userChange: "0%",
    doctorChange: "0%",
  });
  const [doctorRequests, setDoctorRequests] = useState<DoctorRequest[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [activities, setActivities] = useState<SystemActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  // 1. Fetch Initial Data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch stats count
      const [usersCount, doctorsCount, pendingDocs, activeConsultations] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('doctors').select('*', { count: 'exact', head: true }), // Count all active doctors
        supabase.from('doctor_registrations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('consultations').select('*', { count: 'exact', head: true }).eq('payment_status', 'paid')
      ]);

      setStats({
        totalUsers: usersCount.count || 0,
        totalDoctors: doctorsCount.count || 0,
        pendingRequests: pendingDocs.count || 0,
        activeChats: activeConsultations.count || 0,
        userChange: "+2.5%",
        doctorChange: "+1.2%",
      });

      // Fetch Recent Doctor Requests (from doctor_registrations table)
      const { data: docs } = await supabase
        .from('doctor_registrations')
        .select('id, name, specialty, created_at, status')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (docs) {
        // Map to match the interface if necessary
        setDoctorRequests(docs.map(d => ({
          id: d.id,
          full_name: d.name,
          specialty: d.specialty,
          created_at: d.created_at,
          status: d.status
        })));
      }

      // Fetch Recent Users
      const { data: users } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at, is_active')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (users) setRecentUsers(users);

      // Initial Activities (Mocking from data)
      const initialActivities: SystemActivity[] = [
        { id: '1', type: 'info', label: 'Dashboard Admin dimuat', time: 'Baru saja', icon: Activity, color: 'text-sky-400' }
      ];
      setActivities(initialActivities);

    } catch (err) {
      console.error("Error fetching dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Setup Realtime Subscriptions
  useEffect(() => {
    fetchDashboardData();

    // Subscribe to Doctors (Requests)
    const doctorChannel = supabase
      .channel('admin-doctors-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'doctors' }, (payload) => {
        console.log('Realtime Doctor Change:', payload);
        setIsLive(true);
        setTimeout(() => setIsLive(false), 2000);
        
        // Refresh requests and stats
        fetchDashboardData();
        
            // Add activity
            if (payload.eventType === 'INSERT') {
              const newDoc = payload.new as DoctorRequest;
              setActivities(prev => [{
                id: Math.random().toString(),
                type: 'warning' as const,
                label: `Pendaftaran baru: ${newDoc.full_name}`,
                time: 'Baru saja',
                icon: UserPlus,
                color: 'text-amber-400'
              }, ...prev].slice(0, 10));
            }
          })
          .subscribe();
    
        // Subscribe to Profiles (Users)
        const profileChannel = supabase
          .channel('admin-profiles-realtime')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
            console.log('Realtime Profile Change:', payload);
            setIsLive(true);
            setTimeout(() => setIsLive(false), 2000);
            
            fetchDashboardData();
    
            if (payload.eventType === 'INSERT') {
              const newUser = payload.new as RecentUser;
              setActivities(prev => [{
                id: Math.random().toString(),
                type: 'success' as const,
                label: `User baru bergabung: ${newUser.full_name}`,
                time: 'Baru saja',
                icon: UserPlus,
                color: 'text-sky-400'
              }, ...prev].slice(0, 10));
            }
          })
          .subscribe();

    // Subscribe to Doctor Registrations (Requests)
    const registrationChannel = supabase
      .channel('admin-registrations-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'doctor_registrations' }, (payload) => {
        console.log('Realtime Registration Change:', payload);
        setIsLive(true);
        setTimeout(() => setIsLive(false), 2000);
        fetchDashboardData();
        
        if (payload.eventType === 'INSERT') {
          const newReg = payload.new as any;
          setActivities(prev => [{
            id: Math.random().toString(),
            type: 'warning' as const,
            label: `Pendaftaran baru: ${newReg.name}`,
            time: 'Baru saja',
            icon: UserPlus,
            color: 'text-amber-400'
          }, ...prev].slice(0, 10));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(doctorChannel);
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(registrationChannel);
    };
  }, []);

  return (
    <AdminLayout 
      title="Dashboard" 
      subtitle="Ringkasan aktivitas & statistik sistem Sembuhin"
      rightElement={
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {isLive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Live Update</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => fetchDashboardData()}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all active:scale-95"
          >
            <RefreshCcw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* ── Stats row ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            {
              label: "Total Users",
              value: stats.totalUsers.toLocaleString(),
              change: stats.userChange,
              positive: true,
              icon: <Users className="h-5 w-5" />,
              color: "bg-sky-500/10 text-sky-400",
            },
            {
              label: "Total Dokter",
              value: stats.totalDoctors.toLocaleString(),
              change: stats.doctorChange,
              positive: true,
              icon: <Stethoscope className="h-5 w-5" />,
              color: "bg-violet-500/10 text-violet-400",
            },
            {
              label: "Permintaan Pending",
              value: stats.pendingRequests.toString(),
              change: stats.pendingRequests > 0 ? `${stats.pendingRequests} baru` : "Bersih",
              positive: false,
              icon: <Clock className="h-5 w-5" />,
              color: "bg-amber-500/10 text-amber-400",
            },
            {
              label: "Chat Aktif",
              value: stats.activeChats.toString(),
              change: "Realtime",
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
                      <th className="text-center px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctorRequests.length > 0 ? (
                      doctorRequests.map((doc, i) => (
                        <tr
                          key={doc.id}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-5 py-3.5 text-slate-900 font-medium">{doc.full_name}</td>
                          <td className="px-5 py-3.5 text-slate-600">{doc.specialty}</td>
                          <td className="px-5 py-3.5 text-slate-600">
                            {format(new Date(doc.created_at), "dd MMM yyyy", { locale: idLocale })}
                          </td>
                          <td className="px-5 py-3.5 text-center">
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
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                          {isLoading ? "Memuat data..." : "Tidak ada permintaan terbaru"}
                        </td>
                      </tr>
                    )}
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
                      <th className="text-center px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.length > 0 ? (
                      recentUsers.map((u, i) => (
                        <tr
                          key={u.id}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-5 py-3.5 text-slate-900 font-medium">{u.full_name}</td>
                          <td className="px-5 py-3.5 text-slate-600">{u.email}</td>
                          <td className="px-5 py-3.5 text-slate-600">
                            {format(new Date(u.created_at), "dd MMM yyyy", { locale: idLocale })}
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <StatusBadge status={u.is_active ? "active" : "inactive"} />
                          </td>
                          <td className="px-5 py-3.5">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 text-xs font-semibold hover:bg-sky-100 transition-colors">
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                          {isLoading ? "Memuat data..." : "Belum ada user terdaftar"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>

          {/* Right column — 1/3 width: activity timeline */}
          <div>
            <SectionCard title="Aktivitas Sistem" delay={0.2}>
              <ul className="divide-y divide-slate-100">
                {activities.map((item, i) => (
                  <motion.li
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
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
