import { transfers as mockTransfers } from "@/data/mock";
import type { SeasonBundlesMap, SeasonTransfersBundle, CmsTransferEntry } from "@/lib/cms/season-bundles";
import { getSquadBundle, getTransfersBundle } from "@/lib/cms/season-bundles";
import { shouldUseMockCompetitionFallback } from "@/lib/season/cms-data-policy";
import { inferTransferKind } from "@/lib/fichajes-kind";
import { getSquadPlayers } from "@/lib/squad-data";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { TransferRumor } from "@/types";
import type { SquadPlayer } from "@/types/squad";

const RAI_CLUB = "Real Avilés Industrial";
const DEFAULT_GENDER: PrimerEquipoGender = "masculino";

function isCarouselTransfer(transfer: TransferRumor): boolean {
  if (transfer.category === "Bajas") return false;
  if (transfer.status !== "Oficial") return false;
  return transfer.category === "Altas" || transfer.category === "Renovaciones";
}

function mockCarouselTransfers(): TransferRumor[] {
  return mockTransfers.filter(isCarouselTransfer);
}

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
    clubAnnouncementNewsId: transfer.clubAnnouncementNewsId,
  };
}

export function buildMockTransfersBundle(): SeasonTransfersBundle {
  const entries = mockCarouselTransfers()
    .map((transfer) => cmsEntryFromTransferRumor(transfer))
    .filter((entry): entry is CmsTransferEntry => entry !== null);
  return { entries };
}

export function resolveTransfersFromBundles(
  bundles: SeasonBundlesMap,
  gender: PrimerEquipoGender = DEFAULT_GENDER,
): TransferRumor[] {
  const bundle = getTransfersBundle(bundles);
  const squadBundle = getSquadBundle(bundles, gender);
  const squadPlayers = squadBundle?.players?.length ? squadBundle.players : getSquadPlayers(gender);

  const fromCms = transfersFromBundle(bundle, squadPlayers);
  if (fromCms.length) return fromCms;

  if (shouldUseMockCompetitionFallback()) return mockCarouselTransfers();
  return [];
}

export function seasonTransfersBundlePayload(entries: CmsTransferEntry[]): SeasonTransfersBundle {
  return { entries };
}
