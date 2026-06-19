import { Outlet, Link, createRootRoute, useLocation } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuroraBackground } from "@/components/AuroraBackground";
import { FloatingHealthIcons } from "@/components/FloatingHealthIcons";
import { AuthProvider } from "@/contexts/AuthContext";

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
  const isAuthPage = location.pathname === '/auth';

  if (isAuthPage) {
    return (
      <AuthProvider>
        <main>
          <Outlet />
        </main>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <AuroraBackground />
      <FloatingHealthIcons />
      <Header />
      <main className="mx-auto max-w-6xl px-4 pt-24">
        <Outlet />
      </main>
      <Footer />
    </AuthProvider>
  );
}
