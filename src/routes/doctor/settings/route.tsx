import { createFileRoute } from "@tanstack/react-router";
import { DoctorSettings } from "@/panel-doctor/DoctorSettings";

export const Route = createFileRoute("/doctor/settings")({
  head: () => ({ meta: [{ title: "Pengaturan — Doctor Panel" }] }),
  component: DoctorSettings,
});
