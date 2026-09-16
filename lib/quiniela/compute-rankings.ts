import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchSeasonBundlesWithClient } from "@/lib/cms/fetch-season-bundles-server";
import { fetchInlineOverridesWithClient } from "@/lib/cms/inline-overrides-server";
import type { CompetitionSeasonId } from "@/data/mock";
import { isPlaceholderMatch } from "@/lib/competition/normalize-fixtures";
import {
  buildLeagueMatchdaysFromBundles,
  buildQuinielaMatchdaysFromBundles,
} from "@/lib/quiniela/build-matchdays";
import { buildQuinielaScoringContext } from "@/lib/quiniela/scoring-context";
import {
  fetchQuinielaRoundRanking,
  fetchQuinielaSeasonRanking,
  fetchQuinielaUserRound,
  type QuinielaRankingEntry,
  type QuinielaSeasonRankingEntry,
  type QuinielaUserRoundResult,
} from "@/lib/quiniela-ranking";
import { getMatchdayByRound, shouldCountQuinielaPoints } from "@/lib/quiniela";
import type { Matchday } from "@/types";

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

async function loadQuinielaRankingMatchdays(supabase: SupabaseClient, seasonId: CompetitionSeasonId) {
  const [bundles, inlineOverrides] = await Promise.all([
    fetchSeasonBundlesWithClient(supabase, seasonId),
    fetchInlineOverridesWithClient(supabase, seasonId),
  ]);
  const leagueMatchdays = buildLeagueMatchdaysFromBundles(bundles, inlineOverrides);
  const matchdays = buildQuinielaMatchdaysFromBundles(bundles, inlineOverrides);
  const scoringContext = buildQuinielaScoringContext(bundles, matchdays);
  return { bundles, matchdays, leagueMatchdays, scoringContext };
}

export type QuinielaRankingComputeResult =
  | {
      scope: "round";
      round: number;
      countPoints: boolean;
      entries: QuinielaRankingEntry[];
      matchdays: Matchday[];
    }
  | {
      scope: "season";
      entries: QuinielaSeasonRankingEntry[];
      matchdays: Matchday[];
      countPoints: boolean;
    };

export async function computeQuinielaRankingFromSupabase(
  supabase: SupabaseClient,
  seasonId: CompetitionSeasonId,
  options: { scope: "round"; round: number } | { scope: "season"; throughRound?: number },
): Promise<QuinielaRankingComputeResult> {
  const { matchdays, leagueMatchdays, scoringContext } = await loadQuinielaRankingMatchdays(
    supabase,
    seasonId,
  );

  if (options.scope === "round") {
    const matchday = getMatchdayByRound(matchdays, options.round);
    const countPoints = shouldCountQuinielaPoints(matchday);
    const entries = await fetchQuinielaRoundRanking(
      supabase,
      seasonId,
      matchday,
      countPoints,
      scoringContext,
    );
    return { scope: "round", round: options.round, countPoints, entries, matchdays };
  }

  const rankingMatchdays = buildSeasonScoringMatchdays(
    matchdays,
    leagueMatchdays,
    options.throughRound,
  );
  const countPointsForRound = (round: number) => {
    const matchday = getMatchdayByRound(rankingMatchdays, round);
    return shouldCountQuinielaPoints(matchday);
  };
  const entries = await fetchQuinielaSeasonRanking(
    supabase,
    seasonId,
    rankingMatchdays,
    countPointsForRound,
    scoringContext,
  );
  const countPoints = rankingMatchdays.some((matchday) => shouldCountQuinielaPoints(matchday));
  return { scope: "season", entries, matchdays, countPoints };
}

export async function computeQuinielaUserRoundFromSupabase(
  supabase: SupabaseClient,
  seasonId: CompetitionSeasonId,
  userId: string,
  round?: number,
): Promise<QuinielaUserRoundResult> {
  const { matchdays, scoringContext } = await loadQuinielaRankingMatchdays(supabase, seasonId);
  return fetchQuinielaUserRound(supabase, seasonId, userId, matchdays, round, scoringContext);
}
