import { createFileRoute } from "@tanstack/react-router";
import { isId, piFetch, readJson } from "@/lib/pi-server";

export const Route = createFileRoute("/api/public/pi/approve-payment")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { paymentId } = await readJson(request);
        if (!isId(paymentId)) return new Response("Invalid paymentId", { status: 400 });
        // Confirm the payment exists on Pi's side before approving.
        const check = await piFetch(`/payments/${paymentId}`);
        if (!check.ok) return check;
        return piFetch(`/payments/${paymentId}/approve`, { method: "POST" });
      },
    },
  },
});
