import { piFetch } from "@/lib/pi-server";

// Verifies a Pi access token and checks the user is listed as a moderator.
export async function requireModerator(accessToken: unknown) {
  if (typeof accessToken !== "string" || accessToken.length > 4096) return null;
  const me = await piFetch("/me", { auth: `Bearer ${accessToken}` });
  if (!me.ok) return null;
  const user = (await me.json()) as { uid: string; username: string };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("moderators").select("pi_username").eq("pi_username", user.username).maybeSingle();
  return data ? { user, supabaseAdmin } : null;
}
