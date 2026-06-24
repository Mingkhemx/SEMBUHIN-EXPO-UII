import { createFileRoute } from "@tanstack/react-router";
import { AdminUsers } from "@/panel-admin/AdminUsers";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — Admin Panel" }] }),
  component: AdminUsers,
});
