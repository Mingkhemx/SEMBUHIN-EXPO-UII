/**
 * useAnalyticsRealtime - Real-time Analytics Hook dengan Supabase
 * Subscribe ke payment_orders dan analytics_summary untuk live updates
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface AnalyticsMetrics {
  totalRevenue: number;
  premiumRevenue: number;
  pharmacyRevenue: number;
  totalOrders: number;
  premiumOrders: number;
  pharmacyOrders: number;
  averageOrderValue: number;
}

export interface AnalyticsChartData {
  date: string;
  premium: number;
  pharmacy: number;
  total: number;
  premiumOrders: number;
  pharmacyOrders: number;
}

interface UseAnalyticsRealtimeProps {
  dateRange?: 30 | 90;
  autoSubscribe?: boolean;
}

interface UseAnalyticsRealtimeReturn {
  metrics: AnalyticsMetrics;
  chartData: AnalyticsChartData[];
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refresh: () => Promise<void>;
  subscribe: () => void;
  unsubscribe: () => void;
  isSubscribed: boolean;
}

export function useAnalyticsRealtime({
  dateRange = 30,
  autoSubscribe = true,
}: UseAnalyticsRealtimeProps = {}): UseAnalyticsRealtimeReturn {
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalRevenue: 0,
    premiumRevenue: 0,
    pharmacyRevenue: 0,
    totalOrders: 0,
    premiumOrders: 0,
    pharmacyOrders: 0,
    averageOrderValue: 0,
  });

  const [chartData, setChartData] = useState<AnalyticsChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const dateRangeRef = useRef(dateRange);

  // Update ref ketika dateRange berubah
  useEffect(() => {
    dateRangeRef.current = dateRange;
  }, [dateRange]);

  /**
   * Fetch analytics data dari database
   */
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Calculate date range
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRangeRef.current);

      // Try to fetch dari analytics_summary
      let { data: summaryData, error: summaryError } = await supabase
        .from("analytics_summary")
        .select("*")
        .gte("date", startDate.toISOString().split("T")[0])
        .order("date", { ascending: true });

      // If table doesn't exist, fetch directly from payment_orders
      if (summaryError && summaryError.code === "PGRST116") {
        console.log("analytics_summary table not found, fetching from payment_orders");
        summaryData = null;
      } else if (summaryError) {
        throw new Error(summaryError.message);
      }

      if (!summaryData || summaryData.length === 0) {
        // Fallback ke payment_orders jika analytics_summary kosong atau tidak exist
        const { data: ordersData, error: ordersError } = await supabase
          .from("payment_orders")
          .select("*")
          .eq("payment_status", "paid")
          .gte("created_at", startDate.toISOString())
          .order("created_at", { ascending: true });

        if (ordersError) {
          console.error("Orders fetch error:", ordersError);
          throw new Error(ordersError.message);
        }

        if (!ordersData || ordersData.length === 0) {
          setMetrics({
            totalRevenue: 0,
            premiumRevenue: 0,
            pharmacyRevenue: 0,
            totalOrders: 0,
            premiumOrders: 0,
            pharmacyOrders: 0,
            averageOrderValue: 0,
          });
          setChartData([]);
          setLastUpdate(new Date());
          return;
        }

        // Process orders data
        processOrdersData(ordersData);
      } else {
        // Process summary data
        processSummaryData(summaryData);
      }

      setLastUpdate(new Date());
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch analytics");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Process data dari payment_orders
   */
  const processOrdersData = (orders: any[]) => {
    let premiumRev = 0,
      pharmacyRev = 0;
    let premiumCount = 0,
      pharmacyCount = 0;
    const groupedByDate: Record<string, { premium: number; pharmacy: number; premiumOrders: number; pharmacyOrders: number }> = {};

    orders.forEach((order) => {
      const amount = parseFloat(order.amount || 0);
      const orderType = order.order_type || "pharmacy";
      const dateKey = new Date(order.created_at).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      if (orderType === "premium") {
        premiumRev += amount;
        premiumCount += 1;
      } else {
        pharmacyRev += amount;
        pharmacyCount += 1;
      }

      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = { premium: 0, pharmacy: 0, premiumOrders: 0, pharmacyOrders: 0 };
      }

      if (orderType === "premium") {
        groupedByDate[dateKey].premium += amount;
        groupedByDate[dateKey].premiumOrders += 1;
      } else {
        groupedByDate[dateKey].pharmacy += amount;
        groupedByDate[dateKey].pharmacyOrders += 1;
      }
    });

    const newChartData = Object.entries(groupedByDate).map(([date, values]) => ({
      date,
      premium: values.premium,
      pharmacy: values.pharmacy,
      total: values.premium + values.pharmacy,
      premiumOrders: values.premiumOrders,
      pharmacyOrders: values.pharmacyOrders,
    }));

    setMetrics({
      totalRevenue: premiumRev + pharmacyRev,
      premiumRevenue: premiumRev,
      pharmacyRevenue: pharmacyRev,
      totalOrders: orders.length,
      premiumOrders: premiumCount,
      pharmacyOrders: pharmacyCount,
      averageOrderValue: orders.length > 0 ? (premiumRev + pharmacyRev) / orders.length : 0,
    });

    setChartData(newChartData);
  };

  /**
   * Process data dari analytics_summary
   */
  const processSummaryData = (summaryData: any[]) => {
    let totalRev = 0,
      premiumRev = 0,
      pharmacyRev = 0;
    let totalOrders = 0,
      premiumOrders = 0,
      pharmacyOrders = 0;
    let totalAvg = 0;

    const chartDataArray: AnalyticsChartData[] = [];

    summaryData.forEach((row) => {
      totalRev += parseFloat(row.total_revenue || 0);
      premiumRev += parseFloat(row.premium_revenue || 0);
      pharmacyRev += parseFloat(row.pharmacy_revenue || 0);
      totalOrders += row.total_orders || 0;
      premiumOrders += row.premium_orders || 0;
      pharmacyOrders += row.pharmacy_orders || 0;
      totalAvg += parseFloat(row.average_order_value || 0);

      chartDataArray.push({
        date: new Date(row.date).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
        premium: parseFloat(row.premium_revenue || 0),
        pharmacy: parseFloat(row.pharmacy_revenue || 0),
        total: parseFloat(row.total_revenue || 0),
        premiumOrders: row.premium_orders || 0,
        pharmacyOrders: row.pharmacy_orders || 0,
      });
    });

    setMetrics({
      totalRevenue: totalRev,
      premiumRevenue: premiumRev,
      pharmacyRevenue: pharmacyRev,
      totalOrders: totalOrders,
      premiumOrders: premiumOrders,
      pharmacyOrders: pharmacyOrders,
      averageOrderValue: summaryData.length > 0 ? totalAvg / summaryData.length : 0,
    });

    setChartData(chartDataArray);
  };

  /**
   * Subscribe ke real-time updates
   */
  const subscribe = useCallback(() => {
    if (channelRef.current) {
      return; // Already subscribed
    }

    const channel = supabase
      .channel("analytics-realtime", {
        config: {
          broadcast: { self: true },
        },
      })
      // Subscribe ke payment_orders
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payment_orders",
          filter: "payment_status=eq.paid",
        },
        (payload) => {
          console.log("Payment order change:", payload);
          fetchAnalyticsData();
        }
      )
      // Subscribe ke analytics_summary
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "analytics_summary",
        },
        (payload) => {
          console.log("Analytics summary change:", payload);
          fetchAnalyticsData();
        }
      )
      .subscribe((status) => {
        console.log("Analytics subscription status:", status);
        setIsSubscribed(status === "SUBSCRIBED");
      });

    channelRef.current = channel;
  }, [fetchAnalyticsData]);

  /**
   * Unsubscribe dari real-time updates
   */
  const unsubscribe = useCallback(async () => {
    if (channelRef.current) {
      await supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      setIsSubscribed(false);
    }
  }, []);

  /**
   * Setup & cleanup
   */
  useEffect(() => {
    // Initial fetch
    fetchAnalyticsData();

    // Auto subscribe
    if (autoSubscribe) {
      subscribe();
    }

    return () => {
      unsubscribe();
    };
  }, [autoSubscribe, fetchAnalyticsData, subscribe, unsubscribe]);

  return {
    metrics,
    chartData,
    isLoading,
    error,
    lastUpdate,
    refresh: fetchAnalyticsData,
    subscribe,
    unsubscribe,
    isSubscribed,
  };
}
