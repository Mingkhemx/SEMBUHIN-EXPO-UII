/**
 * AdminUsers — Full user/patient management page.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ChevronDown, Eye, ShieldOff, Ban, Users, UserCheck, UserX } from "lucide-react";
import { AdminLayout, StatusBadge } from "@/panel-admin/AdminLayout";

// ─── Types ────────────────────────────────────────────────────────────────────

type Membership = "Free" | "Premium";
type UserStatus = "active" | "inactive" | "banned";

interface UserRow {
  name: string;
  email: string;
  joined: string;
  membership: Membership;
  status: UserStatus;
  avatar: string; // initials
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_USERS: UserRow[] = [
  {
    name: "Anisa Rahma",
    email: "anisa@email.com",
    joined: "12 Jan 2025",
    membership: "Premium",
    status: "active",
    avatar: "AR",
  },
  {
    name: "Budi Santoso",
    email: "budi@email.com",
    joined: "15 Jan 2025",
    membership: "Free",
    status: "active",
    avatar: "BS",
  },
  {
    name: "Citra Dewi",
    email: "citra@email.com",
    joined: "20 Jan 2025",
    membership: "Free",
    status: "active",
    avatar: "CD",
  },
  {
    name: "Dimas Pratama",
    email: "dimas@email.com",
    joined: "1 Feb 2025",
    membership: "Premium",
    status: "active",
    avatar: "DP",
  },
  {
    name: "Eka Putri",
    email: "eka@email.com",
    joined: "5 Feb 2025",
    membership: "Free",
    status: "inactive",
    avatar: "EP",
  },
  {
    name: "Fandi Ahmad",
    email: "fandi@email.com",
    joined: "10 Feb 2025",
    membership: "Free",
    status: "active",
    avatar: "FA",
  },
  {
    name: "Gita Sari",
    email: "gita@email.com",
    joined: "14 Feb 2025",
    membership: "Premium",
    status: "active",
    avatar: "GS",
  },
  {
    name: "Hendra K",
    email: "hendra@email.com",
    joined: "20 Feb 2025",
    membership: "Free",
    status: "banned",
    avatar: "HK",
  },
  {
    name: "Indah W",
    email: "indah@email.com",
    joined: "1 Mar 2025",
    membership: "Free",
    status: "active",
    avatar: "IW",
  },
  {
    name: "Joko S",
    email: "joko@email.com",
    joined: "5 Mar 2025",
    membership: "Premium",
    status: "active",
    avatar: "JS",
  },
];

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

function UserAvatar({ initials, index }: { initials: string; index: number }) {
  const gradient = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <div
      className={`h-9 w-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}
    >
      <span className="text-[11px] font-bold text-white">{initials}</span>
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

function Pagination({ current, total }: { current: number; total: number }) {
  const pages = [1, 2, 3, "...", total];
  return (
    <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
      <p className="text-xs text-slate-500">
        Menampilkan <span className="text-slate-700">10</span> dari{" "}
        <span className="text-slate-700">12,847</span> user
      </p>
      <div className="flex items-center gap-1">
        {pages.map((page, i) => (
          <button
            key={i}
            className={[
              "h-8 min-w-[32px] px-2 rounded-lg text-xs font-semibold transition-colors",
              page === current
                ? "bg-sky-600 text-white"
                : page === "..."
                  ? "text-slate-400 cursor-default"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
            ].join(" ")}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminUsers() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterOption>("Semua");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filtered = MOCK_USERS.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "Semua"
        ? true
        : filter === "Aktif"
          ? u.status === "active"
          : filter === "Banned"
            ? u.status === "banned"
            : u.membership === "Premium";

    return matchSearch && matchFilter;
  });

  return (
    <AdminLayout
      title="Manajemen User"
      subtitle="Kelola dan pantau semua akun pasien"
      headerAction={
        <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-xl transition-colors">
          <Users className="h-4 w-4" />
          Export CSV
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
            value="12,847"
            color="bg-sky-500/10 text-sky-400"
          />
          <MiniStat
            icon={UserCheck}
            label="Aktif"
            value="11,203"
            color="bg-emerald-500/10 text-emerald-400"
          />
          <MiniStat icon={UserX} label="Dibanned" value="42" color="bg-rose-500/10 text-rose-400" />
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
              onChange={(e) => setSearch(e.target.value)}
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
          className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Bergabung
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Membership
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
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-400 text-sm">
                      Tidak ada user yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((user, i) => (
                    <motion.tr
                      key={user.email}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: i * 0.04 }}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                    >
                      {/* Avatar + Name */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <UserAvatar initials={user.avatar} index={i} />
                          <span className="font-medium text-slate-900">{user.name}</span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-slate-600">{user.email}</td>
                      <td className="px-5 py-3.5 text-slate-600">{user.joined}</td>

                      <td className="px-5 py-3.5">
                        <MembershipBadge type={user.membership} />
                      </td>

                      <td className="px-5 py-3.5">
                        <StatusBadge status={user.status} />
                      </td>

                      {/* Row actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            title="Lihat"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 text-xs font-semibold hover:bg-sky-100 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Lihat
                          </button>
                          <button
                            title="Suspend"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold hover:bg-amber-100 transition-colors"
                          >
                            <ShieldOff className="h-3.5 w-3.5" />
                            Suspend
                          </button>
                          <button
                            title="Ban"
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
          <Pagination current={1} total={10} />
        </motion.div>
      </div>
    </AdminLayout>
  );
}
