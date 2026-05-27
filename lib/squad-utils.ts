import type { SquadPlayer, SquadPosition } from "@/types/squad";
import { SQUAD_POSITIONS } from "@/types/squad";

export function getPlayerFullName(player: SquadPlayer): string {
  return `${player.nombre} ${player.apellido}`;
}

export function getPlayerInitials(player: SquadPlayer): string {
  return `${player.nombre[0] ?? ""}${player.apellido[0] ?? ""}`.toUpperCase();
}

export function groupPlayersByPosition(players: SquadPlayer[]): Record<SquadPosition, SquadPlayer[]> {
  const groups = Object.fromEntries(SQUAD_POSITIONS.map((pos) => [pos, [] as SquadPlayer[]])) as Record<
    SquadPosition,
    SquadPlayer[]
  >;

  for (const player of players) {
    groups[player.posicion].push(player);
  }

  for (const pos of SQUAD_POSITIONS) {
    groups[pos].sort((a, b) => a.dorsal - b.dorsal);
  }

  return groups;
}

export function filterSquadPlayers(
  players: SquadPlayer[],
  query: string,
  position: SquadPosition | "Todas",
): SquadPlayer[] {
  const normalized = query.trim().toLowerCase();

  return players.filter((player) => {
    const matchesPosition = position === "Todas" || player.posicion === position;
    if (!matchesPosition) return false;
    if (!normalized) return true;

    const haystack = `${player.nombre} ${player.apellido} ${player.dorsal}`.toLowerCase();
    return haystack.includes(normalized);
  });
}

export function formatContractDate(isoDate: string): string {
  return isoDate.slice(0, 4);
}

export function formatBirthDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}
