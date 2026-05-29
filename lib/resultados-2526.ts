import resultados2526 from "@/data/resultados-2526.json";
import type { Match, Matchday, Team } from "@/types";

type ResultadosPartido = {
  fecha: string;
  hora: string | null;
  local: string;
  visitante: string;
  goles_local: number;
  goles_visitante: number;
  resultado: string;
};

type ResultadosJornada = {
  jornada: number;
  partidos: ResultadosPartido[];
};

type Resultados2526 = {
  competicion: string;
  jornadas: ResultadosJornada[];
};

/** Maps official 1ª RFEF Grupo I names from resultados JSON to internal team ids. */
export const TEAM_NAME_TO_ID: Record<string, string> = {
  "Real Avilés": "real-aviles-industrial",
  "Racing Club Ferrol": "ferrol",
  Lugo: "lugo",
  Pontevedra: "pontevedra",
  Zamora: "zamora",
  Arenteiro: "arenteiro",
  Unionistas: "unionistas",
  Ponferradina: "ponferradina",
  "Real Madrid B": "castilla",
  Tenerife: "tenerife",
  "CF Talavera": "talavera",
  "AD Mérida": "merida",
  "Celta de Vigo B": "celta-fortuna",
  Cacereño: "cacereno",
  Guadalajara: "guadalajara",
  "Ourense CF": "ourense",
  "Arenas Getxo": "arenas",
  Barakaldo: "barakaldo",
  "Athletic Club B": "athletic-bilbao-b",
  "Osasuna B": "osasuna-promesas",
};

export const RESULTADOS_2526_LAST_ROUND = 38;

function resolveTeamId(name: string): string {
  const teamId = TEAM_NAME_TO_ID[name];
  if (!teamId) {
    throw new Error(`Unknown team name in resultados 25/26: "${name}"`);
  }
  return teamId;
}

function parseKickoffIso(fecha: string, hora: string | null): string {
  const [year, month, day] = fecha.split("-").map(Number);
  const [hours, minutes] = hora ? hora.split(":").map(Number) : [12, 0];
  return new Date(Date.UTC(year, month - 1, day, hours, minutes)).toISOString();
}

function buildMatch(
  partido: ResultadosPartido,
  round: number,
  teamById: Map<string, Team>,
): Match {
  const homeTeamId = resolveTeamId(partido.local);
  const awayTeamId = resolveTeamId(partido.visitante);
  const home = teamById.get(homeTeamId)!;
  const away = teamById.get(awayTeamId)!;

  return {
    id: `j${round}-${homeTeamId}-${awayTeamId}`,
    matchday: round,
    homeTeamId,
    awayTeamId,
    homeTeam: home.name,
    awayTeam: away.name,
    date: parseKickoffIso(partido.fecha, partido.hora),
    competition: "primera-rfef",
    venue: home.stadium,
    status: "finished",
    homeScore: partido.goles_local,
    awayScore: partido.goles_visitante,
  };
}

export function buildMatchdaysFromResultados2526(teams: readonly Team[]): Matchday[] {
  const teamById = new Map(teams.map((team) => [team.id, team]));
  const data = resultados2526 as Resultados2526;

  return [...data.jornadas]
    .sort((a, b) => a.jornada - b.jornada)
    .map((jornada) => ({
      round: jornada.jornada,
      matches: jornada.partidos.map((partido) => buildMatch(partido, jornada.jornada, teamById)),
    }));
}
