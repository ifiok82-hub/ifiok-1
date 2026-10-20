import { createFileRoute } from "@tanstack/react-router";
import { isId, piFetch, readJson } from "@/lib/pi-server";

type PiPayment = { amount: number; user_uid: string; metadata?: { orderId?: string; listingId?: string } };

export const Route = createFileRoute("/api/public/pi/approve-payment")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { paymentId } = await readJson(request);
        if (!isId(paymentId)) return new Response("Invalid paymentId", { status: 400 });
        // Confirm the payment exists on Pi's side before approving; trust Pi's data, not the client's.
        const check = await piFetch(`/payments/${paymentId}`);
        if (!check.ok) return check;
        const p = (await check.json()) as PiPayment;
        const orderCode = p.metadata?.orderId;
        if (!orderCode || !isId(orderCode)) return new Response("Missing order", { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        let seller: string | null = null;
        const listingId = p.metadata?.listingId;
        if (listingId && /^[0-9a-f-]{36}$/.test(listingId)) {
          const { data } = await supabaseAdmin.from("listings").select("seller_username").eq("id", listingId).maybeSingle();
          seller = data?.seller_username ?? null;
        }
        const { error } = await supabaseAdmin.from("escrow_orders").upsert(
          { order_code: orderCode, pi_payment_id: paymentId, amount_pi: p.amount, buyer_uid: p.user_uid, listing_id: seller ? listingId! : null, seller_username: seller },
          { onConflict: "pi_payment_id" },
        );
        if (error) return new Response("Could not record order", { status: 500 });
        return piFetch(`/payments/${paymentId}/approve`, { method: "POST" });
      },
    },
  },
});
