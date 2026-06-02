"use client";

import Link from "next/link";
import { TransferFichaCard } from "@/components/fichajes/TransferFichaCard";
import { TransferFichaCardPlaceholder } from "@/components/fichajes/TransferFichaCardPlaceholder";
import { PageHero } from "@/components/PageHero";
import { useSeason } from "@/components/season/SeasonProvider";
import { EMPTY_TRANSFER_FICHA_SLOT_COUNT } from "@/lib/fichajes-carousel";
import { useTransfers } from "@/hooks/useTransfers";
import type { Route } from "next";

export function FichajesPageClient() {
  const { viewedSeason } = useSeason();
  const { getOfficialAltas, loading } = useTransfers();
  const featured = getOfficialAltas();

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Mercado"
        title={`Fichajes ${viewedSeason.label}`}
        description={`Altas oficiales del Real Avilés Industrial en la temporada ${viewedSeason.label}: agentes libres y cesiones del mercado.`}
      />
      {loading ? (
        <p className="text-sm font-bold text-slate-500">Cargando mercado…</p>
      ) : featured.length === 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: EMPTY_TRANSFER_FICHA_SLOT_COUNT }, (_, index) => (
            <TransferFichaCardPlaceholder key={`empty-fichajes-${index}`} layout="grid" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {featured.map((transfer, index) => (
            <TransferFichaCard key={transfer.id} transfer={transfer} index={index} layout="grid" />
          ))}
        </div>
      )}
      <Link href={"/" as Route} className="inline-flex text-sm font-bold uppercase tracking-normal text-[#214C9B] hover:underline">
        Volver al inicio
      </Link>
    </div>
  );
}
