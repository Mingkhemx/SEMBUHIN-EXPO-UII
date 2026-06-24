import { createFileRoute } from "@tanstack/react-router";
import { AdminLiveChat } from "@/panel-admin/AdminLiveChat";

export const Route = createFileRoute("/admin/live-chat")({
  head: () => ({ meta: [{ title: "Live Chat — Admin Panel" }] }),
  component: AdminLiveChat,
});
