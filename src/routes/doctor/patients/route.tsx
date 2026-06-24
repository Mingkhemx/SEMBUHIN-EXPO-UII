import { createFileRoute } from "@tanstack/react-router";
import { DoctorPatients } from "@/panel-doctor/DoctorPatients";

export const Route = createFileRoute("/doctor/patients")({
  head: () => ({ meta: [{ title: "Pasien — Doctor Panel" }] }),
  component: DoctorPatients,
});
