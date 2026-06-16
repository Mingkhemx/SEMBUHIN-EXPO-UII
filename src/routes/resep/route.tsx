import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { MoleculeViewer } from "@/components/three/MoleculeViewer";
import { motion } from "framer-motion";
import { FileText, Download, Share2 } from "lucide-react";

export const Route = createFileRoute("/resep")({
  head: () => ({
    meta: [
      { title: "Resep Holografik — Sembuhin" },
      {
        name: "description",
        content: "Resep digital pertama dengan visualisasi molekul obat 3D. Tilt untuk efek hologram.",
      },
      { property: "og:title", content: "Resep Holografik — Sembuhin" },
      {
        property: "og:description",
        content: "Lihat molekul obatmu menari dalam 3D.",
      },
    ],
  }),
  component: ResepPage,
});

const RESEP = [
  { name: "Amoxicillin 500mg", dose: "3x sehari sesudah makan", days: 7 },
  { name: "Vitamin B Complex", dose: "1x sehari pagi hari", days: 30 },
  { name: "Paracetamol 500mg", dose: "Bila perlu, max 3x sehari", days: 5 },
];

function ResepPage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent) => {
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: -py * 14, y: px * 14 });
  };
  const reset = () => setTilt({ x: 0, y: 0 });

  return (
    <div className="space-y-8 pb-12">
      <header className="pt-4">
        <div className="glass mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium">
          <FileText className="h-3.5 w-3.5 text-primary" />
          World-first holographic prescription
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Resep <span className="text-gradient">Holografik</span>
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Gerakkan kursor di atas kartu untuk melihat efek hologram. Setiap obat divisualisasikan sebagai molekul 3D.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        {/* HOLOGRAM CARD */}
        <div
          className="relative"
          style={{ perspective: "1200px" }}
          onMouseMove={onMove}
          onMouseLeave={reset}
        >
          <motion.div
            ref={cardRef}
            animate={{ rotateX: tilt.x, rotateY: tilt.y }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            style={{ transformStyle: "preserve-3d" }}
            className="glass-strong relative overflow-hidden rounded-3xl p-6"
          >
            {/* Holographic shimmer */}
            <div
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                background: `linear-gradient(${
                  120 + tilt.y * 4
                }deg, oklch(0.85 0.15 240 / 0.0) 30%, oklch(0.9 0.18 200 / 0.4) 50%, oklch(0.85 0.15 280 / 0.0) 70%)`,
              }}
            />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Resep #AM-2891
                  </div>
                  <div className="mt-1 font-display text-2xl font-bold">Aurelia P., 28th</div>
                </div>
                <div className="rounded-full bg-gradient-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-glow">
                  VERIFIED
                </div>
              </div>

              <div className="mt-5 border-y border-white/40 py-4">
                <div className="text-xs text-muted-foreground">Diresepkan oleh</div>
                <div className="font-semibold">dr. Sembuhin Wijaya, Sp.PD</div>
                <div className="text-xs text-muted-foreground">17 April 2026 · STR 4438291</div>
              </div>

              <ul className="mt-4 space-y-3">
                {RESEP.map((r, i) => (
                  <li key={i} className="rounded-xl bg-white/40 p-3">
                    <div className="flex items-baseline justify-between">
                      <div className="font-semibold">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.days} hari</div>
                    </div>
                    <div className="mt-0.5 text-sm text-muted-foreground">{r.dose}</div>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex gap-2">
                <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">
                  <Download className="h-4 w-4" /> Unduh PDF
                </button>
                <button className="glass flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold">
                  <Share2 className="h-4 w-4" /> Bagikan
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* MOLECULE */}
        <div className="glass-strong relative overflow-hidden rounded-3xl">
          <MoleculeViewer className="h-[60vh] min-h-[480px] w-full" />
          <div className="absolute left-4 top-4 rounded-xl bg-white/60 px-3 py-1.5 text-xs font-medium backdrop-blur">
            Struktur molekul: Amoxicillin
          </div>
          <div className="glass absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 text-xs">
            Berputar otomatis • Visualisasi 3D
          </div>
        </div>
      </div>
    </div>
  );
}
