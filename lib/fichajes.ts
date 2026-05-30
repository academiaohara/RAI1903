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

const RAI_CLUB = "Real Aviles Industrial";

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
    lugarNacimiento: "Aviles",
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
  if (transfer.category === "Renovaciones") return "renovacion";
  return "fichaje";
}

export function getTransferKindLabel(kind: TransferKind): string {
  return kind === "renovacion" ? "Renovacion" : "Fichaje";
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

/** Fichajes y renovaciones destacados para el carrusel de inicio. */
export function getFeaturedTransfers(): TransferRumor[] {
  const order = ["t9", "t3", "t4", "t6", "t8"];
  const featured = transfers.filter(
    (transfer) =>
      (transfer.category === "Altas" || transfer.category === "Renovaciones") &&
      transfer.status === "Oficial",
  );

  return featured.sort((a, b) => {
    const ai = order.indexOf(a.id);
    const bi = order.indexOf(b.id);
    if (ai === -1 && bi === -1) return b.date.localeCompare(a.date);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export function getTransferForPlayer(playerId: string): TransferRumor | undefined {
  return transfers.find((transfer) => {
    if (transfer.playerId === playerId) return true;
    return resolveTransferPlayerId(transfer) === playerId;
  });
}

export function getTransferClubAnnouncementNews(transfer: TransferRumor): NewsItem | undefined {
  const playerId = resolveTransferPlayerId(transfer);
  if (playerId) {
    return getPlayerClubAnnouncementNews(playerId, {
      announcementNewsId: transfer.clubAnnouncementNewsId,
      playerName: transfer.playerName,
    });
  }
  return undefined;
}

export function getTransferPlayerNews(transfer: TransferRumor): NewsItem[] {
  const announcement = getTransferClubAnnouncementNews(transfer);
  const playerId = resolveTransferPlayerId(transfer);

  if (playerId) {
    return getPlayerNews(playerId, {
      excludeNewsId: announcement?.id,
      playerName: transfer.playerName,
    });
  }

  return getPlayerNewsByName(transfer.playerName, announcement?.id);
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
