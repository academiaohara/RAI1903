import Link from "next/link";
import { TransferFichaCard } from "@/components/fichajes/TransferFichaCard";
import { PageHero } from "@/components/PageHero";
import { getFeaturedTransfers } from "@/lib/fichajes";
import type { Route } from "next";

export default function FichajesPage() {
  const featured = getFeaturedTransfers();

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Mercado"
        title="Fichajes y renovaciones"
        description="Altas oficiales y renovaciones del Real Aviles Industrial. Pulsa una ficha para ver comunicados, prensa y datos del jugador."
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {featured.map((transfer, index) => (
          <TransferFichaCard key={transfer.id} transfer={transfer} index={index} layout="grid" />
        ))}
      </div>
      <Link href={"/" as Route} className="inline-flex text-sm font-bold uppercase tracking-normal text-[#214C9B] hover:underline">
        Volver al inicio
      </Link>
    </div>
  );
}
