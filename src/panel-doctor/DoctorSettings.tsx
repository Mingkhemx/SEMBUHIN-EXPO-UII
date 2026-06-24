import { useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import {
  Bell,
  Camera,
  User,
  Clock,
  Shield,
  Lock,
  Smartphone,
  Save,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { DoctorLayout } from "@/panel-doctor/DoctorLayout";
import { supabase } from "@/lib/supabase";
import { Avatar } from "@/components/Avatar";

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = [
  { id: "senin", label: "Senin" },
  { id: "selasa", label: "Selasa" },
  { id: "rabu", label: "Rabu" },
  { id: "kamis", label: "Kamis" },
  { id: "jumat", label: "Jumat" },
  { id: "sabtu", label: "Sabtu" },
  { id: "minggu", label: "Minggu" },
] as const;

type DayId = (typeof DAYS)[number]["id"];

type NotificationKey = "emailNotif" | "smsNotif" | "konsultasiBaru" | "pesanPasien";

const NOTIFICATION_ITEMS: Array<{ key: NotificationKey; label: string; desc: string }> = [
  {
    key: "emailNotif",
    label: "Email Notifikasi",
    desc: "Terima pemberitahuan melalui email",
  },
  {
    key: "smsNotif",
    label: "SMS Notifikasi",
    desc: "Terima pemberitahuan melalui SMS",
  },
  {
    key: "konsultasiBaru",
    label: "Notifikasi Konsultasi Baru",
    desc: "Saat ada permintaan konsultasi masuk",
  },
  {
    key: "pesanPasien",
    label: "Notifikasi Pesan Pasien",
    desc: "Saat pasien mengirimkan pesan baru",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.09, duration: 0.38, ease: "easeOut" as const },
  }),
};

const inputCls =
  "w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 " +
  "focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all " +
  "placeholder:text-slate-400";

const labelCls = "block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider";

// ─── Sub-components ───────────────────────────────────────────────────────────

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40",
        checked ? "bg-sky-600" : "bg-slate-200",
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DoctorSettings() {
  const { user } = useAuth();

  // ── Profile form state (dimuat dari DB) ──
  const [profile, setProfile] = useState({
    namaLengkap: "",
    spesialisasi: "",
    noStr: "",
    email: "",
    noHp: "",
    bio: "",
    avatarUrl: null as string | null,
  });
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Fetch profil dokter dari DB
  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const { data: doc } = await supabase
        .from("doctors")
        .select("name, specialty, license_number, email, phone, description, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!active || !doc) return;
      setProfile({
        namaLengkap: doc.name || "",
        spesialisasi: doc.specialty || "",
        noStr: doc.license_number || "",
        email: doc.email || "",
        noHp: doc.phone || "",
        bio: doc.description || "",
        avatarUrl: doc.avatar_url || null,
      });
      setLoadingProfile(false);
    })();
    return () => { active = false; };
  }, [user]);

  // ── Schedule state ──
  const [schedule, setSchedule] = useState<
    Record<DayId, { active: boolean; start: string; end: string }>
  >({
    senin: { active: true, start: "08:00", end: "16:00" },
    selasa: { active: true, start: "08:00", end: "16:00" },
    rabu: { active: true, start: "08:00", end: "16:00" },
    kamis: { active: true, start: "08:00", end: "16:00" },
    jumat: { active: true, start: "08:00", end: "14:00" },
    sabtu: { active: false, start: "09:00", end: "13:00" },
    minggu: { active: false, start: "09:00", end: "12:00" },
  });

  // ── Notification state ──
  const [notifications, setNotifications] = useState<Record<NotificationKey, boolean>>({
    emailNotif: true,
    smsNotif: false,
    konsultasiBaru: true,
    pesanPasien: true,
  });

  // ── Save feedback ──
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2800);
  };

  return (
    <DoctorLayout title="Pengaturan">
      <div className="max-w-3xl mx-auto space-y-5">
        {/* ── Section 1: Profil Dokter ────────────────────────────────── */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="bg-white rounded-xl border border-slate-200 p-5 lg:p-6"
        >
          <div className="flex items-center gap-2.5 mb-5">
            <div className="h-8 w-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-sky-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Profil Dokter</h3>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6 p-4 rounded-lg bg-slate-50 border border-slate-100">
            <div className="relative shrink-0">
              <Avatar
                src={profile.avatarUrl}
                name={profile.namaLengkap || "Dokter"}
                className="h-20 w-20 border-2 border-white shadow-sm"
                textClassName="text-2xl"
              />
              <button
                type="button"
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-sky-600 border-2 border-white flex items-center justify-center hover:bg-sky-700 transition-colors shadow-sm"
              >
                <Camera className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Foto Profil</p>
              <p className="text-xs text-slate-500 mt-0.5">JPG, PNG, atau WebP · Maks. 2 MB</p>
              <button
                type="button"
                className="mt-2 text-xs font-medium text-sky-600 hover:text-sky-700 underline underline-offset-2 transition-colors"
              >
                Ganti Foto
              </button>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Nama Lengkap</label>
              <input
                type="text"
                value={profile.namaLengkap}
                onChange={(e) => setProfile((p) => ({ ...p, namaLengkap: e.target.value }))}
                className={inputCls}
                placeholder="dr. Nama Lengkap"
              />
            </div>

            <div>
              <label className={labelCls}>Spesialisasi</label>
              <input
                type="text"
                value={profile.spesialisasi}
                onChange={(e) => setProfile((p) => ({ ...p, spesialisasi: e.target.value }))}
                className={inputCls}
                placeholder="Sp.PD"
              />
            </div>

            <div>
              <label className={labelCls}>Nomor STR</label>
              <input
                type="text"
                value={profile.noStr}
                onChange={(e) => setProfile((p) => ({ ...p, noStr: e.target.value }))}
                className={inputCls}
                placeholder="STR-XXXXX/YYYY"
              />
            </div>

            <div>
              <label className={labelCls}>Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                className={inputCls}
                placeholder="dokter@email.com"
              />
            </div>

            <div>
              <label className={labelCls}>No. HP / WhatsApp</label>
              <input
                type="tel"
                value={profile.noHp}
                onChange={(e) => setProfile((p) => ({ ...p, noHp: e.target.value }))}
                className={inputCls}
                placeholder="+62 8xx xxxx xxxx"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>Bio Singkat</label>
              <textarea
                rows={3}
                value={profile.bio}
                onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                className={cn(inputCls, "resize-none")}
                placeholder="Tuliskan bio singkat Anda..."
              />
            </div>
          </div>
        </motion.div>

        {/* ── Section 2: Jadwal Praktik ───────────────────────────────── */}
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="bg-white rounded-xl border border-slate-200 p-5 lg:p-6"
        >
          <div className="flex items-center gap-2.5 mb-5">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4 text-emerald-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Jadwal Praktik</h3>
          </div>

          <div className="space-y-2">
            {DAYS.map((day) => {
              const s = schedule[day.id];
              return (
                <div
                  key={day.id}
                  className={cn(
                    "flex flex-wrap sm:flex-nowrap items-center gap-3 px-4 py-3 rounded-lg border transition-colors",
                    s.active
                      ? "border-emerald-100 bg-emerald-50/50"
                      : "border-slate-100 bg-slate-50/60",
                  )}
                >
                  {/* Toggle + day label */}
                  <div className="flex items-center gap-3 w-36 shrink-0">
                    <ToggleSwitch
                      checked={s.active}
                      onChange={() =>
                        setSchedule((prev) => ({
                          ...prev,
                          [day.id]: { ...prev[day.id], active: !prev[day.id].active },
                        }))
                      }
                    />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        s.active ? "text-slate-900" : "text-slate-400",
                      )}
                    >
                      {day.label}
                    </span>
                  </div>

                  {/* Time range */}
                  {s.active ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={s.start}
                        onChange={(e) =>
                          setSchedule((prev) => ({
                            ...prev,
                            [day.id]: { ...prev[day.id], start: e.target.value },
                          }))
                        }
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                      />
                      <span className="text-slate-400 text-xs font-medium select-none">s/d</span>
                      <input
                        type="time"
                        value={s.end}
                        onChange={(e) =>
                          setSchedule((prev) => ({
                            ...prev,
                            [day.id]: { ...prev[day.id], end: e.target.value },
                          }))
                        }
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Tidak praktik</span>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Section 3: Notifikasi ───────────────────────────────────── */}
        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="bg-white rounded-xl border border-slate-200 p-5 lg:p-6"
        >
          <div className="flex items-center gap-2.5 mb-5">
            <div className="h-8 w-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
              <Bell className="h-4 w-4 text-amber-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Notifikasi</h3>
          </div>

          <div className="divide-y divide-slate-100">
            {NOTIFICATION_ITEMS.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
              >
                <div className="pr-4">
                  <p className="text-sm font-medium text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
                <ToggleSwitch
                  checked={notifications[item.key]}
                  onChange={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      [item.key]: !prev[item.key],
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Section 4: Keamanan ─────────────────────────────────────── */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="bg-white rounded-xl border border-slate-200 p-5 lg:p-6"
        >
          <div className="flex items-center gap-2.5 mb-5">
            <div className="h-8 w-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
              <Shield className="h-4 w-4 text-rose-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Keamanan</h3>
          </div>

          <div className="space-y-3">
            {/* Change password */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Ganti Password</p>
                  <p className="text-xs text-slate-500 mt-0.5">Perbarui kata sandi akun Anda</p>
                </div>
              </div>
              <button
                type="button"
                className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-100 transition-all"
              >
                Ganti
              </button>
            </div>

            {/* 2FA */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  <Smartphone className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Autentikasi Dua Faktor</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tingkatkan keamanan akun dengan 2FA
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="px-3.5 py-2 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 transition-all"
              >
                Aktifkan
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Save Button ─────────────────────────────────────────────── */}
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="flex items-center justify-end gap-3 pb-8"
        >
          {saved && (
            <motion.span
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium"
            >
              <CheckCircle className="h-4 w-4" />
              Perubahan tersimpan
            </motion.span>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 active:scale-95 transition-all shadow-sm shadow-sky-200/60"
          >
            <Save className="h-4 w-4" />
            Simpan Perubahan
          </button>
        </motion.div>
      </div>
    </DoctorLayout>
  );
}
