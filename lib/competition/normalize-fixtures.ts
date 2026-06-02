import { matchesPerLeagueRound, leagueRoundCount } from "@/lib/cms/competition-config-bundle";
import type { SeasonCompetitionConfigBundle } from "@/lib/cms/competition-config-bundle";
import type { Match, Matchday } from "@/types";

function placeholderTeamId(slot: number): string {
  return `cms-slot-${slot}`;
}

function placeholderTeamName(slot: number): string {
  return `Equipo ${slot}`;
}

function createPlaceholderMatch(round: number, matchIndex: number, grupo: "1" | "2"): Match {
  const base = matchIndex * 2;
  const homeSlot = base + 1;
  const awaySlot = base + 2;
  const suffix = grupo === "2" ? "-g2" : "";
  return {
    id: `cms-ph-j${round}${suffix}-m${matchIndex}`,
    competition: "primera-rfef",
    matchday: round,
    date: new Date().toISOString(),
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
): Matchday {
  const matches = [...(existing?.matches ?? [])];
  while (matches.length < expectedCount) {
    matches.push(createPlaceholderMatch(round, matches.length, grupo));
  }
  return { round, matches };
}

/** Rellena jornadas vacías y partidos placeholder hasta completar el calendario de liga. */
export function normalizeLeagueMatchdays(
  matchdays: Matchday[],
  config: SeasonCompetitionConfigBundle,
): Matchday[] {
  const totalRounds = leagueRoundCount(config.teamsPerGroup);
  const perRound = matchesPerLeagueRound(config.teamsPerGroup);
  const result: Matchday[] = [];

  for (let round = 1; round <= totalRounds; round++) {
    const existing = matchdays.find((md) => md.round === round);
    result.push(ensureMatchdayMatches(existing, round, perRound, "1"));
  }

  return result;
}

export function normalizeGrupo2Matchdays(
  matchdaysGrupo2: Matchday[],
  config: SeasonCompetitionConfigBundle,
): Matchday[] {
  if (config.groupCount < 2) return matchdaysGrupo2;
  return normalizeLeagueMatchdays(matchdaysGrupo2, config).map((md) => ({
    ...md,
    matches: md.matches.map((m) => ({
      ...m,
      id: m.id.includes("-g2") ? m.id : `${m.id}-g2`,
    })),
  }));
}

export function applyFixtureTeamNames(
  matchdays: Matchday[],
  resolveName: (teamId: string, fallback: string) => string,
): Matchday[] {
  return matchdays.map((md) => ({
    ...md,
    matches: md.matches.map((m) => ({
      ...m,
      homeTeam: resolveName(m.homeTeamId, m.homeTeam),
      awayTeam: resolveName(m.awayTeamId, m.awayTeam),
    })),
  }));
}
