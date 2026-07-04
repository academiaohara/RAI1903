import { extractKickoffTimeUtc } from "@/lib/match-kickoff-time";
import {
  buildJuvenilU19Matches,
  getCanteraPrimaryAvilesTeamId,
  type CanteraTeamId,
} from "@/lib/cantera-data";
import { buildSegundaAsturfutbolAllMatches } from "@/lib/segunda-asturfutbol-2526";
import { getLastPlayedLeagueRound } from "@/lib/standings";
import type { Match, Matchday } from "@/types";
import type {
  JornadaFixture,
  JornadaRoundData,
  JornadaRoundId,
  JornadaRoundSummary,
  JornadasDataset,
} from "@/types/jornadas";

function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(new Date(iso));
}

function extractKickoffTime(iso: string): string | undefined {
  return extractKickoffTimeUtc(iso);
}

function matchesToMatchdays(matches: Match[]): Matchday[] {
  const byRound = new Map<number, Match[]>();
  for (const match of matches) {
    const roundMatches = byRound.get(match.matchday) ?? [];
    roundMatches.push(match);
    byRound.set(match.matchday, roundMatches);
  }
  return [...byRound.entries()]
    .sort(([a], [b]) => a - b)
    .map(([round, roundMatches]) => ({ round, matches: roundMatches }));
}

function representativeDate(matches: Match[]): string {
  if (matches.length === 0) return new Date().toISOString();
  const sorted = [...matches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return sorted[0].date;
}

function opponentFromClubMatch(matches: Match[], clubTeamId: string): { teamId: string; name: string } | undefined {
  const clubMatch = matches.find((m) => m.homeTeamId === clubTeamId || m.awayTeamId === clubTeamId);
  if (!clubMatch) return undefined;
  const isHome = clubMatch.homeTeamId === clubTeamId;
  return {
    teamId: isHome ? clubMatch.awayTeamId : clubMatch.homeTeamId,
    name: isHome ? clubMatch.awayTeam : clubMatch.homeTeam,
  };
}

function matchToFixture(match: Match, jornadaId: JornadaRoundId, clubTeamId: string): JornadaFixture {
  const involvesClub = match.homeTeamId === clubTeamId || match.awayTeamId === clubTeamId;
  return {
    id: match.id,
    jornadaId,
    roundNumber: match.matchday,
    homeTeamId: match.homeTeamId,
    awayTeamId: match.awayTeamId,
    homeTeamName: match.homeTeam,
    awayTeamName: match.awayTeam,
    date: match.date,
    grupo: "1",
    involvesRai: involvesClub,
    status: match.status,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    kickoffTime: match.status === "scheduled" ? extractKickoffTime(match.date) : undefined,
  };
}

function buildLeagueRoundSummary(
  matchday: Matchday,
  clubTeamId: string,
  currentRound: number,
): JornadaRoundSummary {
  const id: JornadaRoundId = `j${matchday.round}`;
  const opponent = opponentFromClubMatch(matchday.matches, clubTeamId);
  const date = representativeDate(matchday.matches);

  return {
    id,
    label: `J${matchday.round}`,
    kind: "league",
    roundNumber: matchday.round,
    date,
    shortDate: formatShortDate(date),
    opponentTeamId: opponent?.teamId,
    opponentName: opponent?.name,
    isCurrent: matchday.round === currentRound,
  };
}

function getCanteraMatchdays(teamId: CanteraTeamId): Matchday[] {
  const matches =
    teamId === "filial" ? buildSegundaAsturfutbolAllMatches() : buildJuvenilU19Matches();
  return matchesToMatchdays(matches);
}

export function buildCanteraJornadasDatasetFromMatches(
  teamId: CanteraTeamId,
  matches: Match[],
): JornadasDataset {
  const clubTeamId = getCanteraPrimaryAvilesTeamId(teamId);
  const matchdays = matchesToMatchdays(matches);
  return buildCanteraJornadasDatasetCore(matchdays, clubTeamId);
}

function buildCanteraJornadasDatasetCore(matchdays: Matchday[], clubTeamId: string): JornadasDataset {
  const currentRound = getLastPlayedLeagueRound(matchdays);
  const currentRoundId: JornadaRoundId = `j${currentRound}`;

  const leagueSummaries = matchdays.map((md) => buildLeagueRoundSummary(md, clubTeamId, currentRound));
  const leagueRoundDataCache = new Map<JornadaRoundId, JornadaRoundData>();

  for (const summary of leagueSummaries) {
    const round = summary.roundNumber!;
    const matches = matchdays.find((md) => md.round === round)?.matches ?? [];
    const fixtures = matches.map((m) => matchToFixture(m, summary.id, clubTeamId));
    leagueRoundDataCache.set(summary.id, {
      summary,
      matchesByGrupo: { "1": fixtures, "2": [] },
    });
  }

  return {
    rounds: leagueSummaries,
    currentRoundId,
    getRound(roundId) {
      return leagueRoundDataCache.get(roundId) ?? leagueRoundDataCache.get(currentRoundId)!;
    },
  };
}

export function buildCanteraJornadasDataset(teamId: CanteraTeamId): JornadasDataset {
  const clubTeamId = getCanteraPrimaryAvilesTeamId(teamId);
  const matchdays = getCanteraMatchdays(teamId);
  return buildCanteraJornadasDatasetCore(matchdays, clubTeamId);
}
