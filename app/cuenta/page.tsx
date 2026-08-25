import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountPanel, AccountPanelSkeleton } from "@/components/auth/AccountPanel";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Mi cuenta | RAI1903",
  description: "Tu carnet blanquiazul: perfil, pronósticos de los juegos y ajustes de acceso.",
};

export default function AccountPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHero
        eyebrow="Cuenta"
        title="Mi cuenta"
        description="Tu carnet blanquiazul: consulta tu posición en los juegos, tu nombre público y tus ajustes de acceso."
      />

      <Suspense fallback={<AccountPanelSkeleton />}>
        <AccountPanel />
      </Suspense>
    </div>
  );
}
