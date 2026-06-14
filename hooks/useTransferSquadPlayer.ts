"use client";

import { useMemo } from "react";
import { useSeason } from "@/components/season/SeasonProvider";
import { useSquadPlayers } from "@/hooks/useSquadPlayers";
import { getSquadPlayerForTransfer } from "@/lib/fichajes";
import type { TransferRumor } from "@/types";
import type { SquadPlayer } from "@/types/squad";

/** Plantilla del movimiento según su temporada CMS (no la temporada visualizada). */
export function useTransferSquadPlayer(transfer: TransferRumor | undefined): SquadPlayer | undefined {
  const {
    viewedSeasonId,
    transferSquadsBySeasonId,
    resolveTransferSeasonIdForTransfer,
    getTransferSquadForSeason,
  } = useSeason();
  const { squad: viewedSquad } = useSquadPlayers("masculino");

  return useMemo(() => {
    if (!transfer) return undefined;

    const seasonId = resolveTransferSeasonIdForTransfer(transfer);
    const seasonSquad = getTransferSquadForSeason(seasonId);
    const squad =
      seasonSquad.length > 0
        ? seasonSquad
        : seasonId === viewedSeasonId
          ? viewedSquad
          : transferSquadsBySeasonId[seasonId] ?? [];

    return getSquadPlayerForTransfer(transfer, squad);
  }, [
    getTransferSquadForSeason,
    resolveTransferSeasonIdForTransfer,
    transfer,
    transferSquadsBySeasonId,
    viewedSeasonId,
    viewedSquad,
  ]);
}
