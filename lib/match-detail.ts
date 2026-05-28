import { fanPreviaVideos, fanRdpVideos, newsItems, players, playersFemenino } from "@/data/mock";
import { matchCompetitionShortLabel } from "@/lib/competition-labels";
import { getMatchById, getRaiTeamId, getTeamByGender, getTeamMatches } from "@/lib/fixtures";
import { youtubeVideoId } from "@/lib/youtube";
import type {
  FormCode,
  HeadToHeadEntry,
  LineupPlayer,
  Match,
  MatchArticle,
  MatchAvailability,
  MatchAvailabilityPlayer,
  MatchDetail,
  MatchLineup,
  MatchStatCategory,
  MatchVideo,
  NewsItem,
  Player,
  PrimerEquipoGender,
  RecentFormMatch,
} from "@/types";

const REFEREES = [
  "Miguel San Roman",
  "Jose Antonio Lopez",
  "Fernando Iglesias",
  "Carlos Fernandez",
  "David Martinez",
  "Alberto Ramos",
];

const RIVAL_NAMES = [
  "Garcia Lopez",
  "Martinez Ruiz",
  "Fernandez Diaz",
  "Lopez Perez",
  "Sanchez Torres",
  "Rodriguez Vega",
  "Hernandez Gil",
  "Jimenez Costa",
  "Moreno Blanco",
  "Navarro Prieto",
  "Dominguez Solis",
  "Vazquez Nieto",
];

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

function buildHeadToHead(homeId: string, awayId: string, seed: number): HeadToHeadEntry[] {
  const home = getTeamByGender(homeId, "masculino") ?? getTeamByGender(homeId, "femenino");
  const away = getTeamByGender(awayId, "masculino") ?? getTeamByGender(awayId, "femenino");
  if (!home || !away) return [];

  const entries: HeadToHeadEntry[] = [];
  for (let index = 0; index < 6; index += 1) {
    const homeGoals = Math.floor(seeded(seed, index * 2) * 4);
    const awayGoals = Math.floor(seeded(seed, index * 2 + 1) * 4);
    const flip = index % 2 === 0;
    const date = new Date(Date.UTC(2025, 10 - index, 5 + index * 12));
    const entryHome = flip ? home.name : away.name;
    const entryAway = flip ? away.name : home.name;
    const resultTeamId = flip ? homeId : awayId;
    entries.push({
      date: new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(date),
      homeTeam: entryHome,
      awayTeam: entryAway,
      score: `${homeGoals}-${awayGoals}`,
      competition: index % 3 === 0 ? "Copa" : "Liga",
      resultCode: formFromMatch(
        resultTeamId,
        {
          id: `h2h-${index}`,
          matchday: 1,
          homeTeamId: flip ? homeId : awayId,
          awayTeamId: flip ? awayId : homeId,
          homeTeam: entryHome,
          awayTeam: entryAway,
          date: date.toISOString(),
          competition: "liga-raij903",
          venue: home.stadium,
          status: "finished",
          homeScore: homeGoals,
          awayScore: awayGoals,
        },
      ),
    });
  }
  return entries;
}

function buildLineup(teamId: string, gender: PrimerEquipoGender, seed: number, isAviles: boolean): MatchLineup {
  const squad: Player[] = isAviles ? (gender === "femenino" ? playersFemenino : players) : [];
  const formations = ["4-2-3-1", "4-4-2", "4-3-3", "3-5-2"];
  const formation = formations[Math.floor(seeded(seed, 1) * formations.length)];

  const pickAviles = () => {
    const titulares = squad.filter((player) => player.status === "titular" || player.status === "nuevo fichaje").slice(0, 11);
    const bench = squad.filter((player) => player.status === "suplente" || player.status === "cantera").slice(0, 7);
    return { titulares, bench };
  };

  if (isAviles && squad.length > 0) {
    const picked = pickAviles();
    return {
      formation,
      starters: picked.titulares.map((player) => ({ number: player.number, name: player.displayName })),
      bench: picked.bench.map((player) => ({ number: player.number, name: player.displayName })),
    };
  }

  const starters: LineupPlayer[] = Array.from({ length: 11 }, (_, index) => ({
    number: index + 1,
    name: RIVAL_NAMES[(index + Math.floor(seed)) % RIVAL_NAMES.length],
    role: index === 0 ? "POR" : undefined,
  }));
  const bench: LineupPlayer[] = Array.from({ length: 7 }, (_, index) => ({
    number: 12 + index,
    name: RIVAL_NAMES[(index + 3 + Math.floor(seed)) % RIVAL_NAMES.length],
  }));

  return { formation, starters, bench };
}

function buildStats(match: Match, seed: number): MatchStatCategory[] {
  const homeGoals = match.homeScore ?? Math.floor(seeded(seed, 4) * 3);
  const awayGoals = match.awayScore ?? Math.floor(seeded(seed, 5) * 3);
  const intensity = homeGoals + awayGoals + 2;

  const pct = (value: number) => `${Math.round(value)}%`;
  const homePoss = 38 + Math.floor(seeded(seed, 6) * 24);
  const shotsHome = 8 + homeGoals * 2 + Math.floor(seeded(seed, 7) * 6);
  const shotsAway = 6 + awayGoals * 2 + Math.floor(seeded(seed, 8) * 5);

  return [
    {
      title: "Remates",
      rows: [
        { label: "Remates a puerta", home: shotsHome, away: shotsAway },
        { label: "Remates totales", home: shotsHome + 5, away: shotsAway + 4 },
      ],
    },
    {
      title: "Pases",
      rows: [
        { label: "Pases totales", home: 380 + intensity * 18, away: 360 + intensity * 16 },
        { label: "Pases completados", home: pct(72 + seeded(seed, 11) * 12), away: pct(70 + seeded(seed, 12) * 12) },
        { label: "Posesion", home: pct(homePoss), away: pct(100 - homePoss) },
      ],
    },
    {
      title: "Disciplina",
      rows: [
        { label: "Faltas", home: 10 + Math.floor(seeded(seed, 13) * 8), away: 11 + Math.floor(seeded(seed, 14) * 7) },
        { label: "Tarjetas amarillas", home: Math.floor(seeded(seed, 15) * 4), away: Math.floor(seeded(seed, 16) * 4) },
        { label: "Fueras de juego", home: Math.floor(seeded(seed, 17) * 3), away: Math.floor(seeded(seed, 18) * 3) },
      ],
    },
  ];
}

function buildAvailability(homeId: string, awayId: string, gender: PrimerEquipoGender, seed: number): MatchAvailability {
  const raiId = getRaiTeamId(gender);
  const squad = gender === "femenino" ? playersFemenino : players;

  const avilesUnavailable = (teamId: string): MatchAvailabilityPlayer[] => {
    if (teamId !== raiId) {
      const count = Math.floor(seeded(seed, 20) * 3);
      return Array.from({ length: count }, (_, index) => ({
        name: RIVAL_NAMES[(index + 2) % RIVAL_NAMES.length],
        reason: index % 2 === 0 ? "lesionado" : "sancionado",
        detail: index % 2 === 0 ? "Sobrecarga muscular" : "Sancion por acumulacion",
      }));
    }
    return squad
      .filter((player) => player.status === "lesionado" || player.status === "sancionado")
      .map((player) => ({
        name: player.displayName,
        reason: player.status === "lesionado" ? "lesionado" : "sancionado",
        detail: player.status === "lesionado" ? "Lesion en competicion" : "Sancion disciplinaria",
      }));
  };

  return {
    home: avilesUnavailable(homeId),
    away: avilesUnavailable(awayId),
  };
}

function pickVideo(videos: { id: string; title: string; url: string }[], seed: number, label: string): MatchVideo | null {
  if (videos.length === 0) return null;
  const video = videos[Math.floor(seeded(seed, 30) * videos.length)];
  if (!youtubeVideoId(video.url)) return null;
  return { ...video, label };
}

function pickNewsForMatch(match: Match, type: "previa" | "cronica" | "press"): NewsItem[] {
  const tag = type === "press" ? undefined : type;
  const filtered = newsItems.filter((item) => {
    if (tag && !item.tags.includes(tag)) return false;
    if (type === "press" && item.channel === "club") return item.tags.includes("cronica") || item.tags.includes("partido");
    if (type === "press" && item.channel !== "prensa" && !item.tags.includes("cronica")) return false;
    return true;
  });

  const seed = hashSeed(match.id + type);
  const count = type === "press" ? 8 : 6;
  const picked: NewsItem[] = [];
  for (let index = 0; index < count; index += 1) {
    const item = filtered[Math.floor(seeded(seed, index + 40) * filtered.length)];
    if (item && !picked.some((existing) => existing.id === item.id)) picked.push(item);
  }
  return picked;
}

function summarizeH2H(entries: HeadToHeadEntry[], perspectiveTeamId: string, match: Match): { wins: number; draws: number; losses: number } {
  let wins = 0;
  let draws = 0;
  let losses = 0;
  for (const entry of entries) {
    if (entry.resultCode === "G") wins += 1;
    else if (entry.resultCode === "E") draws += 1;
    else losses += 1;
  }
  void perspectiveTeamId;
  void match;
  return { wins, draws, losses };
}

export function buildMatchDetail(match: Match, gender: PrimerEquipoGender): MatchDetail {
  const seed = hashSeed(`${match.id}-${gender}`);
  const raiId = getRaiTeamId(gender);

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

  const headToHead = buildHeadToHead(match.homeTeamId, match.awayTeamId, seed);
  const h2hSummary = summarizeH2H(headToHead, raiId, match);

  return {
    match,
    gender,
    referee: REFEREES[seed % REFEREES.length],
    attendance: match.status === "finished" ? 4200 + (seed % 9000) : null,
    kickoffTime: formatKickoffTime(match.date),
    kickoffDateLabel: formatKickoffDateLabel(match.date),
    seasonLabel: "2025/2026",
    stats: buildStats(match, seed),
    homeLineup: buildLineup(match.homeTeamId, gender, seed + 1, match.homeTeamId === raiId),
    awayLineup: buildLineup(match.awayTeamId, gender, seed + 2, match.awayTeamId === raiId),
    homeRecentMatches: homeRecent,
    awayRecentMatches: awayRecent,
    headToHead,
    h2hSummary,
    availability: buildAvailability(match.homeTeamId, match.awayTeamId, gender, seed),
    rdpPrevia: pickVideo(fanPreviaVideos, seed, "RDP Previa"),
    rdpPostpartido: match.status === "finished" ? pickVideo(fanRdpVideos, seed + 3, "RDP Postpartido") : null,
    pressNews: pickNewsForMatch(match, "previa"),
    chronicleNews: pickNewsForMatch(match, "press"),
  };
}

export function getMatchForArticle(article: MatchArticle): Match | null {
  const found = getMatchById(article.matchId);
  if (found) return found;

  if (!article.matchId.startsWith("fem-")) return null;

  const isFinished = article.type === "cronica";
  const scoreMatch = article.title.match(/(\d+)\s*-\s*(\d+)/);
  const homeScore = scoreMatch ? Number(scoreMatch[1]) : undefined;
  const awayScore = scoreMatch ? Number(scoreMatch[2]) : undefined;

  return {
    id: article.matchId,
    matchday: 8,
    homeTeamId: "real-aviles-industrial-femenino",
    awayTeamId: "llanera",
    homeTeam: "Real Aviles Industrial Femenino",
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
