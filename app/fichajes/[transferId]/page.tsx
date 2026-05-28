import Link from "next/link";
import { notFound } from "next/navigation";
import { TransferDetailView } from "@/components/fichajes/TransferDetailView";
import { PageHero } from "@/components/PageHero";
import { getSquadPlayerForTransfer, getTransferById, getTransferKindLabel, getTransferKind } from "@/lib/fichajes";
import type { Route } from "next";

export default async function FichajeDetailPage({ params }: { params: Promise<{ transferId: string }> }) {
  const { transferId } = await params;
  const transfer = getTransferById(transferId);

  if (!transfer) notFound();

  const player = getSquadPlayerForTransfer(transfer);
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
