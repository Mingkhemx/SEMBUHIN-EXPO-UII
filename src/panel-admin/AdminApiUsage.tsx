/**
 * AdminApiUsage — Monitor AI API usage and limits
 */

import { useEffect, useState } from 'react';
import { AlertTriangle, Zap, Brain, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdminLayout } from './AdminLayout';
import { supabase } from '@/lib/supabase';

interface ApiUsageStats {
  moodCheck: number;
  dermatologi: number;
  symptomTriage: number;
  total: number;
}

export function AdminApiUsage() {
  const { setTitle, setSubtitle, setRightElement } = useAdminLayout();
  const [usage, setUsage] = useState<ApiUsageStats>({
    moodCheck: 0,
    dermatologi: 0,
    symptomTriage: 0,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch API usage dari consultation logs
  const fetchApiUsage = async () => {
    try {
      setIsLoading(true);

      // Count consultations per tipe service
      const [moodRes, dermaRes, symptomRes] = await Promise.all([
        supabase.from('consultations').select('*', { count: 'exact', head: true }).eq('type', 'mood_check'),
        supabase.from('consultations').select('*', { count: 'exact', head: true }).eq('type', 'dermatologi'),
        supabase.from('consultations').select('*', { count: 'exact', head: true }).eq('type', 'symptom_triage')
      ]);

      const total = (moodRes.count || 0) + (dermaRes.count || 0) + (symptomRes.count || 0);

      setUsage({
        moodCheck: moodRes.count || 0,
        dermatologi: dermaRes.count || 0,
        symptomTriage: symptomRes.count || 0,
        total
      });
    } catch (err) {
      console.error('Error fetching API usage:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setTitle('API Usage Monitor');
    setSubtitle('Monitor penggunaan AI API dan limit harian');

    // Set right element dengan refresh button
    setRightElement(
      <button
        onClick={fetchApiUsage}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
        title="Refresh data"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        <span className="text-sm font-medium">Refresh</span>
      </button>
    );

    // Initial load
    fetchApiUsage();
  }, [setTitle, setSubtitle, setRightElement]);

  const usagePercent = Math.min((usage.total / 3000) * 100, 100);
  const usageStatus = usagePercent > 80 ? 'danger' : usagePercent > 50 ? 'warning' : 'safe';

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl bg-gradient-to-br border p-8 ${
          usageStatus === 'danger'
            ? 'from-rose-50 to-orange-50 border-rose-200'
            : usageStatus === 'warning'
            ? 'from-amber-50 to-orange-50 border-amber-200'
            : 'from-blue-50 to-indigo-50 border-blue-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-semibold ${
              usageStatus === 'danger'
                ? 'text-rose-600'
                : usageStatus === 'warning'
                ? 'text-amber-600'
                : 'text-blue-600'
            }`}>
              Total API Usage
            </p>
            <p className={`text-4xl font-bold mt-2 ${
              usageStatus === 'danger'
                ? 'text-rose-900'
                : usageStatus === 'warning'
                ? 'text-amber-900'
                : 'text-blue-900'
            }`}>
              {usage.total.toLocaleString()} / 3000
            </p>
            <p className={`text-xs mt-2 ${
              usageStatus === 'danger'
                ? 'text-rose-500'
                : usageStatus === 'warning'
                ? 'text-amber-500'
                : 'text-blue-500'
            }`}>
              {usageStatus === 'danger' ? '⚠️ Mendekati limit!' : usageStatus === 'warning' ? '⚡ Sudah 50%' : '✓ Masih aman'}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-bold ${
              usageStatus === 'danger'
                ? 'text-rose-900'
                : usageStatus === 'warning'
                ? 'text-amber-900'
                : 'text-blue-900'
            }`}>
              {usagePercent.toFixed(1)}%
            </p>
            <div className="w-32 h-3 rounded-full bg-slate-200 overflow-hidden mt-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${usagePercent}%` }}
                className={`h-full rounded-full ${
                  usageStatus === 'danger'
                    ? 'bg-rose-500'
                    : usageStatus === 'warning'
                    ? 'bg-amber-500'
                    : 'bg-blue-500'
                }`}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Individual Services */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { name: 'Mood Check', icon: Brain, desc: 'Deteksi emosi via wajah', count: usage.moodCheck },
          { name: 'Dermatologi Scan', icon: Zap, desc: 'Analisis kondisi kulit', count: usage.dermatologi },
          { name: 'Symptom Triage', icon: AlertTriangle, desc: 'Deteksi gejala kesehatan', count: usage.symptomTriage },
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
                    Digunakan {service.count} kali
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
