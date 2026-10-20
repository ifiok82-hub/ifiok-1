// Server-only Pi Platform API helper. Requires the PI_API_KEY secret.
const PI_API = "https://api.minepi.com/v2";

export async function piFetch(path: string, init: RequestInit & { auth?: string } = {}) {
  const key = process.env.PI_API_KEY;
  const authHeader = init.auth ?? (key ? `Key ${key}` : null);
  if (!authHeader) return new Response("PI_API_KEY is not configured", { status: 503 });
  const r = await fetch(`${PI_API}${path}`, {
    method: init.method ?? "GET",
    headers: { Authorization: authHeader, "Content-Type": "application/json" },
    body: init.body,
  });
  const text = await r.text();
  return new Response(text, { status: r.status, headers: { "Content-Type": "application/json" } });
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  try { return (await request.json()) as Record<string, unknown>; } catch { return {}; }
}

export const isId = (v: unknown): v is string => typeof v === "string" && /^[A-Za-z0-9_-]{4,128}$/.test(v);
