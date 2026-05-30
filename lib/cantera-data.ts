import juvenilU19 from "@/data/cantera-juvenil-u19-2526.json";
import {
  buildSegundaAsturfutbolFilialCalendar,
  buildSegundaAsturfutbolTable,
} from "@/lib/segunda-asturfutbol-2526";
import { computeStandings, extractLeagueMatches } from "@/lib/standings";
import type { CalendarMatch, FormCode, Match, Team } from "@/types";

export type CanteraTeamId = "filial" | "juvenil-a";

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
  return ["filial-real-aviles-b"];
}

export function getCanteraPrimaryAvilesTeamId(teamId: CanteraTeamId): string {
  if (teamId === "juvenil-a") return slugifyCanteraTeamName("Real Avilés U19");
  return "filial-real-aviles-b";
}

export function isCanteraClubTeam(teamId: CanteraTeamId, rowTeamId: string, teamName?: string): boolean {
  const ids = getCanteraClubHighlightTeamIds(teamId);
  if (ids.includes(rowTeamId)) return true;
  return teamName ? isAvilesCanteraTeamName(teamName) : false;
}

function formatJuvenilAvilesResultLine(match: Match): string {
  const avilesId = slugifyCanteraTeamName("Real Avilés U19");
  if (match.homeTeamId === avilesId) {
    return `Real Avilés U19 ${match.homeScore}-${match.awayScore} ${match.awayTeam}`;
  }
  return `${match.homeTeam} ${match.homeScore}-${match.awayScore} Real Avilés U19`;
}

export function buildJuvenilSummary() {
  const standings = buildJuvenilU19Standings();
  const avilesId = slugifyCanteraTeamName("Real Avilés U19");
  const aviles = standings.find((team) => team.id === avilesId);
  const calendar = getJuvenilAvilesCalendarMatches();
  const finished = calendar.filter((m) => m.status === "finished");
  const lastMatch = finished.at(-1);
  const nextMatch = calendar.find((m) => m.status === "scheduled");

  return {
    category: "Liga Nacional Juvenil",
    position: aviles ? `${aviles.position}º - ${aviles.stats.points} pts` : "—",
    lastResult: lastMatch ? formatJuvenilAvilesResultLine(lastMatch) : "—",
    nextMatch: nextMatch
      ? `${nextMatch.homeTeam} - ${nextMatch.awayTeam}`
      : "Temporada 2025-26 finalizada",
  };
}

export function buildFilialStandings(): Team[] {
  return buildSegundaAsturfutbolTable();
}

export function buildFilialCalendar(): Match[] {
  return buildSegundaAsturfutbolFilialCalendar();
}

export function getCanteraStandings(teamId: CanteraTeamId): Team[] {
  if (teamId === "juvenil-a") return buildJuvenilU19Standings();
  return buildFilialStandings();
}

export function getCanteraCalendar(teamId: CanteraTeamId): Match[] {
  if (teamId === "juvenil-a") return getJuvenilAvilesCalendarMatches();
  return buildFilialCalendar();
}
