"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { TransferDetailView } from "@/components/fichajes/TransferDetailView";
import { PageHero } from "@/components/PageHero";
import { useTransfers } from "@/hooks/useTransfers";
import { getSquadPlayerForTransfer, getTransferKind, getTransferKindLabel } from "@/lib/fichajes";
import { useSquadPlayers } from "@/hooks/useSquadPlayers";
import type { Route } from "next";

export function FichajeDetailPageClient({ transferId }: { transferId: string }) {
  const { getById, loading: transfersLoading } = useTransfers();
  const { squad, loading: squadLoading } = useSquadPlayers("masculino");
  const transfer = getById(transferId);

  if (!transfersLoading && !squadLoading && !transfer) notFound();
  if (!transfer || squadLoading) {
    return <p className="text-sm font-bold text-slate-500">Cargando ficha…</p>;
  }

  const player = getSquadPlayerForTransfer(transfer, squad);
  const kind = getTransferKind(transfer);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Mercado"
        title={getTransferKindLabel(kind)}
        description={`Seguimiento del movimiento de ${transfer.playerName}: comunicado oficial, noticias del jugador y ficha.`}
      />
      <TransferDetailView transfer={transfer} player={player} />
      <Link href={"/" as Route} className="inline-flex text-sm font-bold uppercase tracking-normal text-[#214C9B] hover:underline">
        Volver al inicio
      </Link>
    </div>
  );
}
