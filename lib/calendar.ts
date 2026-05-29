import { RAI_TEAM_ID } from "@/data/mock";
import { getTeamMatches, getTeamsByGender } from "@/lib/fixtures";
import { getTeamCrest } from "@/lib/team-crests";
import { getCronicaForMatch, getPreviaForMatch } from "@/lib/match-articles";
import { primerEquipoBase, type PrimerEquipoGender } from "@/lib/primer-equipo";
import type { CalendarMatch, Match } from "@/types";
import type { Route } from "next";

const NO_TIME_COMPETITIONS = new Set(["amistoso"]);

function formatKickoffTime(date: string): string | null {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;
  if (parsed.getUTCHours() === 0 && parsed.getUTCMinutes() === 0) return null;
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parsed);
}

function avilesResult(match: Match, raiId: string): string | null {
  if (match.status !== "finished" || match.homeScore === undefined || match.awayScore === undefined) {
    return null;
  }

  const avilesHome = match.homeTeamId === raiId;
  const avilesGoals = avilesHome ? match.homeScore : match.awayScore;
  const rivalGoals = avilesHome ? match.awayScore : match.homeScore;
  return `${avilesGoals}-${rivalGoals}`;
}

export function matchToCalendarMatch(match: Match, gender: PrimerEquipoGender): CalendarMatch {
  const avilesHome = match.homeTeamId === RAI_TEAM_ID;
  const rivalId = avilesHome ? match.awayTeamId : match.homeTeamId;
  const rival = getTeamsByGender(gender).find((team) => team.id === rivalId);
  const cronica = getCronicaForMatch(match.id, gender);
  const previa = getPreviaForMatch(match.id, gender);
  const played = match.status === "finished";
  const hasTime = !NO_TIME_COMPETITIONS.has(match.competition);

  return {
    id: match.id,
    date: match.date,
    opponent: avilesHome ? match.awayTeam : match.homeTeam,
    opponentLogo: rival ? getTeamCrest(rival) : rivalId.slice(0, 3).toUpperCase(),
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    venue: match.venue,
    competition: match.competition,
    competitionStage: match.competitionStage,
    matchday: match.matchday,
    isHome: avilesHome,
    time: played ? null : hasTime ? formatKickoffTime(match.date) : null,
    played,
    result: avilesResult(match, RAI_TEAM_ID),
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    chronicleUrl: cronica ? (`${primerEquipoBase(gender)}/cronicas/${cronica.id}` as Route) : null,
    previaUrl: !played && previa ? (`${primerEquipoBase(gender)}/previas/${previa.id}` as Route) : null,
  };
}

export function getCalendarMatchesByGender(gender: PrimerEquipoGender): CalendarMatch[] {
  return getTeamMatches(RAI_TEAM_ID)
    .map((match) => matchToCalendarMatch(match, gender))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export type CalendarMonth = {
  key: string;
  label: string;
  year: number;
  month: number;
  weeks: Array<Array<{ day: number; match?: CalendarMatch } | null>>;
};

const WEEKDAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"] as const;

export { WEEKDAY_LABELS };

function buildMonthGrid(year: number, month: number, monthMatches: CalendarMatch[]): CalendarMonth["weeks"] {
  const firstDay = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const startOffset = (firstDay.getUTCDay() + 6) % 7;
  const matchByDay = new Map(monthMatches.map((match) => [new Date(match.date).getUTCDate(), match]));

  const cells: Array<{ day: number; match?: CalendarMatch } | null> = [];
  for (let index = 0; index < startOffset; index += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ day, match: matchByDay.get(day) });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: CalendarMonth["weeks"] = [];
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }

  return weeks;
}

export function isUtcToday(year: number, month: number, day: number): boolean {
  const now = new Date();
  return now.getUTCFullYear() === year && now.getUTCMonth() === month && now.getUTCDate() === day;
}

export function buildSingleCalendarMonth(year: number, month: number, matches: CalendarMatch[]): CalendarMonth {
  const key = `${year}-${month}`;
  const monthMatches = matches.filter((match) => {
    const date = new Date(match.date);
    return date.getUTCFullYear() === year && date.getUTCMonth() === month;
  });
  const label = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(
    new Date(Date.UTC(year, month, 1)),
  );

  return { key, label, year, month, weeks: buildMonthGrid(year, month, monthMatches) };
}

export type CalendarMonthGroup = {
  key: string;
  label: string;
  year: number;
  month: number;
  matches: CalendarMatch[];
};

export function groupCalendarMatchesByMonth(matches: CalendarMatch[]): CalendarMonthGroup[] {
  if (matches.length === 0) return [];

  const byMonth = new Map<string, CalendarMatch[]>();
  for (const match of matches) {
    const date = new Date(match.date);
    const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
    const bucket = byMonth.get(key) ?? [];
    bucket.push(match);
    byMonth.set(key, bucket);
  }

  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, monthMatches]) => {
      const [yearStr, monthStr] = key.split("-");
      const year = Number(yearStr);
      const month = Number(monthStr);
      const label = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(
        new Date(Date.UTC(year, month, 1)),
      );

      return {
        key,
        label,
        year,
        month,
        matches: monthMatches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      };
    });
}

/** Match id to scroll to on list view mount: today if present, else next upcoming, else last played. */
export function getListViewScrollTargetId(matches: CalendarMatch[]): string | null {
  if (matches.length === 0) return null;

  const now = new Date();
  const todayYear = now.getUTCFullYear();
  const todayMonth = now.getUTCMonth();
  const todayDay = now.getUTCDate();

  const todayMatch = matches.find((match) => {
    const date = new Date(match.date);
    return date.getUTCFullYear() === todayYear && date.getUTCMonth() === todayMonth && date.getUTCDate() === todayDay;
  });
  if (todayMatch) return todayMatch.id;

  const todayStart = Date.UTC(todayYear, todayMonth, todayDay);
  const upcoming = matches.find((match) => new Date(match.date).getTime() >= todayStart);
  if (upcoming) return upcoming.id;

  return matches[matches.length - 1].id;
}

export function buildCalendarMonths(matches: CalendarMatch[]): CalendarMonth[] {
  if (matches.length === 0) return [];

  const byMonth = new Map<string, CalendarMatch[]>();
  for (const match of matches) {
    const date = new Date(match.date);
    const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
    const bucket = byMonth.get(key) ?? [];
    bucket.push(match);
    byMonth.set(key, bucket);
  }

  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, monthMatches]) => {
      const [yearStr, monthStr] = key.split("-");
      const year = Number(yearStr);
      const month = Number(monthStr);
      const label = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(
        new Date(Date.UTC(year, month, 1)),
      );

      return { key, label, year, month, weeks: buildMonthGrid(year, month, monthMatches) };
    });
}
