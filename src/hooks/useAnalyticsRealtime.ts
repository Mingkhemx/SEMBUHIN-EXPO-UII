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
   * Fetch analytics data dari payment_orders table
   */
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Calculate date range
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRangeRef.current);

      // Fetch langsung dari payment_orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("payment_orders")
        .select("id, amount, status, created_at")
        .eq("status", "paid")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (ordersError) {
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
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch analytics");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Process data dari payment_orders - simple aggregation
   */
  const processOrdersData = (orders: any[]) => {
    let totalRev = 0;
    const groupedByDate: Record<string, number> = {};

    orders.forEach((order) => {
      const amount = parseFloat(order.amount || 0);
      totalRev += amount;

      const dateKey = new Date(order.created_at).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      groupedByDate[dateKey] = (groupedByDate[dateKey] || 0) + amount;
    });

    const newChartData = Object.entries(groupedByDate)
      .map(([date, total]) => ({
        date,
        premium: total,
        pharmacy: 0,
        total,
        premiumOrders: 0,
        pharmacyOrders: 0,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setMetrics({
      totalRevenue: totalRev,
      premiumRevenue: totalRev,
      pharmacyRevenue: 0,
      totalOrders: orders.length,
      premiumOrders: orders.length,
      pharmacyOrders: 0,
      averageOrderValue: orders.length > 0 ? totalRev / orders.length : 0,
    });

    setChartData(newChartData);
  };

  /**
   * Subscribe ke real-time updates dari payment_orders
   */
  const subscribe = useCallback(() => {
    if (channelRef.current) {
      return;
    }

    const channel = supabase
      .channel("analytics-realtime-v2")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payment_orders",
          filter: "status=eq.paid",
        },
        () => {
          console.log("Payment order change detected");
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
