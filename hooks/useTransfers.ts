"use client";

import { useMemo } from "react";
import { useTransferMarketEditOptional } from "@/components/editor/TransferMarketEditProvider";
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
import { seasonTransfersBundlePayload, transfersFromBundle } from "@/lib/season/transfer-source";
import type { TransferMarketWindowId } from "@/types";

export function useTransfers() {
  const { transfers, transfersLoading } = useSeason();
  const marketEdit = useTransferMarketEditOptional();

  const effectiveTransfers = useMemo(() => {
    if (!marketEdit?.hasDraft) return transfers;
    const draftTransfers = transfersFromBundle(
      seasonTransfersBundlePayload(marketEdit.entries),
      marketEdit.squad,
    );
    const viewedEntryIds = new Set(marketEdit.bundleEntries.map((entry) => entry.id));
    const fromOtherSeasons = transfers.filter((transfer) => !viewedEntryIds.has(transfer.id));
    return [...draftTransfers, ...fromOtherSeasons];
  }, [marketEdit, transfers]);

  return useMemo(
    () => ({
      transfers: effectiveTransfers,
      loading: transfersLoading,
      getById: (id: string) => getTransferById(effectiveTransfers, id),
      getForPlayer: (playerId: string) => getTransferForPlayer(effectiveTransfers, playerId),
      getAllCarousel: (windowId?: TransferMarketWindowId) => getAllCarouselTransfers(effectiveTransfers, windowId),
      getSigningCarousel: (windowId?: TransferMarketWindowId) =>
        getSigningCarouselTransfers(effectiveTransfers, windowId),
      getRenewalCarousel: (windowId?: TransferMarketWindowId) =>
        getRenewalCarouselTransfers(effectiveTransfers, windowId),
      getLoans: (windowId?: TransferMarketWindowId) => getLoanTransfers(effectiveTransfers, windowId),
      getByMode: (mode: TransferCarouselMode, windowId?: TransferMarketWindowId) =>
        getCarouselTransfersByMode(effectiveTransfers, mode, windowId),
      getFeatured: () => getFeaturedTransfers(effectiveTransfers),
      getOfficialAltas: () => getOfficialAltas(effectiveTransfers),
      hasAnyCarousel: () => hasAnyCarouselTransfers(effectiveTransfers),
      hasCarouselForWindow: (windowId: TransferMarketWindowId) =>
        hasCarouselTransfersForWindow(effectiveTransfers, windowId),
    }),
    [effectiveTransfers, transfersLoading],
  );
}

export type UseTransfersResult = ReturnType<typeof useTransfers>;
