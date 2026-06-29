/**
 * DoctorLayout — Shared layout for all Doctor Panel pages.
 * Contains the sidebar navigation, mobile drawer, and top header.
 * Each doctor panel page wraps its content with this component.
 */

import { Link, Outlet } from "@tanstack/react-router";
import { useState, useEffect, createContext, useContext } from "react";
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  FileText,
  Users,
  Activity,
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
  LogIn,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Avatar } from "@/components/Avatar";

// ─── Context for Header ───────────────────────────────────────────────────────

interface DoctorContextType {
  setTitle: (title: string) => void;
  setHeaderAction: (action: React.ReactNode) => void;
}

const DoctorContext = createContext<DoctorContextType | undefined>(undefined);

export const useDoctorLayout = () => {
  const context = useContext(DoctorContext);
  if (!context) throw new Error("useDoctorLayout must be used within DoctorLayout");
  return context;
};

// ─── Navigation config ────────────────────────────────────────────────────────

export const DOCTOR_NAV = [
  { id: "dashboard",     label: "Dashboard",    icon: LayoutDashboard, path: "/doctor" },
  { id: "consultations", label: "Konsultasi",   icon: Calendar,        path: "/doctor/consultations" },
  { id: "chat",          label: "Chat Pasien",  icon: MessageSquare,   path: "/doctor/chat" },
  { id: "prescriptions", label: "Resep",        icon: FileText,        path: "/doctor/prescriptions" },
  { id: "patients",      label: "Pasien",       icon: Users,           path: "/doctor/patients" },
  { id: "analytics",     label: "Analitik",     icon: Activity,        path: "/doctor/analytics" },
  { id: "settings",      label: "Pengaturan",   icon: Settings,        path: "/doctor/settings" },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface DoctorLayoutProps {
  /** Page title shown in the top header bar */
  title: string;
  /** Main page content */
  children: React.ReactNode;
  /** Optional extra element in the top-right of the header (e.g. action buttons) */
  headerAction?: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DoctorShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [title, setTitle] = useState("Doctor Panel");
  const [headerAction, setHeaderAction] = useState<React.ReactNode>();

  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "";
  const { user, signOut } = useAuth();

  // Fetch doctor profile for the logged-in user
  const [doctorProfile, setDoctorProfile] = useState<{
    name: string;
    specialty: string;
    avatar_url: string | null;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("doctors")
        .select("name, specialty, avatar_url")
        .eq("user_id", user.id)
        .single();
      if (active && data) {
        setDoctorProfile(data);
      }
    })();
    return () => { active = false; };
  }, [user]);

  const doctorName = doctorProfile?.name || user?.user_metadata?.full_name || "Dokter";
  const doctorSpecialty = doctorProfile?.specialty || "Spesialis";
  const doctorAvatar = doctorProfile?.avatar_url;

  return (
    <DoctorContext.Provider value={{ setTitle, setHeaderAction }}>
      <div className="min-h-screen bg-white">
        <div className="flex h-screen overflow-hidden">

          {/* ── Sidebar ─────────────────────────────────────────────── */}
          <aside
            className={[
              "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col",
              "lg:static lg:z-auto",
              sidebarOpen ? "flex" : "hidden lg:flex",
            ].join(" ")}
          >
            {/* Logo */}
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <img
                  src="/gif_logo/icon.png"
                  alt="Sembuhin"
                  className="h-10 w-10 rounded-xl object-cover shadow-sm shadow-sky-600/30"
                />
                <div>
                  <h1 className="text-lg font-bold text-slate-900">Sembuhin</h1>
                  <p className="text-xs text-slate-400 font-medium">Doctor Panel</p>
                </div>
                {/* Close button — mobile only */}
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="ml-auto lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
              {DOCTOR_NAV.map((item) => {
                const isActive =
                  item.id === "dashboard"
                    ? currentPath === "/doctor" || currentPath === "/doctor/"
                    : currentPath === item.path;

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={[
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                      isActive
                        ? "bg-sky-50 text-sky-700 border border-sky-100 shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    ].join(" ")}
                  >
                    <item.icon
                      className={["h-4 w-4", isActive ? "text-sky-600" : "text-slate-400"].join(" ")}
                    />
                    {item.label}
                    {/* Active indicator dot */}
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-dot"
                        className="ml-auto h-1.5 w-1.5 rounded-full bg-sky-500"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Doctor Profile */}
            <div className="p-4 border-t border-slate-100">
              {user ? (
                <div className="flex items-center gap-3">
                  <Avatar
                    src={doctorAvatar}
                    name={doctorName}
                    className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-200"
                    textClassName="text-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{doctorName}</p>
                    <p className="text-xs text-slate-400 truncate">{doctorSpecialty} · Online</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors relative">
                      <Bell className="h-4 w-4" />
                      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 border border-white" />
                    </button>
                    <button
                      title="Logout"
                      onClick={() => signOut()}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-sky-50 text-sky-700 text-sm font-medium hover:bg-sky-100 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  Masuk sebagai Dokter
                </Link>
              )}
            </div>
          </aside>

          {/* ── Mobile overlay ──────────────────────────────────────── */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm lg:hidden z-40"
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </AnimatePresence>

          {/* ── Main content area ───────────────────────────────────── */}
          <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 min-w-0">

            {/* Top header */}
            <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between lg:px-6 shadow-sm shadow-slate-100/50 flex-shrink-0">
              <div className="flex items-center gap-3">
                {/* Mobile hamburger */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <h2 className="text-lg font-bold text-slate-900">{title}</h2>
              </div>
              {headerAction && <div className="flex items-center gap-2">{headerAction}</div>}
            </header>

            {/* Scrollable content with Animation */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 relative">
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
            </div>
          </main>
        </div>
      </div>
    </DoctorContext.Provider>
  );
}

export function DoctorLayout({ title, children, headerAction }: DoctorLayoutProps) {
  const { setTitle, setHeaderAction } = useDoctorLayout();

  useEffect(() => {
    setTitle(title);
    setHeaderAction(headerAction);
  }, [title, headerAction, setTitle, setHeaderAction]);

  return <>{children}</>;
}
