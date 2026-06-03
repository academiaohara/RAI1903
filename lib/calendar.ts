import { getAvilesMatchesByGender, getRaiTeamId, getTeamsByGender } from "@/lib/fixtures";
import { isMatchPlayed } from "@/lib/match-result";
import { getTeamCrest, getTeamCrestById } from "@/lib/team-crests";
import { defaultCronicaId, defaultPreviaId } from "@/lib/match-article-factory";
import { getCronicaForMatch, getPreviaForMatch } from "@/lib/match-articles";
import { primerEquipoBase, primerEquipoHasCronicas, type PrimerEquipoGender } from "@/lib/primer-equipo";
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
  if (!isMatchPlayed(match) || match.homeScore === undefined || match.awayScore === undefined) {
    return null;
  }

  const avilesHome = match.homeTeamId === raiId;
  const avilesGoals = avilesHome ? match.homeScore : match.awayScore;
  const rivalGoals = avilesHome ? match.awayScore : match.homeScore;
  return `${avilesGoals}-${rivalGoals}`;
}

type MatchArticleLookup = {
  getCronica?: (matchId: string, gender: PrimerEquipoGender) => { id: string } | undefined;
  getPrevia?: (matchId: string, gender: PrimerEquipoGender) => { id: string } | undefined;
  /** When CMS crests load, pass the map so calendar rows re-resolve opponent logos. */
  crestMap?: Record<string, string>;
  /** Resuelve nombres desde guía de liga / bundle teams (p. ej. sustituye «Equipo 42»). */
  resolveTeamName?: (teamId: string, fallback: string) => string;
};

export function matchToCalendarMatch(
  match: Match,
  gender: PrimerEquipoGender,
  articles?: MatchArticleLookup,
): CalendarMatch {
  const raiId = getRaiTeamId(gender);
  const avilesHome = match.homeTeamId === raiId;
  const rivalId = avilesHome ? match.awayTeamId : match.homeTeamId;
  const rival = getTeamsByGender(gender).find((team) => team.id === rivalId);
  const cronica = articles?.getCronica?.(match.id, gender) ?? getCronicaForMatch(match.id, gender);
  const previa = articles?.getPrevia?.(match.id, gender) ?? getPreviaForMatch(match.id, gender);
  const played = isMatchPlayed(match);
  const hasTime = !NO_TIME_COMPETITIONS.has(match.competition);
  const opponentLogo = rival
    ? getTeamCrest(rival)
    : getTeamCrestById(rivalId, rivalId.slice(0, 3).toUpperCase());

  const opponentFallback = avilesHome ? match.awayTeam : match.homeTeam;
  const opponent =
    articles?.resolveTeamName?.(rivalId, opponentFallback) ?? opponentFallback;

  return {
    id: match.id,
    date: match.date,
    opponent,
    opponentLogo,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    homeTeamId: match.homeTeamId,
    awayTeamId: match.awayTeamId,
    venue: match.venue,
    competition: match.competition,
    competitionStage: match.competitionStage,
    matchday: match.matchday,
    isHome: avilesHome,
    time: played ? null : hasTime ? formatKickoffTime(match.date) : null,
    played,
    result: avilesResult(match, raiId),
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    chronicleUrl:
      primerEquipoHasCronicas(gender) && played
        ? (`${primerEquipoBase(gender)}/cronicas/${cronica?.id ?? defaultCronicaId(match.id, gender)}` as Route)
        : null,
    previaUrl:
      primerEquipoHasCronicas(gender) && !played
        ? (`${primerEquipoBase(gender)}/cronicas/${previa?.id ?? defaultPreviaId(match.id, gender)}` as Route)
        : null,
  };
}

export function getCalendarMatchesByGender(gender: PrimerEquipoGender): CalendarMatch[] {
  return getAvilesMatchesByGender(gender)
    .map((match) => matchToCalendarMatch(match, gender))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getCalendarMatchesFromSource(
  matches: Match[],
  gender: PrimerEquipoGender,
  articles?: MatchArticleLookup,
): CalendarMatch[] {
  void articles?.crestMap;
  return matches
    .map((match) => matchToCalendarMatch(match, gender, articles))
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

function compareCalendarMonthKeys(a: string, b: string): number {
  const [yearA, monthA] = a.split("-").map(Number);
  const [yearB, monthB] = b.split("-").map(Number);
  return yearA - yearB || monthA - monthB;
}

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
    .sort(([a], [b]) => compareCalendarMonthKeys(a, b))
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

/** July (0-based month 6) when season id is e.g. 2025-26. */
export function seasonIdToUtcStartMonth(seasonId: string): { year: number; month: number } | null {
  const match = /^(\d{4})-\d{2}$/.exec(seasonId.trim());
  if (!match) return null;
  return { year: Number(match[1]), month: 6 };
}

export type CalendarNavigationBounds = {
  minYear: number;
  minMonth: number;
  maxYear: number;
  maxMonth: number;
};

export function shiftUtcCalendarMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const date = new Date(Date.UTC(year, month + delta, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
}

function compareUtcMonth(yearA: number, monthA: number, yearB: number, monthB: number): number {
  return yearA - yearB || monthA - monthB;
}

export function getCalendarNavigationBounds(
  matches: CalendarMatch[],
  seasonIds: string[],
): CalendarNavigationBounds {
  const now = new Date();
  let minYear = now.getUTCFullYear();
  let minMonth = now.getUTCMonth();
  let maxYear = minYear;
  let maxMonth = minMonth;

  for (const seasonId of seasonIds) {
    const start = seasonIdToUtcStartMonth(seasonId);
    if (!start) continue;
    if (compareUtcMonth(start.year, start.month, minYear, minMonth) < 0) {
      minYear = start.year;
      minMonth = start.month;
    }
    // Temporada futbolística hasta junio del año siguiente (p. ej. 2026-27 → jun 2027).
    const seasonEndYear = start.year + 1;
    const seasonEndMonth = 5;
    if (compareUtcMonth(seasonEndYear, seasonEndMonth, maxYear, maxMonth) > 0) {
      maxYear = seasonEndYear;
      maxMonth = seasonEndMonth;
    }
  }

  for (const match of matches) {
    const date = new Date(match.date);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    if (compareUtcMonth(year, month, minYear, minMonth) < 0) {
      minYear = year;
      minMonth = month;
    }
    if (compareUtcMonth(year, month, maxYear, maxMonth) > 0) {
      maxYear = year;
      maxMonth = month;
    }
  }

  return { minYear, minMonth, maxYear, maxMonth };
}

export function canNavigateCalendarMonth(
  year: number,
  month: number,
  delta: number,
  bounds: CalendarNavigationBounds,
): boolean {
  const next = shiftUtcCalendarMonth(year, month, delta);
  if (delta < 0) {
    return compareUtcMonth(next.year, next.month, bounds.minYear, bounds.minMonth) >= 0;
  }
  return compareUtcMonth(next.year, next.month, bounds.maxYear, bounds.maxMonth) <= 0;
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
    .sort(([a], [b]) => compareCalendarMonthKeys(a, b))
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
