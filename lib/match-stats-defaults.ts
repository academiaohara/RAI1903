import type { MatchStatCategory, MatchStatRow } from "@/types";

export const STANDARD_MATCH_STAT_ROWS: MatchStatRow[] = [
  { label: "Posesión", home: "50%", away: "50%" },
  { label: "Disparos", home: 0, away: 0 },
  { label: "Disparos a puerta", home: 0, away: 0 },
  { label: "Córners", home: 0, away: 0 },
  { label: "Fueras de juego", home: 0, away: 0 },
  { label: "Faltas", home: 0, away: 0 },
  { label: "Tarjetas amarillas", home: 0, away: 0 },
  { label: "Tarjetas rojas", home: 0, away: 0 },
];

export function buildStandardMatchStatCategory(): MatchStatCategory {
  return {
    title: "Estadísticas",
    rows: STANDARD_MATCH_STAT_ROWS.map((row) => ({ ...row })),
  };
}
