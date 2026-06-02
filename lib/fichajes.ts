import { players, transfers as mockTransfers } from "@/data/mock";
import { inferTransferKind, isLegacyLoanTransfer } from "@/lib/fichajes-kind";
import { parseClubAnnouncementField } from "@/lib/club-announcement";
import {
  getPlayerClubAnnouncementNews,
  getPlayerNews,
  getPlayerNewsByName,
} from "@/lib/player-news";
import { getPlayerRole } from "@/lib/player-roles";
import { getSquadPlayers } from "@/lib/squad-data";
import { getSquadPlayerPhoto, withSquadPlayerPhoto } from "@/lib/squad-photos";
import { resolveTransferMarketWindowId } from "@/lib/transfer-market-windows";
import type { NewsItem, Player, TransferKind, TransferMarketWindowId, TransferRumor } from "@/types";
import type { SquadPlayer } from "@/types/squad";

const RAI_CLUB = "Real Avilés Industrial";

export function isLoanTransfer(transfer: TransferRumor): boolean {
  return inferTransferKind(transfer) === "cesion";
}

function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

function getPlayerFullName(player: Player): string {
  return `${player.firstName} ${player.lastName}`.trim();
}

function dorsalFromTransferPlayerId(playerId: string): number | null {
  const match = playerId.match(/-d(\d+)$/i);
  if (!match) return null;
  const dorsal = Number(match[1]);
  return Number.isFinite(dorsal) ? dorsal : null;
}

function squadPlayerMatchesTransferName(player: SquadPlayer, transferName: string): boolean {
  const normalized = normalizeName(transferName);
  const full = normalizeName(`${player.nombre} ${player.apellido}`.trim());
  const shortName = normalizeName(player.apellido || player.nombre);

  if (full === normalized || shortName === normalized) return true;

  const tokens = normalized.split(/\s+/).filter(Boolean);
  if (tokens.length >= 2) {
    const lastName = tokens[tokens.length - 1]!;
    const firstNames = tokens.slice(0, -1).join(" ");
    if (normalizeName(player.apellido) === lastName && normalizeName(player.nombre) === firstNames) {
      return true;
    }
  }

  return Boolean(shortName && normalized.includes(shortName));
}

function findSquadPlayerInList(transfer: TransferRumor, squadList: SquadPlayer[]): SquadPlayer | undefined {
  const playerId = transfer.playerId ?? resolveTransferPlayerId(transfer);

  if (playerId) {
    const byId = squadList.find((player) => player.id === playerId);
    if (byId) return byId;

    const dorsal = dorsalFromTransferPlayerId(playerId);
    if (dorsal != null) {
      const byDorsal = squadList.find((player) => player.dorsal === dorsal);
      if (byDorsal) return byDorsal;
    }
  }

  const byName = squadList.find((player) => squadPlayerMatchesTransferName(player, transfer.playerName));
  if (byName) return byName;

  const rosterPlayer = getRosterPlayerForTransfer(transfer);
  if (rosterPlayer) {
    const byDorsal = squadList.find((player) => player.dorsal === rosterPlayer.number);
    return byDorsal ?? rosterPlayerToSquadPlayer(rosterPlayer);
  }

  return undefined;
}

function getRosterPlayerForTransfer(transfer: TransferRumor): Player | undefined {
  if (transfer.playerId) {
    const dorsal = dorsalFromTransferPlayerId(transfer.playerId);
    if (dorsal != null) {
      const byNumber = players.find((player) => player.number === dorsal);
      if (byNumber) return byNumber;
    }

    const byId = players.find((player) => player.id === transfer.playerId);
    if (byId) return byId;
  }

  const normalized = normalizeName(transfer.playerName);
  return players.find((player) => {
    const full = normalizeName(getPlayerFullName(player));
    const displayName = normalizeName(player.displayName);
    return full === normalized || displayName === normalized || normalized.includes(displayName);
  });
}

function rosterPlayerToSquadPlayer(player: Player): SquadPlayer {
  const contractYear = player.seasonsAtClub >= 4 ? 2027 : 2026;

  return {
    id: player.id,
    nombre: player.firstName,
    apellido: player.lastName,
    dorsal: player.number,
    posicion: player.position,
    rol: getPlayerRole(player),
    estado: player.status,
    edad: player.age,
    fechaNacimiento: player.birthDate,
    lugarNacimiento: "Avilés",
    nacionalidad: player.nationality,
    altura: player.height,
    peso: "76 kg",
    piernaBuena: player.preferredFoot,
    contratoHasta: `${contractYear}-06-30`,
    valorMercado: null,
    descripcion: player.bio,
    foto: getSquadPlayerPhoto(player.number),
    partidos: player.stats.appearances,
    minutos: player.stats.minutes,
    goles: player.stats.goals,
    asistencias: player.stats.assists,
    amarillas: player.stats.yellowCards,
    rojas: player.stats.redCards,
    historialPartidos: [],
    trayectoria: player.clubHistory.map((club) => ({
      temporada: club === RAI_CLUB ? "2025/26" : "Trayectoria",
      club,
      partidos: club === RAI_CLUB ? player.stats.appearances : 0,
      goles: club === RAI_CLUB ? player.stats.goals : 0,
      asistencias: club === RAI_CLUB ? player.stats.assists : 0,
    })),
  };
}

export function getTransferKind(transfer: TransferRumor): TransferKind {
  return inferTransferKind(transfer);
}

export function getTransferKindLabel(kind: TransferKind): string {
  if (kind === "renovacion") return "Renovacion";
  if (kind === "cesion") return "Cesion";
  return "Fichaje";
}

export function getTransferById(transfers: TransferRumor[], id: string): TransferRumor | undefined {
  return transfers.find((transfer) => transfer.id === id);
}

export function resolveTransferPlayerId(transfer: TransferRumor): string | undefined {
  if (transfer.playerId) return transfer.playerId;

  const normalized = normalizeName(transfer.playerName);
  const match = players.find((player) => {
    const full = normalizeName(getPlayerFullName(player));
    return full === normalized || normalizeName(player.displayName) === normalized;
  });
  return match?.id;
}

export function getSquadPlayerForTransfer(
  transfer: TransferRumor,
  squad?: SquadPlayer[],
): SquadPlayer | undefined {
  const importSquad = getSquadPlayers("masculino");
  const primaryList = squad?.length ? squad : importSquad;

  const player =
    findSquadPlayerInList(transfer, primaryList) ??
    (squad?.length ? findSquadPlayerInList(transfer, importSquad) : undefined);

  return player ? withSquadPlayerPhoto(player) : undefined;
}

export type TransferCarouselMode = "todos" | "fichajes" | "renovaciones" | "cesiones";

function sortTransfersByDate(items: TransferRumor[]): TransferRumor[] {
  return [...items].sort((a, b) => b.date.localeCompare(a.date));
}

function belongsToMarketWindow(transfer: TransferRumor, windowId: TransferMarketWindowId): boolean {
  return resolveTransferMarketWindowId(transfer) === windowId;
}

function filterByMarketWindow(items: TransferRumor[], windowId?: TransferMarketWindowId): TransferRumor[] {
  if (!windowId) return items;
  return items.filter((transfer) => belongsToMarketWindow(transfer, windowId));
}

function isOfficialMarketTransfer(transfer: TransferRumor): boolean {
  if (transfer.category === "Bajas") return false;
  return (
    (transfer.category === "Altas" || transfer.category === "Renovaciones") && transfer.status === "Oficial"
  );
}

function officialMarketTransfers(transfers: TransferRumor[]): TransferRumor[] {
  return transfers.filter(isOfficialMarketTransfer);
}

/** Todos los movimientos oficiales del carrusel de inicio (altas, renovaciones y cesiones). */
export function getAllCarouselTransfers(
  transfers: TransferRumor[],
  windowId?: TransferMarketWindowId,
): TransferRumor[] {
  return sortTransfersByDate(filterByMarketWindow(officialMarketTransfers(transfers), windowId));
}

/** Altas oficiales en propiedad (agente libre u otro), sin cesiones. */
export function getSigningCarouselTransfers(
  transfers: TransferRumor[],
  windowId?: TransferMarketWindowId,
): TransferRumor[] {
  return sortTransfersByDate(
    filterByMarketWindow(
      transfers.filter(
        (transfer) =>
          transfer.category === "Altas" &&
          transfer.status === "Oficial" &&
          getTransferKind(transfer) === "fichaje",
      ),
      windowId,
    ),
  );
}

/** Renovaciones oficiales del carrusel de inicio. */
export function getRenewalCarouselTransfers(
  transfers: TransferRumor[],
  windowId?: TransferMarketWindowId,
): TransferRumor[] {
  return sortTransfersByDate(
    filterByMarketWindow(
      transfers.filter(
        (transfer) => transfer.category === "Renovaciones" && transfer.status === "Oficial",
      ),
      windowId,
    ),
  );
}

/** Jugadores cedidos al club. */
export function getLoanTransfers(transfers: TransferRumor[], windowId?: TransferMarketWindowId): TransferRumor[] {
  return sortTransfersByDate(
    filterByMarketWindow(
      transfers.filter((transfer) => getTransferKind(transfer) === "cesion" && transfer.status === "Oficial"),
      windowId,
    ),
  );
}

export function hasCarouselTransfersForWindow(transfers: TransferRumor[], windowId: TransferMarketWindowId): boolean {
  return getAllCarouselTransfers(transfers, windowId).length > 0;
}

export function hasAnyCarouselTransfers(transfers: TransferRumor[]): boolean {
  return getAllCarouselTransfers(transfers).length > 0;
}

export function getCarouselTransfersByMode(
  transfers: TransferRumor[],
  mode: TransferCarouselMode,
  windowId?: TransferMarketWindowId,
): TransferRumor[] {
  switch (mode) {
    case "todos":
      return getAllCarouselTransfers(transfers, windowId);
    case "fichajes":
      return getSigningCarouselTransfers(transfers, windowId);
    case "renovaciones":
      return getRenewalCarouselTransfers(transfers, windowId);
    case "cesiones":
      return getLoanTransfers(transfers, windowId);
  }
}

/** Altas oficiales y renovaciones para carrusel de inicio (sin cesiones). */
export function getFeaturedTransfers(transfers: TransferRumor[]): TransferRumor[] {
  return sortTransfersByDate([
    ...getSigningCarouselTransfers(transfers),
    ...getRenewalCarouselTransfers(transfers),
  ]);
}

/** Todas las altas oficiales (sin salidas ni rumores). */
export function getOfficialAltas(
  transfers: TransferRumor[],
  windowId?: TransferMarketWindowId,
): TransferRumor[] {
  return sortTransfersByDate(
    filterByMarketWindow(
      transfers.filter((transfer) => transfer.category === "Altas" && transfer.status === "Oficial"),
      windowId,
    ),
  );
}

export function getTransferForPlayer(transfers: TransferRumor[], playerId: string): TransferRumor | undefined {
  return transfers.find((transfer) => {
    if (transfer.playerId === playerId) return true;
    return resolveTransferPlayerId(transfer) === playerId;
  });
}

export function getTransferClubAnnouncementNews(
  transfer: TransferRumor,
  allNews: NewsItem[],
): NewsItem | undefined {
  if (transfer.clubAnnouncementNewsId) {
    return getPlayerClubAnnouncementNews(allNews, transfer.playerId ?? "", {
      announcementNewsId: transfer.clubAnnouncementNewsId,
      playerName: transfer.playerName,
    });
  }

  const parsed = parseClubAnnouncementField(transfer.clubAnnouncement);
  if (parsed.url) {
    return undefined;
  }

  const playerId = resolveTransferPlayerId(transfer);
  if (!playerId) return undefined;

  return getPlayerClubAnnouncementNews(allNews, playerId, {
    playerName: transfer.playerName,
  });
}

export function getTransferPlayerNews(transfer: TransferRumor, allNews: NewsItem[]): NewsItem[] {
  const announcement = getTransferClubAnnouncementNews(transfer, allNews);
  const playerId = resolveTransferPlayerId(transfer);

  if (playerId) {
    return getPlayerNews(allNews, playerId, {
      excludeNewsId: announcement?.id,
      playerName: transfer.playerName,
    });
  }

  return getPlayerNewsByName(allNews, transfer.playerName, announcement?.id);
}

export function getTransferOriginClub(transfer: TransferRumor): string {
  if (getTransferKind(transfer) === "renovacion") return RAI_CLUB;
  return transfer.originClub ?? "—";
}

export function getTransferDisplayName(transfer: TransferRumor, squad?: SquadPlayer[]): string {
  const squadPlayer = getSquadPlayerForTransfer(transfer, squad);
  if (squadPlayer) return `${squadPlayer.nombre} ${squadPlayer.apellido}`;
  return transfer.playerName;
}

/** Mock completo (rumores incluidos); usar resolveTransfersFromBundles en la app. */
export function getMockTransfersCatalog(): TransferRumor[] {
  return mockTransfers;
}

export { isLegacyLoanTransfer };
