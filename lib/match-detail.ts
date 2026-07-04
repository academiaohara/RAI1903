import { matchdays, matchdaysFemenino } from "@/data/mock";
import { isLeagueCompetition, matchCompetitionShortLabel } from "@/lib/competition-labels";
import { getMatchById, getTeamMatches } from "@/lib/fixtures";
import { isMatchPlayed } from "@/lib/match-result";
import { getMatchesBeforeRound, leagueRoundForMatch } from "@/lib/standings";
import { formatMatchKickoffDisplay } from "@/lib/match-kickoff-time";
import type {
  FormCode,
  Match,
  MatchArticle,
  MatchAvailabilityPlayer,
  MatchDetail,
  MatchLineup,
  Matchday,
  PrimerEquipoGender,
  RecentFormMatch,
} from "@/types";

export type BuildMatchDetailOptions = {
  /** Jornadas de liga de la temporada (CMS o mock). Si faltan, se usa el calendario mock del género. */
  leagueMatchdays?: Matchday[];
  /** Etiqueta de temporada visible (p. ej. `25/26`). */
  seasonLabel?: string;
};

const EMPTY_LINEUP: MatchLineup = { formation: "", starters: [], bench: [] };

function formatKickoffDateLabel(date: string): string {
  return new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" }).format(new Date(date));
}

function formFromMatch(teamId: string, match: Match): FormCode {
  if (match.status !== "finished" || match.homeScore === undefined || match.awayScore === undefined) return "E";
  const isHome = match.homeTeamId === teamId;
  const goalsFor = isHome ? match.homeScore : match.awayScore;
  const goalsAgainst = isHome ? match.awayScore : match.homeScore;
  if (goalsFor > goalsAgainst) return "G";
  if (goalsFor < goalsAgainst) return "P";
  return "E";
}

function toRecentFormMatch(teamId: string, match: Match): RecentFormMatch {
  const score =
    match.status === "finished" && match.homeScore !== undefined && match.awayScore !== undefined
      ? `${match.homeScore}-${match.awayScore}`
      : "—";
  return {
    date: new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(new Date(match.date)),
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    score,
    competition: matchCompetitionShortLabel(match),
    resultCode: formFromMatch(teamId, match),
  };
}

function buildAvailability(): MatchAvailabilityPlayer[] {
  return [];
}

function resolveLeagueMatchdays(gender: PrimerEquipoGender, options?: BuildMatchDetailOptions): Matchday[] {
  if (options?.leagueMatchdays?.length) return options.leagueMatchdays;
  return gender === "femenino" ? matchdaysFemenino : matchdays;
}

/** Ultimos 5 partidos del equipo antes del partido de referencia (en liga: jornadas anteriores a la suya). */
export function collectTeamRecentMatchesForPrevia(
  teamId: string,
  referenceMatch: Match,
  gender: PrimerEquipoGender,
  options?: BuildMatchDetailOptions,
): Match[] {
  if (isLeagueCompetition(referenceMatch.competition)) {
    const beforeRound = leagueRoundForMatch(referenceMatch);
    return getMatchesBeforeRound(resolveLeagueMatchdays(gender, options), beforeRound)
      .filter((item) => item.homeTeamId === teamId || item.awayTeamId === teamId)
      .filter((item) => isMatchPlayed(item) && item.id !== referenceMatch.id)
      .filter((item) => isLeagueCompetition(item.competition) && item.competition === referenceMatch.competition)
      .sort((a, b) => {
        const roundDiff = leagueRoundForMatch(b) - leagueRoundForMatch(a);
        if (roundDiff !== 0) return roundDiff;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      })
      .slice(0, 5);
  }

  const referenceTime = new Date(referenceMatch.date).getTime();
  return getTeamMatches(teamId)
    .filter((item) => isMatchPlayed(item) && item.id !== referenceMatch.id)
    .filter((item) => new Date(item.date).getTime() < referenceTime)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
}

export function buildMatchDetail(
  match: Match,
  gender: PrimerEquipoGender,
  options?: BuildMatchDetailOptions,
): MatchDetail {
  const homeRecent = collectTeamRecentMatchesForPrevia(match.homeTeamId, match, gender, options).map((item) =>
    toRecentFormMatch(match.homeTeamId, item),
  );

  const awayRecent = collectTeamRecentMatchesForPrevia(match.awayTeamId, match, gender, options).map((item) =>
    toRecentFormMatch(match.awayTeamId, item),
  );

  const homeLineup = EMPTY_LINEUP;
  const awayLineup = EMPTY_LINEUP;

  return {
    match,
    gender,
    referee: "",
    attendance: null,
    kickoffTime: formatMatchKickoffDisplay(match.date),
    kickoffDateLabel: formatKickoffDateLabel(match.date),
    seasonLabel: options?.seasonLabel ?? "",
    stats: [],
    events: [],
    homeLineup,
    awayLineup,
    homeRecentMatches: homeRecent,
    awayRecentMatches: awayRecent,
    headToHead: [],
    h2hSummary: { wins: 0, draws: 0, losses: 0 },
    availability: {
      home: buildAvailability(),
      away: buildAvailability(),
    },
    rdpPrevia: null,
    rdpPostpartido: null,
    resumenVideo: null,
  };
}

export function getMatchForArticle(article: MatchArticle): Match | null {
  const found = getMatchById(article.matchId);
  if (found) return found;

  if (!article.matchId.startsWith("fem-")) return null;

  const scoreMatch = article.title.match(/(\d+)\s*-\s*(\d+)/);
  const homeScore = scoreMatch ? Number(scoreMatch[1]) : undefined;
  const awayScore = scoreMatch ? Number(scoreMatch[2]) : undefined;
  const isFinished = homeScore !== undefined && awayScore !== undefined;

  return {
    id: article.matchId,
    matchday: 8,
    homeTeamId: "real-aviles-industrial-femenino",
    awayTeamId: "llanera",
    homeTeam: "Real Avilés Industrial Femenino",
    awayTeam: "UD Llanera",
    date: article.date,
    competition: "liga-femenina",
    venue: "Roman Suarez Puerta",
    status: isFinished ? "finished" : "scheduled",
    homeScore: isFinished ? homeScore : undefined,
    awayScore: isFinished ? awayScore : undefined,
  };
}

export function getMatchDetailForArticle(article: MatchArticle): MatchDetail | null {
  const match = getMatchForArticle(article);
  if (!match) return null;
  return buildMatchDetail(match, article.gender);
}
