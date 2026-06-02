import { matchToCalendarMatch } from "@/lib/calendar";
import { getTeamByGender } from "@/lib/fixtures";
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
    status: calendarMatch.played ? "finished" : "scheduled",
    homeScore: calendarMatch.homeScore,
    awayScore: calendarMatch.awayScore,
  };
}

export function utcDateInputValue(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function utcTimeInputValue(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  if (hours === 0 && minutes === 0) return "";
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function mergeUtcDateAndTime(iso: string, dateValue: string, timeValue: string): string {
  const fallback = new Date(iso);
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hours, minutes] = timeValue ? timeValue.split(":").map(Number) : [fallback.getUTCHours(), fallback.getUTCMinutes()];
  return new Date(Date.UTC(year, month - 1, day, hours, minutes)).toISOString();
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
    const base = new Date(match.date);
    const [hours, minutes] = patch.kickoffTime.split(":").map(Number);
    merged.date = new Date(
      Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate(), hours, minutes),
    ).toISOString();
  }

  if (patch.homeTeamId && !patch.homeTeam) {
    merged.homeTeam = resolveTeamLabel(patch.homeTeamId, merged.homeTeam, gender, resolveName);
  }
  if (patch.awayTeamId && !patch.awayTeam) {
    merged.awayTeam = resolveTeamLabel(patch.awayTeamId, merged.awayTeam, gender, resolveName);
  }

  return merged;
}

export function applyCalendarMatchOverride(
  calendarMatch: CalendarMatch,
  override: MatchResultOverride | undefined,
  gender: PrimerEquipoGender,
  resolveName?: ResolveFixtureTeamName,
): CalendarMatch {
  if (!override || Object.keys(override).length === 0) return calendarMatch;
  const match = applyMatchResultOverride(calendarMatchToMatch(calendarMatch), override, gender, resolveName);
  return matchToCalendarMatch(match, gender, { resolveTeamName: resolveName });
}

export function teamDisplayName(
  teamId: string,
  gender: PrimerEquipoGender,
  resolveName?: ResolveFixtureTeamName,
  fallback = "",
): string {
  return resolveTeamLabel(teamId, fallback, gender, resolveName);
}
