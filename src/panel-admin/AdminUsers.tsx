/**
 * AdminUsers — Full user/patient management page.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Eye, ShieldOff, Ban, Users, UserCheck, UserX, Loader2, RefreshCcw, X, Mail, Calendar, CreditCard, Shield } from "lucide-react";
import { AdminLayout, StatusBadge } from "@/panel-admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Membership = "Free" | "Premium";
type UserStatus = "active" | "inactive" | "banned";
type UserRole = "admin" | "doctor" | "user";

interface UserRow {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  is_premium: boolean;
  status: UserStatus;
  is_active: boolean;
  avatar: string; // initials
  phone?: string;
  last_login?: string;
  role?: UserRole;
  avatar_url?: string;
  status_reason?: string;
  ban_until?: string;
}

interface UserStats {
  total: number;
  active: number;
  banned: number;
}

const FILTER_OPTIONS = ["Semua", "Aktif", "Banned", "Premium"] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];

// ─── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "from-sky-500 to-indigo-600",
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
];

function UserAvatar({ initials, index, src }: { initials: string; index: number; src?: string }) {
  const gradient = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <div
      className={`h-9 w-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-200`}
    >
      {src ? (
        <img src={src} alt={initials} className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
      ) : (
        <span className="text-[11px] font-bold text-white">{initials}</span>
      )}
    </div>
  );
}

// ─── Membership badge ─────────────────────────────────────────────────────────

function MembershipBadge({ type }: { type: Membership }) {
  return type === "Premium" ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-200">
      ★ Premium
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-slate-100 text-slate-600 border-slate-200">
      Free
    </span>
  );
}

// ─── Role badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role?: string }) {
  const config: Record<string, { label: string; className: string }> = {
    admin: {
      label: "Administrator",
      className: "bg-rose-50 text-rose-700 border-rose-200",
    },
    doctor: {
      label: "Dokter",
      className: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    user: {
      label: "Pasien",
      className: "bg-slate-50 text-slate-600 border-slate-200",
    },
  };

  // Pecah role jika ada banyak (misal: "admin,doctor")
  const roles = (role || "user").split(",");

  return (
    <div className="flex flex-wrap justify-center gap-1">
      {roles.map((r) => {
        const current = config[r.trim()] || config.user;
        return (
          <span
            key={r}
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${current.className}`}
          >
            {current.label}
          </span>
        );
      })}
    </div>
  );
}

// ─── Mini stat pill ───────────────────────────────────────────────────────────

function MiniStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-xl px-4 py-3">
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-base font-bold text-slate-900 leading-none">{value}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ current, total, onPageChange, totalItems }: { 
  current: number; 
  total: number; 
  onPageChange: (p: number) => void;
  totalItems: number;
}) {
  if (total <= 1) return null;
  
  const pages = Array.from({ length: Math.min(5, total) }, (_, i) => i + 1);
  
  return (
    <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
      <p className="text-xs text-slate-500">
        Menampilkan <span className="text-slate-700">{Math.min(10, totalItems)}</span> dari{" "}
        <span className="text-slate-700">{totalItems.toLocaleString()}</span> user
      </p>
      <div className="flex items-center gap-1">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={[
              "h-8 min-w-[32px] px-2 rounded-lg text-xs font-semibold transition-colors",
              page === current
                ? "bg-sky-600 text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
            ].join(" ")}
          >
            {page}
          </button>
        ))}
        {total > 5 && <span className="text-slate-400 px-1">...</span>}
        {total > 5 && (
           <button
             onClick={() => onPageChange(total)}
             className={[
               "h-8 min-w-[32px] px-2 rounded-lg text-xs font-semibold transition-colors",
               total === current
                 ? "bg-sky-600 text-white"
                 : "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
             ].join(" ")}
           >
             {total}
           </button>
        )}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

function ActionModal({ 
  user, 
  type, 
  onClose, 
  onConfirm 
}: { 
  user: UserRow; 
  type: 'suspend' | 'ban'; 
  onClose: () => void; 
  onConfirm: (reason: string, durationHours?: number) => void;
}) {
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState(24); // default 24 jam untuk ban

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className={`p-6 ${type === 'ban' ? 'bg-rose-600' : 'bg-amber-500'} text-white`}>
          <h3 className="text-xl font-bold flex items-center gap-2">
            {type === 'ban' ? <Ban className="h-6 w-6" /> : <ShieldOff className="h-6 w-6" />}
            {type === 'ban' ? 'Ban User' : 'Suspend User'}
          </h3>
          <p className="text-white/80 text-sm mt-1">Konfirmasi tindakan untuk {user.full_name}</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
              Alasan {type === 'ban' ? 'Ban' : 'Suspend'}
            </label>
            <textarea
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Pelanggaran ketentuan layanan, spamming, dll..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 min-h-[100px] resize-none"
            />
          </div>

          {type === 'ban' && (
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                Durasi Ban (Jam)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[24, 72, 168, 720].map((h) => (
                  <button
                    key={h}
                    onClick={() => setDuration(h)}
                    className={cn(
                      "py-2 rounded-xl text-xs font-bold border transition-all",
                      duration === h 
                        ? "bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-600/20" 
                        : "bg-white border-slate-200 text-slate-600 hover:border-rose-300"
                    )}
                  >
                    {h >= 720 ? '1 Bln' : h >= 168 ? '1 Minggu' : `${h} Jam`}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                className="w-full mt-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                placeholder="Atau masukkan jam kustom..."
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-colors"
            >
              Batal
            </button>
            <button
              disabled={!reason.trim()}
              onClick={() => onConfirm(reason, type === 'ban' ? duration : undefined)}
              className={cn(
                "flex-1 px-4 py-3 rounded-2xl text-sm font-bold text-white transition-all",
                type === 'ban' ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20" : "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20",
                !reason.trim() && "opacity-50 cursor-not-allowed"
              )}
            >
              Konfirmasi
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function UserDetailModal({ user, onClose, onUpdateStatus }: { 
  user: UserRow; 
  onClose: () => void;
  onUpdateStatus: (userId: string, status: UserStatus, isActive: boolean) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-r from-sky-600 to-indigo-700">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="absolute -bottom-10 left-8">
            <div className="h-20 w-20 rounded-2xl bg-white p-1.5 shadow-xl">
              <div className="h-full w-full rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden border border-slate-100">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} className="h-full w-full object-cover" />
                ) : (
                  user.avatar
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-14 pb-8 px-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-slate-900">{user.full_name}</h2>
                <RoleBadge role={user.role} />
              </div>
              <p className="text-slate-500 flex items-center gap-1.5 mt-1">
                <Mail className="h-3.5 w-3.5" />
                {user.email}
              </p>
            </div>
            <StatusBadge status={user.status || (user.is_active ? "active" : "inactive")} />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                Bergabung
              </p>
              <p className="text-sm font-semibold text-slate-700">
                {format(new Date(user.created_at), "dd MMMM yyyy", { locale: idLocale })}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CreditCard className="h-3 w-3" />
                Membership
              </p>
              <MembershipBadge type={user.is_premium ? "Premium" : "Free"} />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Aksi Manajemen</p>
            <div className="flex gap-2">
              {user.status !== 'active' && (
                <button
                  onClick={() => { onUpdateStatus(user.id, 'active', true); onClose(); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors"
                >
                  <UserCheck className="h-4 w-4" />
                  Aktifkan
                </button>
              )}
              {user.status !== 'inactive' && (
                <button
                  onClick={() => { onUpdateStatus(user.id, 'inactive', false); onClose(); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-sm font-bold hover:bg-amber-100 transition-colors"
                >
                  <ShieldOff className="h-4 w-4" />
                  Suspend
                </button>
              )}
              {user.status !== 'banned' && (
                <button
                  onClick={() => { onUpdateStatus(user.id, 'banned', false); onClose(); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-sm font-bold hover:bg-rose-100 transition-colors"
                >
                  <Ban className="h-4 w-4" />
                  Ban User
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function AdminUsers() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterOption>("Semua");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [stats, setStats] = useState<UserStats>({ total: 0, active: 0, banned: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [actionModal, setActionModal] = useState<{ user: UserRow; type: 'suspend' | 'ban' } | null>(null);

  // 1. Fetch Stats
  const fetchStats = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/admin/users/stats");
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Error fetching user stats:", err);
    }
  };

  // 2. Fetch Users
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        search,
        status: filter,
        page: page.toString(),
        per_page: "10"
      });
      const response = await fetch(`http://localhost:5001/api/admin/users?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data.map((u: any) => ({
          ...u,
          avatar: u.full_name ? u.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : '??'
        })));
        setTotalItems(data.total);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Gagal memuat data user");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Update User Status
  const handleUpdateStatus = async (
    userId: string, 
    status: UserStatus, 
    isActive: boolean, 
    reason?: string, 
    banUntil?: string
  ) => {
    try {
      const response = await fetch(`http://localhost:5001/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status, 
          is_active: isActive,
          reason: reason || null,
          ban_until: banUntil || null
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        fetchUsers();
        fetchStats();
        setActionModal(null);
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Gagal memperbarui status user");
    }
  };

  // 4. Export CSV
  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const response = await fetch("http://localhost:5001/api/admin/users/export");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Sembuhin_Users_${format(new Date(), 'yyyyMMdd')}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success("Data user berhasil diekspor");
      } else {
        toast.error("Gagal mengekspor data");
      }
    } catch (err) {
      console.error("Error exporting CSV:", err);
      toast.error("Terjadi kesalahan saat mengekspor");
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();

    // Realtime subscription
    const channel = supabase
      .channel('admin-users-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        setIsLive(true);
        setTimeout(() => setIsLive(false), 2000);
        fetchUsers();
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [search, filter, page]);

  return (
    <AdminLayout
      title="Manajemen User"
      subtitle="Kelola dan pantau semua akun pasien"
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
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Live</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => { fetchUsers(); fetchStats(); }}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all active:scale-95"
          >
            <RefreshCcw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </button>
        </div>
      }
      headerAction={
        <button 
          onClick={handleExportCSV}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
          {isExporting ? 'Mengekspor...' : 'Export CSV'}
        </button>
      }
    >
      <div className="space-y-5">
        {/* ── Mini stats ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-wrap gap-3"
        >
          <MiniStat
            icon={Users}
            label="Total User"
            value={stats.total.toLocaleString()}
            color="bg-sky-500/10 text-sky-400"
          />
          <MiniStat
            icon={UserCheck}
            label="Aktif"
            value={stats.active.toLocaleString()}
            color="bg-emerald-500/10 text-emerald-400"
          />
          <MiniStat 
            icon={UserX} 
            label="Dibanned" 
            value={stats.banned.toLocaleString()} 
            color="bg-rose-500/10 text-rose-400" 
          />
        </motion.div>

        {/* ── Search + Filter bar ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.07 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-colors"
            />
          </div>

          {/* Filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors min-w-[140px]"
            >
              <span className="flex-1 text-left">{filter}</span>
              <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-10 overflow-hidden">
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setFilter(opt);
                      setDropdownOpen(false);
                      setPage(1);
                    }}
                    className={[
                      "w-full text-left px-4 py-2.5 text-sm transition-colors",
                      opt === filter
                        ? "bg-sky-50 text-sky-700 font-semibold"
                        : "text-slate-600 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Users table ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.14 }}
          className="bg-white border border-slate-200 rounded-2xl overflow-hidden min-h-[400px] flex flex-col"
        >
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-center px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Bergabung
                  </th>
                  <th className="text-center px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Membership
                  </th>
                  <th className="text-center px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="relative">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 text-sky-500 animate-spin" />
                        <p className="text-slate-400">Memuat data user...</p>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-20 text-center text-slate-400 text-sm">
                      Tidak ada user yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  users.map((user, i) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: i * 0.04 }}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                    >
                      {/* Avatar + Name */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <UserAvatar initials={user.avatar} index={i} src={user.avatar_url} />
                          <span className="font-medium text-slate-900">{user.full_name}</span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex justify-center">
                          <RoleBadge role={user.role} />
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-slate-600">{user.email}</td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {format(new Date(user.created_at), "dd MMM yyyy", { locale: idLocale })}
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <MembershipBadge type={user.is_premium ? "Premium" : "Free"} />
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex flex-col items-center gap-1">
                          <StatusBadge status={user.status || (user.is_active ? "active" : "inactive")} />
                          {user.status === 'banned' && user.ban_until && (
                            <span className="text-[10px] text-rose-500 font-medium">
                              Hingga: {format(new Date(user.ban_until), "dd MMM HH:mm", { locale: idLocale })}
                            </span>
                          )}
                          {user.status_reason && (
                            <span className="text-[10px] text-slate-400 italic truncate max-w-[120px]" title={user.status_reason}>
                              "{user.status_reason}"
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Row actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            title="Lihat"
                            onClick={() => setSelectedUser(user)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 text-xs font-semibold hover:bg-sky-100 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Lihat
                          </button>
                          <button
                            title="Suspend"
                            onClick={() => setActionModal({ user, type: 'suspend' })}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold hover:bg-amber-100 transition-colors"
                          >
                            <ShieldOff className="h-3.5 w-3.5" />
                            Suspend
                          </button>
                          <button
                            title="Ban"
                            onClick={() => setActionModal({ user, type: 'ban' })}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold hover:bg-rose-100 transition-colors"
                          >
                            <Ban className="h-3.5 w-3.5" />
                            Ban
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination 
            current={page} 
            total={Math.ceil(totalItems / 10)} 
            onPageChange={setPage} 
            totalItems={totalItems} 
          />
        </motion.div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <UserDetailModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </AnimatePresence>
       {/* Action Modal (Suspend/Ban) */}
       <AnimatePresence>
         {actionModal && (
           <ActionModal
             user={actionModal.user}
             type={actionModal.type}
             onClose={() => setActionModal(null)}
             onConfirm={(reason, duration) => {
               const status = actionModal.type === 'ban' ? 'banned' : 'inactive';
               let banUntil: string | undefined;
               if (duration) {
                 const date = new Date();
                 date.setHours(date.getHours() + duration);
                 banUntil = date.toISOString();
               }
               handleUpdateStatus(actionModal.user.id, status, false, reason, banUntil);
             }}
           />
         )}
       </AnimatePresence>
    </AdminLayout>
  );
}
