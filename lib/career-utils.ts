import type { PlayerCareerRecord } from "@/types/squad";

/** Año de inicio de una temporada tipo "2024/25" o "24/25". */
export function parseTemporadaStart(temporada: string): number {
  const match = temporada.trim().match(/(\d{2,4})/);
  if (!match) return 0;
  const year = Number(match[1]);
  if (!Number.isFinite(year)) return 0;
  return year < 100 ? 2000 + year : year;
}

export function sortCareerByTemporada(career: PlayerCareerRecord[]): PlayerCareerRecord[] {
  return [...career].sort((a, b) => parseTemporadaStart(a.temporada) - parseTemporadaStart(b.temporada));
}
