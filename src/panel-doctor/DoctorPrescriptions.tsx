import { useState } from "react";
import { FileText, Plus, Search, Download, Share2, CheckCircle, XCircle } from "lucide-react";
import { DoctorLayout } from "@/panel-doctor/DoctorLayout";

// ─── Data ─────────────────────────────────────────────────────────────────────

const PRESCRIPTIONS = [
  {
    id: 1,
    patient: "Aurelia Putri",
    date: "Hari Ini, 09:45 AM",
    status: "Dispensed",
    medicines: [
      { name: "Amoxicillin 500mg", dose: "3x sehari sesudah makan", days: 7 },
      { name: "Paracetamol 500mg", dose: "Bila demam, max 4x sehari", days: 5 },
    ],
  },
  {
    id: 2,
    patient: "Budi Santoso",
    date: "Hari Ini, 10:30 AM",
    status: "Pending",
    medicines: [
      { name: "Omeprazole 20mg", dose: "1x sehari sebelum makan", days: 14 },
      { name: "Antasida", dose: "Bila nyeri lambung", days: 7 },
    ],
  },
  {
    id: 3,
    patient: "Fina Wati",
    date: "Kemarin, 03:15 PM",
    status: "Dispensed",
    medicines: [{ name: "Vitamin B Complex", dose: "1x sehari pagi", days: 30 }],
  },
  {
    id: 4,
    patient: "Dimas Pratama",
    date: "2 Hari Lalu",
    status: "Cancelled",
    medicines: [{ name: "Sumatriptan 50mg", dose: "Bila migrain", days: 10 }],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function DoctorPrescriptions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredPrescriptions = PRESCRIPTIONS.filter((presc) =>
    presc.patient.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <DoctorLayout
      title="Resep"
      headerAction={
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 transition-all"
        >
          <Plus className="h-4 w-4" />
          Buat Resep Baru
        </button>
      }
    >
      <>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari resep berdasarkan nama pasien..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
          </div>

          {/* Prescriptions List */}
          <div className="space-y-4">
            {filteredPrescriptions.map((presc) => (
              <div
                key={presc.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm hover:shadow-slate-200/50 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Prescription Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-semibold text-slate-900">{presc.patient}</h3>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                              presc.status === "Dispensed"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : presc.status === "Pending"
                                  ? "bg-amber-50 text-amber-700 border border-amber-100"
                                  : "bg-rose-50 text-rose-700 border border-rose-100"
                            }`}
                          >
                            {presc.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">{presc.date}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Obat
                      </p>
                      {presc.medicines.map((med, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg bg-slate-50 border border-slate-100"
                        >
                          <p className="font-medium text-slate-900 text-sm">{med.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {med.dose} · {med.days} hari
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:ml-4">
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-all">
                      <Download className="h-4 w-4" />
                      Unduh PDF
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-all">
                      <Share2 className="h-4 w-4" />
                      Bagikan
                    </button>
                    {presc.status === "Pending" && (
                      <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-all">
                        <CheckCircle className="h-4 w-4" />
                        Tandai Selesai
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Prescription Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Buat Resep Baru</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-slate-500">
                Form pembuatan resep akan ditampilkan di sini.
              </p>
              <button
                onClick={() => setShowCreateModal(false)}
                className="mt-6 w-full px-4 py-2.5 rounded-lg bg-sky-600 text-white font-medium hover:bg-sky-700 transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </>
    </DoctorLayout>
  );
}
