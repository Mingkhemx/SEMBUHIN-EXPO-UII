import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ArrowRight,
  MapPin,
  Clock,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Avatar } from "@/components/Avatar";

export const Route = createFileRoute("/payment")({
  component: PaymentPage,
});

function PaymentPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/payment" }) as any;
  const consultationId: string | undefined = search.consultationId;
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [consultation, setConsultation] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("Transfer Bank");

  // Fetch data konsultasi (snapshot harga dll) bila ada consultationId
  useEffect(() => {
    if (!consultationId) return;
    (async () => {
      const { data, error } = await supabase
        .from("consultations")
        .select("*")
        .eq("id", consultationId)
        .single();
      if (!error && data) {
        setConsultation(data);
        // Jika sudah lunas, langsung tampilkan sukses
        if (data.payment_status === "paid") setIsSuccess(true);
      }
    })();
  }, [consultationId]);

  // Nilai tampilan: pakai data konsultasi bila ada, fallback ke search params
  const doctorName = consultation?.doctor_name || search.doctorName || "Dr. Sarah Wijaya";
  const doctorSpec = consultation?.doctor_specialty || search.doctorSpec || "Bedah Kardiovaskular";
  const doctorHospital = consultation?.doctor_hospital || search.doctorHospital || "RS Jantung Harapan Kita";
  const doctorImg = consultation?.doctor_avatar_url || search.doctorImg;
  const doctorExperience = search.doctorExperience || "12 Tahun";

  const priceNum =
    consultation?.total ??
    (parseInt(String(search.doctorPrice || "150000").replace(/[^0-9]/g, "")) || 150000) + 5000;
  const feeNum = consultation?.service_fee ?? 5000;

  const formatRp = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulasi proses pembayaran (siap diganti gateway Midtrans/Xendit nanti)
    await new Promise((r) => setTimeout(r, 1800));

    // Update payment_status = 'paid' di database bila ada consultationId
    if (consultationId) {
      const { error } = await supabase
        .from("consultations")
        .update({
          payment_status: "paid",
          payment_method: paymentMethod,
          paid_at: new Date().toISOString(),
        })
        .eq("id", consultationId);
      if (error) console.warn("Gagal update status pembayaran:", error.message);
    }

    setIsProcessing(false);
    setIsSuccess(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Payment Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
            <h2 className="text-2xl font-bold font-display text-slate-900 mb-6">
              Pembayaran Konsultasi
            </h2>

            {!isSuccess ? (
              <div className="space-y-6">
                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Metode Pembayaran
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { name: "Transfer Bank", icon: "🏦", active: true },
                      { name: "E-Wallet", icon: "📱", active: false },
                      { name: "Kartu Kredit", icon: "💳", active: false },
                      { name: "Virtual Account", icon: "🏧", active: false },
                    ].map((method, idx) => (
                      <button
                        key={idx}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all ${
                          method.active
                            ? "border-sky-500 bg-sky-50 text-sky-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-sky-300"
                        }`}
                      >
                        <span className="text-2xl">{method.icon}</span>
                        <span className="text-sm font-semibold">{method.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Details (Demo) */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Nomor Rekening / Virtual Account
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Pay Button */}
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:opacity-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-sky-600/20"
                >
                  {isProcessing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Memproses Pembayaran...
                    </>
                  ) : (
                    <>
                      Bayar Sekarang <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6 py-8"
              >
                <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-display text-slate-900">
                    Pembayaran Berhasil!
                  </h3>
                  <p className="text-slate-600 mt-2">
                    Janji konsultasi Anda telah dikonfirmasi.
                  </p>
                </div>
                <button
                  onClick={() => navigate({ to: "/chat", search: { consultationId } })}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:opacity-95 transition-all shadow-xl shadow-sky-600/20"
                >
                  Mulai Chat dengan Dokter <ArrowRight className="h-5 w-5" />
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right: Summary */}
        <div className="space-y-6">
          {/* Doctor Info */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="h-44 relative overflow-hidden">
              <Avatar
                src={doctorImg}
                name={doctorName}
                rounded=""
                className="w-full h-full object-cover object-top"
                textClassName="text-6xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold font-display text-slate-900">
                {doctorName}
              </h3>
              <p className="text-sm text-slate-500 mt-1 font-semibold">
                {doctorSpec}
              </p>
              <div className="flex items-center gap-3 mt-4 text-sm text-slate-600">
                <MapPin className="h-4 w-4 text-sky-500" />
                <span>{doctorHospital}</span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-sm text-slate-600">
                <Clock className="h-4 w-4 text-sky-500" />
                <span>{doctorExperience}</span>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6">
            <h4 className="text-base font-bold text-slate-900 mb-4">
              Ringkasan Pesanan
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-600">Biaya Konsultasi</span>
                <span className="text-lg font-bold font-display text-slate-900">
                  {formatRp(priceNum - feeNum)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-600">Biaya Layanan</span>
                <span className="text-sm font-semibold text-slate-900">
                  {formatRp(feeNum)}
                </span>
              </div>
              <div className="border-t border-slate-200 my-3" />
              <div className="flex items-center justify-between py-2">
                <span className="text-base font-bold text-slate-900">Total</span>
                <span className="text-2xl font-bold font-display text-sky-600">
                  {formatRp(priceNum)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
