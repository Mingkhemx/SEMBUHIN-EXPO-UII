import { createFileRoute } from "@tanstack/react-router";
import { DoctorDashboard } from "@/panel-doctor/DoctorDashboard";

export const Route = createFileRoute("/doctor/")({
  head: () => ({ meta: [{ title: "Dashboard — Doctor Panel" }] }),
  component: DoctorDashboard,
});
