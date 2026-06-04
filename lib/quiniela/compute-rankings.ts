import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchSeasonBundlesWithClient } from "@/lib/cms/fetch-season-bundles-server";
import type { CompetitionSeasonId } from "@/data/mock";
import { buildQuinielaMatchdaysFromBundles } from "@/lib/quiniela/build-matchdays";
import { buildQuinielaScoringContext } from "@/lib/quiniela/scoring-context";
import {
  fetchQuinielaRoundRanking,
  fetchQuinielaSeasonRanking,
  type QuinielaRankingEntry,
  type QuinielaSeasonRankingEntry,
} from "@/lib/quiniela-ranking";
import { getMatchdayByRound, hasFirstMatchStarted } from "@/lib/quiniela";
import type { Matchday } from "@/types";

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
  const bundles = await fetchSeasonBundlesWithClient(supabase, seasonId);
  const matchdays = buildQuinielaMatchdaysFromBundles(bundles);
  const scoringContext = buildQuinielaScoringContext(bundles, matchdays);

  if (options.scope === "round") {
    const matchday = getMatchdayByRound(matchdays, options.round);
    const countPoints = hasFirstMatchStarted(matchday);
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
    return hasFirstMatchStarted(matchday);
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
