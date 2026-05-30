import juvenilU19 from "@/data/cantera-juvenil-u19-2526.json";
import {
  buildSegundaAsturfutbolFilialCalendar,
  buildSegundaAsturfutbolTable,
} from "@/lib/segunda-asturfutbol-2526";
import { computeStandings, extractLeagueMatches } from "@/lib/standings";
import type { CalendarMatch, FormCode, Match, Team } from "@/types";

export type CanteraTeamId = "filial" | "juvenil-a" | "femenino";

type RawPartido = {
  fecha: string;
  local: string;
  visitante: string;
  goles_local: number | null;
  goles_visitante: number | null;
  estado: "finalizado" | "pendiente";
};

type RawJornada = {
  jornada: number;
  partidos: RawPartido[];
};

const JUVENIL_COMPETITION = "liga-nacional-juvenil" as const;
const JUVENIL_AVILES_NAMES = ["Real Avilés U19", "At. Avilés A U19"];

export function slugifyCanteraTeamName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function shortNameFromFull(name: string): string {
  return name
    .replace(/\s+U19$/i, "")
    .replace(/^Real\s+/i, "")
    .replace(/^CD\s+/i, "")
    .replace(/^UD\s+/i, "")
    .replace(/^At\.\s+/i, "")
    .trim();
}

function initialsFromName(name: string): string {
  const words = name.replace(/\s+U19$/i, "").split(/\s+/).filter(Boolean);
  if (words.length === 0) return "EQ";
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words
    .slice(0, 3)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function isAvilesCanteraTeamName(name: string): boolean {
  const normalized = name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
  return normalized.includes("aviles");
}

function rawPartidoToMatch(partido: RawPartido, jornada: number, index: number): Match {
  const homeTeamId = slugifyCanteraTeamName(partido.local);
  const awayTeamId = slugifyCanteraTeamName(partido.visitante);
  const finished = partido.estado === "finalizado";
  const dateIso = `${partido.fecha}T12:00:00.000Z`;

  return {
    id: `juvenil-u19-j${jornada}-${index}`,
    matchday: jornada,
    homeTeamId,
    awayTeamId,
    homeTeam: partido.local,
    awayTeam: partido.visitante,
    date: dateIso,
    competition: JUVENIL_COMPETITION,
    venue: partido.local,
    status: finished ? "finished" : "scheduled",
    homeScore: finished && partido.goles_local !== null ? partido.goles_local : undefined,
    awayScore: finished && partido.goles_visitante !== null ? partido.goles_visitante : undefined,
  };
}

export function buildJuvenilU19Matches(): Match[] {
  const jornadas = juvenilU19.jornadas as RawJornada[];
  return jornadas.flatMap((jornada) =>
    jornada.partidos.map((partido, index) => rawPartidoToMatch(partido, jornada.jornada, index)),
  );
}

function teamMetaFromName(name: string): Pick<Team, "name" | "shortName" | "crestInitials"> {
  return {
    name,
    shortName: shortNameFromFull(name),
    crestInitials: initialsFromName(name),
  };
}

function baseTeamFromName(name: string, position: number): Team {
  const id = slugifyCanteraTeamName(name);
  const meta = teamMetaFromName(name);
  return {
    id,
    ...meta,
    city: "Asturias",
    stadium: "—",
    coach: "—",
    founded: 0,
    colors: ["#64748B", "#FFFFFF"],
    position,
    form: [] as FormCode[],
    stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
  };
}

export function buildJuvenilU19Standings(): Team[] {
  const matches = buildJuvenilU19Matches();
  const teamNames = new Set<string>();
  for (const match of matches) {
    teamNames.add(match.homeTeam);
    teamNames.add(match.awayTeam);
  }

  const teams = [...teamNames].map((name, index) => baseTeamFromName(name, index + 1));
  const leagueMatches = extractLeagueMatches(matches);
  const standings = computeStandings(
    teams.map((team) => team.id),
    leagueMatches,
    { promotion: 1, playoff: 3, relegation: 2 },
  );

  const byId = new Map(standings.map((row) => [row.teamId, row]));

  return teams
    .map((team) => {
      const row = byId.get(team.id);
      if (!row) return team;
      return {
        ...team,
        position: row.position,
        zone: row.zone,
        form: row.form,
        stats: {
          played: row.played,
          won: row.won,
          drawn: row.drawn,
          lost: row.lost,
          goalsFor: row.goalsFor,
          goalsAgainst: row.goalsAgainst,
          points: row.points,
        },
      };
    })
    .sort((a, b) => a.position - b.position);
}

export function getJuvenilAvilesTeamIds(): string[] {
  return JUVENIL_AVILES_NAMES.map((name) => slugifyCanteraTeamName(name));
}

export function getJuvenilAvilesCalendarMatches(): Match[] {
  const avilesIds = new Set(getJuvenilAvilesTeamIds());
  return buildJuvenilU19Matches().filter(
    (match) => avilesIds.has(match.homeTeamId) || avilesIds.has(match.awayTeamId),
  );
}

function avilesResult(match: Match, avilesTeamId: string): string | null {
  if (match.status !== "finished" || match.homeScore === undefined || match.awayScore === undefined) {
    return null;
  }
  const avilesHome = match.homeTeamId === avilesTeamId;
  const avilesGoals = avilesHome ? match.homeScore : match.awayScore;
  const rivalGoals = avilesHome ? match.awayScore : match.homeScore;
  return `${avilesGoals}-${rivalGoals}`;
}

/** Calendar rows for list view (Avilés-centric, no crests). */
export function matchToCanteraCalendarMatch(match: Match, avilesTeamId: string): CalendarMatch {
  const avilesHome = match.homeTeamId === avilesTeamId;
  const played = match.status === "finished";

  return {
    id: match.id,
    date: match.date,
    opponent: avilesHome ? match.awayTeam : match.homeTeam,
    opponentLogo: "",
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    homeTeamId: match.homeTeamId,
    awayTeamId: match.awayTeamId,
    venue: match.venue,
    competition: match.competition,
    matchday: match.matchday,
    isHome: avilesHome,
    time: null,
    played,
    result: avilesResult(match, avilesTeamId),
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    chronicleUrl: null,
    previaUrl: null,
  };
}

export function matchesToCanteraCalendarMatches(matches: Match[], avilesTeamId: string): CalendarMatch[] {
  return matches
    .map((match) => matchToCanteraCalendarMatch(match, avilesTeamId))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getCanteraClubHighlightTeamIds(teamId: CanteraTeamId): string[] {
  if (teamId === "juvenil-a") return getJuvenilAvilesTeamIds();
  if (teamId === "femenino") return ["real-aviles-industrial-femenino"];
  return ["filial-real-aviles-b"];
}

export function getCanteraPrimaryAvilesTeamId(teamId: CanteraTeamId): string {
  if (teamId === "juvenil-a") return slugifyCanteraTeamName("Real Avilés U19");
  if (teamId === "femenino") return "real-aviles-industrial-femenino";
  return "filial-real-aviles-b";
}

export function isCanteraClubTeam(teamId: CanteraTeamId, rowTeamId: string, teamName?: string): boolean {
  const ids = getCanteraClubHighlightTeamIds(teamId);
  if (ids.includes(rowTeamId)) return true;
  return teamName ? isAvilesCanteraTeamName(teamName) : false;
}

const FEMENINO_TEAM_NAMES = [
  "Real Avilés Industrial Femenino",
  "CD Orientación Marítima",
  "Oviedo Moderno",
  "Sporting de Gijón Femenino B",
  "CD Covadonga Femenino",
  "UD Llanera Femenino",
  "CD Tuilla Femenino",
  "Mosconia CF Femenino",
  "Caudal Deportivo Femenino",
  "UP Langreo Femenino",
  "CD Llanes Femenino",
  "SD Llano 2000 Femenino",
  "CD Arenal Femenino",
  "Romanón CF Femenino",
  "Veriña CF Femenino",
  "Juventud Estadio Femenino",
  "Colegio Inmaculada Femenino",
  "Astur CF Femenino",
  "Real Oviedo Femenino B",
  "At. Avilés Femenino",
] as const;

const MOCK_STANDINGS_STATS: Array<{
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  form: FormCode[];
}> = [
  { played: 26, won: 18, drawn: 4, lost: 4, goalsFor: 52, goalsAgainst: 22, points: 58, form: ["G", "G", "E", "G", "G"] },
  { played: 26, won: 17, drawn: 5, lost: 4, goalsFor: 48, goalsAgainst: 24, points: 56, form: ["G", "G", "G", "E", "G"] },
  { played: 26, won: 15, drawn: 6, lost: 5, goalsFor: 44, goalsAgainst: 28, points: 51, form: ["G", "E", "G", "P", "G"] },
  { played: 26, won: 14, drawn: 5, lost: 7, goalsFor: 40, goalsAgainst: 30, points: 47, form: ["G", "P", "G", "G", "E"] },
  { played: 26, won: 13, drawn: 6, lost: 7, goalsFor: 38, goalsAgainst: 31, points: 45, form: ["E", "G", "G", "P", "G"] },
  { played: 26, won: 12, drawn: 7, lost: 7, goalsFor: 36, goalsAgainst: 32, points: 43, form: ["E", "G", "E", "G", "P"] },
  { played: 26, won: 11, drawn: 8, lost: 7, goalsFor: 35, goalsAgainst: 33, points: 41, form: ["E", "E", "G", "G", "P"] },
  { played: 26, won: 11, drawn: 6, lost: 9, goalsFor: 34, goalsAgainst: 35, points: 39, form: ["P", "G", "E", "G", "P"] },
  { played: 26, won: 10, drawn: 8, lost: 8, goalsFor: 33, goalsAgainst: 34, points: 38, form: ["E", "P", "G", "E", "G"] },
  { played: 26, won: 10, drawn: 6, lost: 10, goalsFor: 32, goalsAgainst: 36, points: 36, form: ["P", "G", "P", "G", "E"] },
  { played: 26, won: 9, drawn: 8, lost: 9, goalsFor: 30, goalsAgainst: 35, points: 35, form: ["E", "P", "G", "E", "P"] },
  { played: 26, won: 9, drawn: 7, lost: 10, goalsFor: 29, goalsAgainst: 36, points: 34, form: ["P", "E", "G", "P", "G"] },
  { played: 26, won: 8, drawn: 9, lost: 9, goalsFor: 28, goalsAgainst: 37, points: 33, form: ["E", "E", "P", "G", "P"] },
  { played: 26, won: 8, drawn: 8, lost: 10, goalsFor: 27, goalsAgainst: 38, points: 32, form: ["P", "E", "P", "G", "E"] },
  { played: 26, won: 7, drawn: 9, lost: 10, goalsFor: 26, goalsAgainst: 39, points: 30, form: ["E", "P", "E", "P", "G"] },
  { played: 26, won: 7, drawn: 7, lost: 12, goalsFor: 25, goalsAgainst: 40, points: 28, form: ["P", "P", "G", "E", "P"] },
  { played: 26, won: 6, drawn: 8, lost: 12, goalsFor: 24, goalsAgainst: 42, points: 26, form: ["P", "E", "P", "P", "G"] },
  { played: 26, won: 5, drawn: 9, lost: 12, goalsFor: 22, goalsAgainst: 44, points: 24, form: ["E", "P", "P", "E", "P"] },
  { played: 26, won: 4, drawn: 8, lost: 14, goalsFor: 20, goalsAgainst: 46, points: 20, form: ["P", "P", "E", "P", "P"] },
  { played: 26, won: 3, drawn: 7, lost: 16, goalsFor: 18, goalsAgainst: 50, points: 16, form: ["P", "P", "P", "E", "P"] },
];

function buildMockTwentyTeamStandings(teamNames: readonly string[], avilesName: string, avilesPosition = 2): Team[] {
  const rest = teamNames.filter((name) => name !== avilesName);
  const orderedNames = [...rest];
  orderedNames.splice(Math.max(0, avilesPosition - 1), 0, avilesName);

  return orderedNames.map((name, index) => {
    const stats = MOCK_STANDINGS_STATS[index] ?? MOCK_STANDINGS_STATS[MOCK_STANDINGS_STATS.length - 1];
    const id =
      name === "Real Avilés B"
        ? "filial-real-aviles-b"
        : name === "Real Avilés Industrial Femenino"
          ? "real-aviles-industrial-femenino"
          : slugifyCanteraTeamName(name);

    return {
      ...baseTeamFromName(name, index + 1),
      id,
      position: index + 1,
      form: stats.form,
      stats: {
        played: stats.played,
        won: stats.won,
        drawn: stats.drawn,
        lost: stats.lost,
        goalsFor: stats.goalsFor,
        goalsAgainst: stats.goalsAgainst,
        points: stats.points,
      },
    };
  });
}

export function buildFilialStandings(): Team[] {
  return buildSegundaAsturfutbolTable();
}

export function buildFemeninoCanteraStandings(): Team[] {
  return buildMockTwentyTeamStandings(FEMENINO_TEAM_NAMES, "Real Avilés Industrial Femenino", 1);
}

export function buildFilialCalendar(): Match[] {
  return buildSegundaAsturfutbolFilialCalendar();
}

export function buildFemeninoCanteraCalendar(): Match[] {
  const avilesId = "real-aviles-industrial-femenino";
  return [
    {
      id: "fem-cantera-j12",
      matchday: 12,
      homeTeamId: avilesId,
      awayTeamId: "fem-cantera-oviedo-moderno",
      homeTeam: "Real Avilés Industrial Femenino",
      awayTeam: "Oviedo Moderno",
      date: "2026-04-12T10:00:00.000Z",
      competition: "liga-femenina",
      venue: "Muro de Zaro",
      status: "scheduled",
    },
    {
      id: "fem-cantera-j11",
      matchday: 11,
      homeTeamId: "fem-cantera-cd-covadonga-femenino",
      awayTeamId: avilesId,
      homeTeam: "CD Covadonga Femenino",
      awayTeam: "Real Avilés Industrial Femenino",
      date: "2026-04-05T11:30:00.000Z",
      competition: "liga-femenina",
      venue: "Juan Antonio Alvarez",
      status: "finished",
      homeScore: 1,
      awayScore: 3,
    },
  ];
}

export function getCanteraStandings(teamId: CanteraTeamId): Team[] {
  if (teamId === "juvenil-a") return buildJuvenilU19Standings();
  if (teamId === "femenino") return buildFemeninoCanteraStandings();
  return buildFilialStandings();
}

export function getCanteraCalendar(teamId: CanteraTeamId): Match[] {
  if (teamId === "juvenil-a") return getJuvenilAvilesCalendarMatches();
  if (teamId === "femenino") return buildFemeninoCanteraCalendar();
  return buildFilialCalendar();
}
