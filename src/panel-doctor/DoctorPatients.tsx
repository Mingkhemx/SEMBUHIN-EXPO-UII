import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Users, Search, UserCheck, UserX, Eye, TrendingUp, Activity, Loader2 } from "lucide-react";
import { DoctorLayout } from "@/panel-doctor/DoctorLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PatientData {
  id: string;
  name: string;
  age: number | string;
  gender: string;
  lastDiagnosis: string;
  lastVisit: string;
  status: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
  {
    label: "Total Pasien",
    value: "156",
    icon: Users,
    color: "bg-sky-50 text-sky-700 border-sky-100",
  },
  {
    label: "Pasien Baru Bulan Ini",
    value: "23",
    icon: TrendingUp,
    color: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  {
    label: "Pasien Aktif",
    value: "89",
    icon: UserCheck,
    color: "bg-violet-50 text-violet-700 border-violet-100",
  },
  {
    label: "Rata-rata Usia",
    value: "38",
    icon: Activity,
    color: "bg-amber-50 text-amber-700 border-amber-100",
  },
];

const PATIENTS = [
  {
    id: 1,
    name: "Aurelia Putri",
    age: 28,
    gender: "Perempuan",
    lastDiagnosis: "ISPA & Demam",
    lastVisit: "20 Jun 2026",
    status: "Aktif",
  },
  {
    id: 2,
    name: "Budi Santoso",
    age: 45,
    gender: "Laki-laki",
    lastDiagnosis: "Hipertensi Grade II",
    lastVisit: "18 Jun 2026",
    status: "Aktif",
  },
  {
    id: 3,
    name: "Citra Dewi",
    age: 32,
    gender: "Perempuan",
    lastDiagnosis: "Dermatitis Kontak",
    lastVisit: "15 Jun 2026",
    status: "Aktif",
  },
  {
    id: 4,
    name: "Dimas Pratama",
    age: 19,
    gender: "Laki-laki",
    lastDiagnosis: "Migrain",
    lastVisit: "12 Jun 2026",
    status: "Tidak Aktif",
  },
  {
    id: 5,
    name: "Eka Putra",
    age: 55,
    gender: "Laki-laki",
    lastDiagnosis: "Diabetes Mellitus Tipe 2",
    lastVisit: "10 Jun 2026",
    status: "Aktif",
  },
  {
    id: 6,
    name: "Fina Wati",
    age: 25,
    gender: "Perempuan",
    lastDiagnosis: "Gastritis Akut",
    lastVisit: "08 Jun 2026",
    status: "Tidak Aktif",
  },
  {
    id: 7,
    name: "Gilang Raharjo",
    age: 38,
    gender: "Laki-laki",
    lastDiagnosis: "Asma Bronkial",
    lastVisit: "05 Jun 2026",
    status: "Aktif",
  },
  {
    id: 8,
    name: "Hana Pertiwi",
    age: 42,
    gender: "Perempuan",
    lastDiagnosis: "Tiroid Hipotiroid",
    lastVisit: "01 Jun 2026",
    status: "Aktif",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function DoctorPatients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    newThisMonth: 0,
    active: 0,
    avgAge: 0
  });
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      try {
        // Resolve doctor ID first
        const { data: doc } = await supabase
          .from("doctors")
          .select("id")
          .eq("user_id", user.id)
          .single();
        
        if (!doc) return;

        const response = await fetch(`https://sembuhin-expo-uii-production.up.railway.app/api/doctor/stats?doctor_id=${doc.id}`);
        const data = await response.json();
        if (data.success) {
          setStats({
            total: data.stats.total_patients,
            newThisMonth: data.stats.new_this_month,
            active: data.stats.active_patients,
            avgAge: data.stats.avg_age
          });
        }
      } catch (err) {
        console.error("Error fetching doctor stats:", err);
      }
    }

    async function fetchPatients() {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Resolve doctor ID first
        const { data: doc } = await supabase
          .from("doctors")
          .select("id")
          .eq("user_id", user.id)
          .single();
        
        if (!doc) {
          setLoading(false);
          return;
        }

        // Gunakan backend API untuk mengambil data pasien yang pernah konsul dengan dokter ini
        const params = new URLSearchParams({
          doctor_id: doc.id,
          search: searchQuery,
          page: page.toString(),
          per_page: "10"
        });
        
        const response = await fetch(`https://sembuhin-expo-uii-production.up.railway.app/api/doctor/patients?${params}`);
        const data = await response.json();
        
        if (data.success) {
          const formattedPatients: PatientData[] = data.data.map((u: any) => {
            // Calculate age if date_of_birth exists
            let age: number | string = "-";
            if (u.date_of_birth) {
              const dob = new Date(u.date_of_birth);
              const ageDiffMs = Date.now() - dob.getTime();
              const ageDate = new Date(ageDiffMs);
              age = Math.abs(ageDate.getUTCFullYear() - 1970);
            } else {
              // Mock age for UI consistency if missing
              age = 20 + (parseInt(u.id.slice(0, 2), 16) % 40 || 0);
            }

            const joinDate = new Date(u.created_at);
            const isActive = u.is_active !== false;

            return {
              id: u.id,
              name: u.full_name || "User",
              age: age,
              gender: u.gender === 'female' ? 'Perempuan' : u.gender === 'male' ? 'Laki-laki' : 'Tidak disebutkan',
              lastDiagnosis: "Pasien Terdaftar", 
              lastVisit: format(joinDate, "dd MMM yyyy", { locale: idLocale }),
              status: isActive ? 'Aktif' : 'Tidak Aktif'
            };
          });

          setPatients(formattedPatients);
          setTotalItems(data.total);
        }
      } catch (err) {
        console.error("Error fetching patients from backend:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStats();
    fetchPatients();
  }, [user, searchQuery, page]);

  const filtered = patients; // Filtering already done by backend search param

  const dynamicStats = [
    {
      label: "Total Pasien",
      value: stats.total.toString(),
      icon: Users,
      color: "bg-sky-50 text-sky-700 border-sky-100",
    },
    {
      label: "Pasien Baru Bulan Ini",
      value: stats.newThisMonth.toString(),
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    {
      label: "Pasien Aktif",
      value: stats.active.toString(),
      icon: UserCheck,
      color: "bg-violet-50 text-violet-700 border-violet-100",
    },
    {
      label: "Rata-rata Usia",
      value: stats.avgAge.toString(),
      icon: Activity,
      color: "bg-amber-50 text-amber-700 border-amber-100",
    },
  ];

  return (
    <DoctorLayout title="Pasien">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {dynamicStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="bg-white border border-slate-200 rounded-xl p-4"
            >
              <div className={`inline-flex p-2 rounded-lg border mb-3 ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="bg-white border border-slate-200 rounded-xl p-4"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama pasien atau diagnosis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
          </div>
        </motion.div>

        {/* Patients Table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.32 }}
          className="bg-white border border-slate-200 rounded-xl overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Daftar Pasien</p>
            <p className="text-xs text-slate-500">{filtered.length} pasien ditemukan</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Usia / Gender
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Diagnosis Terakhir
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Terakhir Kunjungan
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
                {filtered.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                    {/* Nama */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                          <Users className="h-4 w-4 text-sky-600" />
                        </div>
                        <p className="font-medium text-slate-900 whitespace-nowrap">
                          {patient.name}
                        </p>
                      </div>
                    </td>

                    {/* Usia / Gender */}
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <p className="text-slate-900">{patient.age} tahun</p>
                        <p className="text-slate-500 text-xs">{patient.gender}</p>
                      </div>
                    </td>

                    {/* Diagnosis */}
                    <td className="py-4 px-4 text-sm text-slate-600 whitespace-nowrap">
                      {patient.lastDiagnosis}
                    </td>

                    {/* Tanggal */}
                    <td className="py-4 px-4 text-sm text-slate-600 whitespace-nowrap">
                      {patient.lastVisit}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                          patient.status === "Aktif"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-slate-50 text-slate-500 border-slate-200"
                        }`}
                      >
                        {patient.status === "Aktif" ? (
                          <UserCheck className="h-3 w-3" />
                        ) : (
                          <UserX className="h-3 w-3" />
                        )}
                        {patient.status}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => navigate({ to: "/doctor/patients" })}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-50 text-sky-700 border border-sky-100 text-sm font-medium hover:bg-sky-100 transition-all"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="py-16 text-center">
                <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Tidak ada pasien yang cocok</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </DoctorLayout>
  );
}
