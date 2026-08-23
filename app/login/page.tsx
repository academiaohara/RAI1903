import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginPanel } from "@/components/auth/LoginPanel";
import { Card } from "@/components/Card";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Entrar | RAI1903",
  description: "Inicia sesión con tu usuario o con X.",
};

export default function LoginPage() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Cuenta"
        title="Entrar"
        description="Regístrate con nombre de usuario y contraseña, o continúa con tu cuenta de X."
      />

      <Card eyebrow="Acceso" title="Tu cuenta">
        <Suspense fallback={<p className="text-center text-sm text-slate-600">Cargando…</p>}>
          <LoginPanel />
        </Suspense>
        <p className="mt-6 text-center text-sm text-slate-600">
          <Link href="/" prefetch={false} className="font-bold text-[#214C9B] underline-offset-2 hover:underline">
            Volver al inicio
          </Link>
        </p>
      </Card>
    </div>
  );
}
