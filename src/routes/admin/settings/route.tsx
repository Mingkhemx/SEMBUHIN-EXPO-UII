import { createFileRoute } from "@tanstack/react-router";
import { AdminSettings } from "@/panel-admin/AdminSettings";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Pengaturan — Admin Panel" }] }),
  component: AdminSettings,
});
