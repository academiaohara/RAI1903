import {
  fetchSeasonBundles,
  getSquadBundle,
  getTransfersBundle,
  type CmsTransferMarketWindow,
  type SeasonBundlesMap,
} from "@/lib/cms/season-bundles";
import type { CmsSeason } from "@/lib/cms/seasons";
import { DEFAULT_COMPETITION_SEASON_ID } from "@/data/mock";
import { shouldUseMockCompetitionFallback } from "@/lib/season/cms-data-policy";
import { getMockCarouselTransfers } from "@/lib/season/mock-transfers-bundle";
import { resolveTransfersFromBundles } from "@/lib/season/transfer-source";
import { withSquadPlayerPhoto } from "@/lib/squad-photos";
import {
  mergeTransferMarketWindows,
  resolveTransferMarketWindows,
  type TransferMarketWindow,
} from "@/lib/transfer-market-windows";
import type { TransferRumor } from "@/types";
import type { SquadPlayer } from "@/types/squad";

export type PublishedTransfersSnapshot = {
  transfers: TransferRumor[];
  marketWindows: TransferMarketWindow[];
  /** Plantilla masculina por temporada (para fotos de fichajes). */
  squadsBySeasonId: Record<string, SquadPlayer[]>;
  /** Bundles cargados al publicar el mercado (evita recargas por temporada). */
  bundlesBySeasonId: Record<string, SeasonBundlesMap>;
};

function mergeSeasonTransferWindows(maps: SeasonBundlesMap[]): TransferMarketWindow[] {
  const configuredById = new Map<string, CmsTransferMarketWindow>();
  const entries: Array<{ date: string; marketWindowId?: string }> = [];

  for (const map of maps) {
    const bundle = getTransfersBundle(map);
    if (!bundle) continue;
    for (const window of bundle.windows ?? []) {
      if (!configuredById.has(window.id)) configuredById.set(window.id, window);
    }
    entries.push(...bundle.entries);
  }
  const configured = [...configuredById.values()];

  if (!configured.length && !entries.length) {
    return resolveTransferMarketWindows(null, []);
  }

  const base = configured.map((window) => ({ id: window.id, label: window.label }));
  return mergeTransferMarketWindows(base.length ? base : resolveTransferMarketWindows(null, []), entries);
}

function enrichSquadForTransfers(players: SquadPlayer[]): SquadPlayer[] {
  return players.map(withSquadPlayerPhoto);
}

export async function fetchPublishedTransfersSnapshot(
  publishedSeasons: CmsSeason[],
): Promise<PublishedTransfersSnapshot> {
  if (!publishedSeasons.length) {
    const mock = shouldUseMockCompetitionFallback() ? getMockCarouselTransfers() : [];
    const mockWithSeason = mock.map((transfer) => ({
      ...transfer,
      seasonId: transfer.seasonId ?? DEFAULT_COMPETITION_SEASON_ID,
    }));
    return {
      transfers: mockWithSeason,
      marketWindows: resolveTransferMarketWindows(null, mockWithSeason),
      squadsBySeasonId: {},
      bundlesBySeasonId: {},
    };
  }

  const maps = await Promise.all(publishedSeasons.map((season) => fetchSeasonBundles(season.id)));
  const transfers: TransferRumor[] = [];
  const squadsBySeasonId: Record<string, SquadPlayer[]> = {};
  const bundlesBySeasonId: Record<string, SeasonBundlesMap> = {};

  for (let index = 0; index < maps.length; index += 1) {
    const season = publishedSeasons[index]!;
    const map = maps[index]!;
    bundlesBySeasonId[season.id] = map;

    const squadPlayers = getSquadBundle(map, "masculino")?.players ?? [];
    if (squadPlayers.length) {
      squadsBySeasonId[season.id] = enrichSquadForTransfers(squadPlayers);
    }

    const seasonTransfers = resolveTransfersFromBundles(map, squadPlayers).map((transfer) => ({
      ...transfer,
      seasonId: season.id,
    }));
    transfers.push(...seasonTransfers);
  }

  const marketWindows = mergeSeasonTransferWindows(maps);

  if (!transfers.length && shouldUseMockCompetitionFallback()) {
    const mock = getMockCarouselTransfers().map((transfer) => ({
      ...transfer,
      seasonId: transfer.seasonId ?? DEFAULT_COMPETITION_SEASON_ID,
    }));
    return {
      transfers: mock,
      marketWindows: resolveTransferMarketWindows(null, mock),
      squadsBySeasonId,
      bundlesBySeasonId,
    };
  }

  return { transfers, marketWindows, squadsBySeasonId, bundlesBySeasonId };
}
