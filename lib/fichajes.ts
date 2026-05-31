import { players, transfers } from "@/data/mock";
import {
  getPlayerClubAnnouncementNews,
  getPlayerNews,
  getPlayerNewsByName,
} from "@/lib/player-news";
import { getPlayerRole } from "@/lib/player-roles";
import { getSquadPlayers } from "@/lib/squad-data";
import { getSquadPlayerPhoto } from "@/lib/squad-photos";
import type { NewsItem, Player, TransferKind, TransferRumor } from "@/types";
import type { SquadPlayer } from "@/types/squad";

const RAI_CLUB = "Real Avilés Industrial";

/** Altas en calidad de cedidos (carrusel de cesiones en inicio). */
export const LOAN_TRANSFER_IDS = new Set([
  "t-alt-eze",
  "t-alt-uzkudun",
  "t-alt-nando",
  "t-alt-ortega",
]);

export function isLoanTransfer(transfer: TransferRumor): boolean {
  return LOAN_TRANSFER_IDS.has(transfer.id);
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

function getRosterPlayerForTransfer(transfer: TransferRumor): Player | undefined {
  if (transfer.playerId) {
    const byId = players.find((player) => player.id === transfer.playerId);
    if (byId) return byId;
  }

  const normalized = normalizeName(transfer.playerName);
  return players.find((player) => {
    const full = normalizeName(getPlayerFullName(player));
    const displayName = normalizeName(player.displayName);
    return full === normalized || displayName === normalized;
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
  if (isLoanTransfer(transfer)) return "cesion";
  if (transfer.category === "Renovaciones") return "renovacion";
  return "fichaje";
}

export function getTransferKindLabel(kind: TransferKind): string {
  if (kind === "renovacion") return "Renovacion";
  if (kind === "cesion") return "Cesion";
  return "Fichaje";
}

export function getTransferById(id: string): TransferRumor | undefined {
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

export function getSquadPlayerForTransfer(transfer: TransferRumor): SquadPlayer | undefined {
  const squad = getSquadPlayers("masculino");
  const rosterPlayer = getRosterPlayerForTransfer(transfer);
  const playerId = rosterPlayer?.id ?? resolveTransferPlayerId(transfer);

  if (playerId) {
    const byId = squad.find((player) => player.id === playerId);
    if (byId) return byId;
  }

  const normalized = normalizeName(transfer.playerName);
  const byName = squad.find((player) => {
    const full = normalizeName(`${player.nombre} ${player.apellido}`);
    const shortName = normalizeName(player.apellido || player.nombre);
    return full === normalized || shortName === normalized;
  });
  if (byName) return byName;

  if (rosterPlayer) {
    const byDorsal = squad.find((player) => player.dorsal === rosterPlayer.number);
    return byDorsal ?? rosterPlayerToSquadPlayer(rosterPlayer);
  }

  return undefined;
}

export type TransferCarouselMode = "todos" | "fichajes" | "renovaciones" | "cesiones";

function sortTransfersByDate(items: TransferRumor[]): TransferRumor[] {
  return [...items].sort((a, b) => b.date.localeCompare(a.date));
}

function isOfficialMarketTransfer(transfer: TransferRumor): boolean {
  return (
    (transfer.category === "Altas" || transfer.category === "Renovaciones") && transfer.status === "Oficial"
  );
}

/** Todos los movimientos oficiales del carrusel de inicio (altas, renovaciones y cesiones). */
export function getAllCarouselTransfers(): TransferRumor[] {
  return sortTransfersByDate(transfers.filter(isOfficialMarketTransfer));
}

/** Altas oficiales en propiedad (agente libre u otro), sin cesiones. */
export function getSigningCarouselTransfers(): TransferRumor[] {
  return sortTransfersByDate(
    transfers.filter(
      (transfer) => transfer.category === "Altas" && transfer.status === "Oficial" && !isLoanTransfer(transfer),
    ),
  );
}

/** Renovaciones oficiales del carrusel de inicio. */
export function getRenewalCarouselTransfers(): TransferRumor[] {
  return sortTransfersByDate(
    transfers.filter((transfer) => transfer.category === "Renovaciones" && transfer.status === "Oficial"),
  );
}

/** Jugadores cedidos al club en la temporada 25/26. */
export function getLoanTransfers(): TransferRumor[] {
  return sortTransfersByDate(
    transfers.filter((transfer) => isLoanTransfer(transfer) && transfer.status === "Oficial"),
  );
}

export function getCarouselTransfersByMode(mode: TransferCarouselMode): TransferRumor[] {
  switch (mode) {
    case "todos":
      return getAllCarouselTransfers();
    case "fichajes":
      return getSigningCarouselTransfers();
    case "renovaciones":
      return getRenewalCarouselTransfers();
    case "cesiones":
      return getLoanTransfers();
  }
}

/** Altas oficiales y renovaciones para carrusel de inicio (sin cesiones). */
export function getFeaturedTransfers(): TransferRumor[] {
  return sortTransfersByDate([
    ...getSigningCarouselTransfers(),
    ...getRenewalCarouselTransfers(),
  ]);
}

/** Todas las altas oficiales de la temporada 25/26. */
export function getOfficialAltas(): TransferRumor[] {
  return transfers
    .filter((transfer) => transfer.category === "Altas" && transfer.status === "Oficial")
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getTransferForPlayer(playerId: string): TransferRumor | undefined {
  return transfers.find((transfer) => {
    if (transfer.playerId === playerId) return true;
    return resolveTransferPlayerId(transfer) === playerId;
  });
}

export function getTransferClubAnnouncementNews(
  transfer: TransferRumor,
  allNews: NewsItem[],
): NewsItem | undefined {
  const playerId = resolveTransferPlayerId(transfer);
  if (playerId) {
    return getPlayerClubAnnouncementNews(allNews, playerId, {
      announcementNewsId: transfer.clubAnnouncementNewsId,
      playerName: transfer.playerName,
    });
  }
  return undefined;
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

export function getTransferDisplayName(transfer: TransferRumor): string {
  const squadPlayer = getSquadPlayerForTransfer(transfer);
  if (squadPlayer) return `${squadPlayer.nombre} ${squadPlayer.apellido}`;
  return transfer.playerName;
}
