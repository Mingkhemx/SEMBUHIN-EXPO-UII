import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { MoleculeViewer } from "@/components/three/MoleculeViewer";
import { motion } from "framer-motion";
import { FileText, Download, Share2, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";

interface ResepSearchParams {
  id?: string;
}

export const Route = createFileRoute("/resep")({
  validateSearch: (search: Record<string, unknown>): ResepSearchParams => {
    return {
      id: (search.id as string) || "",
    };
  },
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

interface Medicine {
  name: string;
  dose: string;
  days: number | string;
}

interface PrescriptionData {
  id: string;
  patient_name: string;
  patient_age: number;
  doctor_name: string;
  doctor_str: string;
  created_at: string;
  medicines: Medicine[];
  status: string;
}

// Mock data untuk testing
const MOCK_PRESCRIPTIONS: Record<string, PrescriptionData> = {
  "demo-1": {
    id: "demo-1",
    patient_name: "Ahmad Rizki",
    patient_age: 28,
    doctor_name: "Dr. Siti Nurhaliza",
    doctor_str: "1234567890",
    created_at: new Date().toISOString(),
    medicines: [
      { name: "Paracetamol", dose: "500mg", days: 7 },
      { name: "Ibuprofen", dose: "400mg", days: 5 },
      { name: "Amoxicillin", dose: "250mg 3x sehari", days: 10 }
    ],
    status: "ACTIVE"
  },
  "test-resep": {
    id: "test-resep",
    patient_name: "Budi Santoso",
    patient_age: 35,
    doctor_name: "Dr. Eka Wijaya",
    doctor_str: "9876543210",
    created_at: new Date().toISOString(),
    medicines: [
      { name: "Omeprazole", dose: "20mg", days: 14 },
      { name: "Antasida", dose: "500mg", days: 7 }
    ],
    status: "DISPENSED"
  }
};

function ResepPage() {
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const idFromUrl = searchParams.get('id');
  
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PrescriptionData | null>(null);

  useEffect(() => {
    async function fetchResep() {
      try {
        setLoading(true);
        
        // If no ID provided, show available demo prescriptions
        if (!idFromUrl) {
          setData(MOCK_PRESCRIPTIONS["demo-1"]);
          setLoading(false);
          return;
        }

        // Try mock data first
        const mockData = MOCK_PRESCRIPTIONS[idFromUrl];
        if (mockData) {
          setData(mockData);
          setLoading(false);
          return;
        }

        // If not in mock, show error with available options
        throw new Error(`Resep dengan ID "${idFromUrl}" tidak ditemukan. Coba: "demo-1" atau "test-resep"`);
      } catch (err: any) {
        console.error("Error fetching resep:", err);
        setError(err.message || "Gagal memuat resep. Silakan coba lagi atau hubungi dukungan.");
        setLoading(false);
      }
    }
    fetchResep();
  }, [idFromUrl]);

  const handleDownloadPDF = async () => {
    if (!data) return;
    toast.success("Fitur download sedang dalam pengembangan");
  };

  const handleShare = async () => {
    if (!id) return;
    const url = `${window.location.origin}/resep?id=${id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Resep Sembuhin - ${data?.patient_name}`,
          text: "Lihat resep digitalku di Sembuhin",
          url
        });
      } catch (err) {
        console.error("Share error:", err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      toast.success("Link resep disalin ke clipboard");
    }
  };

  const onMove = (e: React.MouseEvent) => {
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: -py * 14, y: px * 14 });
  };
  const reset = () => setTilt({ x: 0, y: 0 });

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Menyiapkan hologram resep Anda...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-5 text-center px-4">
        <div className="h-16 w-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-rose-500" />
        </div>
        <div>
          <h2 className="text-[17px] font-bold text-slate-900 mb-1">
            {!id ? "ID Resep tidak ditemukan" : "Resep tidak tersedia"}
          </h2>
          <p className="text-[13px] text-slate-400 max-w-xs leading-relaxed">
            {error || "Resep ini mungkin belum dibuat atau sudah dihapus oleh dokter."}
          </p>
        </div>
        <a
          href="/rekam-medis"
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-[13px] font-semibold rounded-xl hover:bg-slate-800 transition-colors"
        >
          ← Kembali ke Rekam Medis
        </a>
      </div>
    );
  }

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
                    Resep #{data.id.slice(0, 8).toUpperCase()}
                  </div>
                  <div className="mt-1 font-display text-2xl font-bold">{data.patient_name}, {data.patient_age}th</div>
                </div>
                <div className="rounded-full bg-gradient-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-glow">
                  {data.status.toUpperCase()}
                </div>
              </div>

              <div className="mt-5 border-y border-white/40 py-4">
                <div className="text-xs text-muted-foreground">Diresepkan oleh</div>
                <div className="font-semibold">{data.doctor_name}</div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(data.created_at), "dd MMMM yyyy", { locale: idLocale })} · STR {data.doctor_str}
                </div>
              </div>

              <ul className="mt-4 space-y-3">
                {data.medicines && data.medicines.length > 0 ? (
                  data.medicines.map((r, i) => (
                    <li key={i} className="rounded-xl bg-white/40 p-3">
                      <div className="flex items-baseline justify-between">
                        <div className="font-semibold">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{r.days} hari</div>
                      </div>
                      <div className="mt-0.5 text-sm text-muted-foreground">{r.dose}</div>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-muted-foreground italic">Tidak ada data obat</li>
                )}
              </ul>

              <div className="mt-5 flex gap-2">
                <button 
                  onClick={handleDownloadPDF}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-lg transition-all"
                >
                  <Download className="h-4 w-4" /> Unduh PDF
                </button>
                <button 
                  onClick={handleShare}
                  className="glass flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-white/20 transition-colors"
                >
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
            Struktur molekul: {data.medicines?.[0]?.name || "Obat"}
          </div>
          <div className="glass absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 text-xs">
            Berputar otomatis • Visualisasi 3D
          </div>
        </div>
      </div>
    </div>
  );
}
