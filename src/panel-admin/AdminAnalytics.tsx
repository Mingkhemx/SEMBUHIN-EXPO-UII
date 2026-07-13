/**
 * AdminAnalytics — Dashboard Real-time Penjualan
 * 
 * PENJELASAN CARA KERJA:
 * 1. Saat page load → fetch data dari payment_orders table
 * 2. Subscribe ke perubahan payment_orders (saat ada pembayaran baru)
 * 3. Auto-update dashboard dengan data terbaru
 * 4. Tampilkan: Total uang, Total order, Breakdown membership vs pharmacy
 * 
 * DATABASE: Ambil dari table payment_orders di Supabase
 * - order_id: identifier unik (untuk deteksi membership vs pharmacy)
 * - amount: jumlah uang
 * - status: 'paid' = pembayaran berhasil
 * - created_at: waktu transaksi
 */

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
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

interface MetricsData {
  totalRevenue: number;
  membershipRevenue: number;
  pharmacyRevenue: number;
  totalOrders: number;
  membershipOrders: number;
  pharmacyOrders: number;
}

interface ChartData {
  date: string;
  membership: number;
  pharmacy: number;
  total: number;
}

const COLORS = {
  membership: "#a78bfa",
  pharmacy: "#10b981",
};

function StatCard({
  label,
  value,
  change,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  change: number;
  icon: any;
  color: string;
}) {
  const isPositive = change >= 0;
  const formatted = value > 0 ? `Rp ${value.toLocaleString("id-ID")}` : "Rp 0";

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
            <span className="text-xs text-slate-500">vs hari lalu</span>
          </div>
        </div>
        <div className={cn("p-3 rounded-xl", color.split(" ")[1])}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

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

export function AdminAnalytics() {
  const [dateRange, setDateRange] = useState<30 | 90>(30);
  const [metrics, setMetrics] = useState<MetricsData>({
    totalRevenue: 0,
    membershipRevenue: 0,
    pharmacyRevenue: 0,
    totalOrders: 0,
    membershipOrders: 0,
    pharmacyOrders: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  /**
   * Fetch analytics data dari payment_orders
   * Ini dipanggil:
   * 1. Saat component pertama kali load
   * 2. Saat ada perubahan di payment_orders (via subscription)
   * 3. Saat user klik refresh button
   * 4. Saat user ganti date range
   */
  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      // Query ke database: ambil semua pembayaran yang berhasil
      const { data: orders, error } = await supabase
        .from("payment_orders")
        .select("order_id, amount, created_at, status, order_type")
        .eq("status", "paid")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Jika tidak ada data, tampilkan 0
      if (!orders || orders.length === 0) {
        setMetrics({
          totalRevenue: 0,
          membershipRevenue: 0,
          pharmacyRevenue: 0,
          totalOrders: 0,
          membershipOrders: 0,
          pharmacyOrders: 0,
        });
        setChartData([]);
        setLastUpdate(format(new Date(), "dd MMM yyyy HH:mm"));
        return;
      }

      // Hitung statistik dari data yang diambil
      let membershipRev = 0,
        pharmacyRev = 0;
      let membershipCount = 0,
        pharmacyCount = 0;
      const groupedByDate: Record<string, { membership: number; pharmacy: number }> = {};

      // Loop setiap order
      orders.forEach((order: any) => {
        const amount = Number(order.amount) || 0;
        const date = format(new Date(order.created_at), "dd MMM");

        // Deteksi: Apakah ini membership atau pharmacy?
        // Gunakan field order_type yang lebih reliable
        const isMembership = order.order_type === 'membership';

        if (isMembership) {
          membershipRev += amount;
          membershipCount += 1;
        } else {
          pharmacyRev += amount;
          pharmacyCount += 1;
        }

        // Group by tanggal untuk chart
        if (!groupedByDate[date]) {
          groupedByDate[date] = { membership: 0, pharmacy: 0 };
        }

        if (isMembership) {
          groupedByDate[date].membership += amount;
        } else {
          groupedByDate[date].pharmacy += amount;
        }
      });

      // Update state dengan data yang sudah dihitung
      setMetrics({
        totalRevenue: membershipRev + pharmacyRev,
        membershipRevenue: membershipRev,
        pharmacyRevenue: pharmacyRev,
        totalOrders: orders.length,
        membershipOrders: membershipCount,
        pharmacyOrders: pharmacyCount,
      });

      // Format untuk chart
      const chartDataArray = Object.entries(groupedByDate).map(([date, values]) => ({
        date,
        membership: values.membership,
        pharmacy: values.pharmacy,
        total: values.membership + values.pharmacy,
      }));

      setChartData(chartDataArray);
      setLastUpdate(format(new Date(), "dd MMM yyyy HH:mm"));
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Setup: Fetch data saat pertama kali dan subscribe ke perubahan
  useEffect(() => {
    // Fetch pertama kali
    fetchAnalyticsData();

    // Subscribe ke real-time updates
    // Setiap kali ada pembayaran baru yang masuk ke payment_orders → auto-fetch data
    const subscription = supabase
      .channel("payment_orders_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payment_orders",
          filter: "status=eq.paid",
        },
        () => {
          console.log("Ada pembayaran baru! Refresh data...");
          fetchAnalyticsData();
        }
      )
      .subscribe();

    // Cleanup: unsubscribe saat component unmount
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [dateRange]);

  // Hitung percentage untuk pie chart
  const membershipPercentage =
    metrics.totalRevenue > 0
      ? (metrics.membershipRevenue / metrics.totalRevenue) * 100
      : 0;
  const pharmacyPercentage = 100 - membershipPercentage;
  const pieData = [
    { name: "Membership", value: membershipPercentage, fill: COLORS.membership },
    { name: "Pharmacy", value: pharmacyPercentage, fill: COLORS.pharmacy },
  ];

  return (
    <AdminLayout
      title="Analytics & Penjualan"
      subtitle="Real-time data penjualan membership dan obat-obatan"
      rightElement={
        <div className="flex items-center gap-3">
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

          <button
            onClick={fetchAnalyticsData}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
            disabled={isLoading}
          >
            <RefreshCcw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </button>

          <span className="text-xs text-slate-500 font-medium min-w-[140px] text-right">
            <Calendar className="h-3 w-3 inline mr-1" />
            {lastUpdate}
          </span>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total Pendapatan"
            value={metrics.totalRevenue}
            change={12.5}
            icon={DollarSign}
            color="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
          />

          <StatCard
            label="Membership"
            value={metrics.membershipRevenue}
            change={8.2}
            icon={Users}
            color="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200"
          />

          <StatCard
            label="Pharmacy"
            value={metrics.pharmacyRevenue}
            change={15.3}
            icon={ShoppingCart}
            color="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200"
          />

          <StatCard
            label="Total Order"
            value={metrics.totalOrders}
            change={10.1}
            icon={ShoppingCart}
            color="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Section
            title="Tren Pendapatan"
            subtitle={`Breakdown membership vs pharmacy (${dateRange} hari)`}
            delay={0.1}
            className="xl:col-span-2"
          >
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMembership" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.membership} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.membership} stopOpacity={0} />
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
                  dataKey="membership"
                  stackId="1"
                  stroke={COLORS.membership}
                  fillOpacity={1}
                  fill="url(#colorMembership)"
                  name="Membership"
                />
                <Area
                  type="monotone"
                  dataKey="pharmacy"
                  stackId="1"
                  stroke={COLORS.pharmacy}
                  fillOpacity={1}
                  fill="url(#colorPharmacy)"
                  name="Pharmacy"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Section>

          <Section title="Distribusi Revenue" subtitle="Membership vs Pharmacy" delay={0.2}>
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
                    style={{ backgroundColor: COLORS.membership }}
                  />
                  <span className="text-sm font-medium text-slate-700">Membership</span>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  Rp {metrics.membershipRevenue.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS.pharmacy }}
                  />
                  <span className="text-sm font-medium text-slate-700">Pharmacy</span>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  Rp {metrics.pharmacyRevenue.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </Section>
        </div>

        {/* Bottom Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section title="Perbandingan Revenue" subtitle="Membership vs Pharmacy" delay={0.3}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  {
                    name: "Membership",
                    value: metrics.membershipRevenue / 1000000,
                    fill: COLORS.membership,
                  },
                  {
                    name: "Pharmacy",
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
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                  {[
                    {
                      name: "Membership",
                      value: metrics.membershipRevenue / 1000000,
                      fill: COLORS.membership,
                    },
                    {
                      name: "Pharmacy",
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

          <Section title="Breakdown Order" subtitle="Jumlah order per kategori" delay={0.4}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { name: "Membership", orders: metrics.membershipOrders, fill: COLORS.membership },
                  { name: "Pharmacy", orders: metrics.pharmacyOrders, fill: COLORS.pharmacy },
                ]}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={70} />
                <Tooltip
                  formatter={(value) => `${value} order`}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                    color: "#f1f5f9",
                  }}
                />
                <Bar dataKey="orders" radius={[0, 8, 8, 0]}>
                  {[
                    { name: "Membership", orders: metrics.membershipOrders, fill: COLORS.membership },
                    { name: "Pharmacy", orders: metrics.pharmacyOrders, fill: COLORS.pharmacy },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Section>
        </div>
      </div>
    </AdminLayout>
  );
}
