"use client";

import { useMemo } from "react";
import { useTransferMarketEditOptional } from "@/components/editor/TransferMarketEditProvider";
import { useSeason } from "@/components/season/SeasonProvider";
import { getSquadBundle, getTransfersBundle, type SeasonBundlesMap } from "@/lib/cms/season-bundles";
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
import { shouldUseMockCompetitionFallback } from "@/lib/season/cms-data-policy";
import { resolveTransfersFromBundles, seasonTransfersBundlePayload, transfersFromBundle } from "@/lib/season/transfer-source";
import { resolveTransferMarketWindows } from "@/lib/transfer-market-windows";
import type { TransferMarketWindowId, TransferRumor } from "@/types";

function transfersForViewedSeason(
  bundles: SeasonBundlesMap,
  bundlesLoading: boolean,
  effectiveTransfers: TransferRumor[],
): TransferRumor[] {
  const squadPlayers = getSquadBundle(bundles, "masculino")?.players ?? [];
  const fromBundle = resolveTransfersFromBundles(bundles, squadPlayers);
  if (fromBundle.length) {
    const ids = new Set(fromBundle.map((transfer) => transfer.id));
    return effectiveTransfers.filter((transfer) => ids.has(transfer.id));
  }
  if (shouldUseMockCompetitionFallback() && !bundlesLoading) {
    return effectiveTransfers;
  }
  return [];
}

export function useTransfers() {
  const { transfers, transfersLoading, bundles, bundlesLoading } = useSeason();
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

  const viewedSeasonTransfers = useMemo(
    () => transfersForViewedSeason(bundles, bundlesLoading, effectiveTransfers),
    [bundles, bundlesLoading, effectiveTransfers],
  );

  const viewedSeasonMarketWindows = useMemo(() => {
    const bundle = getTransfersBundle(bundles);
    return resolveTransferMarketWindows(bundle?.windows, bundle?.entries ?? []);
  }, [bundles]);

  return useMemo(
    () => ({
      transfers: effectiveTransfers,
      viewedSeasonTransfers,
      viewedSeasonMarketWindows,
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
      getOfficialAltas: (windowId?: TransferMarketWindowId) => getOfficialAltas(effectiveTransfers, windowId),
      getOfficialAltasForViewedSeason: (windowId?: TransferMarketWindowId) =>
        getOfficialAltas(viewedSeasonTransfers, windowId),
      hasAnyCarousel: () => hasAnyCarouselTransfers(effectiveTransfers),
      hasCarouselForWindow: (windowId: TransferMarketWindowId) =>
        hasCarouselTransfersForWindow(effectiveTransfers, windowId),
    }),
    [effectiveTransfers, transfersLoading, viewedSeasonMarketWindows, viewedSeasonTransfers],
  );
}

export type UseTransfersResult = ReturnType<typeof useTransfers>;
