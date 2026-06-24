import { createFileRoute } from "@tanstack/react-router";
import { DoctorPrescriptions } from "@/panel-doctor/DoctorPrescriptions";

export const Route = createFileRoute("/doctor/prescriptions")({
  head: () => ({ meta: [{ title: "Resep — Doctor Panel" }] }),
  component: DoctorPrescriptions,
});
