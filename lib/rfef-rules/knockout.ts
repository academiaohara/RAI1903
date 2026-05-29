import type { KnockoutLegRules, KnockoutTieResult, KnockoutTwoLegInput } from "@/lib/rfef-rules/types";

function goalsForTeamInLeg(
  teamId: string,
  leg: KnockoutTwoLegInput["firstLeg"],
): { goals: number; extra: number } {
  const isHome = leg.homeTeamId === teamId;
  return {
    goals: isHome ? leg.homeScore : leg.awayScore,
    extra: isHome ? (leg.extraTimeHome ?? 0) : (leg.extraTimeAway ?? 0),
  };
}

/**
 * Resuelve una eliminatoria a doble partido según el reglamento configurable.
 */
export function resolveKnockoutTwoLeg(
  input: KnockoutTwoLegInput,
  rules: KnockoutLegRules,
  penaltyShootout?: { home: number; away: number },
): KnockoutTieResult {
  const { homeTeamId, awayTeamId, firstLeg, secondLeg } = input;

  const homeFirst = goalsForTeamInLeg(homeTeamId, firstLeg);
  const homeSecond = goalsForTeamInLeg(homeTeamId, secondLeg);
  const awayFirst = goalsForTeamInLeg(awayTeamId, firstLeg);
  const awaySecond = goalsForTeamInLeg(awayTeamId, secondLeg);

  const homeFt = homeFirst.goals + homeSecond.goals;
  const awayFt = awayFirst.goals + awaySecond.goals;

  if (homeFt > awayFt) return { winnerId: homeTeamId, method: "aggregate" };
  if (awayFt > homeFt) return { winnerId: awayTeamId, method: "aggregate" };

  if (rules.awayGoals) {
    const homeAwayGoals = homeSecond.goals;
    const awayAwayGoals = awayFirst.goals;
    if (homeAwayGoals > awayAwayGoals) return { winnerId: homeTeamId, method: "away-goals" };
    if (awayAwayGoals > homeAwayGoals) return { winnerId: awayTeamId, method: "away-goals" };
  }

  if (rules.extraTimeOnAggregateDraw) {
    const homeEt = homeFirst.extra + homeSecond.extra;
    const awayEt = awayFirst.extra + awaySecond.extra;
    const homeTotal = homeFt + homeEt;
    const awayTotal = awayFt + awayEt;
    if (homeTotal > awayTotal) return { winnerId: homeTeamId, method: "aggregate" };
    if (awayTotal > homeTotal) return { winnerId: awayTeamId, method: "aggregate" };
  }

  if (rules.penaltiesOnDraw && penaltyShootout) {
    if (penaltyShootout.home > penaltyShootout.away) {
      return { winnerId: homeTeamId, method: "penalties", penaltyScore: penaltyShootout };
    }
    if (penaltyShootout.away > penaltyShootout.home) {
      return { winnerId: awayTeamId, method: "penalties", penaltyScore: penaltyShootout };
    }
  }

  if (rules.aggregateDrawTiebreaker === "penalties" && rules.penaltiesOnDraw) {
    return { status: "pending", reason: "Empate global: pendiente de penaltis" };
  }

  if (input.homeLeaguePosition < input.awayLeaguePosition) {
    return { winnerId: homeTeamId, method: "league-position" };
  }
  if (input.awayLeaguePosition < input.homeLeaguePosition) {
    return { winnerId: awayTeamId, method: "league-position" };
  }

  return {
    winnerId: homeTeamId.localeCompare(awayTeamId) <= 0 ? homeTeamId : awayTeamId,
    method: "league-position",
  };
}
