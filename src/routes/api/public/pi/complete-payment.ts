import { createFileRoute } from "@tanstack/react-router";
import { isId, piFetch, readJson } from "@/lib/pi-server";

export const Route = createFileRoute("/api/public/pi/complete-payment")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { paymentId, txid } = await readJson(request);
        if (!isId(paymentId) || !isId(txid)) return new Response("Invalid input", { status: 400 });
        return piFetch(`/payments/${paymentId}/complete`, { method: "POST", body: JSON.stringify({ txid }) });
      },
    },
  },
});
