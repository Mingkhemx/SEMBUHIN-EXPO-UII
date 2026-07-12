/**
 * AdminAnalytics — Comprehensive business analytics & sales tracking.
 * Charts, metrics, and business intelligence for Sembuhin.
 */

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Activity,
  Calendar,
  Download,
} from "lucide-react";
import { AdminLayout, AdminStatCard } from "@/panel-admin/AdminLayout";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SalesData {
  date: string;
  premiumSales: number;
  pharmacySales: number;
  totalRevenue: number;
  orders: number;
}

interface MetricsData {
  totalRevenue: number;
  premiumRevenue: number;
  pharmacyRevenue: number;
  totalOrders: number;
  premiumSubs: number;
  avgOrderValue: number;
  monthlyGrowth: number;
}

interface TopProducts {
  id: string;
  name: string;
  category: string;
  sales: number;
  revenue: number;
  trend: number;
}

// ─── Animation helpers ────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay },
});

// ─── Mock Chart Component (Line Chart Visualization) ─────────────────────────

function SimpleLineChart({ data, label, color }: { data: number[]; label: string; color: string }) {
  if (data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const height = 120;
  const width = data.length > 1 ? (data.length - 1) * 20 + 40 : 40;

  // Generate SVG path for line chart
  const points = data
    .map((val, i) => {
      const x = 20 + (i / (data.length - 1 || 1)) * (width - 40);
      const y = height - ((val - min) / range) * (height - 40) + 20;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="w-full overflow-x-auto">
      <svg width={Math.max(width, 300)} height={height + 40} className="min-w-full">
        {/* Grid lines */}
        <line x1="0" y1={height / 2 + 20} x2={width} y2={height / 2 + 20} stroke="#e2e8f0" />

        {/* Line chart */}
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" />

        {/* Area under curve */}
        <polygon
          points={`20,${height + 20} ${points} ${20 + (width - 40)},${height + 20}`}
          fill={color}
          opacity="0.1"
        />
      </svg>
    </div>
  );
}

// ─── Revenue Stats Card ─────────────────────────────────────────────────────

function RevenueCard({
  title,
  value,
  currency = true,
  change,
  trend,
  color,
}: {
  title: string;
  value: number;
  currency?: boolean;
  change: number;
  trend: "up" | "down";
  color: string;
}) {
  const formatter = new Intl.NumberFormat("id-ID", {
    style: currency ? "currency" : "decimal",
    currency: "IDR",
    maximumFractionDigits: currency ? 0 : 2,
  });

  return (
    <div className={cn("rounded-2xl p-6 border", color)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-slate-600 font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-2">
            {currency ? "Rp " : ""}
            {formatter.format(value).replace("IDR ", "")}
          </h3>
        </div>
        {trend === "up" ? (
          <TrendingUp
            className={cn("h-5 w-5", change > 0 ? "text-emerald-500" : "text-rose-500")}
          />
        ) : (
          <TrendingDown
            className={cn("h-5 w-5", change < 0 ? "text-emerald-500" : "text-rose-500")}
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        <span
          className={cn("text-sm font-semibold", change > 0 ? "text-emerald-600" : "text-rose-600")}
        >
          {change > 0 ? "+" : ""}
          {change}%
        </span>
        <span className="text-xs text-slate-500">vs bulan lalu</span>
      </div>
    </div>
  );
}

// ─── Section Card ──────────────────────────────────────────────────────────

function SectionCard({
  title,
  subtitle,
  children,
  delay = 0,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  delay?: number;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      {...fadeUp(delay)}
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
    >
      <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

export function AdminAnalytics() {
  const [metrics, setMetrics] = useState<MetricsData>({
    totalRevenue: 0,
    premiumRevenue: 0,
    pharmacyRevenue: 0,
    totalOrders: 0,
    premiumSubs: 0,
    avgOrderValue: 0,
    monthlyGrowth: 0,
  });

  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProducts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");

  // Fetch analytics data
  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);

      // Fetch payment orders untuk revenue
      const { data: orders } = await supabase
        .from("payment_orders")
        .select("*")
        .eq("payment_status", "paid")
        .order("created_at", { ascending: false })
        .limit(1000);

      if (orders) {
        // Calculate metrics
        let premiumRev = 0,
          pharmacyRev = 0,
          totalRev = 0;

        orders.forEach((order: any) => {
          const amount = parseFloat(order.amount || 0);
          if (order.order_type === "premium") {
            premiumRev += amount;
          } else if (order.order_type === "pharmacy") {
            pharmacyRev += amount;
          }
          totalRev += amount;
        });

        setMetrics({
          totalRevenue: totalRev,
          premiumRevenue: premiumRev,
          pharmacyRevenue: pharmacyRev,
          totalOrders: orders.length,
          premiumSubs: Math.floor(orders.filter((o: any) => o.order_type === "premium").length),
          avgOrderValue: orders.length > 0 ? totalRev / orders.length : 0,
          monthlyGrowth: 12.5, // Mock data
        });

        // Generate sales data for chart
        generateSalesData(orders);
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSalesData = (orders: any[]) => {
    const grouped: Record<string, SalesData> = {};

    orders.forEach((order: any) => {
      const date = format(new Date(order.created_at), "yyyy-MM-dd", { locale: idLocale });

      if (!grouped[date]) {
        grouped[date] = { date, premiumSales: 0, pharmacySales: 0, totalRevenue: 0, orders: 0 };
      }

      const amount = parseFloat(order.amount || 0);
      if (order.order_type === "premium") {
        grouped[date].premiumSales += amount;
      } else {
        grouped[date].pharmacySales += amount;
      }
      grouped[date].totalRevenue += amount;
      grouped[date].orders += 1;
    });

    setSalesData(Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date)));
  };

  // Extract chart data
  const premiumChartData = salesData.map((d) => d.premiumSales);
  const pharmacyChartData = salesData.map((d) => d.pharmacySales);
  const revenueChartData = salesData.map((d) => d.totalRevenue);

  return (
    <AdminLayout
      title="Analytics & Penjualan"
      subtitle="Pelacakan bisnis Sembuhin — Premium, Apotek, & Revenue Intelligence"
      rightElement={
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700"
          >
            <option value="7d">7 Hari</option>
            <option value="30d">30 Hari</option>
            <option value="90d">90 Hari</option>
          </select>
          <button className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">
            <Download className="h-4 w-4" />
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Revenue Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div {...fadeUp(0)}>
            <RevenueCard
              title="Total Pendapatan"
              value={metrics.totalRevenue}
              change={12.5}
              trend="up"
              color="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
            />
          </motion.div>

          <motion.div {...fadeUp(0.07)}>
            <RevenueCard
              title="Premium Membership"
              value={metrics.premiumRevenue}
              change={8.2}
              trend="up"
              color="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200"
            />
          </motion.div>

          <motion.div {...fadeUp(0.14)}>
            <RevenueCard
              title="Penjualan Apotek"
              value={metrics.pharmacyRevenue}
              change={15.3}
              trend="up"
              color="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200"
            />
          </motion.div>

          <motion.div {...fadeUp(0.21)}>
            <RevenueCard
              title="Nilai Order Rata-rata"
              value={metrics.avgOrderValue}
              change={5.1}
              trend="up"
              color="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200"
            />
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <SectionCard
            title="Tren Pendapatan Total"
            subtitle="Grafik penjualan harian"
            delay={0.28}
            action={<Activity className="h-4 w-4 text-slate-400" />}
          >
            <div className="space-y-4">
              <SimpleLineChart data={revenueChartData} label="Revenue" color="#3b82f6" />
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Rata-rata Harian</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    Rp {(metrics.totalRevenue / (salesData.length || 1)).toLocaleString("id-ID")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Puncak Penjualan</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    Rp {Math.max(...revenueChartData).toLocaleString("id-ID")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Total Transaksi</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{metrics.totalOrders}</p>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Premium vs Pharmacy */}
          <SectionCard
            title="Perbandingan: Premium vs Apotek"
            subtitle="Breakdown penjualan per kategori"
            delay={0.35}
            action={<ShoppingCart className="h-4 w-4 text-slate-400" />}
          >
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">Premium</span>
                  <span className="text-sm font-bold text-violet-600">
                    Rp {metrics.premiumRevenue.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-400 to-violet-600 rounded-full"
                    style={{
                      width: `${(metrics.premiumRevenue / metrics.totalRevenue) * 100 || 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">Apotek</span>
                  <span className="text-sm font-bold text-emerald-600">
                    Rp {metrics.pharmacyRevenue.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                    style={{
                      width: `${(metrics.pharmacyRevenue / metrics.totalRevenue) * 100 || 0}%`,
                    }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Premium Subscribers</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{metrics.premiumSubs}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Pharmacy Orders</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {metrics.totalOrders - metrics.premiumSubs}
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Individual Trend Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Premium Sales Trend */}
          <SectionCard
            title="Tren Penjualan Premium"
            subtitle="Subscription dan membership revenue"
            delay={0.42}
          >
            <SimpleLineChart data={premiumChartData} label="Premium" color="#a78bfa" />
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Premium Revenue</p>
                <p className="text-xl font-bold text-violet-600 mt-1">
                  Rp {metrics.premiumRevenue.toLocaleString("id-ID")}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">% dari Total</p>
                <p className="text-xl font-bold text-violet-600 mt-1">
                  {((metrics.premiumRevenue / metrics.totalRevenue) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </SectionCard>

          {/* Pharmacy Sales Trend */}
          <SectionCard
            title="Tren Penjualan Apotek"
            subtitle="Penjualan obat dan produk kesehatan"
            delay={0.49}
          >
            <SimpleLineChart data={pharmacyChartData} label="Pharmacy" color="#10b981" />
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Pharmacy Revenue</p>
                <p className="text-xl font-bold text-emerald-600 mt-1">
                  Rp {metrics.pharmacyRevenue.toLocaleString("id-ID")}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">% dari Total</p>
                <p className="text-xl font-bold text-emerald-600 mt-1">
                  {((metrics.pharmacyRevenue / metrics.totalRevenue) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Metrics Summary */}
        <SectionCard
          title="Ringkasan Metrik Bisnis"
          subtitle="Key Performance Indicators"
          delay={0.56}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                Total Transaksi
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{metrics.totalOrders}</p>
              <p className="text-xs text-emerald-600 font-semibold mt-2">
                +{metrics.monthlyGrowth}% bulan ini
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                Rata-rata Order Value
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                Rp {Math.round(metrics.avgOrderValue).toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-slate-600 font-medium mt-2">per pesanan</p>
            </div>

            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                Revenue / Order
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {(metrics.totalRevenue / metrics.totalOrders).toFixed(0)}%
              </p>
              <p className="text-xs text-slate-600 font-medium mt-2">conversion rate</p>
            </div>

            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                Pertumbuhan Bulanan
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {metrics.monthlyGrowth.toFixed(1)}%
              </p>
              <p className="text-xs text-emerald-600 font-semibold mt-2">vs bulan lalu</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </AdminLayout>
  );
}
