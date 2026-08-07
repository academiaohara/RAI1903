import type { SeasonFemeninoFixturesBundle } from "@/lib/cms/season-bundles";
import type { Match, Matchday } from "@/types";

/** Convierte matchdays CMS a formato jornadas legible para exportar/importar. */
export function matchdaysToJornadasExport(matchdays: Matchday[]) {
  return matchdays.map((md) => ({
    jornada: md.round,
    partidos: md.matches.map((match) => matchToJornadaPartido(match)),
  }));
}

function matchToJornadaPartido(match: Match) {
  const fecha = match.date.slice(0, 10);
  const horaMatch = match.date.match(/T(\d{2}:\d{2})/);
  const hora = horaMatch?.[1] ?? null;
  const finished = match.status === "finished";

  return {
    fecha,
    hora,
    local: match.homeTeam,
    visitante: match.awayTeam,
    goles_local: finished && match.homeScore !== undefined ? match.homeScore : null,
    goles_visitante: finished && match.awayScore !== undefined ? match.awayScore : null,
    estado: finished ? "finalizado" : "pendiente",
  };
}

/** Exporta el bundle femenino como JSON (formato CMS o jornadas). */
export function exportFemeninoFixturesJson(
  fixtures: SeasonFemeninoFixturesBundle,
  options?: { format?: "cms" | "jornadas"; clubTeamId?: string },
): string {
  const format = options?.format ?? "jornadas";
  const payload =
    format === "cms"
      ? {
          matchdaysFemenino: fixtures.matchdaysFemenino,
          meta: fixtures.meta,
          ...(options?.clubTeamId ? { clubTeamId: options.clubTeamId } : {}),
        }
      : {
          jornadas: matchdaysToJornadasExport(fixtures.matchdaysFemenino),
          ...(options?.clubTeamId ? { clubTeamId: options.clubTeamId } : {}),
        };
  return JSON.stringify(payload, null, 2);
}
