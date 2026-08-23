import { createClient } from "@/lib/supabase/client";

export async function signInWithGoogle(nextPath = "/"): Promise<{ error: string | null }> {
  const supabase = createClient();
  const next = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });

  return { error: error?.message ?? null };
}
