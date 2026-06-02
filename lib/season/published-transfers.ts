import {
  fetchSeasonBundles,
  getSquadBundle,
  getTransfersBundle,
  type CmsTransferMarketWindow,
  type SeasonBundlesMap,
} from "@/lib/cms/season-bundles";
import type { CmsSeason } from "@/lib/cms/seasons";
import { shouldUseMockCompetitionFallback } from "@/lib/season/cms-data-policy";
import { getMockCarouselTransfers } from "@/lib/season/mock-transfers-bundle";
import { resolveTransfersFromBundles } from "@/lib/season/transfer-source";
import {
  mergeTransferMarketWindows,
  resolveTransferMarketWindows,
  type TransferMarketWindow,
} from "@/lib/transfer-market-windows";
import type { TransferRumor } from "@/types";

export type PublishedTransfersSnapshot = {
  transfers: TransferRumor[];
  marketWindows: TransferMarketWindow[];
};

function mergeSeasonTransferWindows(maps: SeasonBundlesMap[]): TransferMarketWindow[] {
  const configured: CmsTransferMarketWindow[] = [];
  const entries: Array<{ date: string; marketWindowId?: string }> = [];

  for (const map of maps) {
    const bundle = getTransfersBundle(map);
    if (!bundle) continue;
    if (bundle.windows?.length) configured.push(...bundle.windows);
    entries.push(...bundle.entries);
  }

  if (!configured.length && !entries.length) {
    return resolveTransferMarketWindows(null, []);
  }

  const base = configured.map((window) => ({ id: window.id, label: window.label }));
  return mergeTransferMarketWindows(base.length ? base : resolveTransferMarketWindows(null, []), entries);
}

export async function fetchPublishedTransfersSnapshot(
  publishedSeasons: CmsSeason[],
): Promise<PublishedTransfersSnapshot> {
  if (!publishedSeasons.length) {
    const mock = shouldUseMockCompetitionFallback() ? getMockCarouselTransfers() : [];
    return {
      transfers: mock,
      marketWindows: resolveTransferMarketWindows(null, mock),
    };
  }

  const maps = await Promise.all(publishedSeasons.map((season) => fetchSeasonBundles(season.id)));
  const transfers: TransferRumor[] = [];

  for (const map of maps) {
    const squadPlayers = getSquadBundle(map, "masculino")?.players ?? [];
    transfers.push(...resolveTransfersFromBundles(map, squadPlayers));
  }

  const marketWindows = mergeSeasonTransferWindows(maps);

  if (!transfers.length && shouldUseMockCompetitionFallback()) {
    const mock = getMockCarouselTransfers();
    return { transfers: mock, marketWindows: resolveTransferMarketWindows(null, mock) };
  }

  return { transfers, marketWindows };
}
