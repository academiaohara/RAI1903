import { matchToCalendarMatch } from "@/lib/calendar";
import { getTeamByGender } from "@/lib/fixtures";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { CalendarMatch, Match } from "@/types";

export type MatchResultOverride = Partial<Match> & { kickoffTime?: string };

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
): Match {
  const merged: Match = { ...match, ...override };

  if (override.kickoffTime !== undefined && override.date === undefined) {
    const base = new Date(match.date);
    const [hours, minutes] = override.kickoffTime.split(":").map(Number);
    merged.date = new Date(
      Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate(), hours, minutes),
    ).toISOString();
  }

  if (override.homeTeamId && !override.homeTeam) {
    const team = getTeamByGender(override.homeTeamId, gender);
    merged.homeTeam = team?.shortName ?? team?.name ?? merged.homeTeam;
  }
  if (override.awayTeamId && !override.awayTeam) {
    const team = getTeamByGender(override.awayTeamId, gender);
    merged.awayTeam = team?.shortName ?? team?.name ?? merged.awayTeam;
  }

  return merged;
}

export function applyCalendarMatchOverride(
  calendarMatch: CalendarMatch,
  override: MatchResultOverride | undefined,
  gender: PrimerEquipoGender,
): CalendarMatch {
  if (!override || Object.keys(override).length === 0) return calendarMatch;
  const match = applyMatchResultOverride(calendarMatchToMatch(calendarMatch), override, gender);
  return matchToCalendarMatch(match, gender);
}

export function teamDisplayName(teamId: string, gender: PrimerEquipoGender): string {
  const team = getTeamByGender(teamId, gender);
  return team?.shortName ?? team?.name ?? teamId;
}
