import { X_OAUTH_SCOPES } from "@/lib/auth/x-oauth";
import { createClient } from "@/lib/supabase/client";

export async function signInWithX(nextPath = "/"): Promise<{ error: string | null }> {
  const supabase = createClient();
  const next = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "x",
    options: {
      redirectTo,
      scopes: X_OAUTH_SCOPES,
    },
  });

  return { error: error?.message ?? null };
}
