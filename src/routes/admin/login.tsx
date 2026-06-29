import { createFileRoute } from "@tanstack/react-router";
import { AdminLogin } from "@/panel-admin/AdminLogin";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});
