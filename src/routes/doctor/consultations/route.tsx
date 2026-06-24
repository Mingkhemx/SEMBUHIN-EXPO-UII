import { createFileRoute } from "@tanstack/react-router";
import { DoctorConsultations } from "@/panel-doctor/DoctorConsultations";

export const Route = createFileRoute("/doctor/consultations")({
  head: () => ({ meta: [{ title: "Konsultasi — Doctor Panel" }] }),
  component: DoctorConsultations,
});
