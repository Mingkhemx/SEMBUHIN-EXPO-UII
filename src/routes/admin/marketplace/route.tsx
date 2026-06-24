import { createFileRoute } from "@tanstack/react-router";
import { AdminMarketplace } from "@/panel-admin/AdminMarketplace";

export const Route = createFileRoute("/admin/marketplace")({
  head: () => ({ meta: [{ title: "Marketplace — Admin Panel" }] }),
  component: AdminMarketplace,
});
