import type { SquadPlayer, SquadPosition, SquadRoleCode } from "@/types/squad";
import { SQUAD_POSITIONS } from "@/types/squad";

export function getPlayerFullName(player: SquadPlayer): string {
  return `${player.nombre} ${player.apellido}`;
}

/** Nombre corto para fichas (p. ej. "Alvaro Fdez"). */
export function getPlayerDisplayName(player: SquadPlayer): string {
  const shortLast =
    player.apellido.length > 5 ? `${player.apellido.slice(0, 4)}.` : player.apellido;
  return `${player.nombre} ${shortLast}`;
}

export function getPlayerInitials(player: SquadPlayer): string {
  return `${player.nombre[0] ?? ""}${player.apellido[0] ?? ""}`.toUpperCase();
}

const NATIONALITY_FLAGS: Record<string, string> = {
  Espana: "🇪🇸",
  España: "🇪🇸",
  Portugal: "🇵🇹",
  Francia: "🇫🇷",
  Argentina: "🇦🇷",
  Brasil: "🇧🇷",
  Colombia: "🇨🇴",
  Mexico: "🇲🇽",
  México: "🇲🇽",
  Marruecos: "🇲🇦",
  Senegal: "🇸🇳",
  Nigeria: "🇳🇬",
};

export function getNationalityFlag(nacionalidad: string): string {
  return NATIONALITY_FLAGS[nacionalidad] ?? "🏳️";
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
  role: SquadRoleCode | "Todas",
): SquadPlayer[] {
  const normalized = query.trim().toLowerCase();

  return players.filter((player) => {
    const matchesPosition = role === "Todas" || player.rol === role;
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
