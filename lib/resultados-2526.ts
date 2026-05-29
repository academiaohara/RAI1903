import resultados2526Grupo1 from "@/data/resultados-2526.json";
import resultados2526Grupo2 from "@/data/resultados-2526-grupo2.json";
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
export const TEAM_NAME_TO_ID_GRUPO1: Record<string, string> = {
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

/** Maps official 1ª RFEF Grupo II names from resultados JSON to internal team ids. */
export const TEAM_NAME_TO_ID_GRUPO2: Record<string, string> = {
  "AD Alcorcón": "alcorcon",
  "Algeciras CF": "algeciras",
  "Antequera CF": "antequera",
  "Atlético Madrileño": "atletico-madrileno",
  "Atlético Sanluqueño": "atletico-sanluqueno",
  "Betis Deportivo": "betis-deportivo",
  "FC Cartagena": "cartagena",
  "CD Eldense": "eldense",
  "CE Europa": "europa",
  "Gimnàstic de Tarragona": "gimnastic",
  "Hércules CF": "hercules",
  "UD Ibiza": "ibiza",
  "Juventud Torremolinos CF": "torremolinos",
  "Marbella FC": "marbella",
  "Real Murcia CF": "real-murcia",
  "CE Sabadell FC": "sabadell",
  "Sevilla Atlético": "sevilla-atletico",
  "SD Tarazona": "tarazona",
  "CD Teruel": "teruel",
  "Villarreal CF B": "villarreal-b",
};

/** @deprecated Use TEAM_NAME_TO_ID_GRUPO1 */
export const TEAM_NAME_TO_ID = TEAM_NAME_TO_ID_GRUPO1;

export const RESULTADOS_2526_LAST_ROUND = 38;

function resolveTeamId(name: string, nameToId: Record<string, string>): string {
  const teamId = nameToId[name];
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
  nameToId: Record<string, string>,
): Match {
  const homeTeamId = resolveTeamId(partido.local, nameToId);
  const awayTeamId = resolveTeamId(partido.visitante, nameToId);
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

export function buildMatchdaysFromResultados2526(
  teams: readonly Team[],
  data: Resultados2526 = resultados2526Grupo1 as Resultados2526,
  nameToId: Record<string, string> = TEAM_NAME_TO_ID_GRUPO1,
): Matchday[] {
  const teamById = new Map(teams.map((team) => [team.id, team]));

  return [...data.jornadas]
    .sort((a, b) => a.jornada - b.jornada)
    .map((jornada) => ({
      round: jornada.jornada,
      matches: jornada.partidos.map((partido) => buildMatch(partido, jornada.jornada, teamById, nameToId)),
    }));
}

export function buildMatchdaysGrupo2(teams: readonly Team[]): Matchday[] {
  return buildMatchdaysFromResultados2526(
    teams,
    resultados2526Grupo2 as Resultados2526,
    TEAM_NAME_TO_ID_GRUPO2,
  );
}
