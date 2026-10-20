import { createFileRoute } from "@tanstack/react-router";
import { readJson } from "@/lib/pi-server";
import { requireModerator } from "@/lib/moderator-server";

export const Route = createFileRoute("/api/public/admin/reports")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { accessToken } = await readJson(request);
        const mod = await requireModerator(accessToken);
        if (!mod) return new Response("Moderators only", { status: 403 });
        const { data, error } = await mod.supabaseAdmin
          .from("scam_reports")
          .select("id, description, evidence_urls, status, moderator_note, created_at, reporter_username, escrow_orders(order_code, amount_pi, seller_username, buyer_username, status)")
          .order("created_at", { ascending: false })
          .limit(200);
        if (error) return new Response("Could not load reports", { status: 500 });
        return Response.json({ reports: data, moderator: mod.user.username });
      },
    },
  },
});
