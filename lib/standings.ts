import { isLeagueCompetition, type LeagueCompetitionId } from "@/lib/competition-labels";
import { isMatchPlayed } from "@/lib/match-result";
import { RESULTADOS_2526_LAST_ROUND } from "@/lib/resultados-2526";
import { sortStandingsByRfefRules } from "@/lib/rfef-rules/tiebreak";
import type { LeagueTiebreakContext } from "@/lib/rfef-rules/types";
import type { FormCode, Match, StandingsZone, Team } from "@/types";

/** Alcance de partidos en la tabla: todos, solo como local o solo como visitante. */
export type StandingsVenue = "all" | "home" | "away";

export const STANDINGS_VENUE_LABELS: Record<StandingsVenue, string> = {
  all: "General",
  home: "Local",
  away: "Visitante",
};

export type FinishedLeagueMatch = {
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  date: string;
};

export type StandingsZonesConfig = {
  promotion: number;
  playoff: number;
  relegation: number;
};

export const DEFAULT_STANDINGS_ZONES: StandingsZonesConfig = {
  promotion: 2,
  playoff: 4,
  relegation: 2,
};

type RecentResult = { outcome: FormCode; date: string };

export type TeamStandingsAccumulator = {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  recentResults: RecentResult[];
};

export type ComputedStandingsRow = TeamStandingsAccumulator & {
  position: number;
  goalDifference: number;
  zone: StandingsZone;
  form: FormCode[];
  tiebreakNote?: string;
};

function outcomeForTeam(homeTeamId: string, awayTeamId: string, teamId: string, homeScore: number, awayScore: number): FormCode {
  const isHome = teamId === homeTeamId;
  const goalsFor = isHome ? homeScore : awayScore;
  const goalsAgainst = isHome ? awayScore : homeScore;
  if (goalsFor > goalsAgainst) return "G";
  if (goalsFor < goalsAgainst) return "P";
  return "E";
}

function createAccumulator(teamId: string): TeamStandingsAccumulator {
  return {
    teamId,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
    recentResults: [],
  };
}

function applyMatch(acc: TeamStandingsAccumulator, match: FinishedLeagueMatch, teamId: string): void {
  const isHome = teamId === match.homeTeamId;
  const goalsFor = isHome ? match.homeScore : match.awayScore;
  const goalsAgainst = isHome ? match.awayScore : match.homeScore;
  const outcome = outcomeForTeam(match.homeTeamId, match.awayTeamId, teamId, match.homeScore, match.awayScore);

  acc.played += 1;
  acc.goalsFor += goalsFor;
  acc.goalsAgainst += goalsAgainst;
  acc.recentResults.push({ outcome, date: match.date });

  if (outcome === "G") {
    acc.won += 1;
    acc.points += 3;
  } else if (outcome === "E") {
    acc.drawn += 1;
    acc.points += 1;
  } else {
    acc.lost += 1;
  }
}

function compareStandingsSimple(a: TeamStandingsAccumulator, b: TeamStandingsAccumulator): number {
  if (b.points !== a.points) return b.points - a.points;
  const dgA = a.goalsFor - a.goalsAgainst;
  const dgB = b.goalsFor - b.goalsAgainst;
  if (dgB !== dgA) return dgB - dgA;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  return a.teamId.localeCompare(b.teamId);
}

function sortAccumulators(
  rows: TeamStandingsAccumulator[],
  matches: readonly FinishedLeagueMatch[],
  tiebreak?: LeagueTiebreakContext,
): TeamStandingsAccumulator[] {
  if (!tiebreak) {
    return [...rows].sort(compareStandingsSimple);
  }

  const { orderedTeamIds } = sortStandingsByRfefRules(rows, matches, tiebreak);
  const byId = new Map(rows.map((row) => [row.teamId, row]));
  return orderedTeamIds.map((id) => byId.get(id)!);
}

function zoneForPosition(position: number, teamCount: number, zones: StandingsZonesConfig): StandingsZone {
  if (position <= zones.promotion) return "promotion";
  if (position <= zones.promotion + zones.playoff) return "playoff";
  if (position > teamCount - zones.relegation) return "relegation";
  return "mid";
}

/** Recalcula zonas de ascenso/playoff/descenso según la posición actual en la tabla. */
export function applyPositionZonesToTeams(teams: Team[], zones: StandingsZonesConfig): Team[] {
  const count = teams.length;
  return teams.map((team) => ({
    ...team,
    zone: zoneForPosition(team.position, count, zones),
    zoneColorClass: undefined,
  }));
}

export function matchToFinishedLeagueMatch(match: Match): FinishedLeagueMatch | null {
  if (!isMatchPlayed(match) || match.homeScore === undefined || match.awayScore === undefined) {
    return null;
  }
  if (!isLeagueCompetition(match.competition)) return null;
  return {
    homeTeamId: match.homeTeamId,
    awayTeamId: match.awayTeamId,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    date: match.date,
  };
}

export function extractLeagueMatches(matches: Match[]): FinishedLeagueMatch[] {
  return matches.flatMap((match) => {
    const finished = matchToFinishedLeagueMatch(match);
    return finished ? [finished] : [];
  });
}

export function computeStandings(
  teamIds: readonly string[],
  matches: readonly FinishedLeagueMatch[],
  zones: StandingsZonesConfig = DEFAULT_STANDINGS_ZONES,
  tiebreak?: LeagueTiebreakContext,
  venue: StandingsVenue = "all",
): ComputedStandingsRow[] {
  const byTeam = new Map(teamIds.map((id) => [id, createAccumulator(id)]));

  for (const match of matches) {
    const home = byTeam.get(match.homeTeamId);
    const away = byTeam.get(match.awayTeamId);
    if (!home || !away) continue;
    if (venue !== "away") applyMatch(home, match, match.homeTeamId);
    if (venue !== "home") applyMatch(away, match, match.awayTeamId);
  }

  const rows = [...byTeam.values()];
  const useTiebreak = tiebreak && venue === "all";
  const tiebreakResult = useTiebreak ? sortStandingsByRfefRules(rows, matches, tiebreak) : null;
  const sorted = useTiebreak
    ? sortAccumulators(rows, matches, tiebreak)
    : [...rows].sort(compareStandingsSimple);

  return sorted.map((row, index) => {
    const position = index + 1;
    const form = [...row.recentResults]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-5)
      .map((entry) => entry.outcome);

    const meta = tiebreakResult?.metaByTeamId.get(row.teamId);

    return {
      ...row,
      recentResults: [],
      position,
      goalDifference: row.goalsFor - row.goalsAgainst,
      zone: zoneForPosition(position, sorted.length, zones),
      form,
      tiebreakNote: meta?.note,
    };
  });
}

export function applyStandingsToTeams(
  teams: Team[],
  matches: Match[],
  zones: StandingsZonesConfig = DEFAULT_STANDINGS_ZONES,
  tiebreak?: LeagueTiebreakContext,
  venue: StandingsVenue = "all",
): Team[] {
  const leagueMatches = extractLeagueMatches(matches);
  const standings = computeStandings(
    teams.map((team) => team.id),
    leagueMatches,
    zones,
    tiebreak,
    venue,
  );
  const byId = new Map(standings.map((row) => [row.teamId, row]));

  return teams.map((team) => {
    const row = byId.get(team.id);
    if (!row) return team;
    return {
      ...team,
      position: row.position,
      zone: row.zone,
      form: row.form,
      tiebreakNote: row.tiebreakNote,
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
  });
}

export type HomeAwayRecord = {
  played: number;
  wins: number;
  draws: number;
  losses: number;
};

/** Jornada de liga del partido (prioriza `match.matchday`; el contenedor puede venir mal del CMS). */
export function leagueRoundForMatch(match: Match, matchdayRound?: number): number {
  if (Number.isFinite(match.matchday) && match.matchday > 0) {
    return match.matchday;
  }
  if (Number.isFinite(matchdayRound) && matchdayRound! > 0) {
    return matchdayRound!;
  }
  return 0;
}

export function getMatchesBeforeRound(
  matchdays: Array<{ round: number; matches: Match[] }>,
  exclusiveUpperRound: number,
): Match[] {
  return matchdays.flatMap((matchday) =>
    matchday.matches.filter((match) => leagueRoundForMatch(match, matchday.round) < exclusiveUpperRound),
  );
}

export function zeroedTeamsForStandings(teams: Team[]): Team[] {
  return teams.map((team) => ({
    ...team,
    position: 0,
    form: [],
    stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
  }));
}

export function getTeamsAtRound(
  teams: Team[],
  matchdays: Array<{ round: number; matches: Match[] }>,
  round: number,
  zones: StandingsZonesConfig = DEFAULT_STANDINGS_ZONES,
  tiebreak?: LeagueTiebreakContext,
  venue: StandingsVenue = "all",
): Team[] {
  const priorMatches = getMatchesBeforeRound(matchdays, round);
  return applyStandingsToTeams(zeroedTeamsForStandings(teams), priorMatches, zones, tiebreak, venue);
}

/** Jornadas de liga con al menos un partido finalizado. */
export function getPlayedLeagueRounds(matchdays: Array<{ round: number; matches: Match[] }>): number[] {
  const rounds = new Set<number>();
  for (const matchday of matchdays) {
    for (const match of matchday.matches) {
      if (!isMatchPlayed(match)) continue;
      const round = leagueRoundForMatch(match, matchday.round);
      if (round > 0) rounds.add(round);
    }
  }
  return [...rounds].sort((a, b) => a - b);
}

/** Última jornada de liga con al menos un partido finalizado (1 si aún no hay resultados). */
export function getLastPlayedLeagueRound(matchdays: Array<{ round: number; matches: Match[] }>): number {
  const played = getPlayedLeagueRounds(matchdays);
  return played[played.length - 1] ?? 1;
}

/** Round exclusivo superior para incluir la jornada indicada en la clasificación. */
export function qualifyingRoundAfterJornada(jornada: number): number {
  return Math.min(jornada + 1, RESULTADOS_2526_LAST_ROUND + 1);
}

export function getHomeAwayRecordBeforeRound(
  teamId: string,
  side: "home" | "away",
  matchdays: Array<{ round: number; matches: Match[] }>,
  round: number,
): HomeAwayRecord {
  const record: HomeAwayRecord = { played: 0, wins: 0, draws: 0, losses: 0 };
  const priorMatches = getMatchesBeforeRound(matchdays, round);

  for (const match of priorMatches) {
    const finished = matchToFinishedLeagueMatch(match);
    if (!finished) continue;

    const isHomeSide = side === "home";
    if (isHomeSide && finished.homeTeamId !== teamId) continue;
    if (!isHomeSide && finished.awayTeamId !== teamId) continue;

    const outcome = outcomeForTeam(
      finished.homeTeamId,
      finished.awayTeamId,
      teamId,
      finished.homeScore,
      finished.awayScore,
    );

    record.played += 1;
    if (outcome === "G") record.wins += 1;
    else if (outcome === "E") record.draws += 1;
    else record.losses += 1;
  }

  return record;
}

export function leagueMatchesFromMatchdays(
  matchdays: Array<{ matches: Match[] }>,
  competitionFilter?: readonly LeagueCompetitionId[],
): FinishedLeagueMatch[] {
  const all = matchdays.flatMap((round) => round.matches);
  const filtered =
    competitionFilter === undefined
      ? all
      : all.filter((match) => competitionFilter.includes(match.competition as LeagueCompetitionId));
  return extractLeagueMatches(filtered);
}
