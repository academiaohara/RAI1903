import type { Metadata } from "next";
import Link from "next/link";
import { TwitterLoginButton } from "@/components/auth/TwitterLoginButton";
import { Card } from "@/components/Card";
import { PageHero } from "@/components/PageHero";
import { isXProfileProviderError } from "@/lib/auth/x-oauth";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Entrar | RAI1903",
  description: "Inicia sesión con tu cuenta de X para guardar pronósticos y participar en la quiniela.",
};

const ERROR_MESSAGES: Record<string, string> = {
  auth: "No se pudo completar el inicio de sesión. Vuelve a intentarlo.",
  no_code: "X no devolvió el código de autorización. Revisa las Redirect URLs en Supabase.",
  config: "Supabase no está configurado en este entorno.",
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string; reason?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorKey = params.error;
  const errorMessage = errorKey ? ERROR_MESSAGES[errorKey] ?? ERROR_MESSAGES.auth : undefined;
  const errorDetail = params.reason?.replace(/\+/g, " ");
  const nextPath = params.next?.startsWith("/") ? params.next : "/quiniela";
  const configured = isSupabaseConfigured();
  const showXSetupHelp = isXProfileProviderError(errorDetail);

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Cuenta"
        title="Entrar"
        description="Usa tu cuenta de X (Twitter) para identificarte. Así podremos guardar tus pronósticos de quiniela en la nube (próximo paso)."
      />

      <Card eyebrow="Acceso" title="Iniciar sesión con X">
        {!configured ? (
          <p className="text-sm leading-7 text-slate-600">
            Faltan las variables <code className="text-[#214C9B]">NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
            <code className="text-[#214C9B]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en Vercel o en{" "}
            <code className="text-[#214C9B]">.env.local</code>.
          </p>
        ) : (
          <div className="mx-auto max-w-md space-y-4">
            {errorMessage ? (
              <div className="rounded-lg border border-[#981915]/30 bg-[#981915]/10 px-4 py-3 text-sm font-medium text-[#981915]">
                <p>{errorMessage}</p>
                {errorDetail ? (
                  <p className="mt-2 text-xs font-normal opacity-90">Detalle: {errorDetail}</p>
                ) : null}
              </div>
            ) : null}
            <TwitterLoginButton nextPath={nextPath} />
            {showXSetupHelp ? (
              <div className="rounded-lg border border-[#214C9B]/20 bg-blue-50 px-4 py-3 text-left text-xs leading-6 text-slate-700">
                <p className="font-bold text-[#214C9B]">Si ves «Error getting user profile…»:</p>
                <ol className="mt-2 list-decimal space-y-1 pl-4">
                  <li>
                    En <strong>developer.x.com → tu app → User authentication</strong>, activa{" "}
                    <strong>Request email from users</strong> y tipo <strong>Web App</strong>. Guarda.
                  </li>
                  <li>
                    Usa <strong>Client ID</strong> y <strong>Client Secret</strong> de OAuth 2.0 (no Consumer Key ni
                    Access Token).
                  </li>
                  <li>
                    En la cuenta de X con la que pruebas: Ajustes → Email y confirma que hay email. Si cambiaste la app,
                    revoca el acceso en X y vuelve a entrar.
                  </li>
                  <li>
                    Supabase: <strong>Allow users without an email</strong> activado (ya lo tienes).
                  </li>
                </ol>
              </div>
            ) : null}
            <p className="text-center text-xs leading-6 text-slate-500">
              En Supabase debes tener activado el proveedor <strong>X / Twitter (OAuth 2.0)</strong> y la URL de
              callback de tu despliegue en Authentication → URL Configuration.
            </p>
          </div>
        )}
        <p className="mt-6 text-center text-sm text-slate-600">
          <Link href="/" prefetch={false} className="font-bold text-[#214C9B] underline-offset-2 hover:underline">
            Volver al inicio
          </Link>
        </p>
      </Card>
    </div>
  );
}
