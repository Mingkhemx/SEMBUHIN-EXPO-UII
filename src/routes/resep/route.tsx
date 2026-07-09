import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { FileText, Download, Share2, Clock, User, Pill, AlertCircle, Check } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";

export const Route = createFileRoute("/resep")({
  head: () => ({
    meta: [
      { title: "Resep Digital — Sembuhin" },
      { name: "description", content: "Resep digital yang aman dan terverifikasi" },
    ],
  }),
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

const MOCK_PRESCRIPTIONS: Record<string, Prescription> = {
  "demo-1": {
    id: "demo-1",
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
  "test": {
    id: "test",
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
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : ""
    );
    const id = searchParams.get("id") || "demo-1";

    try {
      const data = MOCK_PRESCRIPTIONS[id];
      if (!data) {
        throw new Error("Resep tidak ditemukan");
      }
      setPrescription(data);
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
          <div className="h-12 w-12 rounded-full border-2 border-slate-200 border-t-slate-900 animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Memuat resep...</p>
        </div>
      </div>
    );
  }

  if (error || !prescription) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Resep Tidak Ditemukan</h2>
          <p className="text-slate-500 text-sm mb-6">{error || "Resep yang Anda cari tidak tersedia."}</p>
          <a
            href="/rekam-medis"
            className="inline-block px-6 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            Kembali ke Rekam Medis
          </a>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    toast.success("Fitur download sedang dalam pengembangan");
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/resep?id=${prescription.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Resep Digital",
          text: `Resep dari Dr. ${prescription.doctorName}`,
          url,
        });
      } catch {
        navigator.clipboard.writeText(url);
        toast.success("Link disalin ke clipboard");
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link disalin ke clipboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Resep Digital</h1>
              <p className="text-sm text-slate-500">ID: {prescription.id}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Download className="h-4 w-4" />
              Unduh
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-900 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              Bagikan
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          {/* Patient Info */}
          <div className="border-b border-slate-200 p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pasien</p>
                <p className="text-lg font-semibold text-slate-900 mt-1">{prescription.patientName}</p>
                <p className="text-sm text-slate-600 mt-1">{prescription.patientAge} tahun</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dokter</p>
                <p className="text-lg font-semibold text-slate-900 mt-1">{prescription.doctorName}</p>
                <p className="text-sm text-slate-600 mt-1">SIP: {prescription.doctorLicense}</p>
              </div>
            </div>
          </div>

          {/* Issued Date */}
          <div className="border-b border-slate-200 px-6 py-4 bg-slate-50">
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                Diresepkan pada {format(new Date(prescription.issuedDate), "dd MMMM yyyy", { locale: idLocale })}
              </span>
            </div>
          </div>

          {/* Medicines */}
          <div className="p-6">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Obat-obatan</h3>
            <div className="space-y-3">
              {prescription.medicines.map((medicine, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Pill className="h-4 w-4 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900">{medicine.name}</h4>
                      <p className="text-sm text-slate-600 mt-1">{medicine.dose}</p>
                      <p className="text-xs text-slate-500 mt-2">Durasi: {medicine.days} hari</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {prescription.notes && (
            <div className="border-t border-slate-200 px-6 py-4 bg-amber-50">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Catatan Penting</p>
                  <p className="text-sm text-amber-800 mt-1">{prescription.notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Verification Badge */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-green-900 text-sm">Resep Terverifikasi</h4>
            <p className="text-sm text-green-700 mt-1">Resep ini adalah dokumen digital resmi yang dapat digunakan di apotek.</p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500">
            Dokumen ini dicetak dari Sembuhin Digital Health Platform
          </p>
        </div>
      </div>
    </div>
  );
}
