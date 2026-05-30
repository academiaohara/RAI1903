import resultados from "@/data/segunda-rfef-femenina-grupo1-2526.json";
import { applyStandingsToTeams } from "@/lib/standings";
import type { Match, Matchday, Team } from "@/types";

export const RAI_FEM_TEAM_ID = "real-aviles-industrial-femenino";
export const SEGUNDA_RFEF_FEMENINA_COMPETITION_ID = "liga-femenina" as const;
export const SEGUNDA_RFEF_FEMENINA_LAST_ROUND = 26;

type ResultadosPartido = {
  fecha: string;
  local: string;
  visitante: string;
  goles_local: number;
  goles_visitante: number;
};

type ResultadosJornada = {
  jornada: number;
  partidos: ResultadosPartido[];
};

type ResultadosSegundaRfefFemenina = {
  competicion: string;
  temporada: string;
  jornadas: ResultadosJornada[];
};

export const SEGUNDA_RFEF_FEMENINA_DATA = resultados as ResultadosSegundaRfefFemenina;

/** Maps official names from resultados JSON to internal team ids. */
export const TEAM_NAME_TO_ID: Record<string, string> = {
  "Athletic Club B Fem": "fem-athletic-club-b",
  "Atlético Villalonga Fem": "fem-atletico-villalonga",
  "Eibar B Fem": "fem-eibar-b",
  "Racing Fem": "fem-racing-santander",
  "Celta Fem": "fem-celta",
  "Club Bizkerre Fem": "fem-club-bizkerre",
  "Olímpico de León Fem": "fem-olimpico-leon",
  "Real Sporting Fem": "fem-real-sporting",
  "Real Avilés Fem": RAI_FEM_TEAM_ID,
  "Burgos CF Fem": "fem-burgos-cf",
  "Atlético C Fem": "fem-atletico-c",
  "R. Sociedad B Fem": "fem-real-sociedad-b",
  "Deportivo Abanca B Fem": "fem-deportivo-abanca-b",
  "Madrid CFF B Fem": "fem-madrid-cff-b",
};

const MONTH_INDEX: Record<string, number> = {
  ENE: 0,
  FEB: 1,
  MAR: 2,
  ABR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AGO: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DIC: 11,
};

type TeamSeed = {
  id: string;
  name: string;
  shortName: string;
  city: string;
  stadium: string;
  coach: string;
  crestInitials: string;
  colors: [string, string];
};

const TEAM_SEEDS: TeamSeed[] = [
  {
    id: RAI_FEM_TEAM_ID,
    name: "Real Avilés Industrial Femenino",
    shortName: "Avilés Fem.",
    city: "Avilés",
    stadium: "Roman Suarez Puerta",
    coach: "Javi Gómez",
    crestInitials: "RAI",
    colors: ["#214C9B", "#FFFFFF"],
  },
  {
    id: "fem-racing-santander",
    name: "Racing de Santander Femenino",
    shortName: "Racing Fem.",
    city: "Santander",
    stadium: "El Sardinero",
    coach: "—",
    crestInitials: "RAC",
    colors: ["#166534", "#FFFFFF"],
  },
  {
    id: "fem-real-sociedad-b",
    name: "Real Sociedad B Femenino",
    shortName: "Sociedad B Fem.",
    city: "San Sebastián",
    stadium: "Zubieta",
    coach: "—",
    crestInitials: "RSO",
    colors: ["#1D4ED8", "#FFFFFF"],
  },
  {
    id: "fem-celta",
    name: "Celta de Vigo Femenino",
    shortName: "Celta Fem.",
    city: "Vigo",
    stadium: "Municipal de Barreiro",
    coach: "—",
    crestInitials: "CEL",
    colors: ["#0EA5E9", "#FFFFFF"],
  },
  {
    id: "fem-club-bizkerre",
    name: "Club Bizkerre Femenino",
    shortName: "Bizkerre Fem.",
    city: "Bilbao",
    stadium: "Instalaciones de Lezama",
    coach: "—",
    crestInitials: "BIZ",
    colors: ["#DC2626", "#111827"],
  },
  {
    id: "fem-athletic-club-b",
    name: "Athletic Club B Femenino",
    shortName: "Athletic B Fem.",
    city: "Bilbao",
    stadium: "Instalaciones de Lezama",
    coach: "—",
    crestInitials: "ATH",
    colors: ["#DC2626", "#FFFFFF"],
  },
  {
    id: "fem-atletico-c",
    name: "Atlético C Femenino",
    shortName: "Atlético C Fem.",
    city: "Madrid",
    stadium: "Ciudad Deportiva Wanda",
    coach: "—",
    crestInitials: "ATM",
    colors: ["#DC2626", "#FFFFFF"],
  },
  {
    id: "fem-real-sporting",
    name: "Real Sporting Femenino",
    shortName: "Sporting Fem.",
    city: "Gijón",
    stadium: "Mareo",
    coach: "—",
    crestInitials: "SPO",
    colors: ["#DC2626", "#FFFFFF"],
  },
  {
    id: "fem-burgos-cf",
    name: "Burgos CF Femenino",
    shortName: "Burgos Fem.",
    city: "Burgos",
    stadium: "El Plantio",
    coach: "—",
    crestInitials: "BUR",
    colors: ["#111827", "#FFFFFF"],
  },
  {
    id: "fem-eibar-b",
    name: "SD Eibar B Femenino",
    shortName: "Eibar B Fem.",
    city: "Eibar",
    stadium: "Ipurua",
    coach: "—",
    crestInitials: "EIB",
    colors: ["#1D4ED8", "#FFFFFF"],
  },
  {
    id: "fem-madrid-cff-b",
    name: "Madrid CFF B Femenino",
    shortName: "Madrid CFF B Fem.",
    city: "Madrid",
    stadium: "Ciudad Deportiva del Madrid CFF",
    coach: "—",
    crestInitials: "MCF",
    colors: ["#7C3AED", "#FFFFFF"],
  },
  {
    id: "fem-deportivo-abanca-b",
    name: "Deportivo Abanca B Femenino",
    shortName: "Depor B Fem.",
    city: "A Coruña",
    stadium: "Abanca-Riazor",
    coach: "—",
    crestInitials: "DEP",
    colors: ["#1D4ED8", "#FFFFFF"],
  },
  {
    id: "fem-olimpico-leon",
    name: "Olímpico de León Femenino",
    shortName: "Olímpico Fem.",
    city: "León",
    stadium: "La Eragudina",
    coach: "—",
    crestInitials: "OLP",
    colors: ["#B91C1C", "#FFFFFF"],
  },
  {
    id: "fem-atletico-villalonga",
    name: "Atlético Villalonga Femenino",
    shortName: "Villalonga Fem.",
    city: "Villalonga",
    stadium: "Municipal",
    coach: "—",
    crestInitials: "VIL",
    colors: ["#15803D", "#FFFFFF"],
  },
];

const teamSeedById = new Map(TEAM_SEEDS.map((team) => [team.id, team]));

export const FEMENINA_STANDINGS_ZONES = {
  promotion: 1,
  playoff: 0,
  relegation: 1,
};

function resolveTeamId(name: string): string {
  const teamId = TEAM_NAME_TO_ID[name];
  if (!teamId) {
    throw new Error(`Unknown team name in 2ª RFEF Femenina 25/26: "${name}"`);
  }
  return teamId;
}

function parseSpanishKickoffIso(fecha: string): string {
  const [dayStr, monthToken, yearStr] = fecha.trim().split(/\s+/);
  const day = Number(dayStr);
  const month = MONTH_INDEX[monthToken];
  const year = Number(yearStr);
  if (!day || month === undefined || !year) {
    throw new Error(`Invalid date in 2ª RFEF Femenina 25/26: "${fecha}"`);
  }
  return new Date(Date.UTC(year, month, day, 12, 0)).toISOString();
}

function seedToBaseTeam(seed: TeamSeed): Team {
  return {
    id: seed.id,
    name: seed.name,
    shortName: seed.shortName,
    city: seed.city,
    stadium: seed.stadium,
    coach: seed.coach,
    founded: 0,
    crestInitials: seed.crestInitials,
    colors: [...seed.colors],
    position: 0,
    form: [],
    stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
  };
}

export const baseTeamsSegundaRfefFemenina: Team[] = TEAM_SEEDS.map(seedToBaseTeam);

function buildMatch(partido: ResultadosPartido, round: number): Match {
  const homeTeamId = resolveTeamId(partido.local);
  const awayTeamId = resolveTeamId(partido.visitante);
  const home = teamSeedById.get(homeTeamId)!;
  const away = teamSeedById.get(awayTeamId)!;

  return {
    id: `fem-j${round}-${homeTeamId}-${awayTeamId}`,
    matchday: round,
    homeTeamId,
    awayTeamId,
    homeTeam: home.name,
    awayTeam: away.name,
    date: parseSpanishKickoffIso(partido.fecha),
    competition: SEGUNDA_RFEF_FEMENINA_COMPETITION_ID,
    venue: home.stadium,
    status: "finished",
    homeScore: partido.goles_local,
    awayScore: partido.goles_visitante,
  };
}

export function buildMatchdaysSegundaRfefFemenina(
  data: ResultadosSegundaRfefFemenina = SEGUNDA_RFEF_FEMENINA_DATA,
): Matchday[] {
  return [...data.jornadas]
    .sort((a, b) => a.jornada - b.jornada)
    .map((jornada) => ({
      round: jornada.jornada,
      matches: jornada.partidos.map((partido) => buildMatch(partido, jornada.jornada)),
    }));
}

export function buildTeamsSegundaRfefFemenina(
  data: ResultadosSegundaRfefFemenina = SEGUNDA_RFEF_FEMENINA_DATA,
): Team[] {
  const matchdays = buildMatchdaysSegundaRfefFemenina(data);
  const leagueMatches = matchdays.flatMap((round) => round.matches);
  return applyStandingsToTeams(baseTeamsSegundaRfefFemenina, leagueMatches, FEMENINA_STANDINGS_ZONES);
}

function formatAvilesResultLine(match: Match): string {
  if (match.homeTeamId === RAI_FEM_TEAM_ID) {
    return `Real Avilés Femenino ${match.homeScore}-${match.awayScore} ${match.awayTeam}`;
  }
  return `${match.homeTeam} ${match.homeScore}-${match.awayScore} Real Avilés Femenino`;
}

export function buildFemeninoPrimerEquipoSummary(data: ResultadosSegundaRfefFemenina = SEGUNDA_RFEF_FEMENINA_DATA) {
  const teams = buildTeamsSegundaRfefFemenina(data);
  const aviles = teams.find((team) => team.id === RAI_FEM_TEAM_ID);
  const calendar = buildMatchdaysSegundaRfefFemenina(data)
    .flatMap((round) => round.matches)
    .filter((match) => match.homeTeamId === RAI_FEM_TEAM_ID || match.awayTeamId === RAI_FEM_TEAM_ID);
  const lastMatch = calendar.at(-1);

  return {
    category: data.competicion,
    position: aviles ? `${aviles.position}º - ${aviles.stats.points} pts` : "—",
    lastResult: lastMatch ? formatAvilesResultLine(lastMatch) : "—",
    nextMatch: "Temporada 2025-26 finalizada",
  };
}

export function getAvilesFemeninoMatches(data: ResultadosSegundaRfefFemenina = SEGUNDA_RFEF_FEMENINA_DATA): Match[] {
  return buildMatchdaysSegundaRfefFemenina(data)
    .flatMap((round) => round.matches)
    .filter((match) => match.homeTeamId === RAI_FEM_TEAM_ID || match.awayTeamId === RAI_FEM_TEAM_ID);
}
