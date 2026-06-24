import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { 
  Stethoscope, User, Mail, Phone, Briefcase, FileText, Upload, CheckCircle, 
  ChevronLeft, Users, Zap, ShieldCheck, Loader2, MapPin, Calendar, 
  FileCheck, BookOpen, UserCheck 
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/daftar-dokter")({
  head: () => ({
    meta: [
      { title: "Daftar Dokter Mitra | Sembuhin" },
      { name: "description", content: "Daftarkan diri Anda menjadi dokter mitra Sembuhin dan bergabung dengan jaringan medis profesional terpercaya." },
    ],
  }),
  component: DoctorRegistration,
});

// Daftar dokumen yang dibutuhkan
const REQUIRED_DOCUMENTS = [
  { id: "ktp", label: "KTP (Kartu Tanda Penduduk)", icon: UserCheck, required: true },
  { id: "str", label: "STR (Surat Tanda Registrasi)", icon: FileCheck, required: true },
  { id: "sip", label: "SIP (Surat Izin Praktik)", icon: Stethoscope, required: true },
  { id: "diploma", label: "Ijazah Terakhir", icon: BookOpen, required: true },
  { id: "cv", label: "CV (Curriculum Vitae)", icon: FileText, required: false },
];

// Daftar spesialisasi
const SPECIALTIES = [
  "Dokter Umum",
  "Spesialis Anak",
  "Spesialis Jantung dan Pembuluh Darah",
  "Spesialis Kulit dan Kelamin",
  "Dokter Gigi",
  "Psikolog",
  "Spesialis Bedah",
  "Spesialis Saraf",
  "Spesialis Kandungan dan Ginekologi",
  "Spesialis THT",
  "Spesialis Mata",
  "Spesialis Paru",
  "Lainnya"
];

function DoctorRegistration() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State form
  const [formData, setFormData] = useState({
    // Step 1: Data Diri
    name: "",
    email: "",
    phone: "",
    nik: "",
    birth_date: "",
    gender: "",
    address: "",
    // Step 2: Profesional
    specialty: "",
    license_number: "", // STR
    sip: "",
    practice_location: "",
    practice_address: "",
    experience_years: "",
    // Step 3: Dokumen
    ktp_file: null as File | null,
    str_file: null as File | null,
    sip_file: null as File | null,
    diploma_file: null as File | null,
    cv_file: null as File | null,
  });

  // Handle text input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file upload
  const handleFileChange = (docId: string, file: File | null) => {
    setFormData({ ...formData, [`${docId}_file`]: file });
  };

  // Upload file ke Supabase Storage (private bucket — simpan path, bukan public URL)
  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from("doctor-documents")
      .upload(filePath, file, { upsert: false });

    if (error) {
      throw new Error(`Gagal upload ${folder}: ${error.message}`);
    }

    // Kembalikan path saja — admin akan generate signed URL saat mau lihat
    return filePath;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Ambil user_id jika sedang login (untuk linking akun ↔ dokter)
      let currentUserId: string | null = null;
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        currentUserId = authUser?.id ?? null;
      } catch { /* ignore — user belum login */ }

      // Upload semua file — kembalikan storage path (bukan public URL)
      let ktp_path = "", str_path = "", sip_path = "", diploma_path = "", cv_path = "";

      if (formData.ktp_file) ktp_path = await uploadFile(formData.ktp_file, "ktp");
      if (formData.str_file) str_path = await uploadFile(formData.str_file, "str");
      if (formData.sip_file) sip_path = await uploadFile(formData.sip_file, "sip");
      if (formData.diploma_file) diploma_path = await uploadFile(formData.diploma_file, "diploma");
      if (formData.cv_file) cv_path = await uploadFile(formData.cv_file, "cv");

      // Insert ke database — simpan path, bukan URL publik
      const { error: dbError } = await supabase
        .from("doctor_registrations")
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          nik: formData.nik,
          birth_date: formData.birth_date,
          gender: formData.gender,
          address: formData.address,
          specialty: formData.specialty,
          license_number: formData.license_number,
          sip: formData.sip,
          hospital: formData.practice_location,      // mapping ke kolom lama
          practice_location: formData.practice_location,
          practice_address: formData.practice_address,
          experience_years: parseInt(formData.experience_years) || 0,
          ktp_path,
          str_path,
          sip_path,
          diploma_path,
          cv_path,
          status: "pending",
          user_id: currentUserId,  // Link ke auth user jika sedang login
        }]);

      if (dbError) throw dbError;
      setStep(4); // Success
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  // Validasi per step
  const isStepValid = () => {
    if (step === 1) {
      return formData.name && formData.email && formData.phone && formData.nik && 
             formData.birth_date && formData.gender && formData.address;
    }
    if (step === 2) {
      return formData.specialty && formData.license_number && formData.sip && 
             formData.practice_location;
    }
    if (step === 3) {
      return formData.ktp_file && formData.str_file && formData.sip_file && formData.diploma_file;
    }
    return true;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 pt-24">
      <div className="w-full max-w-7xl bg-white rounded-[3rem] shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row min-h-[700px]">
          {/* Left Side - Info Panel */}
          <div className="md:w-1/3 bg-gradient-to-br from-sky-600 via-blue-700 to-sky-800 p-10 flex flex-col justify-between text-white relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <video
                className="absolute inset-0 w-full h-full object-cover opacity-30"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              >
                <source src="/video/daftar-doctor.mp4" type="video/mp4" />
              </video>
              <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-32 -left-32 w-[28rem] h-[28rem] bg-blue-400/10 rounded-full blur-3xl" />
            </div>
            <div className="relative z-20">
              <div className="flex items-center gap-4 mb-12">
                <div className="p-4 bg-white/15 backdrop-blur-xl rounded-3xl shadow-lg shadow-white/10">
                  <img src="/gif_logo/icon.png" alt="Sembuhin" className="h-10 w-10 object-cover" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight">Sembuhin</h1>
                  <p className="text-sky-200 text-xs font-medium">Mitra Dokter Registration</p>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <h2 className="text-3xl font-extrabold leading-tight">
                  Bergabunglah dengan Ribuan Dokter Profesional
                </h2>
              </div>
              
              <div className="space-y-4">
                {[
                  { icon: Users, text: "Akses ke ribuan pasien", desc: "Booking otomatis" },
                  { icon: Zap, text: "Manajemen praktik digital", desc: "Rekam medis & resep" },
                  { icon: ShieldCheck, text: "Verifikasi profesional", desc: "Support 24/7" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/15">
                    <item.icon className="h-5 w-5 text-white" />
                    <div className="pt-0.5">
                      <p className="text-white font-semibold text-sm">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-20">
              <Link to="/beranda" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-xl transition-all duration-300 text-white font-semibold border border-white/20">
                <ChevronLeft className="h-4 w-4" />
                Kembali ke Beranda
              </Link>
            </div>
          </div>

          {/* Right Side - Form Panel */}
          <div className="md:w-2/3 p-10 flex items-center justify-center">
            <div className="w-full max-w-2xl relative z-10">
              {/* Step Indicator */}
              {step < 4 && (
                <div className="flex items-center justify-between mb-10">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                        step > s ? "bg-emerald-500 text-white" :
                        step === s ? "bg-sky-600 text-white ring-4 ring-sky-100" : "bg-slate-100 text-slate-400"
                      }`}>
                        {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                      </div>
                      {s < 3 && <div className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${step > s ? "bg-emerald-500" : "bg-slate-200"}`} />}
                    </div>
                  ))}
                </div>
              )}

              {/* Step 1: Data Diri */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-slate-900">Data Diri</h2>
                    <p className="text-slate-500 text-lg">Isi data pribadi Anda dengan lengkap dan benar.</p>
                  </div>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-sky-500" /> Nama Lengkap
                      </label>
                      <div className="relative group">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input name="name" value={formData.name} onChange={handleChange} required placeholder="dr. Nama Lengkap" className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sky-500" /> Email</label>
                        <div className="relative group">
                          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="email@domain.com" className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sky-500" /> Nomor Telepon</label>
                        <div className="relative group">
                          <Phone className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <input name="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="+628123456789" className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sky-500" /> NIK</label>
                        <div className="relative group">
                          <UserCheck className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <input name="nik" value={formData.nik} onChange={handleChange} required placeholder="1234567890123456" className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sky-500" /> Tanggal Lahir</label>
                        <div className="relative group">
                          <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <input name="birth_date" type="date" value={formData.birth_date} onChange={handleChange} required className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sky-500" /> Jenis Kelamin</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} required className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500">
                          <option value="">Pilih</option>
                          <option value="Laki-laki">Laki-laki</option>
                          <option value="Perempuan">Perempuan</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sky-500" /> Pengalaman (Tahun)</label>
                        <div className="relative group">
                          <Stethoscope className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <input name="experience_years" type="number" min="0" value={formData.experience_years} onChange={handleChange} placeholder="0" className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sky-500" /> Alamat Lengkap</label>
                      <div className="relative group">
                        <MapPin className="absolute left-5 top-4 h-5 w-5 text-slate-400" />
                        <textarea name="address" value={formData.address} onChange={handleChange} required rows={3} placeholder="Jalan, RT/RW, Desa/Kelurahan, Kecamatan, Kota/Kabupaten, Provinsi" className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500" />
                      </div>
                    </div>
                    <button onClick={() => setStep(2)} disabled={!isStepValid()} className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold text-sm uppercase tracking-widest hover:from-sky-500 hover:to-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                      Selanjutnya
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Profesional */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-slate-900">Data Profesional</h2>
                    <p className="text-slate-500 text-lg">Isi informasi praktik dan spesialisasi Anda.</p>
                  </div>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sky-500" /> Spesialisasi</label>
                      <div className="relative group">
                        <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <select name="specialty" value={formData.specialty} onChange={handleChange} required className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500">
                          <option value="">Pilih Spesialisasi</option>
                          {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sky-500" /> Nomor STR</label>
                        <div className="relative group">
                          <FileText className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <input name="license_number" value={formData.license_number} onChange={handleChange} required placeholder="Nomor STR" className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sky-500" /> Nomor SIP</label>
                        <div className="relative group">
                          <FileCheck className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <input name="sip" value={formData.sip} onChange={handleChange} required placeholder="Nomor SIP" className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sky-500" /> Tempat Praktik Utama</label>
                      <div className="relative group">
                        <Stethoscope className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input name="practice_location" value={formData.practice_location} onChange={handleChange} required placeholder="Nama Rumah Sakit / Klinik" className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sky-500" /> Alamat Praktik</label>
                      <div className="relative group">
                        <MapPin className="absolute left-5 top-4 h-5 w-5 text-slate-400" />
                        <textarea name="practice_address" value={formData.practice_address} onChange={handleChange} rows={3} placeholder="Alamat lengkap tempat praktik" className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500" />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => setStep(1)} className="flex-1 py-4 rounded-2xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all">
                        Kembali
                      </button>
                      <button onClick={() => setStep(3)} disabled={!isStepValid()} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold text-sm uppercase tracking-widest hover:from-sky-500 hover:to-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                        Selanjutnya
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Upload Dokumen */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-slate-900">Upload Dokumen</h2>
                    <p className="text-slate-500 text-lg">Upload dokumen pendukung (PDF/JPG/PNG, max 5MB).</p>
                  </div>
                  <div className="space-y-4">
                    {REQUIRED_DOCUMENTS.map((doc) => (
                      <div key={doc.id} className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${doc.required ? "bg-sky-500" : "bg-slate-300"}`} />
                          {doc.label} {doc.required && <span className="text-rose-500">*</span>}
                        </label>
                        <div className="relative group">
                          <div className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all duration-300 cursor-pointer bg-slate-50 hover:bg-sky-50 ${
                            (formData as Record<string, any>)[`${doc.id}_file`] ? "border-sky-400 bg-sky-50" : "border-slate-200"
                          }`}>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={(e) => handleFileChange(doc.id, e.target.files?.[0] || null)}
                            />
                            {(formData as Record<string, any>)[`${doc.id}_file`] ? (
                              <div className="flex items-center justify-center gap-3">
                                <CheckCircle className="h-7 w-7 text-emerald-500" />
                                <span className="text-sm font-semibold text-slate-700">{(formData as Record<string, any>)[`${doc.id}_file`]?.name}</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center">
                                <doc.icon className="h-8 w-8 text-slate-400 mb-2" />
                                <span className="text-sm text-slate-600 font-semibold">Klik untuk upload</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {error && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                      ❌ {error}
                    </div>
                  )}
                  <div className="flex gap-4 pt-2">
                    <button onClick={() => setStep(2)} className="flex-1 py-4 rounded-2xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all">
                      Kembali
                    </button>
                    <button onClick={handleSubmit} disabled={loading || !isStepValid()} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold text-sm uppercase tracking-widest hover:from-sky-500 hover:to-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Mengirim...
                        </>
                      ) : "Kirim Pendaftaran"}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Success */}
              {step === 4 && (
                <div className="text-center py-16 space-y-10">
                  <div className="h-28 w-28 mx-auto rounded-[3rem] bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <CheckCircle className="h-14 w-14 text-emerald-600" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-slate-900">Pendaftaran Berhasil!</h2>
                    <p className="text-slate-600 max-w-md mx-auto text-lg leading-relaxed">Terima kasih telah mendaftar. Tim kami akan memverifikasi data Anda dan menghubungi Anda dalam 2x24 jam.</p>
                  </div>
                  <Link
                    to="/beranda"
                    className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-[2rem] bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold text-sm uppercase tracking-widest hover:from-slate-800 hover:to-slate-700 transition-all duration-300 shadow-xl"
                  >
                    Kembali ke Beranda
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
