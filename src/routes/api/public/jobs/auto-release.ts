import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

// Hourly job: completes escrows whose 7-day window passed with no open scam report.
export const Route = createFileRoute("/api/public/jobs/auto-release")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const now = new Date().toISOString();
        const { data, error } = await supabaseAdmin
          .from("escrow_orders")
          .update({ status: "completed", completed_at: now })
          .in("status", ["deposited", "in_progress", "submitted"])
          .lte("release_at", now)
          .select("id");
        if (error) return new Response("Release failed", { status: 500 });
        return Response.json({ released: data?.length ?? 0 });
      },
    },
  },
});
