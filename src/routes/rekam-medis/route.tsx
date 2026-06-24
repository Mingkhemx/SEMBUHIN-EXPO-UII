import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import {
  FolderOpen,
  FileText,
  FlaskConical,
  Pill,
  Calendar,
  Download,
  Search,
  Filter,
  ChevronRight,
  Stethoscope,
  User,
  Clock,
  MapPin,
  CheckCircle2,
  Info,
  ShieldCheck,
  Eye,
  Printer,
  Share2,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/rekam-medis')({
  head: () => ({
    meta: [
      { title: 'Rekam Medis Mandiri — Sembuhin' },
      { name: 'description', content: 'Riwayat konsultasi, lab & resep tersimpan di akunmu, ekspor PDF kapan saja.' },
    ],
  }),
  component: RekamMedisPage,
})

/* ─── Types ──────────────────────────────────────────────────────── */
type TabType = 'semua' | 'konsultasi' | 'lab' | 'resep'
type RecordStatus = 'selesai' | 'pending' | 'diproses'

interface MedicalRecord {
  id: string
  type: 'konsultasi' | 'lab' | 'resep'
  title: string
  date: string
  doctor?: string
  facility?: string
  status: RecordStatus
  summary: string
  details: Record<string, string>
}

/* ─── Mock Data ──────────────────────────────────────────────────── */
const RECORDS: MedicalRecord[] = [
  {
    id: '1',
    type: 'konsultasi',
    title: 'Konsultasi Kardiologi',
    date: '12 Feb 2026',
    doctor: 'Dr. Ahmad Fauzi, Sp.JP',
    facility: 'RS Sembuhin',
    status: 'selesai',
    summary: 'Evaluasi hipertensi grade I. TD 135/85. Dosis amlodipine dipertahankan 5mg. Target TD < 130/80.',
    details: { 'Diagnosis': 'Hipertensi Grade I (I10)', 'Tekanan Darah': '135/85 mmHg', 'Nadi': '76 bpm', 'Rencana': 'Lanjutkan amlodipine 5mg 1×1, kontrol 4 minggu' },
  },
  {
    id: '2',
    type: 'lab',
    title: 'Panel Lipid Lengkap',
    date: '12 Feb 2026',
    facility: 'Lab RS Sembuhin',
    status: 'selesai',
    summary: 'Kolesterol total 195 mg/dL (turun dari 218). LDL dan trigliserida dalam batas normal.',
    details: { 'Kolesterol Total': '195 mg/dL (ref: < 200)', 'HDL': '52 mg/dL (ref: > 40)', 'LDL': '118 mg/dL (ref: < 130)', 'Trigliserida': '125 mg/dL (ref: < 150)' },
  },
  {
    id: '3',
    type: 'resep',
    title: 'Resep Amlodipine 5mg',
    date: '29 Jan 2026',
    doctor: 'Dr. Ahmad Fauzi, Sp.JP',
    status: 'selesai',
    summary: 'Amlodipine 5mg, 1 tablet setiap pagi. Untuk 30 hari.',
    details: { 'Obat': 'Amlodipine Besilate 5mg', 'Dosis': '1 tablet, pagi hari', 'Durasi': '30 hari', 'Instruksi': 'Diminum setelah makan, jangan dilewatkan' },
  },
  {
    id: '4',
    type: 'konsultasi',
    title: 'Konsultasi Umum',
    date: '29 Jan 2026',
    doctor: 'Dr. Ahmad Fauzi, Sp.JP',
    facility: 'RS Sembuhin',
    status: 'selesai',
    summary: 'Kontrol pertama hipertensi. TD 140/88, turun dari 150/95. Evaluasi gaya hidup dan kepatuhan obat.',
    details: { 'Diagnosis': 'Hipertensi Grade I', 'Tekanan Darah': '140/88 mmHg', 'BB': '72 kg', 'Rencana': 'Pertahankan dosis, tambah jalan kaki 30 menit/hari' },
  },
  {
    id: '5',
    type: 'lab',
    title: 'Darah Lengkap + Fungsi Ginjal',
    date: '18 Jan 2026',
    facility: 'Lab RS Sembuhin',
    status: 'selesai',
    summary: 'Semua parameter dalam batas normal. Hb 14.2, kreatinin 0.9, ureum 28.',
    details: { 'Hemoglobin': '14.2 g/dL (ref: 13-17)', 'Leukosit': '6,800 /μL (ref: 4,500-11,000)', 'Kreatinin': '0.9 mg/dL (ref: 0.7-1.3)', 'Ureum': '28 mg/dL (ref: 20-40)', 'GDS': '92 mg/dL (ref: < 140)' },
  },
  {
    id: '6',
    type: 'konsultasi',
    title: 'Konsultasi Awal — Diagnosis Hipertensi',
    date: '15 Jan 2026',
    doctor: 'Dr. Ahmad Fauzi, Sp.JP',
    facility: 'RS Sembuhin',
    status: 'selesai',
    summary: 'Pasien datang dengan keluhan sering pusing dan tegang di tengkuk. TD 150/95. EKG normal. Diagnosis hipertensi grade I.',
    details: { 'Diagnosis': 'Hipertensi Grade I (I10)', 'Tekanan Darah': '150/95 mmHg', 'EKG': 'Sinus rhythm, normal', 'Keluhan': 'Pusing, tengkuk tegak 2 minggu', 'Rencana': 'Mulai amlodipine 5mg 1×1 + modifikasi gaya hidup' },
  },
  {
    id: '7',
    type: 'resep',
    title: 'Resep Awal Amlodipine 5mg',
    date: '15 Jan 2026',
    doctor: 'Dr. Ahmad Fauzi, Sp.JP',
    status: 'selesai',
    summary: 'Terapi awal hipertensi. Amlodipine 5mg 1×1 pagi. Kontrol 2 minggu.',
    details: { 'Obat': 'Amlodipine Besilate 5mg', 'Dosis': '1 tablet, pagi hari', 'Durasi': '14 hari', 'Instruksi': 'Minum teratur, hindari grapefruit' },
  },
]

const TAB_CONFIG: Record<TabType, { label: string; icon: typeof FolderOpen }> = {
  semua: { label: 'Semua', icon: FolderOpen },
  konsultasi: { label: 'Konsultasi', icon: Stethoscope },
  lab: { label: 'Hasil Lab', icon: FlaskConical },
  resep: { label: 'Resep', icon: Pill },
}

const TYPE_CONFIG: Record<string, { icon: typeof Stethoscope; color: string; bgColor: string }> = {
  konsultasi: { icon: Stethoscope, color: 'text-teal-600', bgColor: 'bg-teal-50 border-teal-100' },
  lab: { icon: FlaskConical, color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-100' },
  resep: { icon: Pill, color: 'text-violet-600', bgColor: 'bg-violet-50 border-violet-100' },
}

const STATUS_CONFIG: Record<RecordStatus, { label: string; className: string }> = {
  selesai: { label: 'Selesai', className: 'bg-emerald-100 text-emerald-700' },
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
  diproses: { label: 'Diproses', className: 'bg-sky-100 text-sky-700' },
}

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

/* ─── Component ──────────────────────────────────────────────────── */
function RekamMedisPage() {
  const [activeTab, setActiveTab] = useState<TabType>('semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)

  const filteredRecords = RECORDS.filter((r) => {
    const matchTab = activeTab === 'semua' || r.type === activeTab
    const matchSearch = !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.summary.toLowerCase().includes(searchQuery.toLowerCase())
    return matchTab && matchSearch
  })

  const totalRecords = RECORDS.length
  const totalKonsultasi = RECORDS.filter((r) => r.type === 'konsultasi').length
  const totalLab = RECORDS.filter((r) => r.type === 'lab').length
  const totalResep = RECORDS.filter((r) => r.type === 'resep').length

  return (
    <div className="relative z-10 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-14">

        {/* ── Hero Card ─────────────────────────────────────── */}
        <motion.div
          variants={fadeIn} initial="hidden" animate="visible"
          className="rounded-3xl shadow-2xl shadow-teal-500/25 overflow-hidden relative min-h-[360px]"
        >
          {/* Background image */}
          <img
            src="/images/riwayat.jpg"
            alt="Riwayat Kesehatan"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-teal-900/90 via-emerald-800/70 to-sky-700/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          <div className="relative z-10 p-8 sm:p-12 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-4 py-1.5 mb-5 backdrop-blur-sm">
              <FolderOpen className="h-3.5 w-3.5 text-teal-200" />
              <span className="text-xs font-semibold text-white/90 tracking-wide uppercase">Rekam Medis Mandiri</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
              Riwayat Kesehatan Anda
            </h1>
            <p className="mt-3 text-base sm:text-lg text-teal-100 leading-relaxed max-w-lg">
              Semua riwayat konsultasi, hasil lab, dan resep tersimpan aman. Ekspor PDF kapan saja untuk kebutuhan Anda.
            </p>

            {/* Quick stats */}
            <div className="flex items-center gap-8 mt-6">
              {[
                [totalRecords.toString(), 'Total Rekam'],
                [totalKonsultasi.toString(), 'Konsultasi'],
                [totalLab.toString(), 'Hasil Lab']
              ].map(([v, l]) => (
                <div key={l}>
                  <div className="text-2xl font-bold text-white">{v}</div>
                  <div className="text-[10px] text-teal-200 uppercase tracking-widest">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Summary Cards ─────────────────────────────────────── */}
        <motion.div variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Rekam', value: totalRecords, icon: FolderOpen, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-100' },
            { label: 'Konsultasi', value: totalKonsultasi, icon: Stethoscope, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-100' },
            { label: 'Hasil Lab', value: totalLab, icon: FlaskConical, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
            { label: 'Resep', value: totalResep, icon: Pill, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-100' },
          ].map((card) => {
            const Icon = card.icon
            return (
              <div key={card.label} className={cn('rounded-2xl border p-4 shadow-sm', card.bg)}>
                <Icon className={cn('h-5 w-5 mb-2', card.color)} />
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                <p className="text-xs text-slate-500">{card.label}</p>
              </div>
            )
          })}
        </motion.div>

        {/* ── Search + Export ───────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari konsultasi, lab, atau resep..."
              className="flex-1 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 shadow-sm transition-colors">
            <Download className="h-4 w-4" />
            Ekspor PDF
          </button>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100/80 p-1 w-fit">
          {(Object.entries(TAB_CONFIG) as [TabType, { label: string; icon: typeof FolderOpen }][]).map(([key, { label, icon: Icon }]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200',
                activeTab === key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full', activeTab === key ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-500')}>
                {key === 'semua' ? totalRecords : key === 'konsultasi' ? totalKonsultasi : key === 'lab' ? totalLab : totalResep}
              </span>
            </button>
          ))}
        </div>

        {/* ── Records List ──────────────────────────────────────── */}
        <motion.div variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.15 }} className="space-y-3">
          {filteredRecords.length === 0 && (
            <div className="rounded-2xl bg-white border border-white/60 shadow-lg p-12 text-center">
              <FolderOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600">Tidak ada rekam medis</p>
              <p className="text-xs text-slate-400 mt-1">Rekam medis akan muncul setelah kunjungan atau pemeriksaan.</p>
            </div>
          )}

          {filteredRecords.map((record) => {
            const typeConf = TYPE_CONFIG[record.type]
            const Icon = typeConf.icon
            const statusConf = STATUS_CONFIG[record.status]
            return (
              <button
                key={record.id}
                onClick={() => setSelectedRecord(record)}
                className="w-full rounded-2xl bg-white border border-white/60 shadow-lg shadow-slate-200/60 hover:shadow-xl hover:border-teal-200 transition-all text-left group"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border', typeConf.bgColor)}>
                      <Icon className={cn('h-6 w-6', typeConf.color)} />
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border', typeConf.bgColor)}>
                          {record.type === 'konsultasi' ? 'Konsultasi' : record.type === 'lab' ? 'Lab' : 'Resep'}
                        </span>
                        <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', statusConf.className)}>
                          {statusConf.label}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-teal-700 transition-colors">{record.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{record.summary}</p>
                      <div className="flex items-center gap-3 mt-2.5 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {record.date}</span>
                        {record.doctor && <span className="flex items-center gap-1"><User className="h-3 w-3" /> {record.doctor}</span>}
                        {record.facility && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {record.facility}</span>}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300 shrink-0 mt-2 group-hover:text-teal-500 transition-colors" />
                  </div>
                </div>
              </button>
            )
          })}
        </motion.div>

        {/* ── Record Detail Modal ──────────────────────────────── */}
        {selectedRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setSelectedRecord(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border', TYPE_CONFIG[selectedRecord.type].bgColor)}>
                    {(() => { const Icon = TYPE_CONFIG[selectedRecord.type].icon; return <Icon className={cn('h-5 w-5', TYPE_CONFIG[selectedRecord.type].color)} /> })()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">{selectedRecord.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedRecord.date}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-slate-600 p-1">
                  <AlertCircle className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Summary */}
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Ringkasan</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{selectedRecord.summary}</p>
                </div>

                {/* Details */}
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Detail</p>
                  <div className="space-y-2">
                    {Object.entries(selectedRecord.details).map(([key, value]) => (
                      <div key={key} className="flex items-start justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-xs font-medium text-slate-500">{key}</span>
                        <span className="text-sm font-semibold text-slate-800 text-right max-w-[60%]">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Meta */}
                <div className="space-y-2">
                  {selectedRecord.doctor && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <User className="h-3.5 w-3.5" /> {selectedRecord.doctor}
                    </div>
                  )}
                  {selectedRecord.facility && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5" /> {selectedRecord.facility}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 flex items-center gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                  <Printer className="h-4 w-4" /> Cetak
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                  <Share2 className="h-4 w-4" /> Bagikan
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition-colors">
                  <Download className="h-4 w-4" /> PDF
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── Info ──────────────────────────────────────────────── */}
        <div className="flex gap-3 rounded-xl bg-white/80 border border-slate-200/80 p-4 shadow-sm">
          <ShieldCheck className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 leading-relaxed">
            Semua data rekam medis Anda terenkripsi end-to-end dan hanya bisa diakses oleh Anda dan dokter yang Anda izinkan. Anda dapat mengekspor atau menghapus data kapan saja.
          </p>
        </div>
      </div>
    </div>
  )
}
