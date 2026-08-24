import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountPanel } from "@/components/auth/AccountPanel";
import { Card } from "@/components/Card";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Mi cuenta | RAI1903",
  description: "Gestiona tu cuenta y cambia tu contraseña.",
};

export default function AccountPage() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Cuenta"
        title="Mi cuenta"
        description="Consulta tus datos, boletos y cambia tu contraseña cuando lo necesites."
      />

      <Card eyebrow="Perfil" title="Ajustes">
        <Suspense fallback={<p className="text-center text-sm text-slate-600">Cargando…</p>}>
          <AccountPanel />
        </Suspense>
      </Card>
    </div>
  );
}
