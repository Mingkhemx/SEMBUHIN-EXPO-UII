/**
 * AdminLayout — Shared layout for all Admin Panel pages.
 * Clean light-theme professional admin design.
 */

import { Link, useNavigate, Outlet } from "@tanstack/react-router";
import { useState, useEffect, createContext, useContext } from "react";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  MessageSquare,
  Settings,
  Bell,
  Menu,
  X,
  ShieldCheck,
  LogOut,
  ShoppingBag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/Avatar";

// ─── Context for Header ───────────────────────────────────────────────────────

interface AdminContextType {
  setTitle: (title: string) => void;
  setSubtitle: (subtitle: string | undefined) => void;
  setHeaderAction: (action: React.ReactNode) => void;
  setRightElement: (element: React.ReactNode) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdminLayout = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdminLayout must be used within AdminShell");
  return context;
};

// ─── Navigation ───────────────────────────────────────────────────────────────

export const ADMIN_NAV = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin",
    description: "Ringkasan sistem",
  },
  {
    id: "users",
    label: "Manajemen User",
    icon: Users,
    path: "/admin/users",
    description: "Kelola akun pasien",
  },
  {
    id: "doctors",
    label: "Manajemen Dokter",
    icon: Stethoscope,
    path: "/admin/doctors",
    description: "Verifikasi & akses dokter",
  },
  {
    id: "marketplace",
    label: "Marketplace",
    icon: ShoppingBag,
    path: "/admin/marketplace",
    description: "Kelola produk & pesanan",
  },
  {
    id: "live-chat",
    label: "Live Chat",
    icon: MessageSquare,
    path: "/admin/live-chat",
    description: "Monitor & balas chat",
    badge: 5,
  },
  {
    id: "settings",
    label: "Pengaturan",
    icon: Settings,
    path: "/admin/settings",
    description: "Konfigurasi sistem",
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface AdminLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  rightElement?: React.ReactNode;
}

// ─── Components ───────────────────────────────────────────────────────────────

export function AdminShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, userProfile, signOut: authSignOut } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  
  // Header state (controlled by child pages)
  const [title, setTitle] = useState("Admin Panel");
  const [subtitle, setSubtitle] = useState<string | undefined>();
  const [headerAction, setHeaderAction] = useState<React.ReactNode>();
  const [rightElement, setRightElement] = useState<React.ReactNode>();

  const navigate = useNavigate();
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";

  useEffect(() => {
    const checkAdminAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate({ to: "/admin/login" }); return; }
      
      // Get fresh profile from table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, email, role, avatar_url')
        .eq('id', session.user.id)
        .single();

      if (error || profile?.role !== 'admin') {
        await authSignOut();
        navigate({ to: "/admin/login" });
      } else {
        setIsVerifying(false);
      }
    };
    checkAdminAuth();
  }, [navigate, authSignOut]);

  const handleLogout = async () => {
    await authSignOut();
    navigate({ to: "/admin/login" });
  };

  if (isVerifying) return null;

  // Prioritas avatar: Metadata Auth > Table Profiles
  const adminAvatar = user?.user_metadata?.avatar_url || userProfile?.avatar_url;
  const adminName = userProfile?.full_name || user?.user_metadata?.full_name || "Super Admin";
  const adminEmail = userProfile?.email || user?.email || "admin@sembuhin.id";

  return (
    <AdminContext.Provider value={{ setTitle, setSubtitle, setHeaderAction, setRightElement }}>
      <div className="min-h-screen bg-slate-50 flex">
        {/* Sidebar - Remains static across routes */}
        <aside className={[
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm",
          "lg:static lg:z-auto",
          sidebarOpen ? "flex" : "hidden lg:flex",
        ].join(" ")}>
          {/* Logo */}
          <div className="px-5 py-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <img src="/gif_logo/icon.png" alt="Sembuhin" className="h-10 w-10 rounded-xl object-cover shadow-md shadow-sky-500/25" />
              <div>
                <h1 className="text-base font-bold text-slate-900">Sembuhin</h1>
                <p className="text-xs text-slate-400 font-medium">Admin Panel</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 pt-5 space-y-0.5 overflow-y-auto pb-4">
            <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Menu Utama</p>
            {ADMIN_NAV.map((item) => {
              const isActive = item.id === "dashboard" ? currentPath === "/admin" || currentPath === "/admin/" : currentPath.startsWith(item.path);
              return (
                <Link key={item.id} to={item.path} onClick={() => setSidebarOpen(false)} className={[
                  "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  isActive ? "bg-sky-50 text-sky-700 border border-sky-100 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                ].join(" ")}>
                  <item.icon className={["h-4 w-4 flex-shrink-0", isActive ? "text-sky-600" : "text-slate-400 group-hover:text-slate-600"].join(" ")} />
                  <div className="flex-1 min-w-0">
                    <span className="truncate block">{item.label}</span>
                    <p className={["text-[10px] truncate mt-0.5", isActive ? "text-sky-500/70" : "text-slate-400"].join(" ")}>{item.description}</p>
                  </div>
                  {isActive && <motion.div layoutId="admin-active-dot" className="h-1.5 w-1.5 rounded-full bg-sky-500 flex-shrink-0" />}
                </Link>
              );
            })}
          </nav>

          {/* Admin Profile */}
          <div className="px-4 py-4 border-t border-slate-100">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <Avatar
                src={adminAvatar}
                name={adminName}
                className="h-10 w-10 border border-slate-200 shadow-sm"
                textClassName="text-xs"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{adminName}</p>
                <p className="text-[10px] text-slate-400 truncate">{adminEmail}</p>
              </div>
              <button 
                onClick={handleLogout} 
                className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"
                title="Keluar"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        <AnimatePresence>
          {sidebarOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm lg:hidden z-40" onClick={() => setSidebarOpen(false)} />}
        </AnimatePresence>

        {/* Main Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-3.5 flex items-center justify-between flex-shrink-0 shadow-sm shadow-slate-100/50">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600">
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h2 className="text-base font-bold text-slate-900">{title}</h2>
                {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {headerAction}
              {rightElement}
              <button className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 border-2 border-white" />
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-6 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPath}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="min-h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}

export function AdminLayout({ title, subtitle, children, headerAction, rightElement }: AdminLayoutProps) {
  const { setTitle, setSubtitle, setHeaderAction, setRightElement } = useAdminLayout();

  useEffect(() => {
    setTitle(title);
    setSubtitle(subtitle);
    setHeaderAction(headerAction);
    setRightElement(rightElement);
  }, [title, subtitle, headerAction, rightElement, setTitle, setSubtitle, setHeaderAction, setRightElement]);

  return <>{children}</>;
}

// ─── Reusable stat card ───────────────────────────────────────────────────────

interface AdminStatCardProps {
  label: string;
  value: string | number;
  change?: string;
  positive?: boolean;
  icon: React.ReactNode;
  color: string;
}

export function AdminStatCard({
  label,
  value,
  change,
  positive = true,
  icon,
  color,
}: AdminStatCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:shadow-slate-200/50 hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        {change && (
          <span
            className={[
              "text-xs font-bold px-2.5 py-1 rounded-full border",
              positive
                ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                : "text-rose-700 bg-rose-50 border-rose-100",
            ].join(" ")}
          >
            {positive ? "+" : ""}
            {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-extrabold text-slate-900 mb-1">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    inactive: "bg-slate-100 text-slate-600 border-slate-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
    online: "bg-emerald-50 text-emerald-700 border-emerald-200",
    offline: "bg-slate-100 text-slate-600 border-slate-200",
    banned: "bg-rose-50 text-rose-700 border-rose-200",
    tersedia: "bg-sky-50 text-sky-700 border-sky-200",
    habis: "bg-orange-50 text-orange-700 border-orange-200",
  };
  const cls = map[status.toLowerCase()] ?? "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span
      className={`inline-flex items-center justify-center w-fit px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${cls}`}
    >
      {status}
    </span>
  );
}
