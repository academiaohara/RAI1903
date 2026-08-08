import { matchToCalendarMatch } from "@/lib/calendar";
import {
  mergeSpainDateAndTime,
  spainDateInputValue,
  spainTimeInputValue,
} from "@/lib/match-kickoff-time";
import { getTeamByGender } from "@/lib/fixtures";
import { isMatchPlayed } from "@/lib/match-result";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { CalendarMatch, Match } from "@/types";

export type MatchResultOverride = Partial<Match> & {
  kickoffTime?: string;
  /** Alias usado en jornadas (se normaliza a homeTeam/awayTeam). */
  homeTeamName?: string;
  awayTeamName?: string;
};

export type ResolveFixtureTeamName = (teamId: string, fallback: string) => string;

function normalizeMatchResultOverride(override: MatchResultOverride): MatchResultOverride {
  const normalized = { ...override };
  if (normalized.homeTeamName !== undefined && normalized.homeTeam === undefined) {
    normalized.homeTeam = normalized.homeTeamName;
  }
  if (normalized.awayTeamName !== undefined && normalized.awayTeam === undefined) {
    normalized.awayTeam = normalized.awayTeamName;
  }
  return normalized;
}

function resolveTeamLabel(
  teamId: string,
  fallback: string,
  gender: PrimerEquipoGender,
  resolveName?: ResolveFixtureTeamName,
): string {
  if (resolveName) return resolveName(teamId, fallback);
  const team = getTeamByGender(teamId, gender);
  return team?.shortName ?? team?.name ?? fallback;
}

export function calendarMatchToMatch(calendarMatch: CalendarMatch): Match {
  return {
    id: calendarMatch.id,
    matchday: calendarMatch.matchday ?? 0,
    homeTeamId: calendarMatch.homeTeamId,
    awayTeamId: calendarMatch.awayTeamId,
    homeTeam: calendarMatch.homeTeam,
    awayTeam: calendarMatch.awayTeam,
    date: calendarMatch.date,
    competition: calendarMatch.competition,
    competitionStage: calendarMatch.competitionStage,
    venue: calendarMatch.venue,
    status: isMatchPlayed(calendarMatch) ? "finished" : "scheduled",
    homeScore: calendarMatch.homeScore,
    awayScore: calendarMatch.awayScore,
  };
}

export function utcDateInputValue(iso: string): string {
  return spainDateInputValue(iso);
}

export function utcTimeInputValue(iso: string): string {
  return spainTimeInputValue(iso);
}

export function mergeUtcDateAndTime(iso: string, dateValue: string, timeValue: string): string {
  return mergeSpainDateAndTime(iso, dateValue, timeValue);
}

export function applyMatchResultOverride(
  match: Match,
  override: MatchResultOverride,
  gender: PrimerEquipoGender = "masculino",
  resolveName?: ResolveFixtureTeamName,
): Match {
  const patch = normalizeMatchResultOverride(override);
  const merged: Match = { ...match, ...patch };

  if (patch.kickoffTime !== undefined && patch.date === undefined) {
    merged.date = mergeSpainDateAndTime(match.date, spainDateInputValue(match.date), patch.kickoffTime);
  }

  if (patch.homeTeamId && !patch.homeTeam) {
    merged.homeTeam = resolveTeamLabel(patch.homeTeamId, merged.homeTeam, gender, resolveName);
  }
  if (patch.awayTeamId && !patch.awayTeam) {
    merged.awayTeam = resolveTeamLabel(patch.awayTeamId, merged.awayTeam, gender, resolveName);
  }

  if (patch.homeScore !== undefined && patch.awayScore !== undefined) {
    merged.status = "finished";
  }

  if (patch.status === "scheduled") {
    merged.homeScore = undefined;
    merged.awayScore = undefined;
  } else if (isMatchPlayed(merged) && merged.status !== "finished") {
    merged.status = "finished";
  }

  return merged;
}

export function applyCalendarMatchOverride(
  calendarMatch: CalendarMatch,
  override: MatchResultOverride | undefined,
  gender: PrimerEquipoGender,
  resolveName?: ResolveFixtureTeamName,
  clubTeamIds?: readonly string[],
): CalendarMatch {
  if (!override || Object.keys(override).length === 0) return calendarMatch;
  const match = applyMatchResultOverride(calendarMatchToMatch(calendarMatch), override, gender, resolveName);
  const rebuilt = matchToCalendarMatch(match, gender, {
    resolveTeamName: resolveName,
    clubTeamIds,
  });
  return {
    ...rebuilt,
    chronicleUrl: calendarMatch.chronicleUrl,
    previaUrl: calendarMatch.previaUrl,
  };
}

export function teamDisplayName(
  teamId: string,
  gender: PrimerEquipoGender,
  resolveName?: ResolveFixtureTeamName,
  fallback = "",
): string {
  return resolveTeamLabel(teamId, fallback, gender, resolveName);
}
