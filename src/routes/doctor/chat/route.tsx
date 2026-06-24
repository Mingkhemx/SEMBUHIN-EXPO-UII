import { createFileRoute } from "@tanstack/react-router";
import { DoctorChat } from "@/panel-doctor/DoctorChat";

export const Route = createFileRoute("/doctor/chat")({
  head: () => ({ meta: [{ title: "Chat Pasien — Doctor Panel" }] }),
  component: DoctorChat,
});
