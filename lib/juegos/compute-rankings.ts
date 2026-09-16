import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchSeasonBundlesWithClient } from "@/lib/cms/fetch-season-bundles-server";
import { fetchInlineOverridesWithClient } from "@/lib/cms/inline-overrides-server";
import type { CompetitionSeasonId } from "@/data/mock";
import {
  countPointsForQuinigolRound,
  fetchClasificacionRanking,
  fetchClasificacionUserSubmission,
  fetchQuinigolRoundRanking,
  fetchQuinigolSeasonRanking,
  fetchQuinigolUserRound,
  type ClasificacionUserSubmissionResult,
  type GameRankingEntry,
  type GameSeasonRankingEntry,
  type QuinigolUserRoundResult,
} from "@/lib/game-rankings";
import { isPlaceholderMatch } from "@/lib/competition/normalize-fixtures";
import { buildLeagueMatchdaysFromBundles, buildQuinielaMatchdaysFromBundles } from "@/lib/quiniela/build-matchdays";
import { getMatchdayByRound } from "@/lib/quiniela";
import { resolveGroupTeams } from "@/lib/cms/group-teams";
import { canScoreClasificacionStandings } from "@/lib/clasificacion-prediction";
import type { Matchday, Team } from "@/types";

function resolveScoringMatchday(
  round: number,
  quinielaMatchdays: Matchday[],
  leagueMatchdays: Matchday[],
): Matchday {
  const quiniela = getMatchdayByRound(quinielaMatchdays, round);
  if (quiniela.matches.length > 0) return quiniela;

  const league = getMatchdayByRound(leagueMatchdays, round);
  const matches = league.matches.filter((match) => !isPlaceholderMatch(match));
  return matches.length > 0 ? { round, matches } : quiniela;
}

function buildSeasonScoringMatchdays(
  quinielaMatchdays: Matchday[],
  leagueMatchdays: Matchday[],
  throughRound?: number,
): Matchday[] {
  const roundNumbers = new Set<number>([
    ...quinielaMatchdays.map((matchday) => matchday.round),
    ...leagueMatchdays.map((matchday) => matchday.round),
  ]);
  const maxRound = throughRound ?? (roundNumbers.size > 0 ? Math.max(...roundNumbers) : 0);

  const scoring: Matchday[] = [];
  for (let round = 1; round <= maxRound; round += 1) {
    const matchday = resolveScoringMatchday(round, quinielaMatchdays, leagueMatchdays);
    if (matchday.matches.length === 0) continue;
    scoring.push(matchday);
  }
  return scoring;
}

async function loadGameMatchdays(supabase: SupabaseClient, seasonId: CompetitionSeasonId) {
  const [bundles, inlineOverrides] = await Promise.all([
    fetchSeasonBundlesWithClient(supabase, seasonId),
    fetchInlineOverridesWithClient(supabase, seasonId),
  ]);
  const quinielaMatchdays = buildQuinielaMatchdaysFromBundles(bundles, inlineOverrides);
  const leagueMatchdays = buildLeagueMatchdaysFromBundles(bundles, inlineOverrides);
  const teams = resolveGroupTeams(bundles, "masculino", "1");
  return { bundles, quinielaMatchdays, leagueMatchdays, teams };
}

export type QuinigolRankingComputeResult =
  | {
      scope: "round";
      round: number;
      countPoints: boolean;
      entries: GameRankingEntry[];
      matchdays: Matchday[];
    }
  | {
      scope: "season";
      entries: GameSeasonRankingEntry[];
      matchdays: Matchday[];
      countPoints: boolean;
    };

export async function computeQuinigolRankingFromSupabase(
  supabase: SupabaseClient,
  seasonId: CompetitionSeasonId,
  options: { scope: "round"; round: number } | { scope: "season"; throughRound?: number },
): Promise<QuinigolRankingComputeResult> {
  const { quinielaMatchdays, leagueMatchdays } = await loadGameMatchdays(supabase, seasonId);

  if (options.scope === "round") {
    const matchday = getMatchdayByRound(quinielaMatchdays, options.round);
    const countPoints = countPointsForQuinigolRound(quinielaMatchdays, options.round);
    const entries = await fetchQuinigolRoundRanking(supabase, seasonId, matchday, countPoints);
    return { scope: "round", round: options.round, countPoints, entries, matchdays: quinielaMatchdays };
  }

  const rankingMatchdays = buildSeasonScoringMatchdays(
    quinielaMatchdays,
    leagueMatchdays,
    options.throughRound,
  );
  const countPointsForRound = (round: number) => countPointsForQuinigolRound(rankingMatchdays, round);
  const entries = await fetchQuinigolSeasonRanking(supabase, seasonId, rankingMatchdays, countPointsForRound);
  const countPoints = rankingMatchdays.some((matchday) => countPointsForQuinigolRound(rankingMatchdays, matchday.round));
  return { scope: "season", entries, matchdays: quinielaMatchdays, countPoints };
}

export type ClasificacionRankingComputeResult = {
  countPoints: boolean;
  entries: GameRankingEntry[];
  matchdays: Matchday[];
  teams: Team[];
};

export async function computeClasificacionRankingFromSupabase(
  supabase: SupabaseClient,
  seasonId: CompetitionSeasonId,
): Promise<ClasificacionRankingComputeResult> {
  const { leagueMatchdays, teams } = await loadGameMatchdays(supabase, seasonId);
  const countPoints = canScoreClasificacionStandings(teams, leagueMatchdays);
  const entries = await fetchClasificacionRanking(supabase, seasonId, teams, leagueMatchdays);
  return { countPoints, entries, matchdays: leagueMatchdays, teams };
}

export async function computeQuinigolUserRoundFromSupabase(
  supabase: SupabaseClient,
  seasonId: CompetitionSeasonId,
  userId: string,
  round?: number,
): Promise<QuinigolUserRoundResult> {
  const { quinielaMatchdays } = await loadGameMatchdays(supabase, seasonId);
  return fetchQuinigolUserRound(supabase, seasonId, userId, quinielaMatchdays, round);
}

export async function computeClasificacionUserSubmissionFromSupabase(
  supabase: SupabaseClient,
  seasonId: CompetitionSeasonId,
  userId: string,
): Promise<ClasificacionUserSubmissionResult> {
  const { leagueMatchdays, teams } = await loadGameMatchdays(supabase, seasonId);
  return fetchClasificacionUserSubmission(supabase, seasonId, userId, teams, leagueMatchdays);
}
