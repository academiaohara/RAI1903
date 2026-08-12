import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchSeasonBundlesWithClient } from "@/lib/cms/fetch-season-bundles-server";
import { fetchInlineOverridesWithClient } from "@/lib/cms/inline-overrides-server";
import type { CompetitionSeasonId } from "@/data/mock";
import {
  countPointsForQuinigolRound,
  fetchClasificacionRanking,
  fetchQuinigolRoundRanking,
  fetchQuinigolSeasonRanking,
  type GameRankingEntry,
  type GameSeasonRankingEntry,
} from "@/lib/game-rankings";
import { buildQuinielaMatchdaysFromBundles } from "@/lib/quiniela/build-matchdays";
import { getMatchdayByRound } from "@/lib/quiniela";
import { getTeamsForRfefGrupo } from "@/lib/rfef-grupos";
import { mergeTeamsWithCms, getTeamsBundle } from "@/lib/cms/teams-bundle";
import type { Matchday, Team } from "@/types";

async function loadGameMatchdays(supabase: SupabaseClient, seasonId: CompetitionSeasonId) {
  const [bundles, inlineOverrides] = await Promise.all([
    fetchSeasonBundlesWithClient(supabase, seasonId),
    fetchInlineOverridesWithClient(supabase, seasonId),
  ]);
  const matchdays = buildQuinielaMatchdaysFromBundles(bundles, inlineOverrides);
  const baseTeams = getTeamsForRfefGrupo("1");
  const teams = mergeTeamsWithCms(baseTeams, getTeamsBundle(bundles, "masculino"));
  return { bundles, matchdays, teams };
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
    };

export async function computeQuinigolRankingFromSupabase(
  supabase: SupabaseClient,
  seasonId: CompetitionSeasonId,
  options: { scope: "round"; round: number } | { scope: "season" },
): Promise<QuinigolRankingComputeResult> {
  const { matchdays } = await loadGameMatchdays(supabase, seasonId);

  if (options.scope === "round") {
    const matchday = getMatchdayByRound(matchdays, options.round);
    const countPoints = countPointsForQuinigolRound(matchdays, options.round);
    const entries = await fetchQuinigolRoundRanking(supabase, seasonId, matchday, countPoints);
    return { scope: "round", round: options.round, countPoints, entries, matchdays };
  }

  const countPointsForRound = (round: number) => countPointsForQuinigolRound(matchdays, round);
  const entries = await fetchQuinigolSeasonRanking(supabase, seasonId, matchdays, countPointsForRound);
  return { scope: "season", entries, matchdays };
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
  const { matchdays, teams } = await loadGameMatchdays(supabase, seasonId);
  const countPoints = matchdays.some((matchday) =>
    countPointsForQuinigolRound(matchdays, matchday.round),
  );
  const entries = await fetchClasificacionRanking(
    supabase,
    seasonId,
    teams,
    matchdays,
    countPoints,
  );
  return { countPoints, entries, matchdays, teams };
}
