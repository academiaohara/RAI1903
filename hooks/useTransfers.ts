"use client";

import { useMemo } from "react";
import { useSeason } from "@/components/season/SeasonProvider";
import {
  getAllCarouselTransfers,
  getCarouselTransfersByMode,
  getFeaturedTransfers,
  getLoanTransfers,
  getOfficialAltas,
  getRenewalCarouselTransfers,
  getSigningCarouselTransfers,
  getTransferById,
  getTransferForPlayer,
  hasAnyCarouselTransfers,
  hasCarouselTransfersForWindow,
} from "@/lib/fichajes";
import type { TransferCarouselMode } from "@/lib/fichajes";
import type { TransferMarketWindowId } from "@/types";

export function useTransfers() {
  const { transfers, transfersLoading } = useSeason();

  return useMemo(
    () => ({
      transfers,
      loading: transfersLoading,
      getById: (id: string) => getTransferById(transfers, id),
      getForPlayer: (playerId: string) => getTransferForPlayer(transfers, playerId),
      getAllCarousel: (windowId?: TransferMarketWindowId) => getAllCarouselTransfers(transfers, windowId),
      getSigningCarousel: (windowId?: TransferMarketWindowId) => getSigningCarouselTransfers(transfers, windowId),
      getRenewalCarousel: (windowId?: TransferMarketWindowId) => getRenewalCarouselTransfers(transfers, windowId),
      getLoans: (windowId?: TransferMarketWindowId) => getLoanTransfers(transfers, windowId),
      getByMode: (mode: TransferCarouselMode, windowId?: TransferMarketWindowId) =>
        getCarouselTransfersByMode(transfers, mode, windowId),
      getFeatured: () => getFeaturedTransfers(transfers),
      getOfficialAltas: () => getOfficialAltas(transfers),
      hasAnyCarousel: () => hasAnyCarouselTransfers(transfers),
      hasCarouselForWindow: (windowId: TransferMarketWindowId) => hasCarouselTransfersForWindow(transfers, windowId),
    }),
    [transfers, transfersLoading],
  );
}

export type UseTransfersResult = ReturnType<typeof useTransfers>;
