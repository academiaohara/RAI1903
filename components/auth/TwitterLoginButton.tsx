"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type TwitterLoginButtonProps = {
  nextPath?: string;
  className?: string;
  label?: string;
};

export function TwitterLoginButton({
  nextPath = "/",
  className,
  label = "Continuar con X",
}: TwitterLoginButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const next = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "x",
        options: { redirectTo },
      });

      if (oauthError) {
        setError(oauthError.message);
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => void handleLogin()}
        disabled={loading}
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#214C9B] bg-[#214C9B] px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-[#1a3d7a] disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
      >
        <XIcon />
        {loading ? "Redirigiendo…" : label}
      </button>
      {error ? <p className="text-center text-sm font-medium text-[#981915]">{error}</p> : null}
    </div>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
