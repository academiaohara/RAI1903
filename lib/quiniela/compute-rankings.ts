import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchSeasonBundlesWithClient } from "@/lib/cms/fetch-season-bundles-server";
import { fetchInlineOverridesWithClient } from "@/lib/cms/inline-overrides-server";
import type { CompetitionSeasonId } from "@/data/mock";
import { buildQuinielaMatchdaysFromBundles } from "@/lib/quiniela/build-matchdays";
import { buildQuinielaScoringContext } from "@/lib/quiniela/scoring-context";
import {
  fetchQuinielaRoundRanking,
  fetchQuinielaSeasonRanking,
  type QuinielaRankingEntry,
  type QuinielaSeasonRankingEntry,
} from "@/lib/quiniela-ranking";
import { getMatchdayByRound, shouldCountQuinielaPoints } from "@/lib/quiniela";
import type { Matchday } from "@/types";

async function loadQuinielaRankingMatchdays(supabase: SupabaseClient, seasonId: CompetitionSeasonId) {
  const [bundles, inlineOverrides] = await Promise.all([
    fetchSeasonBundlesWithClient(supabase, seasonId),
    fetchInlineOverridesWithClient(supabase, seasonId),
  ]);
  const matchdays = buildQuinielaMatchdaysFromBundles(bundles, inlineOverrides);
  const scoringContext = buildQuinielaScoringContext(bundles, matchdays);
  return { bundles, matchdays, scoringContext };
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
    };

export async function computeQuinielaRankingFromSupabase(
  supabase: SupabaseClient,
  seasonId: CompetitionSeasonId,
  options: { scope: "round"; round: number } | { scope: "season" },
): Promise<QuinielaRankingComputeResult> {
  const { matchdays, scoringContext } = await loadQuinielaRankingMatchdays(supabase, seasonId);

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

  const countPointsForRound = (round: number) => {
    const matchday = getMatchdayByRound(matchdays, round);
    return shouldCountQuinielaPoints(matchday);
  };
  const entries = await fetchQuinielaSeasonRanking(
    supabase,
    seasonId,
    matchdays,
    countPointsForRound,
    scoringContext,
  );
  return { scope: "season", entries, matchdays };
}
