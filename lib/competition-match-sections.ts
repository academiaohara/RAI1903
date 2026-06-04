import { calendarMatchToMatch } from "@/lib/calendar-match-overrides";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { CalendarMatch, CompetitionId, Match } from "@/types";

const SIDEBAR_MATCH_LIMIT = 5;

const LEAGUE_COMPETITIONS_BY_GENDER: Record<PrimerEquipoGender, readonly CompetitionId[]> = {
  masculino: ["primera-rfef", "liga-raij903"],
  femenino: ["liga-femenina"],
};

function matchTime(match: Pick<CalendarMatch, "date">): number {
  return new Date(match.date).getTime();
}

function isLeagueMatchForGender(
  match: Pick<CalendarMatch, "competition">,
  gender: PrimerEquipoGender,
): boolean {
  return LEAGUE_COMPETITIONS_BY_GENDER[gender].includes(match.competition);
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
    return Number.isFinite(time) && isLeagueMatchForGender(match, gender);
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
