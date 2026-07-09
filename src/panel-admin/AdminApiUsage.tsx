/**
 * AdminApiUsage — Monitor AI API usage and limits
 */

import { useEffect } from 'react';
import { AlertTriangle, Zap, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdminLayout } from './AdminLayout';

export function AdminApiUsage() {
  const { setTitle, setSubtitle } = useAdminLayout();

  useEffect(() => {
    setTitle('API Usage Monitor');
    setSubtitle('Monitor penggunaan AI API dan limit harian');
  }, [setTitle, setSubtitle]);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Total API Usage</p>
            <p className="text-4xl font-bold text-blue-900 mt-2">
              — / 3000
            </p>
            <p className="text-xs text-blue-500 mt-2">
              Manual tracking via OpenRouter dashboard
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-900">—%</p>
            <div className="w-32 h-3 rounded-full bg-blue-200 overflow-hidden mt-4">
              <div className="h-full rounded-full bg-blue-500" style={{ width: '0%' }} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Individual Services */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { name: 'Mood Check', icon: Brain, desc: 'Deteksi emosi via wajah' },
          { name: 'Dermatologi Scan', icon: Zap, desc: 'Analisis kondisi kulit' },
          { name: 'Symptom Triage', icon: AlertTriangle, desc: 'Deteksi gejala kesehatan' },
        ].map((service, i) => {
          const Icon = service.icon;

          return (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border bg-white border-slate-200 shadow-sm p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-100">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{service.name}</p>
                    <p className="text-xs text-slate-400">{service.desc}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="pt-2 border-t border-slate-200">
                  <p className="text-sm font-semibold text-emerald-600">✓ Aman</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Lihat OpenRouter dashboard untuk detail
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Notes */}
      <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
        <p className="text-sm text-blue-900">
          <strong>📌 Catatan:</strong> Untuk monitoring detail, kunjungi <a href="https://openrouter.ai/settings/credits" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">OpenRouter Dashboard</a>. Jika sudah menyentuh limit, ganti API key di .env dan redeploy di Vercel.
        </p>
      </div>
    </div>
  );
}
