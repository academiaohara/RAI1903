import { calendarMatchToMatch } from "@/lib/calendar-match-overrides";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { CalendarMatch, CompetitionId, Match } from "@/types";

const SIDEBAR_MATCH_LIMIT = 5;

const MASCULINO_SIDEBAR_LEAGUE_COMPETITIONS: readonly CompetitionId[] = ["primera-rfef", "liga-raij903"];

function matchTime(match: Pick<CalendarMatch, "date">): number {
  return new Date(match.date).getTime();
}

function isSidebarMatch(
  match: Pick<CalendarMatch, "competition">,
  gender: PrimerEquipoGender,
): boolean {
  if (gender === "femenino") return true;
  return MASCULINO_SIDEBAR_LEAGUE_COMPETITIONS.includes(match.competition);
}

export function getCompetitionSidebarMatches(
  calendarMatches: CalendarMatch[],
  gender: PrimerEquipoGender,
  now = new Date(),
  limit = SIDEBAR_MATCH_LIMIT,
): { latest: Match[]; upcoming: Match[] } {
  const nowTime = now.getTime();
  const leagueMatches = calendarMatches.filter((match) => {
    const time = matchTime(match);
    return Number.isFinite(time) && isSidebarMatch(match, gender);
  });

  const latest = leagueMatches
    .filter((match) => matchTime(match) < nowTime)
    .sort((a, b) => matchTime(b) - matchTime(a))
    .slice(0, limit)
    .map(calendarMatchToMatch);

  const upcoming = leagueMatches
    .filter((match) => matchTime(match) >= nowTime)
    .sort((a, b) => matchTime(a) - matchTime(b))
    .slice(0, limit)
    .map(calendarMatchToMatch);

  return { latest, upcoming };
}
