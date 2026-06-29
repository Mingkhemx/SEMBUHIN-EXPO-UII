import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/panel-admin/AdminLayout";

export const Route = createFileRoute("/admin")({ component: AdminShell });
