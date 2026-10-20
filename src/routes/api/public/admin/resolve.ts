import { createFileRoute } from "@tanstack/react-router";
import { readJson } from "@/lib/pi-server";
import { requireModerator } from "@/lib/moderator-server";

const ACTIONS = { release: ["approved_release", "completed"], refund: ["refunded", "refunded"], dismiss: ["dismissed", null] } as const;

export const Route = createFileRoute("/api/public/admin/resolve")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { accessToken, reportId, action, note } = await readJson(request);
        const mod = await requireModerator(accessToken);
        if (!mod) return new Response("Moderators only", { status: 403 });
        if (typeof reportId !== "string" || !/^[0-9a-f-]{36}$/.test(reportId)) return new Response("Invalid report", { status: 400 });
        if (action !== "release" && action !== "refund" && action !== "dismiss") return new Response("Invalid action", { status: 400 });
        const [reportStatus, orderStatus] = ACTIONS[action];
        const db = mod.supabaseAdmin;
        const { data: rep } = await db.from("scam_reports").select("order_id").eq("id", reportId).maybeSingle();
        if (!rep) return new Response("Not found", { status: 404 });
        const now = new Date().toISOString();
        await db.from("scam_reports").update({ status: reportStatus, resolved_at: now, moderator_note: typeof note === "string" ? note.slice(0, 2000) : `By @${mod.user.username}` }).eq("id", reportId);
        if (rep.order_id) {
          // Dismissed reports resume the 7-day countdown.
          const upd = orderStatus ? { status: orderStatus, completed_at: now } : { status: "deposited" as const, release_at: new Date(Date.now() + 7 * 864e5).toISOString() };
          await db.from("escrow_orders").update(upd).eq("id", rep.order_id).eq("status", "disputed");
        }
        return Response.json({ ok: true });
      },
    },
  },
});
