import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  User,
  Phone,
  Mail,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/Avatar";

export const Route = createFileRoute("/booking")({
  component: BookingPage,
});

function BookingPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/booking" }) as any;
  const { user } = useAuth();

  const [form, setForm] = useState({
    patientName: "",
    patientPhone: "",
    patientEmail: "",
    date: "",
    time: "",
    complaint: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Wajib login sebelum booking
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }

    // Parse harga dari format "Rp 150.000" → 150000
    const priceNum = parseInt(String(search.doctorPrice || "0").replace(/[^0-9]/g, "")) || 0;
    const serviceFee = 5000;

    setSubmitting(true);
    const { data, error } = await supabase
      .from("consultations")
      .insert({
        doctor_id: search.doctorId || null,
        patient_id: user.id,
        patient_name: form.patientName,
        patient_phone: form.patientPhone,
        patient_email: form.patientEmail || null,
        doctor_name: search.doctorName || "Dokter",
        doctor_specialty: search.doctorSpec || null,
        doctor_hospital: search.doctorHospital || null,
        doctor_avatar_url: search.doctorImg || null,
        appointment_date: form.date,
        appointment_time: form.time,
        consultation_type: "Chat",
        complaint: form.complaint,
        price: priceNum,
        service_fee: serviceFee,
        total: priceNum + serviceFee,
        payment_status: "unpaid",
        consultation_status: "scheduled",
      })
      .select("id")
      .single();

    setSubmitting(false);

    if (error) {
      console.error("Gagal membuat konsultasi:", error);
      setErrorMsg(
        "Gagal membuat janji konsultasi. Pastikan tabel 'consultations' sudah dibuat (jalankan supabase-consultations.sql)."
      );
      return;
    }

    // Lanjut ke payment bawa ID konsultasi
    navigate({
      to: "/payment",
      search: {
        consultationId: data.id,
        ...form,
        ...search,
      },
    });
  };

  const timeSlots = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-strong rounded-3xl border border-sky-100/60 shadow-xl p-8">
            <h2 className="text-2xl font-bold font-display text-slate-900 mb-6">
              Isi Detail Janji Konsultasi
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nama Pasien */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nama Lengkap Pasien
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={form.patientName}
                    onChange={(e) =>
                      setForm({ ...form, patientName: e.target.value })
                    }
                    placeholder="Masukkan nama lengkap"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>

              {/* No HP & Email */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nomor Handphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={form.patientPhone}
                      onChange={(e) =>
                        setForm({ ...form, patientPhone: e.target.value })
                      }
                      placeholder="0812xxxxxxxx"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email (Opsional)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={form.patientEmail}
                      onChange={(e) =>
                        setForm({ ...form, patientEmail: e.target.value })
                      }
                      placeholder="email@example.com"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Tanggal */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tanggal Konsultasi
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Waktu */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Pilih Waktu
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setForm({ ...form, time })}
                      className={cn(
                        "py-2.5 px-1.5 rounded-xl text-sm font-semibold transition-all border",
                        form.time === time
                          ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white border-transparent shadow-lg shadow-sky-500/20"
                          : "bg-white text-slate-700 border-slate-200 hover:border-sky-300 hover:bg-sky-50"
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Keluhan */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Keluhan
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.complaint}
                  onChange={(e) => setForm({ ...form, complaint: e.target.value })}
                  placeholder="Jelaskan keluhan Anda secara detail..."
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 resize-none"
                />
              </div>

              {errorMsg && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={!form.date || !form.time || submitting}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:opacity-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-sky-600/20"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Membuat Janji...
                  </>
                ) : (
                  <>
                    Lanjut ke Pembayaran
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Doctor Card & Info */}
        <div className="space-y-6">
          {/* Doctor info */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="h-44 relative overflow-hidden">
              <Avatar
                src={search.doctorImg}
                name={search.doctorName || "Dokter"}
                alt={search.doctorName}
                rounded=""
                className="w-full h-full object-cover object-top"
                textClassName="text-6xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold font-display text-slate-900">
                {search.doctorName || "Dr. Sarah Wijaya"}
              </h3>
              <p className="text-sm text-slate-500 mt-1 font-semibold">{search.doctorSpec || "Bedah Kardiovaskular"}</p>
              <div className="flex items-center gap-3 mt-4 text-sm text-slate-600">
                <MapPin className="h-4 w-4 text-sky-500" />
                <span>{search.doctorHospital || "RS Jantung Harapan Kita"}</span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-sm text-slate-600">
                <Clock className="h-4 w-4 text-sky-500" />
                <span>{search.doctorExperience || "12 Tahun"}</span>
              </div>
            </div>
          </div>

          {/* Price summary */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6">
            <h4 className="text-base font-bold text-slate-900 mb-4">
              Ringkasan Biaya
            </h4>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">Biaya Konsultasi</span>
              <span className="text-lg font-bold font-display text-slate-900">
                {search.doctorPrice || "Rp 150.000"}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 pt-4">
              <span className="text-base font-bold text-slate-900">Total</span>
              <span className="text-2xl font-bold font-display text-sky-600">
                {search.doctorPrice || "Rp 150.000"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
