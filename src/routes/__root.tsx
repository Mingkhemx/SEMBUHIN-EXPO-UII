import { Outlet, Link, createRootRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuroraBackground } from "@/components/AuroraBackground";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const { userProfile, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkMaintenance() {
      try {
        const { data } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "maintenance_mode")
          .maybeSingle();
        
        if (data?.value?.active) {
          setIsMaintenance(true);
        }
      } catch (err) {
        console.error("Error checking maintenance mode:", err);
      } finally {
        setChecking(false);
      }
    }
    checkMaintenance();

    // Real-time listener for maintenance toggle
    const channel = supabase
      .channel("maintenance_changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "settings", filter: "key=eq.maintenance_mode" },
        (payload) => {
          setIsMaintenance(!!payload.new.value?.active);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (checking) return;

    const isMaintenancePage = location.pathname === '/maintenance';
    const isAdminPath = location.pathname.startsWith('/admin');

    // Jika maintenance aktif, kunci semua user di page maintenance
    // Kecuali jika sedang mengakses Admin Panel (agar bisa mematikan maintenance)
    if (isMaintenance && !isMaintenancePage && !isAdminPath) {
      navigate({ to: '/maintenance', replace: true });
    } else if (!isMaintenance && isMaintenancePage) {
      navigate({ to: '/beranda', replace: true });
    }
  }, [isMaintenance, checking, location.pathname, navigate]);

  if (checking) return null;
  return <>{children}</>;
}

function BanGuard({ children }: { children: React.ReactNode }) {
  const { userProfile, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && userProfile) {
      const isBanned = userProfile.status === 'banned';
      const isInactive = userProfile.status === 'inactive';
      const isBannedPage = location.pathname === '/banned';

      if ((isBanned || isInactive) && !isBannedPage) {
        navigate({ to: '/banned', replace: true });
      } else if (!isBanned && !isInactive && isBannedPage) {
        navigate({ to: '/beranda', replace: true });
      }
    }
  }, [userProfile, loading, location.pathname, navigate]);

  return <>{children}</>;
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="glass max-w-md rounded-3xl p-10 text-center">
        <h1 className="font-display text-7xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Halaman tidak ditemukan</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Sepertinya kamu tersesat di lautan aurora.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
        >
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";
  const isBannedPage = location.pathname === "/banned";
  const isDoctorPage = location.pathname.startsWith("/doctor");
  const isAdminPage = location.pathname.startsWith("/admin");
  const isDaftarDokterPage = location.pathname.startsWith("/daftar-dokter");

  // Scroll ke atas setiap kali route berubah
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  const content = (
    <MaintenanceGuard>
      <BanGuard>
        {isAuthPage || isDoctorPage || isAdminPage || isBannedPage || location.pathname === "/maintenance" ? (
          <main className="flex-1 flex flex-col min-h-screen">
            <Outlet />
          </main>
        ) : (
          <div className="flex-1 flex flex-col min-h-screen">
            <AuroraBackground />
            <Header />
            <main className={`${isDaftarDokterPage ? 'px-0 pt-10 pb-10' : 'mx-auto max-w-6xl px-4 pt-24'} flex-1`}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </main>
            {!isDaftarDokterPage && <Footer />}
          </div>
        )}
      </BanGuard>
    </MaintenanceGuard>
  );

  return (
    <AuthProvider>
      <LanguageProvider>
        {content}
      </LanguageProvider>
    </AuthProvider>
  );
}
