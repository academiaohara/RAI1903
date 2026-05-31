import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginAutoRedirect } from "@/components/auth/LoginAutoRedirect";
import { Card } from "@/components/Card";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Entrar | RAI1903",
  description: "Inicio de sesión con X.",
};

export default function LoginPage() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Cuenta"
        title="Entrar"
        description="Te redirigimos a X para identificarte. Si algo falla, podrás reintentar aquí."
      />

      <Card eyebrow="Acceso" title="Conectando con X">
        <Suspense fallback={<p className="text-center text-sm text-slate-600">Cargando…</p>}>
          <LoginAutoRedirect />
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
