import { createFileRoute } from "@tanstack/react-router";
import { piFetch, readJson } from "@/lib/pi-server";

export const Route = createFileRoute("/api/public/pi/verify-user")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { accessToken } = await readJson(request);
        if (typeof accessToken !== "string" || accessToken.length > 4096) return new Response("Invalid token", { status: 400 });
        const r = await piFetch("/me", { auth: `Bearer ${accessToken}` });
        if (!r.ok) return new Response("Pi authentication failed", { status: 401 });
        const me = (await r.json()) as { uid: string; username: string };
        return Response.json({ uid: me.uid, username: me.username });
      },
    },
  },
});
