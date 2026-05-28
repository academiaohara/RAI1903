import { newsItems, players, transfers } from "@/data/mock";
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

function nameMatchesNews(transfer: TransferRumor, item: NewsItem): boolean {
  const nameParts = transfer.playerName.toLowerCase().split(/\s+/);
  const haystack = `${item.title} ${item.excerpt}`.toLowerCase();
  return nameParts.every((part) => haystack.includes(part));
}

export function getTransferClubNews(transfer: TransferRumor): NewsItem[] {
  return newsItems
    .filter((item) => item.channel === "club")
    .filter(
      (item) =>
        item.tags.includes("fichajes") ||
        item.tags.includes("renovaciones") ||
        nameMatchesNews(transfer, item),
    )
    .filter((item) => nameMatchesNews(transfer, item) || item.tags.includes("fichajes"))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);
}

export function getTransferPressNews(transfer: TransferRumor): NewsItem[] {
  return newsItems
    .filter((item) => item.channel === "prensa")
    .filter((item) => item.tags.includes("fichajes") || item.tags.includes("renovaciones") || nameMatchesNews(transfer, item))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);
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
