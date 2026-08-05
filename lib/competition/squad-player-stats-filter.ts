import {
  matchesStatsCompetitionFilterFromId,
  type StatsCompetitionFilter,
} from "@/lib/competition/stats-filters";
import type { PlayerMatchRecord, SquadPlayer } from "@/types/squad";

function isActiveMatchRow(row: PlayerMatchRecord): boolean {
  return (
    row.minutos > 0 ||
    row.goles > 0 ||
    row.asistencias > 0 ||
    row.amarillas > 0 ||
    row.rojas > 0
  );
}

function totalsFromHistorial(rows: PlayerMatchRecord[]) {
  const active = rows.filter(isActiveMatchRow);
  return {
    partidos: active.length,
    minutos: active.reduce((sum, row) => sum + row.minutos, 0),
    goles: active.reduce((sum, row) => sum + row.goles, 0),
    asistencias: active.reduce((sum, row) => sum + row.asistencias, 0),
    amarillas: active.reduce((sum, row) => sum + row.amarillas, 0),
    rojas: active.reduce((sum, row) => sum + row.rojas, 0),
    historialPartidos: rows,
  };
}

export function filterPlayerHistorialByCompetition(
  historial: PlayerMatchRecord[],
  filter: StatsCompetitionFilter,
): PlayerMatchRecord[] {
  if (filter === "todos") return historial;
  return historial.filter((row) => matchesStatsCompetitionFilterFromId(row.competitionId, filter));
}

export function applyCompetitionFilterToSquadPlayers(
  squad: SquadPlayer[],
  filter: StatsCompetitionFilter,
): SquadPlayer[] {
  if (filter === "todos") return squad;

  return squad.map((player) => {
    const historialPartidos = filterPlayerHistorialByCompetition(player.historialPartidos, filter);
    const totals = totalsFromHistorial(historialPartidos);
    return {
      ...player,
      ...totals,
    };
  });
}
