import { createFileRoute } from "@tanstack/react-router";
import { isId, piFetch, readJson } from "@/lib/pi-server";

export const Route = createFileRoute("/api/public/pi/complete-payment")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { paymentId, txid } = await readJson(request);
        if (!isId(paymentId) || !isId(txid)) return new Response("Invalid input", { status: 400 });
        const r = await piFetch(`/payments/${paymentId}/complete`, { method: "POST", body: JSON.stringify({ txid }) });
        if (r.ok) {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const release_at = new Date(Date.now() + 7 * 864e5).toISOString();
          await supabaseAdmin.from("escrow_orders").update({ status: "deposited", txid, release_at }).eq("pi_payment_id", paymentId).eq("status", "created");
        }
        return r;
      },
    },
  },
});
