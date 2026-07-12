import { createFileRoute } from "@tanstack/react-router";
import { AdminAnalytics } from "@/panel-admin/AdminAnalytics";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics & Penjualan — Admin Panel — Sembuhin" },
      { name: "description", content: "Pelacakan bisnis, revenue, dan sales analytics" },
    ],
  }),
  component: AdminAnalytics,
});
