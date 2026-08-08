import { RAI_FEM_TEAM_ID, RAI_TEAM_ID } from "@/data/mock";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import {
  getDefaultFixtureSource,
  type JornadasFixtureSource,
} from "@/lib/season/fixture-source";
import { utcDateInputValue } from "@/lib/calendar-match-overrides";
import { extractKickoffTimeUtc } from "@/lib/match-kickoff-time";
import { PLACEHOLDER_MATCH_DATE } from "@/lib/competition/normalize-fixtures";
import { isMatchPlayed } from "@/lib/match-result";
import { getTeam } from "@/lib/fixtures";
import { getLastPlayedLeagueRound } from "@/lib/standings";
import { isClubTeamMatch, resolveClubSideInMatch } from "@/lib/season/club-team-ids";
import type { Match, Matchday } from "@/types";
import type {
  JornadaFixture,
  JornadaGrupo,
  JornadaRoundData,
  JornadaRoundId,
  JornadaRoundSummary,
  JornadasDataset,
} from "@/types/jornadas";

function raiTeamId(gender: PrimerEquipoGender): string {
  return gender === "femenino" ? RAI_FEM_TEAM_ID : RAI_TEAM_ID;
}

export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(new Date(iso));
}

function extractKickoffTime(iso: string): string | undefined {
  return extractKickoffTimeUtc(iso);
}

function matchToFixture(
  match: Match,
  jornadaId: JornadaRoundId,
  grupo: JornadaGrupo,
  clubTeamIds: readonly string[],
): JornadaFixture {
  const involvesRai = isClubTeamMatch(match, clubTeamIds);
  return {
    id: match.id,
    jornadaId,
    roundNumber: match.matchday,
    homeTeamId: match.homeTeamId,
    awayTeamId: match.awayTeamId,
    homeTeamName: match.homeTeam,
    awayTeamName: match.awayTeam,
    date: match.date,
    grupo,
    involvesRai,
    status: match.status,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    kickoffTime: !isMatchPlayed(match) ? extractKickoffTime(match.date) : undefined,
  };
}

function opponentFromRaiMatch(
  matches: Match[],
  clubTeamIds: readonly string[],
): { teamId: string; name: string } | undefined {
  const raiMatch = matches.find((match) => isClubTeamMatch(match, clubTeamIds));
  if (!raiMatch) return undefined;
  const clubSide = resolveClubSideInMatch(raiMatch, clubTeamIds);
  if (!clubSide) return undefined;
  const isHome = clubSide.isHome;
  return {
    teamId: isHome ? raiMatch.awayTeamId : raiMatch.homeTeamId,
    name: isHome ? raiMatch.awayTeam : raiMatch.homeTeam,
  };
}

function representativeDate(matches: Match[], clubTeamIds: readonly string[]): string {
  return representativeDateFromFixtures(
    matches.map((match) => ({
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      homeTeamName: match.homeTeam,
      awayTeamName: match.awayTeam,
      date: match.date,
    })),
    clubTeamIds,
  );
}

/** Igual que representativeDate pero sobre fixtures ya enriquecidos (p. ej. con overrides). */
export function representativeDateFromFixtures(
  fixtures: Array<{
    homeTeamId: string;
    awayTeamId: string;
    homeTeamName?: string;
    awayTeamName?: string;
    date: string;
  }>,
  clubTeamIds: readonly string[],
): string {
  const raiFixture = fixtures.find((fixture) =>
    isClubTeamMatch(
      {
        homeTeamId: fixture.homeTeamId,
        awayTeamId: fixture.awayTeamId,
        homeTeam: fixture.homeTeamName ?? "",
        awayTeam: fixture.awayTeamName ?? "",
      } as Match,
      clubTeamIds,
    ),
  );
  if (raiFixture) return raiFixture.date;
  if (fixtures.length === 0) return PLACEHOLDER_MATCH_DATE;
  const sorted = [...fixtures].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return sorted[0].date;
}

/** Encabezado de día en jornadas (p. ej. 24/08/2026). */
export function formatJornadaDayHeading(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export type JornadaDayGroup = {
  dayKey: string;
  heading: string;
  fixtures: JornadaFixture[];
};

/** Agrupa partidos de una jornada por día de calendario (UTC). */
export function groupFixturesByCalendarDay(fixtures: JornadaFixture[]): JornadaDayGroup[] {
  const byDay = new Map<string, JornadaFixture[]>();

  for (const fixture of fixtures) {
    const dayKey = utcDateInputValue(fixture.date) || "sin-fecha";
    const list = byDay.get(dayKey) ?? [];
    list.push(fixture);
    byDay.set(dayKey, list);
  }

  return [...byDay.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([dayKey, dayFixtures]) => {
      const sorted = [...dayFixtures].sort((a, b) => {
        if (a.involvesRai !== b.involvesRai) return a.involvesRai ? -1 : 1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
      return {
        dayKey,
        heading: formatJornadaDayHeading(sorted[0]?.date ?? ""),
        fixtures: sorted,
      };
    });
}

function buildLeagueRoundSummary(
  matchday: Matchday,
  clubTeamIds: readonly string[],
  currentRound: number,
): JornadaRoundSummary {
  const id: JornadaRoundId = `j${matchday.round}`;
  const opponent = opponentFromRaiMatch(matchday.matches, clubTeamIds);
  const date = representativeDate(matchday.matches, clubTeamIds);

  return {
    id,
    label: `J${matchday.round}`,
    kind: "league",
    roundNumber: matchday.round,
    date,
    shortDate: formatShortDate(date),
    opponentTeamId: opponent?.teamId,
    opponentName: opponent?.name,
    isCurrent: matchday.round === currentRound,
  };
}

function sortFixtures(matches: JornadaFixture[]): JornadaFixture[] {
  return [...matches].sort((a, b) => {
    if (a.involvesRai !== b.involvesRai) return a.involvesRai ? -1 : 1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
}

function buildRoundData(
  summary: JornadaRoundSummary,
  grupo1Matches: Match[],
  grupo2Matches: Match[],
  clubTeamIds: readonly string[],
): JornadaRoundData {
  const grupo1 = sortFixtures(grupo1Matches.map((m) => matchToFixture(m, summary.id, "1", clubTeamIds)));
  const grupo2 = sortFixtures(grupo2Matches.map((m) => matchToFixture(m, summary.id, "2", clubTeamIds)));

  return {
    summary,
    matchesByGrupo: { "1": grupo1, "2": grupo2 },
  };
}

function matchdayByRound(matchdaysList: Matchday[], round: number): Matchday | undefined {
  return matchdaysList.find((md) => md.round === round);
}

/**
 * Construye el dataset de jornadas para la UI.
 * Los partidos de liga provienen del calendario de la temporada (CMS o mock).
 */
function buildFemeninoJornadasDataset(
  source: JornadasFixtureSource,
  clubTeamIds: readonly string[],
): JornadasDataset {
  const currentRound = getLastPlayedLeagueRound(source.matchdaysFemenino);
  const currentRoundId: JornadaRoundId = `j${currentRound}`;

  const leagueSummaries = [...source.matchdaysFemenino]
    .sort((a, b) => a.round - b.round)
    .map((md) => buildLeagueRoundSummary(md, clubTeamIds, currentRound));

  const rounds: JornadaRoundSummary[] = leagueSummaries;
  const leagueRoundDataCache = new Map<JornadaRoundId, JornadaRoundData>();

  for (const summary of leagueSummaries) {
    const round = summary.roundNumber!;
    const matches = matchdayByRound(source.matchdaysFemenino, round)?.matches ?? [];
    leagueRoundDataCache.set(summary.id, buildRoundData(summary, matches, [], clubTeamIds));
  }

  return {
    rounds,
    currentRoundId,
    getRound(roundId) {
      return leagueRoundDataCache.get(roundId) ?? leagueRoundDataCache.get(currentRoundId)!;
    },
  };
}

export function buildJornadasDataset(
  gender: PrimerEquipoGender,
  source: JornadasFixtureSource = getDefaultFixtureSource(),
  clubTeamIds: readonly string[] = [raiTeamId(gender)],
): JornadasDataset {
  if (gender === "femenino") {
    return buildFemeninoJornadasDataset(source, clubTeamIds);
  }

  const currentRound = getLastPlayedLeagueRound(source.matchdays);
  const currentRoundId: JornadaRoundId = `j${currentRound}`;

  const leagueSummaries = [...source.matchdays]
    .sort((a, b) => a.round - b.round)
    .map((md) => buildLeagueRoundSummary(md, clubTeamIds, currentRound));

  const rounds: JornadaRoundSummary[] = leagueSummaries;
  const leagueRoundDataCache = new Map<JornadaRoundId, JornadaRoundData>();

  for (const summary of leagueSummaries) {
    const round = summary.roundNumber!;
    const g1 = matchdayByRound(source.matchdays, round)?.matches ?? [];
    const g2 = matchdayByRound(source.matchdaysGrupo2, round)?.matches ?? [];
    leagueRoundDataCache.set(summary.id, buildRoundData(summary, g1, g2, clubTeamIds));
  }

  return {
    rounds,
    currentRoundId,
    getRound(roundId) {
      const leagueData = leagueRoundDataCache.get(roundId);
      if (leagueData) return leagueData;

      const fallback = rounds[0];
      return leagueRoundDataCache.get(fallback.id) ?? leagueRoundDataCache.get(currentRoundId)!;
    },
  };
}

export function getJornadaTeam(teamId: string) {
  return getTeam(teamId);
}

/** Título de la tarjeta de resultados: respeta etiqueta personalizada si difiere del J{n} por defecto. */
export function jornadaSectionTitle(
  summary: JornadaRoundSummary,
  customLabel: string | undefined,
): string {
  if (customLabel && customLabel !== summary.label) return customLabel;
  if (summary.roundNumber !== undefined) return `Jornada ${summary.roundNumber}`;
  return summary.label;
}
