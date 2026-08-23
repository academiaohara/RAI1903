"use client";

import { useState } from "react";
import { signInWithGoogle } from "@/lib/auth/sign-in-with-google";
import { signInWithX } from "@/lib/auth/sign-in-with-x";
import { cn } from "@/lib/utils";

type OAuthLoginButtonsProps = {
  nextPath?: string;
  className?: string;
  compact?: boolean;
  googleLabel?: string;
  xLabel?: string;
};

export function OAuthLoginButtons({
  nextPath = "/",
  className,
  compact = false,
  googleLabel = "Continuar con Google",
  xLabel = "Continuar con X",
}: OAuthLoginButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<"google" | "x" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const next = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;

  const handleGoogleLogin = async () => {
    setLoadingProvider("google");
    setError(null);

    try {
      const { error: oauthError } = await signInWithGoogle(next);
      if (oauthError) {
        setError(oauthError);
        setLoadingProvider(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
      setLoadingProvider(null);
    }
  };

  const handleXLogin = async () => {
    setLoadingProvider("x");
    setError(null);

    try {
      const { error: oauthError } = await signInWithX(next);
      if (oauthError) {
        setError(oauthError);
        setLoadingProvider(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
      setLoadingProvider(null);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <button
        type="button"
        onClick={() => void handleGoogleLogin()}
        disabled={loadingProvider !== null}
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#214C9B] bg-white font-extrabold uppercase tracking-wide text-[#214C9B] transition hover:bg-[#214C9B]/5 disabled:cursor-not-allowed disabled:opacity-60",
          compact ? "px-3 py-2 text-[10px]" : "px-6 py-3 text-sm",
        )}
      >
        <GoogleIcon />
        {loadingProvider === "google" ? "Redirigiendo…" : googleLabel}
      </button>
      <button
        type="button"
        onClick={() => void handleXLogin()}
        disabled={loadingProvider !== null}
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#214C9B] bg-[#214C9B] font-extrabold uppercase tracking-wide text-white transition hover:bg-[#1a3d7a] disabled:cursor-not-allowed disabled:opacity-60",
          compact ? "px-3 py-2 text-[10px]" : "px-6 py-3 text-sm",
        )}
      >
        <XIcon />
        {loadingProvider === "x" ? "Redirigiendo…" : xLabel}
      </button>
      {error ? <p className="text-center text-sm font-medium text-[#981915]">{error}</p> : null}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
