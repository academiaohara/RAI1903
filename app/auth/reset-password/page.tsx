import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Card } from "@/components/Card";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Nueva contraseña | RAI1903",
  description: "Restablece tu contraseña de acceso.",
};

export default function ResetPasswordPage() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Cuenta"
        title="Nueva contraseña"
        description="Elige una contraseña nueva para tu cuenta."
      />

      <Card eyebrow="Acceso" title="Restablecer contraseña">
        <Suspense fallback={<p className="text-center text-sm text-slate-600">Cargando…</p>}>
          <ResetPasswordForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-slate-600">
          <Link href="/login" prefetch={false} className="font-bold text-[#214C9B] underline-offset-2 hover:underline">
            Volver a entrar
          </Link>
        </p>
      </Card>
    </div>
  );
}
