import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountPanel, AccountPanelSkeleton } from "@/components/auth/AccountPanel";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Mi cuenta | RAI1903",
  description: "Perfil, pronósticos de los juegos y nombre público.",
};

export default function AccountPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHero
        eyebrow="Cuenta"
        title="Mi cuenta"
        description="Tu equipo, tu nombre y tu posición en los juegos."
      />

      <Suspense fallback={<AccountPanelSkeleton />}>
        <AccountPanel />
      </Suspense>
    </div>
  );
}
