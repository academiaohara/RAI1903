import type { PlayerStatus } from "@/types";
import type { SquadPlayer, SquadPosition, SquadRoleCode } from "@/types/squad";
import { SQUAD_POSITIONS } from "@/types/squad";

const ROSTER_ESTADOS: PlayerStatus[] = ["titular", "suplente", "cantera", "nuevo fichaje"];

/** Estado de plantilla al quitar lesionado/sancionado. */
export function defaultRosterEstado(player: SquadPlayer): PlayerStatus {
  if (ROSTER_ESTADOS.includes(player.estado)) return player.estado;
  return "titular";
}

export function getPlayerFullName(player: SquadPlayer): string {
  return `${player.nombre} ${player.apellido}`;
}

/** Nombre para fichas de plantilla (nombre + apellido completo). */
export function getPlayerDisplayName(player: SquadPlayer): string {
  return player.apellido ? `${player.nombre} ${player.apellido}` : player.nombre;
}

export function getPlayerInitials(player: SquadPlayer): string {
  return `${player.nombre[0] ?? ""}${player.apellido[0] ?? ""}`.toUpperCase();
}

/** Dorsal visible en cromos (oculta 0 y valores vacíos). */
export function hasDisplayDorsal(dorsal: number | null | undefined): dorsal is number {
  return typeof dorsal === "number" && dorsal > 0;
}

const NATIONALITY_ISO: Record<string, string> = {
  España: "es",
  Portugal: "pt",
  Francia: "fr",
  Argentina: "ar",
  Brasil: "br",
  Colombia: "co",
  Mexico: "mx",
  México: "mx",
  Marruecos: "ma",
  Senegal: "sn",
  Nigeria: "ng",
};

/** Small flag image for ficha cards (flagcdn, 40px wide). */
export function getNationalityFlagUrl(nacionalidad: string): string {
  const iso = NATIONALITY_ISO[nacionalidad] ?? "un";
  return `https://flagcdn.com/w40/${iso}.png`;
}

export function isSquadPlayerUnavailable(player: SquadPlayer): boolean {
  return player.estado === "lesionado" || player.estado === "sancionado";
}

export function splitSquadByAvailability(players: SquadPlayer[]) {
  const injured: SquadPlayer[] = [];
  const suspended: SquadPlayer[] = [];
  const available: SquadPlayer[] = [];

  for (const player of players) {
    if (player.estado === "lesionado") injured.push(player);
    else if (player.estado === "sancionado") suspended.push(player);
    else available.push(player);
  }

  const byDorsal = (a: SquadPlayer, b: SquadPlayer) => a.dorsal - b.dorsal;
  injured.sort(byDorsal);
  suspended.sort(byDorsal);

  return { injured, suspended, available };
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
  if (!isoDate || isoDate === "—") return "—";
  return isoDate.slice(0, 4);
}

export function formatPlayerAge(edad: number): string {
  return edad > 0 ? String(edad) : "—";
}

export function formatPlayerAgeWithUnit(edad: number): string {
  return edad > 0 ? `${edad} años` : "—";
}

export function formatBirthDate(isoDate: string): string {
  if (!isoDate) return "—";
  const date = new Date(isoDate);
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}
