import { RAI_FEM_TEAM_ID, RAI_TEAM_ID } from "@/data/mock";
import {
  buildPlayoffBracketThroughLeagueRound,
  buildPlayoffFixturesForRound,
  isDefinitiveQualifyingRound,
  playoffFixturesForBothGrupos,
  type PlayoffRoundKey,
} from "@/lib/playoff-jornadas";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import {
  getDefaultFixtureSource,
  type JornadasFixtureSource,
} from "@/lib/season/fixture-source";
import { utcDateInputValue } from "@/lib/calendar-match-overrides";
import { PLACEHOLDER_MATCH_DATE } from "@/lib/competition/normalize-fixtures";
import { getTeam } from "@/lib/fixtures";
import { getLastPlayedLeagueRound } from "@/lib/standings";
import type { Match, Matchday } from "@/types";
import type {
  JornadaFixture,
  JornadaGrupo,
  JornadaRoundData,
  JornadaRoundId,
  JornadaRoundSummary,
  JornadasDataset,
  JornadasGetRoundOptions,
} from "@/types/jornadas";

const PLAYOFF_ROUNDS: Array<{
  id: JornadaRoundId;
  label: string;
  /** Fecha placeholder hasta que haya datos reales. */
  date: string;
}> = [
  { id: "po-sf-ida", label: "SF Ida", date: "2026-05-30T16:00:00.000Z" },
  { id: "po-sf-vuelta", label: "SF Vta", date: "2026-06-06T18:30:00.000Z" },
  { id: "po-f-ida", label: "Final Ida", date: "2026-06-13T18:30:00.000Z" },
  { id: "po-f-vuelta", label: "Final Vta", date: "2026-06-20T20:00:00.000Z" },
];

function raiTeamId(gender: PrimerEquipoGender): string {
  return gender === "femenino" ? RAI_FEM_TEAM_ID : RAI_TEAM_ID;
}

export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(new Date(iso));
}

function extractKickoffTime(iso: string): string | undefined {
  const date = new Date(iso);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  if (hours === 12 && minutes === 0) return undefined;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function matchToFixture(
  match: Match,
  jornadaId: JornadaRoundId,
  grupo: JornadaGrupo,
  raiId: string,
): JornadaFixture {
  const involvesRai = match.homeTeamId === raiId || match.awayTeamId === raiId;
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
    kickoffTime: match.status === "scheduled" ? extractKickoffTime(match.date) : undefined,
  };
}

function opponentFromRaiMatch(matches: Match[], raiId: string): { teamId: string; name: string } | undefined {
  const raiMatch = matches.find((m) => m.homeTeamId === raiId || m.awayTeamId === raiId);
  if (!raiMatch) return undefined;
  const isHome = raiMatch.homeTeamId === raiId;
  return {
    teamId: isHome ? raiMatch.awayTeamId : raiMatch.homeTeamId,
    name: isHome ? raiMatch.awayTeam : raiMatch.homeTeam,
  };
}

/** Fecha del partido del Real Avilés; si no hay, la del primer partido de la jornada. */
function representativeDate(matches: Match[], raiId: string): string {
  return representativeDateFromFixtures(
    matches.map((match) => ({
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      date: match.date,
    })),
    raiId,
  );
}

/** Igual que representativeDate pero sobre fixtures ya enriquecidos (p. ej. con overrides). */
export function representativeDateFromFixtures(
  fixtures: Array<{ homeTeamId: string; awayTeamId: string; date: string }>,
  raiId: string,
): string {
  const raiFixture = fixtures.find((fixture) => fixture.homeTeamId === raiId || fixture.awayTeamId === raiId);
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
  raiId: string,
  currentRound: number,
): JornadaRoundSummary {
  const id: JornadaRoundId = `j${matchday.round}`;
  const opponent = opponentFromRaiMatch(matchday.matches, raiId);
  const date = representativeDate(matchday.matches, raiId);

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

function buildPlayoffRoundSummary(
  playoff: (typeof PLAYOFF_ROUNDS)[number],
  isCurrent: boolean,
  qualifyingLeagueRound: number,
): JornadaRoundSummary {
  return {
    id: playoff.id,
    label: playoff.label,
    kind: "playoff",
    date: playoff.date,
    shortDate: formatShortDate(playoff.date),
    isCurrent,
    isProvisional: !isDefinitiveQualifyingRound(qualifyingLeagueRound),
  };
}

function buildPlayoffRoundData(
  summary: JornadaRoundSummary,
  qualifyingLeagueRound: number,
  raiId: string,
): JornadaRoundData {
  const playoffMeta = PLAYOFF_ROUNDS.find((round) => round.id === summary.id);
  if (!playoffMeta) {
    return { summary, matchesByGrupo: { "1": [], "2": [] } };
  }

  const bracket = buildPlayoffBracketThroughLeagueRound(qualifyingLeagueRound);
  const fixtures = buildPlayoffFixturesForRound(
    summary.id as PlayoffRoundKey,
    playoffMeta.date,
    bracket,
    raiId,
  );

  return {
    summary,
    matchesByGrupo: playoffFixturesForBothGrupos(fixtures),
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
  raiId: string,
): JornadaRoundData {
  const grupo1 = sortFixtures(grupo1Matches.map((m) => matchToFixture(m, summary.id, "1", raiId)));
  const grupo2 = sortFixtures(grupo2Matches.map((m) => matchToFixture(m, summary.id, "2", raiId)));

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
 * Los partidos de liga provienen de los JSON de resultados; el playoff de ascenso
 * se genera desde el cuadro RFEF (clasificados definitivos o provisionales por jornada).
 */
function buildFemeninoJornadasDataset(source: JornadasFixtureSource): JornadasDataset {
  const raiId = RAI_FEM_TEAM_ID;
  const currentRound = getLastPlayedLeagueRound(source.matchdaysFemenino);
  const currentRoundId: JornadaRoundId = `j${currentRound}`;

  const leagueSummaries = [...source.matchdaysFemenino]
    .sort((a, b) => a.round - b.round)
    .map((md) => buildLeagueRoundSummary(md, raiId, currentRound));

  const rounds: JornadaRoundSummary[] = leagueSummaries;
  const leagueRoundDataCache = new Map<JornadaRoundId, JornadaRoundData>();

  for (const summary of leagueSummaries) {
    const round = summary.roundNumber!;
    const matches = matchdayByRound(source.matchdaysFemenino, round)?.matches ?? [];
    leagueRoundDataCache.set(summary.id, buildRoundData(summary, matches, [], raiId));
  }

  return {
    rounds,
    currentRoundId,
    definitiveQualifyingLeagueRound: currentRound,
    getRound(roundId) {
      return leagueRoundDataCache.get(roundId) ?? leagueRoundDataCache.get(currentRoundId)!;
    },
  };
}

export type JornadasBuildOptions = {
  /** Si false, no se añaden jornadas de playoff RFEF al carrusel. */
  hasPlayoff?: boolean;
};

export function buildJornadasDataset(
  gender: PrimerEquipoGender,
  source: JornadasFixtureSource = getDefaultFixtureSource(),
  options?: JornadasBuildOptions,
): JornadasDataset {
  if (gender === "femenino") {
    return buildFemeninoJornadasDataset(source);
  }

  const raiId = raiTeamId(gender);
  const currentRound = getLastPlayedLeagueRound(source.matchdays);
  const currentRoundId: JornadaRoundId = `j${currentRound}`;
  const definitiveQualifyingLeagueRound = source.definitiveQualifyingLeagueRound;

  const leagueSummaries = [...source.matchdays]
    .sort((a, b) => a.round - b.round)
    .map((md) => buildLeagueRoundSummary(md, raiId, currentRound));

  const includePlayoff = options?.hasPlayoff !== false;
  const playoffSummaries = includePlayoff
    ? PLAYOFF_ROUNDS.map((po) => buildPlayoffRoundSummary(po, false, definitiveQualifyingLeagueRound))
    : [];

  const rounds: JornadaRoundSummary[] = [...leagueSummaries, ...playoffSummaries];

  const leagueRoundDataCache = new Map<JornadaRoundId, JornadaRoundData>();

  for (const summary of leagueSummaries) {
    const round = summary.roundNumber!;
    const g1 = matchdayByRound(source.matchdays, round)?.matches ?? [];
    const g2 = matchdayByRound(source.matchdaysGrupo2, round)?.matches ?? [];
    leagueRoundDataCache.set(summary.id, buildRoundData(summary, g1, g2, raiId));
  }

  return {
    rounds,
    currentRoundId,
    definitiveQualifyingLeagueRound,
    getRound(roundId, options?: JornadasGetRoundOptions) {
      const qualifyingLeagueRound =
        options?.qualifyingLeagueRound ?? definitiveQualifyingLeagueRound;

      const leagueData = leagueRoundDataCache.get(roundId);
      if (leagueData) return leagueData;

      const playoffMeta = PLAYOFF_ROUNDS.find((round) => round.id === roundId);
      if (playoffMeta) {
        const summary = buildPlayoffRoundSummary(playoffMeta, false, qualifyingLeagueRound);
        return buildPlayoffRoundData(summary, qualifyingLeagueRound, raiId);
      }

      const fallback = rounds[0];
      return (
        leagueRoundDataCache.get(fallback.id) ??
        buildPlayoffRoundData(
          buildPlayoffRoundSummary(PLAYOFF_ROUNDS[0], false, qualifyingLeagueRound),
          qualifyingLeagueRound,
          raiId,
        )
      );
    },
  };
}

export function getJornadaTeam(teamId: string) {
  return getTeam(teamId);
}

export { PLAYOFF_ROUNDS };
