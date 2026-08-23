"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { OAuthLoginButtons } from "@/components/auth/OAuthLoginButtons";
import { isXProfileProviderError } from "@/lib/auth/x-oauth";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const ERROR_MESSAGES: Record<string, string> = {
  auth: "No se pudo completar el inicio de sesión. Vuelve a intentarlo.",
  no_code: "El proveedor no devolvió el código de autorización. Revisa las Redirect URLs en Supabase.",
  config: "Supabase no está configurado en este entorno.",
};

export function LoginPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorKey = searchParams.get("error");
  const errorDetail = searchParams.get("reason")?.replace(/\+/g, " ");
  const nextPath = searchParams.get("next")?.startsWith("/") ? searchParams.get("next")! : "/quiniela";
  const showXSetupHelp = isXProfileProviderError(errorDetail);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) return;

    const supabase = createClient();
    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.replace(nextPath as Route);
      }
    });
  }, [configured, nextPath, router]);

  if (!configured) {
    return (
      <p className="rounded-lg border border-[#981915]/30 bg-[#981915]/10 px-4 py-3 text-center text-sm font-medium text-[#981915]">
        {ERROR_MESSAGES.config}
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      {errorKey ? (
        <p className="rounded-lg border border-[#981915]/30 bg-[#981915]/10 px-4 py-3 text-center text-sm font-medium text-[#981915]">
          {ERROR_MESSAGES[errorKey] ?? ERROR_MESSAGES.auth}
          {errorDetail ? <span className="mt-2 block text-xs font-normal opacity-90">Detalle: {errorDetail}</span> : null}
        </p>
      ) : null}

      {showXSetupHelp ? (
        <p className="text-center text-xs leading-6 text-slate-600">
          Revisa en developer.x.com: User authentication → Request email from users, y Client ID/Secret OAuth 2.0 en
          Supabase.
        </p>
      ) : null}

      <OAuthLoginButtons nextPath={nextPath} />
    </div>
  );
}
