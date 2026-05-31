import type { Metadata } from "next";
import Link from "next/link";
import { TwitterLoginButton } from "@/components/auth/TwitterLoginButton";
import { Card } from "@/components/Card";
import { PageHero } from "@/components/PageHero";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Entrar | RAI1903",
  description: "Inicia sesión con tu cuenta de X para guardar pronósticos y participar en la quiniela.",
};

const ERROR_MESSAGES: Record<string, string> = {
  auth: "No se pudo completar el inicio de sesión. Vuelve a intentarlo.",
  config: "Supabase no está configurado en este entorno.",
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorKey = params.error;
  const errorMessage = errorKey ? ERROR_MESSAGES[errorKey] : undefined;
  const nextPath = params.next?.startsWith("/") ? params.next : "/quiniela";
  const configured = isSupabaseConfigured();

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
              <p className="rounded-lg border border-[#981915]/30 bg-[#981915]/10 px-4 py-3 text-sm font-medium text-[#981915]">
                {errorMessage}
              </p>
            ) : null}
            <TwitterLoginButton nextPath={nextPath} />
            <p className="text-center text-xs leading-6 text-slate-500">
              En Supabase debes tener activado el proveedor <strong>X / Twitter (OAuth 2.0)</strong> y la URL de
              callback de tu
              despliegue en Authentication → URL Configuration.
            </p>
          </div>
        )}
        <p className="mt-6 text-center text-sm text-slate-600">
          <Link href="/" className="font-bold text-[#214C9B] underline-offset-2 hover:underline">
            Volver al inicio
          </Link>
        </p>
      </Card>
    </div>
  );
}
