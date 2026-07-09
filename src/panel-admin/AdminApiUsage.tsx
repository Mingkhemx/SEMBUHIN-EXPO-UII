/**
 * AdminApiUsage — Monitor AI API usage and limits
 */

import { useEffect, useState } from 'react';
import { AlertTriangle, TrendingUp, Zap, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAdminLayout } from './AdminLayout';

interface ApiUsageStats {
  moodCheck: { count: number; limit: number; percentage: number };
  dermatologi: { count: number; limit: number; percentage: number };
  symptomTriage: { count: number; limit: number; percentage: number };
  total: { count: number; limit: number; percentage: number };
  lastUpdated: string;
}

export function AdminApiUsage() {
  const { setTitle, setSubtitle } = useAdminLayout();
  const [stats, setStats] = useState<ApiUsageStats>({
    moodCheck: { count: 0, limit: 1000, percentage: 0 },
    dermatologi: { count: 0, limit: 1000, percentage: 0 },
    symptomTriage: { count: 0, limit: 1000, percentage: 0 },
    total: { count: 0, limit: 3000, percentage: 0 },
    lastUpdated: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTitle('API Usage Monitor');
    setSubtitle('Monitor penggunaan AI API dan limit harian');
  }, [setTitle, setSubtitle]);

  useEffect(() => {
    loadUsageStats();
    const interval = setInterval(loadUsageStats, 30000); // Refresh setiap 30 detik
    return () => clearInterval(interval);
  }, []);

  const loadUsageStats = async () => {
    try {
      // In production, fetch dari database atau API gateway
      // For now, load dari localStorage cache jika ada
      const cached = localStorage.getItem('api_usage_stats');
      if (cached) {
        const data = JSON.parse(cached);
        setStats(data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to load usage stats:', err);
      setLoading(false);
    }
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getStatusLabel = (percentage: number) => {
    if (percentage >= 90) return '🔴 KRITIS';
    if (percentage >= 70) return '🟡 TINGGI';
    return '🟢 NORMAL';
  };

  const services = [
    {
      id: 'moodCheck',
      name: 'Mood Check',
      icon: Brain,
      desc: 'Deteksi emosi via wajah',
      data: stats.moodCheck,
    },
    {
      id: 'dermatologi',
      name: 'Dermatologi Scan',
      icon: Zap,
      desc: 'Analisis kondisi kulit',
      data: stats.dermatologi,
    },
    {
      id: 'symptomTriage',
      name: 'Symptom Triage',
      icon: AlertTriangle,
      desc: 'Deteksi gejala kesehatan',
      data: stats.symptomTriage,
    },
  ];

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
              {stats.total.count} / {stats.total.limit}
            </p>
            <p className="text-xs text-blue-500 mt-2">
              Updated {new Date(stats.lastUpdated).toLocaleTimeString('id-ID')}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-bold ${getStatusLabel(stats.total.percentage)}`}>
              {stats.total.percentage.toFixed(1)}%
            </p>
            <div className="w-32 h-3 rounded-full bg-blue-200 overflow-hidden mt-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.total.percentage}%` }}
                className={`h-full rounded-full ${getStatusColor(stats.total.percentage)}`}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Individual Services */}
      <div className="grid md:grid-cols-3 gap-6">
        {services.map((service, i) => {
          const Icon = service.icon;
          const isWarning = service.data.percentage >= 70;

          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-xl border p-6 transition-all ${
                isWarning
                  ? 'bg-amber-50 border-amber-300 shadow-md'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-lg ${
                      isWarning ? 'bg-amber-100' : 'bg-blue-100'
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isWarning ? 'text-amber-600' : 'text-blue-600'
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{service.name}</p>
                    <p className="text-xs text-slate-400">{service.desc}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold">{getStatusLabel(service.data.percentage)}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">Usage</span>
                    <span className="text-sm font-bold text-slate-800">
                      {service.data.count} / {service.data.limit}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${service.data.percentage}%` }}
                      className={`h-full rounded-full ${getStatusColor(
                        service.data.percentage
                      )}`}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <p className={`text-sm font-semibold ${
                    service.data.percentage >= 90
                      ? 'text-red-600'
                      : service.data.percentage >= 70
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}>
                    {service.data.percentage >= 90
                      ? '⚠️ Hampir habis!'
                      : service.data.percentage >= 70
                      ? '⚠️ Perhatikan'
                      : '✓ Aman'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Sisa: {service.data.limit - service.data.count} requests
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
          <strong>📌 Catatan:</strong> Update penggunaan API setiap 30 detik. Jika sudah menyentuh limit, manual ganti API key di .env dan redeploy di Vercel.
        </p>
      </div>
    </div>
  );
}
