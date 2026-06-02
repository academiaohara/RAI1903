import type { SeasonBundlesMap, SeasonTransfersBundle, CmsTransferEntry } from "@/lib/cms/season-bundles";
import { getTransfersBundle } from "@/lib/cms/season-bundles";
import { shouldUseMockCompetitionFallback } from "@/lib/season/cms-data-policy";
import { inferTransferKind } from "@/lib/fichajes-kind";
import type { TransferRumor } from "@/types";
import type { SquadPlayer } from "@/types/squad";

const RAI_CLUB = "Real Avilés Industrial";

function squadLookup(players: SquadPlayer[], playerId: string): SquadPlayer | undefined {
  return players.find((player) => player.id === playerId);
}

function entryToTransferRumor(entry: CmsTransferEntry, player: SquadPlayer | undefined): TransferRumor {
  const category = entry.kind === "renovacion" ? "Renovaciones" : "Altas";
  const playerName = player ? `${player.nombre} ${player.apellido}`.trim() : entry.playerId;

  return {
    id: entry.id,
    playerId: entry.playerId,
    playerName,
    position: player?.posicion ?? "Centrocampista",
    age: player?.edad ?? 0,
    category,
    status: "Oficial",
    probability: 100,
    source: "Club",
    date: entry.date,
    originClub: entry.kind === "renovacion" ? RAI_CLUB : entry.originClub,
    destinationClub: RAI_CLUB,
    rating: 4,
    analysis: entry.analysis ?? "",
    kind: entry.kind,
    clubAnnouncement: entry.clubAnnouncement,
    clubAnnouncementTitle: entry.clubAnnouncementTitle,
    clubAnnouncementExcerpt: entry.clubAnnouncementExcerpt,
    clubAnnouncementImageUrl: entry.clubAnnouncementImageUrl,
    clubAnnouncementDate: entry.clubAnnouncementDate,
    clubAnnouncementNewsId: entry.clubAnnouncementNewsId,
    marketWindowId: entry.marketWindowId,
  };
}

export function transfersFromBundle(
  bundle: SeasonTransfersBundle | null,
  squadPlayers: SquadPlayer[],
): TransferRumor[] {
  if (!bundle?.entries?.length) return [];
  return bundle.entries.map((entry) => entryToTransferRumor(entry, squadLookup(squadPlayers, entry.playerId)));
}

export function cmsEntryFromTransferRumor(transfer: TransferRumor): CmsTransferEntry | null {
  const playerId = transfer.playerId;
  if (!playerId) return null;

  const kind = inferTransferKind(transfer);

  return {
    id: transfer.id,
    playerId,
    kind,
    date: transfer.date,
    marketWindowId: transfer.marketWindowId,
    originClub: transfer.originClub,
    analysis: transfer.analysis,
    clubAnnouncement: transfer.clubAnnouncement,
    clubAnnouncementTitle: transfer.clubAnnouncementTitle,
    clubAnnouncementExcerpt: transfer.clubAnnouncementExcerpt,
    clubAnnouncementImageUrl: transfer.clubAnnouncementImageUrl,
    clubAnnouncementDate: transfer.clubAnnouncementDate,
    clubAnnouncementNewsId: transfer.clubAnnouncementNewsId,
  };
}

/** Resuelve movimientos CMS; el fallback mock lo aplica el llamador (evita import circular con data/mock). */
export function resolveTransfersFromBundles(
  bundles: SeasonBundlesMap,
  squadPlayers: SquadPlayer[],
  mockFallback?: TransferRumor[],
): TransferRumor[] {
  const bundle = getTransfersBundle(bundles);
  const fromCms = transfersFromBundle(bundle, squadPlayers);
  if (fromCms.length) return fromCms;

  if (shouldUseMockCompetitionFallback() && mockFallback?.length) return mockFallback;
  return [];
}

export function seasonTransfersBundlePayload(entries: CmsTransferEntry[]): SeasonTransfersBundle {
  return { entries };
}
