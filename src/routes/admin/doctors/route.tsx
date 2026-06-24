import { createFileRoute } from "@tanstack/react-router";
import { AdminDoctors } from "@/panel-admin/AdminDoctors";

export const Route = createFileRoute("/admin/doctors")({
  head: () => ({ meta: [{ title: "Dokter — Admin Panel" }] }),
  component: AdminDoctors,
});
