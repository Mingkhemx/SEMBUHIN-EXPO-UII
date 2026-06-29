/**
 * AdminSettings — Pengaturan sistem platform Sembuhin
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Shield,
  Bell,
  Sliders,
  Wrench,
  Check,
  Loader2,
  Trash2,
  Download,
} from "lucide-react";
import { AdminLayout } from "@/panel-admin/AdminLayout";
import { supabase } from "@/lib/supabase";

// ─── Toggle switch component ──────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none",
        checked ? "bg-sky-500" : "bg-slate-200",
      ].join(" ")}
    >
      <span
        className={[
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center">
          <Icon className="h-4 w-4 text-sky-600" />
        </div>
        <p className="text-slate-900 font-bold text-sm uppercase tracking-widest">{title}</p>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

// ─── Input field ──────────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {hint && <p className="text-xs text-slate-400 mb-2">{hint}</p>}
      {children}
    </div>
  );
}

const inputCls =
  "w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-colors";

// ─── Toggle row ───────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-0.5">
      <div>
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

// ─── Save state ───────────────────────────────────────────────────────────────

type SaveState = "idle" | "saving" | "saved";

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminSettings() {
  // ── Platform info ──────────────────────────────────────────────────────────
  const [appName, setAppName] = useState("Sembuhin");
  const [description, setDescription] = useState(
    "Platform kesehatan digital terpercaya untuk konsultasi dokter online.",
  );
  const [supportEmail, setSupportEmail] = useState("support@sembuhin.id");
  const [logoUrl, setLogoUrl] = useState("https://sembuhin.id/logo.png");

  // ── Limits ─────────────────────────────────────────────────────────────────
  const [maxChat, setMaxChat] = useState(5);
  const [maxDoctors, setMaxDoctors] = useState(200);
  const [premiumFee, setPremiumFee] = useState(49000);

  // ── Security ───────────────────────────────────────────────────────────────
  const [emailVerify, setEmailVerify] = useState(true);
  const [twoFA, setTwoFA] = useState(false);
  const [autoBan, setAutoBan] = useState(true);
  const [autoBanLimit, setAutoBanLimit] = useState(5);

  // ── Notifications ──────────────────────────────────────────────────────────
  const [notifNewDoctor, setNotifNewDoctor] = useState(true);
  const [notifNewUser, setNotifNewUser] = useState(false);
  const [slackWebhook, setSlackWebhook] = useState("");

  // ── Maintenance ────────────────────────────────────────────────────────────
  const [maintenance, setMaintenance] = useState(false);

  // ── Save feedback ──────────────────────────────────────────────────────────
  const [saveState, setSaveState] = useState<SaveState>("idle");

  // Fetch initial settings from Supabase
  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "maintenance_mode")
        .maybeSingle();
      
      if (data?.value) {
        setMaintenance(!!data.value.active);
      }
    }
    fetchSettings();
  }, []);

  async function handleSave() {
    setSaveState("saving");
    try {
      // Save maintenance mode to Supabase
      const { error } = await supabase
        .from("settings")
        .upsert({
          key: "maintenance_mode",
          value: { 
            active: maintenance, 
            message: "Website sedang dalam perbaikan. Kami akan segera kembali!" 
          }
        });

      if (error) throw error;

      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2200);
    } catch (err) {
      console.error("Gagal menyimpan pengaturan:", err);
      setSaveState("idle");
    }
  }

  return (
    <AdminLayout title="Pengaturan" subtitle="Konfigurasi sistem dan parameter platform">
      <div className="max-w-3xl space-y-5">
        {/* ── 1. Platform info ──────────────────────────────────────────── */}
        <Section icon={Globe} title="Informasi Platform">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Nama Aplikasi">
              <input
                className={inputCls}
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
              />
            </Field>
            <Field label="Email Support">
              <input
                type="email"
                className={inputCls}
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Deskripsi Platform">
            <textarea
              rows={3}
              className={inputCls + " resize-none"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
          <Field label="Logo URL" hint="URL gambar logo yang digunakan di seluruh platform">
            <input
              className={inputCls}
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://..."
            />
          </Field>
        </Section>

        {/* ── 2. Limits ─────────────────────────────────────────────────── */}
        <Section icon={Sliders} title="Batas & Limitasi">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Field label="Max Chat / Hari" hint="Per user">
              <input
                type="number"
                min={1}
                max={50}
                className={inputCls}
                value={maxChat}
                onChange={(e) => setMaxChat(Number(e.target.value))}
              />
            </Field>
            <Field label="Max Dokter Aktif">
              <input
                type="number"
                min={1}
                className={inputCls}
                value={maxDoctors}
                onChange={(e) => setMaxDoctors(Number(e.target.value))}
              />
            </Field>
            <Field label="Biaya Premium (Rp)">
              <input
                type="number"
                min={0}
                step={1000}
                className={inputCls}
                value={premiumFee}
                onChange={(e) => setPremiumFee(Number(e.target.value))}
              />
            </Field>
          </div>
        </Section>

        {/* ── 3. Security ───────────────────────────────────────────────── */}
        <Section icon={Shield} title="Keamanan">
          <ToggleRow
            label="Wajib Verifikasi Email"
            description="User harus memverifikasi email sebelum menggunakan layanan"
            checked={emailVerify}
            onChange={setEmailVerify}
          />
          <div className="border-t border-slate-100" />
          <ToggleRow
            label="Aktifkan 2FA untuk Admin"
            description="Two-factor authentication saat login ke admin panel"
            checked={twoFA}
            onChange={setTwoFA}
          />
          <div className="border-t border-slate-100" />
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <ToggleRow
                label="Auto-ban Setelah Login Gagal"
                description="Blokir akun setelah beberapa kali percobaan gagal berturut-turut"
                checked={autoBan}
                onChange={setAutoBan}
              />
            </div>
          </div>
          <AnimatePresence>
            {autoBan && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Field
                  label="Batas Percobaan Gagal"
                  hint="Akun akan diblokir setelah N kali gagal login"
                >
                  <input
                    type="number"
                    min={1}
                    max={20}
                    className={inputCls + " w-32"}
                    value={autoBanLimit}
                    onChange={(e) => setAutoBanLimit(Number(e.target.value))}
                  />
                </Field>
              </motion.div>
            )}
          </AnimatePresence>
        </Section>

        {/* ── 4. Notifications ──────────────────────────────────────────── */}
        <Section icon={Bell} title="Notifikasi Sistem">
          <ToggleRow
            label="Email: Pendaftaran Dokter Baru"
            description="Kirim email ke admin saat dokter baru mendaftar untuk verifikasi"
            checked={notifNewDoctor}
            onChange={setNotifNewDoctor}
          />
          <div className="border-t border-slate-100" />
          <ToggleRow
            label="Email: User Baru Mendaftar"
            description="Kirim ringkasan harian jumlah user baru yang mendaftar"
            checked={notifNewUser}
            onChange={setNotifNewUser}
          />
          <div className="border-t border-slate-100" />
          <Field
            label="Slack Webhook URL"
            hint="Opsional — kirim notifikasi sistem ke channel Slack"
          >
            <input
              className={inputCls}
              value={slackWebhook}
              onChange={(e) => setSlackWebhook(e.target.value)}
              placeholder="https://hooks.slack.com/services/..."
            />
          </Field>
        </Section>

        {/* ── 5. Maintenance ────────────────────────────────────────────── */}
        <Section icon={Wrench} title="Maintenance">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 mb-2">
            <ToggleRow
              label="Mode Maintenance"
              description="Saat aktif, semua user (kecuali admin) akan melihat halaman maintenance"
              checked={maintenance}
              onChange={setMaintenance}
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <button className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors">
              <Trash2 className="h-4 w-4 text-rose-500" />
              Clear Cache
            </button>
            <button className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors">
              <Download className="h-4 w-4 text-emerald-500" />
              Export Data
            </button>
          </div>
        </Section>

        {/* ── Save button ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-4 pt-2 pb-8">
          <AnimatePresence mode="wait">
            {saveState === "saved" && (
              <motion.p
                key="saved"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-sm text-emerald-600 font-semibold"
              >
                <Check className="h-4 w-4" />
                Perubahan disimpan!
              </motion.p>
            )}
          </AnimatePresence>

          <button
            onClick={handleSave}
            disabled={saveState === "saving"}
            className={[
              "flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl px-6 py-2.5 text-sm transition-all",
              saveState === "saving" ? "opacity-80 cursor-not-allowed" : "",
            ].join(" ")}
          >
            {saveState === "saving" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
