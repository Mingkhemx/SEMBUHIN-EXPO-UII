import { createFileRoute } from "@tanstack/react-router";
import { DoctorMedicalRecords } from "@/panel-doctor/DoctorMedicalRecords";

export const Route = createFileRoute("/doctor/medical-records")({
  head: () => ({ meta: [{ title: "Rekam Medis Pasien — Doctor Panel" }] }),
  component: DoctorMedicalRecords,
});
