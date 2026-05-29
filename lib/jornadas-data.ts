import { matchdays, matchdaysGrupo2, RAI_FEM_TEAM_ID, RAI_TEAM_ID } from "@/data/mock";
import { RESULTADOS_2526_LAST_ROUND } from "@/lib/resultados-2526";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { getTeam } from "@/lib/fixtures";
import type { Match, Matchday } from "@/types";
import type {
  JornadaFixture,
  JornadaGrupo,
  JornadaRoundData,
  JornadaRoundId,
  JornadaRoundSummary,
  JornadasDataset,
} from "@/types/jornadas";

const PLAYOFF_ROUNDS: Array<{
  id: JornadaRoundId;
  label: string;
  /** Fecha placeholder hasta que haya datos reales. */
  date: string;
}> = [
  { id: "po-sf-ida", label: "SF Ida", date: "2026-05-30T16:00:00.000Z" },
  { id: "po-sf-vuelta", label: "SF Vta", date: "2026-06-06T18:30:00.000Z" },
  { id: "po-f-ida", label: "Final Ida", date: "2026-06-13T18:30:00.000Z" },
  { id: "po-f-vuelta", label: "Final Vta", date: "2026-06-20T20:00:00.000Z" },
];

function raiTeamId(gender: PrimerEquipoGender): string {
  return gender === "femenino" ? RAI_FEM_TEAM_ID : RAI_TEAM_ID;
}

function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(new Date(iso));
}

function extractKickoffTime(iso: string): string | undefined {
  const date = new Date(iso);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  if (hours === 12 && minutes === 0) return undefined;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function matchToFixture(
  match: Match,
  jornadaId: JornadaRoundId,
  grupo: JornadaGrupo,
  raiId: string,
): JornadaFixture {
  const involvesRai = match.homeTeamId === raiId || match.awayTeamId === raiId;
  return {
    id: match.id,
    jornadaId,
    roundNumber: match.matchday,
    homeTeamId: match.homeTeamId,
    awayTeamId: match.awayTeamId,
    homeTeamName: match.homeTeam,
    awayTeamName: match.awayTeam,
    date: match.date,
    grupo,
    involvesRai,
    status: match.status,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    kickoffTime: match.status === "scheduled" ? extractKickoffTime(match.date) : undefined,
  };
}

function opponentFromRaiMatch(matches: Match[], raiId: string): { teamId: string; name: string } | undefined {
  const raiMatch = matches.find((m) => m.homeTeamId === raiId || m.awayTeamId === raiId);
  if (!raiMatch) return undefined;
  const isHome = raiMatch.homeTeamId === raiId;
  return {
    teamId: isHome ? raiMatch.awayTeamId : raiMatch.homeTeamId,
    name: isHome ? raiMatch.awayTeam : raiMatch.homeTeam,
  };
}

function representativeDate(matches: Match[]): string {
  if (matches.length === 0) return new Date().toISOString();
  const sorted = [...matches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return sorted[0].date;
}

function buildLeagueRoundSummary(
  matchday: Matchday,
  raiId: string,
  currentRound: number,
): JornadaRoundSummary {
  const id: JornadaRoundId = `j${matchday.round}`;
  const opponent = opponentFromRaiMatch(matchday.matches, raiId);
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

function buildPlayoffRoundSummary(
  playoff: (typeof PLAYOFF_ROUNDS)[number],
  isCurrent: boolean,
): JornadaRoundSummary {
  return {
    id: playoff.id,
    label: playoff.label,
    kind: "playoff",
    date: playoff.date,
    shortDate: formatShortDate(playoff.date),
    isCurrent,
  };
}

function sortFixtures(matches: JornadaFixture[]): JornadaFixture[] {
  return [...matches].sort((a, b) => {
    if (a.involvesRai !== b.involvesRai) return a.involvesRai ? -1 : 1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
}

function buildRoundData(
  summary: JornadaRoundSummary,
  grupo1Matches: Match[],
  grupo2Matches: Match[],
  raiId: string,
): JornadaRoundData {
  const grupo1 = sortFixtures(grupo1Matches.map((m) => matchToFixture(m, summary.id, "1", raiId)));
  const grupo2 = sortFixtures(grupo2Matches.map((m) => matchToFixture(m, summary.id, "2", raiId)));

  return {
    summary,
    matchesByGrupo: { "1": grupo1, "2": grupo2 },
  };
}

function matchdayByRound(matchdaysList: Matchday[], round: number): Matchday | undefined {
  return matchdaysList.find((md) => md.round === round);
}

/**
 * Construye el dataset de jornadas para la UI.
 * Los partidos de liga provienen de los JSON de resultados; las fases de playoff
 * quedan preparadas para rellenarse desde API o JSON local.
 */
export function buildJornadasDataset(gender: PrimerEquipoGender): JornadasDataset {
  const raiId = raiTeamId(gender);
  const currentRound = RESULTADOS_2526_LAST_ROUND;
  const currentRoundId: JornadaRoundId = `j${currentRound}`;

  const leagueSummaries = [...matchdays]
    .sort((a, b) => a.round - b.round)
    .map((md) => buildLeagueRoundSummary(md, raiId, currentRound));

  const playoffSummaries = PLAYOFF_ROUNDS.map((po) => buildPlayoffRoundSummary(po, false));

  const rounds: JornadaRoundSummary[] = [...leagueSummaries, ...playoffSummaries];

  const roundDataCache = new Map<JornadaRoundId, JornadaRoundData>();

  for (const summary of leagueSummaries) {
    const round = summary.roundNumber!;
    const g1 = matchdayByRound(matchdays, round)?.matches ?? [];
    const g2 = matchdayByRound(matchdaysGrupo2, round)?.matches ?? [];
    roundDataCache.set(summary.id, buildRoundData(summary, g1, g2, raiId));
  }

  for (const summary of playoffSummaries) {
    roundDataCache.set(summary.id, buildRoundData(summary, [], [], raiId));
  }

  return {
    rounds,
    currentRoundId,
    getRound(roundId) {
      const data = roundDataCache.get(roundId);
      if (!data) {
        const fallback = rounds[0];
        return roundDataCache.get(fallback.id)!;
      }
      return data;
    },
  };
}

export function getJornadaTeam(teamId: string) {
  return getTeam(teamId);
}

export { PLAYOFF_ROUNDS };
