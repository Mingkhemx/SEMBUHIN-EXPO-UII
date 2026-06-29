import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { DoctorShell } from "@/panel-doctor/DoctorLayout";

/**
 * Parent layout route for all /doctor/* pages.
 * Guards: user must be logged in AND linked as a doctor in the `doctors` table.
 */
export const Route = createFileRoute("/doctor")({
  beforeLoad: async ({ location }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw redirect({
        to: "/auth",
        search: { redirect: location.pathname },
      });
    }

    // Check if this user is registered as a doctor
    const { data: doctor } = await supabase
      .from("doctors")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (!doctor) {
      // Not a recognized doctor — redirect to home
      throw redirect({
        to: "/",
      });
    }
  },
  component: DoctorShell,
});
