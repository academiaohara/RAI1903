import { players, transfers } from "@/data/mock";
import {
  getPlayerClubAnnouncementNews,
  getPlayerNews,
  getPlayerNewsByName,
} from "@/lib/player-news";
import { getSquadPlayers } from "@/lib/squad-data";
import type { NewsItem, TransferKind, TransferRumor } from "@/types";
import type { SquadPlayer } from "@/types/squad";

const RAI_CLUB = "Real Aviles Industrial";

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

  const normalized = transfer.playerName.toLowerCase();
  const match = players.find((player) => {
    const full = `${player.firstName} ${player.lastName}`.toLowerCase();
    return full === normalized || player.displayName.toLowerCase() === normalized;
  });
  return match?.id;
}

export function getSquadPlayerForTransfer(transfer: TransferRumor): SquadPlayer | undefined {
  const playerId = resolveTransferPlayerId(transfer);
  if (!playerId) return undefined;
  return getSquadPlayers("masculino").find((player) => player.id === playerId);
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
