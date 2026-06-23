import type { SquadPosition } from "@/types/squad";

/** Temporada que conserva el diseño clásico de ficha (excepción editorial). */
export const LEGACY_FICHA_SEASON_LABEL = "25/26";

const POSITION_ABBREVS: Record<SquadPosition, string> = {
  Portero: "POR",
  Defensa: "DEF",
  Centrocampista: "MED",
  Delantero: "DEL",
};

/** `2025-26` → `25/26` */
export function seasonIdToDisplayLabel(seasonId: string): string {
  const [start, end] = seasonId.split("-");
  if (!start || !end) return seasonId;
  return `${start.slice(-2)}/${end}`;
}

/** Etiquetas `25/26`, `26/27`… → año de inicio (25, 26…). */
export function parseSeasonStartYear(seasonLabel: string): number | null {
  const match = seasonLabel.trim().match(/^(\d{2})\/\d{2}$/);
  if (!match) return null;
  return Number.parseInt(match[1], 10);
}

export function usesLegacyFichaDesign(seasonLabel: string): boolean {
  const startYear = parseSeasonStartYear(seasonLabel);
  if (startYear === null) return seasonLabel === LEGACY_FICHA_SEASON_LABEL;
  return startYear <= 25;
}

export function getFichaPositionAbbrev(position: SquadPosition): string {
  return POSITION_ABBREVS[position];
}

export function getFichaFootAbbrev(pierna: string): string {
  if (pierna === "Izquierda") return "IZ";
  if (pierna === "Ambidiestro") return "AM";
  return "DR";
}
