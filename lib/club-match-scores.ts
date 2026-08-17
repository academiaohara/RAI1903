import { resolveClubSideInMatch } from "@/lib/season/club-team-ids";

type ScoredMatch = {
  homeTeamId: string;
  awayTeamId: string;
  homeTeam?: string;
  awayTeam?: string;
  homeScore?: number;
  awayScore?: number;
};

export type ClubMatchGoals = {
  clubGoals: number;
  rivalGoals: number;
  isClubHome: boolean;
};

export function clubGoalsFromMatch(
  match: ScoredMatch,
  clubTeamIds: readonly string[],
): ClubMatchGoals | null {
  const clubSide = resolveClubSideInMatch(
    {
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      homeTeam: match.homeTeam ?? "",
      awayTeam: match.awayTeam ?? "",
    },
    clubTeamIds,
  );
  if (!clubSide || match.homeScore === undefined || match.awayScore === undefined) {
    return null;
  }

  return {
    clubGoals: clubSide.isHome ? match.homeScore : match.awayScore,
    rivalGoals: clubSide.isHome ? match.awayScore : match.homeScore,
    isClubHome: clubSide.isHome,
  };
}

export function homeAwayScoresFromClubGoals(
  clubGoals: number,
  rivalGoals: number,
  isClubHome: boolean,
): { homeScore: number; awayScore: number } {
  return isClubHome
    ? { homeScore: clubGoals, awayScore: rivalGoals }
    : { homeScore: rivalGoals, awayScore: clubGoals };
}
