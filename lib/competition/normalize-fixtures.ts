import { matchesPerLeagueRound, leagueRoundCount } from "@/lib/cms/competition-config-bundle";
import type { SeasonCompetitionConfigBundle } from "@/lib/cms/competition-config-bundle";
import { resolveMatchCompetition } from "@/lib/cms/competition-config-bundle";
import type { Match, Matchday, CompetitionId } from "@/types";

/** Fecha lejana para partidos sin asignar; evita bloquear la quiniela antes de fijar horarios. */
export const PLACEHOLDER_MATCH_DATE = "2099-07-01T12:00:00.000Z";

export function isPlaceholderTeamId(teamId: string): boolean {
  return teamId.startsWith("cms-slot-");
}

/** Partido generado automáticamente (aún sin equipos reales del grupo). */
export function isPlaceholderMatch(match: Match): boolean {
  return isPlaceholderTeamId(match.homeTeamId) || isPlaceholderTeamId(match.awayTeamId);
}

export function isSchedulableMatchday(matchday: Matchday): boolean {
  return matchday.matches.some((match) => !isPlaceholderMatch(match));
}

function placeholderTeamId(slot: number): string {
  return `cms-slot-${slot}`;
}

function placeholderTeamName(slot: number): string {
  return `Equipo ${slot}`;
}

function createPlaceholderMatch(
  round: number,
  matchIndex: number,
  grupo: "1" | "2",
  competition: CompetitionId,
): Match {
  const base = matchIndex * 2;
  const homeSlot = base + 1;
  const awaySlot = base + 2;
  const suffix = grupo === "2" ? "-g2" : "";
  return {
    id: `cms-ph-j${round}${suffix}-m${matchIndex}`,
    competition,
    matchday: round,
    date: PLACEHOLDER_MATCH_DATE,
    status: "scheduled",
    homeTeamId: placeholderTeamId(homeSlot),
    awayTeamId: placeholderTeamId(awaySlot),
    homeTeam: placeholderTeamName(homeSlot),
    awayTeam: placeholderTeamName(awaySlot),
    venue: "",
  };
}

function ensureMatchdayMatches(
  existing: Matchday | undefined,
  round: number,
  expectedCount: number,
  grupo: "1" | "2",
  competition: CompetitionId,
): Matchday {
  const matches = [...(existing?.matches ?? [])];
  while (matches.length < expectedCount) {
    matches.push(createPlaceholderMatch(round, matches.length, grupo, competition));
  }
  return { round, matches };
}

/** Rellena jornadas vacías y partidos placeholder hasta completar el calendario de liga. */
export function normalizeLeagueMatchdays(
  matchdays: Matchday[],
  config: SeasonCompetitionConfigBundle,
  competitionOverride?: CompetitionId,
): Matchday[] {
  const competition = competitionOverride ?? resolveMatchCompetition(config);
  const totalRounds = leagueRoundCount(config.teamsPerGroup);
  const perRound = matchesPerLeagueRound(config.teamsPerGroup);
  const result: Matchday[] = [];

  for (let round = 1; round <= totalRounds; round++) {
    const existing = matchdays.find((md) => md.round === round);
    result.push(ensureMatchdayMatches(existing, round, perRound, "1", competition));
  }

  return result;
}

export function normalizeGrupo2Matchdays(
  matchdaysGrupo2: Matchday[],
  config: SeasonCompetitionConfigBundle,
  competitionOverride?: CompetitionId,
): Matchday[] {
  if (config.groupCount < 2) return matchdaysGrupo2;
  return normalizeLeagueMatchdays(matchdaysGrupo2, config, competitionOverride).map((md) => ({
    ...md,
    matches: md.matches.map((m) => ({
      ...m,
      id: m.id.includes("-g2") ? m.id : `${m.id}-g2`,
    })),
  }));
}

export function applyFixtureTeamNamesToMatches(
  matches: Match[],
  resolveName: (teamId: string, fallback: string) => string,
): Match[] {
  return matches.map((m) => ({
    ...m,
    homeTeam: resolveName(m.homeTeamId, m.homeTeam),
    awayTeam: resolveName(m.awayTeamId, m.awayTeam),
  }));
}

export function applyFixtureTeamNames(
  matchdays: Matchday[],
  resolveName: (teamId: string, fallback: string) => string,
): Matchday[] {
  return matchdays.map((md) => ({
    ...md,
    matches: applyFixtureTeamNamesToMatches(md.matches, resolveName),
  }));
}
