import { createFileRoute } from "@tanstack/react-router";
import { isId, piFetch, readJson } from "@/lib/pi-server";

export const Route = createFileRoute("/api/public/escrow/report")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { accessToken, orderCode, description } = await readJson(request);
        if (typeof accessToken !== "string" || accessToken.length > 4096) return new Response("Sign in with Pi first", { status: 401 });
        if (!isId(orderCode)) return new Response("Invalid order", { status: 400 });
        if (typeof description !== "string" || description.trim().length < 5 || description.length > 4000) return new Response("Please describe what happened", { status: 400 });
        // Verify the reporter with Pi.
        const me = await piFetch("/me", { auth: `Bearer ${accessToken}` });
        if (!me.ok) return new Response("Pi authentication failed", { status: 401 });
        const user = (await me.json()) as { uid: string; username: string };

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: order } = await supabaseAdmin.from("escrow_orders").select("id, buyer_uid").eq("order_code", orderCode).maybeSingle();
        if (!order || order.buyer_uid !== user.uid) return new Response("Only the buyer can report this order", { status: 403 });
        const { error } = await supabaseAdmin.from("scam_reports").insert({ order_id: order.id, reporter_username: user.username, description: description.trim() });
        if (error) return new Response("Could not file report", { status: 500 });
        return Response.json({ ok: true });
      },
    },
  },
});
