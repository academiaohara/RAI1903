"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { isXProfileProviderError } from "@/lib/auth/x-oauth";
import { signInWithX } from "@/lib/auth/sign-in-with-x";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const ERROR_MESSAGES: Record<string, string> = {
  auth: "No se pudo completar el inicio de sesión. Vuelve a intentarlo.",
  no_code: "X no devolvió el código de autorización. Revisa las Redirect URLs en Supabase.",
  config: "Supabase no está configurado en este entorno.",
};

export function LoginAutoRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorKey = searchParams.get("error");
  const errorDetail = searchParams.get("reason")?.replace(/\+/g, " ");
  const nextPath = searchParams.get("next")?.startsWith("/") ? searchParams.get("next")! : "/quiniela";
  const showXSetupHelp = isXProfileProviderError(errorDetail);
  const initialError = !isSupabaseConfigured() || Boolean(errorKey);
  const status: "loading" | "error" = initialError ? "error" : "loading";

  useEffect(() => {
    if (initialError) {
      return;
    }

    const supabase = createClient();

    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.replace(nextPath as Route);
        return;
      }
      void signInWithX(nextPath).then(({ error }) => {
        if (error) {
          router.replace(`/login?error=auth&reason=${encodeURIComponent(error)}`);
        }
      });
    });
  }, [initialError, nextPath, router]);

  if (status === "error") {
    const errorMessage = errorKey ? (ERROR_MESSAGES[errorKey] ?? ERROR_MESSAGES.auth) : ERROR_MESSAGES.config;

    return (
      <div className="mx-auto max-w-md space-y-4 text-center">
        <p className="rounded-lg border border-[#981915]/30 bg-[#981915]/10 px-4 py-3 text-sm font-medium text-[#981915]">
          {errorMessage}
          {errorDetail ? <span className="mt-2 block text-xs font-normal opacity-90">Detalle: {errorDetail}</span> : null}
        </p>
        {showXSetupHelp ? (
          <p className="text-xs leading-6 text-slate-600">
            Revisa en developer.x.com: User authentication → Request email from users, y Client ID/Secret OAuth 2.0 en
            Supabase.
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => void signInWithX(nextPath)}
          className="rounded-full bg-[#214C9B] px-6 py-3 text-sm font-extrabold uppercase text-white"
        >
          Reintentar con X
        </button>
      </div>
    );
  }

  return (
    <p className="text-center text-sm font-medium text-slate-600">Redirigiendo a X para iniciar sesión…</p>
  );
}
