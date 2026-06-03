import { fanPreviaVideos, fanRdpVideos, fanResumenesVideosByGender, players, playersFemenino } from "@/data/mock";
import { matchCompetitionShortLabel } from "@/lib/competition-labels";
import { getMatchById, getRaiTeamId, getTeamMatches } from "@/lib/fixtures";
import { youtubeVideoId } from "@/lib/youtube";
import type {
  FormCode,
  Match,
  MatchArticle,
  MatchAvailabilityPlayer,
  MatchDetail,
  MatchLineup,
  MatchVideo,
  PrimerEquipoGender,
  RecentFormMatch,
} from "@/types";

const EMPTY_LINEUP: MatchLineup = { formation: "", starters: [], bench: [] };

function hashSeed(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function seeded(seed: number, offset = 0): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

function formatKickoffTime(date: string): string {
  return new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(date));
}

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

function buildAvailability(teamId: string, gender: PrimerEquipoGender): MatchAvailabilityPlayer[] {
  const raiId = getRaiTeamId(gender);
  if (teamId !== raiId) return [];

  const squad = gender === "femenino" ? playersFemenino : players;
  return squad
    .filter((player) => player.status === "lesionado" || player.status === "sancionado")
    .map((player) => ({
      playerId: player.id,
      name: player.displayName,
      reason: player.status === "lesionado" ? "lesionado" : "sancionado",
      detail: "",
    }));
}

function pickVideo(videos: { id: string; title: string; url: string }[], seed: number, label: string): MatchVideo | null {
  if (videos.length === 0) return null;
  const video = videos[Math.floor(seeded(seed, 30) * videos.length)];
  if (!youtubeVideoId(video.url)) return null;
  return { ...video, label };
}

export function buildMatchDetail(match: Match, gender: PrimerEquipoGender): MatchDetail {
  const seed = hashSeed(`${match.id}-${gender}`);

  const homeRecent = getTeamMatches(match.homeTeamId)
    .filter((item) => item.status === "finished" && item.id !== match.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map((item) => toRecentFormMatch(match.homeTeamId, item));

  const awayRecent = getTeamMatches(match.awayTeamId)
    .filter((item) => item.status === "finished" && item.id !== match.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map((item) => toRecentFormMatch(match.awayTeamId, item));

  const homeLineup = EMPTY_LINEUP;
  const awayLineup = EMPTY_LINEUP;

  return {
    match,
    gender,
    referee: "",
    attendance: null,
    kickoffTime: formatKickoffTime(match.date),
    kickoffDateLabel: formatKickoffDateLabel(match.date),
    seasonLabel: "2025/2026",
    stats: [],
    events: [],
    homeLineup,
    awayLineup,
    homeRecentMatches: homeRecent,
    awayRecentMatches: awayRecent,
    headToHead: [],
    h2hSummary: { wins: 0, draws: 0, losses: 0 },
    availability: {
      home: buildAvailability(match.homeTeamId, gender),
      away: buildAvailability(match.awayTeamId, gender),
    },
    rdpPrevia: pickVideo(fanPreviaVideos, seed, "RDP Previa"),
    rdpPostpartido: match.status === "finished" ? pickVideo(fanRdpVideos, seed + 3, "RDP Postpartido") : null,
    resumenVideo:
      match.status === "finished"
        ? pickVideo(fanResumenesVideosByGender[gender], seed + 7, "Resumen")
        : null,
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
