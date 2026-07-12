/**
 * AdminAnalytics — Professional Dashboard with Real-time Data & Recharts
 * Enterprise-grade analytics for Sembuhin business metrics
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  Users,
  RefreshCcw,
  Calendar,
  Wifi,
  WifiOff,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { AdminLayout } from "@/panel-admin/AdminLayout";
import { useAnalyticsRealtime } from "@/hooks/useAnalyticsRealtime";

// ─── Colors

const COLORS = {
  premium: "#a78bfa",
  pharmacy: "#10b981",
  primary: "#3b82f6",
  accent: "#f59e0b",
};

// ─── Stat Card

function StatCard({
  label,
  value,
  change,
  icon: Icon,
  color,
  currency = true,
}: {
  label: string;
  value: number;
  change: number;
  icon: any;
  color: string;
  currency?: boolean;
}) {
  const isPositive = change >= 0;
  const formatted = currency ? `Rp ${value.toLocaleString("id-ID")}` : value.toString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-2xl p-6 border backdrop-blur-sm transition-all hover:shadow-lg",
        color,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-2">{formatted}</h3>
          <div className="flex items-center gap-1 mt-3">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-rose-500" />
            )}
            <span
              className={cn(
                "text-sm font-semibold",
                isPositive ? "text-emerald-600" : "text-rose-600",
              )}
            >
              {isPositive ? "+" : ""}
              {change}%
            </span>
            <span className="text-xs text-slate-500">vs bulan lalu</span>
          </div>
        </div>
        <div className={cn("p-3 rounded-xl", color.split(" ")[1])}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Section

function Section({
  title,
  subtitle,
  children,
  delay = 0,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

// ─── Main Component

export function AdminAnalytics() {
  const [dateRange, setDateRange] = useState<30 | 90>(30);

  // Use real-time hook
  const { metrics, chartData, isLoading, error, lastUpdate, refresh, isSubscribed } =
    useAnalyticsRealtime({
      dateRange,
      autoSubscribe: true,
    });

  const premiumPercentage =
    metrics.totalRevenue > 0 ? (metrics.premiumRevenue / metrics.totalRevenue) * 100 : 0;
  const pharmacyPercentage = 100 - premiumPercentage;
  const pieData = [
    { name: "Premium", value: premiumPercentage, fill: COLORS.premium },
    { name: "Pharmacy", value: pharmacyPercentage, fill: COLORS.pharmacy },
  ];

  return (
    <AdminLayout
      title="Analytics & Penjualan"
      subtitle="Real-time business intelligence untuk Sembuhin"
      rightElement={
        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200">
            {isSubscribed ? (
              <>
                <Wifi className="h-4 w-4 text-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-emerald-600">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-500">Offline</span>
              </>
            )}
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-xs font-medium text-red-600 truncate max-w-[200px]">{error}</span>
            </div>
          )}

          {/* Date Range Selector */}
          <div className="flex items-center gap-2 rounded-lg bg-white border border-slate-200 p-1">
            <button
              onClick={() => setDateRange(30)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                dateRange === 30 ? "bg-blue-500 text-white" : "text-slate-600 hover:bg-slate-100",
              )}
            >
              30 Hari
            </button>
            <button
              onClick={() => setDateRange(90)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                dateRange === 90 ? "bg-blue-500 text-white" : "text-slate-600 hover:bg-slate-100",
              )}
            >
              90 Hari
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => refresh()}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
            disabled={isLoading}
            title="Refresh data"
          >
            <RefreshCcw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </button>

          {/* Last Update */}
          <span className="text-xs text-slate-500 font-medium min-w-[160px] text-right">
            <Calendar className="h-3 w-3 inline mr-1" />
            {lastUpdate ? format(lastUpdate, "dd MMM yyyy HH:mm") : "—"}
          </span>
        </div>
      }
    >
      <div className="space-y-6">
        {/* ─── Stats Row ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total Pendapatan"
            value={metrics.totalRevenue}
            change={12.5}
            icon={DollarSign}
            color="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
          />

          <StatCard
            label="Premium Membership"
            value={metrics.premiumRevenue}
            change={8.2}
            icon={Users}
            color="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200"
          />

          <StatCard
            label="Penjualan Apotek"
            value={metrics.pharmacyRevenue}
            change={15.3}
            icon={ShoppingCart}
            color="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200"
          />

          <StatCard
            label="Total Pesanan"
            value={metrics.totalOrders}
            change={10.1}
            icon={ShoppingCart}
            color="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200"
            currency={false}
          />
        </div>

        {/* ─── Charts Grid ─── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Revenue Trend - Full Width */}
          <Section
            title="Tren Pendapatan"
            subtitle={`Pergeseran revenue premium vs apotek (${dateRange} hari)`}
            delay={0.1}
            className="xl:col-span-2"
          >
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPremium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.premium} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.premium} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPharmacy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.pharmacy} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.pharmacy} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                    color: "#f1f5f9",
                  }}
                  formatter={(value) => `Rp ${(value as number).toLocaleString("id-ID")}`}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="premium"
                  stackId="1"
                  stroke={COLORS.premium}
                  fillOpacity={1}
                  fill="url(#colorPremium)"
                  name="Premium Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="pharmacy"
                  stackId="1"
                  stroke={COLORS.pharmacy}
                  fillOpacity={1}
                  fill="url(#colorPharmacy)"
                  name="Pharmacy Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Section>

          {/* Distribution Pie */}
          <Section title="Distribusi Revenue" subtitle="Breakdown Premium vs Apotek" delay={0.2}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${(value as number).toFixed(1)}%`} />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-6 space-y-3 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS.premium }}
                  />
                  <span className="text-sm font-medium text-slate-700">Premium</span>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  Rp {metrics.premiumRevenue.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS.pharmacy }}
                  />
                  <span className="text-sm font-medium text-slate-700">Apotek</span>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  Rp {metrics.pharmacyRevenue.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </Section>
        </div>

        {/* ─── Secondary Charts ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Comparison */}
          <Section
            title="Perbandingan Revenue"
            subtitle="Bar chart perbandingan kategori"
            delay={0.3}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  {
                    name: "Premium",
                    value: metrics.premiumRevenue / 1000000,
                    fill: COLORS.premium,
                  },
                  {
                    name: "Apotek",
                    value: metrics.pharmacyRevenue / 1000000,
                    fill: COLORS.pharmacy,
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis
                  stroke="#94a3b8"
                  label={{ value: "Juta Rp", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  formatter={(value) =>
                    `Rp ${((value as number) * 1000000).toLocaleString("id-ID")}`
                  }
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                    color: "#f1f5f9",
                  }}
                />
                <Bar dataKey="value" fill={COLORS.primary} radius={[8, 8, 0, 0]}>
                  {[
                    {
                      name: "Premium",
                      value: metrics.premiumRevenue / 1000000,
                      fill: COLORS.premium,
                    },
                    {
                      name: "Apotek",
                      value: metrics.pharmacyRevenue / 1000000,
                      fill: COLORS.pharmacy,
                    },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Section>

          {/* Order Breakdown */}
          <Section title="Breakdown Pesanan" subtitle="Jumlah order per kategori" delay={0.4}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { name: "Premium", orders: metrics.premiumOrders, fill: COLORS.premium },
                  { name: "Apotek", orders: metrics.pharmacyOrders, fill: COLORS.pharmacy },
                ]}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={70} />
                <Tooltip
                  formatter={(value) => `${value} pesanan`}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                    color: "#f1f5f9",
                  }}
                />
                <Bar dataKey="orders" radius={[0, 8, 8, 0]}>
                  {[
                    { name: "Premium", orders: metrics.premiumOrders, fill: COLORS.premium },
                    { name: "Apotek", orders: metrics.pharmacyOrders, fill: COLORS.pharmacy },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Section>
        </div>

        {/* ─── Metrics Summary ─── */}
        <Section title="Ringkasan Metrik" subtitle="Key performance indicators" delay={0.5}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Rata-rata Order
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                Rp{" "}
                {Math.round(metrics.totalRevenue / (metrics.totalOrders || 1)).toLocaleString(
                  "id-ID",
                )}
              </p>
            </div>

            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100">
              <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider">
                Premium Orders
              </p>
              <p className="text-2xl font-bold text-violet-900 mt-2">{metrics.premiumOrders}</p>
              <p className="text-xs text-violet-600 mt-1">
                {((metrics.premiumOrders / (metrics.totalOrders || 1)) * 100).toFixed(1)}%
              </p>
            </div>

            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                Pharmacy Orders
              </p>
              <p className="text-2xl font-bold text-emerald-900 mt-2">{metrics.pharmacyOrders}</p>
              <p className="text-xs text-emerald-600 mt-1">
                {((metrics.pharmacyOrders / (metrics.totalOrders || 1)) * 100).toFixed(1)}%
              </p>
            </div>

            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                Total Orders
              </p>
              <p className="text-2xl font-bold text-amber-900 mt-2">{metrics.totalOrders}</p>
              <p className="text-xs text-amber-600 mt-1">transaksi</p>
            </div>
          </div>
        </Section>
      </div>
    </AdminLayout>
  );
}
