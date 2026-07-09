import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { FileText, Download, Share2, Clock, Pill, AlertCircle, Check } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";

export const Route = createFileRoute("/resep/")({
  component: ResepPage,
});

interface Medicine {
  name: string;
  dose: string;
  days: number;
}

interface Prescription {
  id: string;
  patientName: string;
  patientAge: number;
  doctorName: string;
  doctorLicense: string;
  issuedDate: string;
  medicines: Medicine[];
  notes?: string;
}

const MOCK_DATA: Record<string, Prescription> = {
  "1": {
    id: "1",
    patientName: "Ahmad Rizki",
    patientAge: 28,
    doctorName: "Dr. Siti Nurhaliza, Sp.PD",
    doctorLicense: "12345/KEP/2020",
    issuedDate: new Date().toISOString(),
    medicines: [
      { name: "Paracetamol", dose: "500mg, 3x sehari", days: 7 },
      { name: "Ibuprofen", dose: "400mg, 2x sehari", days: 5 },
      { name: "Amoxicillin", dose: "250mg, 3x sehari", days: 10 },
    ],
    notes: "Diminum setelah makan. Hindari alkohol selama pengobatan.",
  },
  "2": {
    id: "2",
    patientName: "Budi Santoso",
    patientAge: 35,
    doctorName: "Dr. Eka Wijaya, Sp.A",
    doctorLicense: "54321/KEP/2019",
    issuedDate: new Date().toISOString(),
    medicines: [
      { name: "Omeprazole", dose: "20mg, 2x sehari", days: 14 },
      { name: "Antasida", dose: "500mg, saat diperlukan", days: 7 },
    ],
  },
};

export function ResepPage() {
  const [data, setData] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id") || "1";

    try {
      const prescription = MOCK_DATA[id];
      if (!prescription) throw new Error("Resep tidak ditemukan");
      setData(prescription);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 rounded-full border-2 border-slate-200 border-t-slate-900 animate-spin mb-4"></div>
          <p className="text-slate-600 font-medium">Memuat resep...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Resep Tidak Ditemukan</h2>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <a href="/" className="inline-block px-6 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800">
            Kembali ke Beranda
          </a>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/resep?id=${data.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Resep Digital",
          text: `Resep dari Dr. ${data.doctorName}`,
          url,
        });
      } catch {
        navigator.clipboard.writeText(url);
        toast.success("Link disalin");
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link disalin ke clipboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Resep Digital</h1>
              <p className="text-sm text-slate-500">ID: {data.id}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800">
              <Download className="h-4 w-4" />
              Unduh
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-900 text-sm font-medium rounded-lg hover:bg-slate-200"
            >
              <Share2 className="h-4 w-4" />
              Bagikan
            </button>
          </div>
        </div>

        {/* Patient & Doctor Info */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Pasien</p>
              <p className="text-lg font-semibold text-slate-900 mt-2">{data.patientName}</p>
              <p className="text-sm text-slate-600">{data.patientAge} tahun</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Dokter</p>
              <p className="text-lg font-semibold text-slate-900 mt-2">{data.doctorName}</p>
              <p className="text-sm text-slate-600">SIP: {data.doctorLicense}</p>
            </div>
          </div>

          <div className="border-t border-slate-200 mt-6 pt-6">
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                Diresepkan {format(new Date(data.issuedDate), "dd MMMM yyyy", { locale: idLocale })}
              </span>
            </div>
          </div>
        </div>

        {/* Medicines */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Obat-obatan</h3>
          <div className="space-y-3">
            {data.medicines.map((med, i) => (
              <div key={i} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Pill className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{med.name}</h4>
                    <p className="text-sm text-slate-600 mt-1">{med.dose}</p>
                    <p className="text-xs text-slate-500 mt-2">Durasi: {med.days} hari</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {data.notes && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 text-sm">Catatan Penting</p>
                <p className="text-sm text-amber-800 mt-1">{data.notes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Verification */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex gap-3">
            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900 text-sm">Resep Terverifikasi</h4>
              <p className="text-sm text-green-700 mt-1">Resep ini adalah dokumen digital resmi dari Sembuhin.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
