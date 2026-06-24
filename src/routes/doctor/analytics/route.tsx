import { createFileRoute } from "@tanstack/react-router";
import { DoctorAnalytics } from "@/panel-doctor/DoctorAnalytics";

export const Route = createFileRoute("/doctor/analytics")({
  head: () => ({ meta: [{ title: "Analitik — Doctor Panel" }] }),
  component: DoctorAnalytics,
});
