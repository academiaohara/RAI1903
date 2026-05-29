export {
  PRIMERA_RFEF_INELIGIBLE_PLAYOFF_TEAM_IDS,
  PRIMERA_RFEF_RULES,
} from "@/lib/rfef-rules/config";
export { resolveKnockoutTwoLeg } from "@/lib/rfef-rules/knockout";
export {
  computeMiniLeagueStats,
  headToHeadGoalDifference,
} from "@/lib/rfef-rules/mini-league";
export {
  buildPlayoffBracket,
  buildPlayoffBracketFromConfig,
  selectPlayoffQualifiers,
  type GroupStandings,
} from "@/lib/rfef-rules/playoff";
export { sortStandingsByRfefRules, sortTiedTeams, type TiebreakSortResult } from "@/lib/rfef-rules/tiebreak";
export type {
  FairPlayScores,
  KnockoutAggregateDrawTiebreaker,
  KnockoutFirstLegHome,
  KnockoutLegInput,
  KnockoutLegRules,
  KnockoutTieResult,
  KnockoutTwoLegInput,
  LeagueTiebreakContext,
  LeagueTiebreakRules,
  MultiTeamTiebreakCriterion,
  PlayoffBracket,
  PlayoffBracketConfig,
  PlayoffBracketSlot,
  PlayoffBracketTie,
  PlayoffGroupRef,
  PlayoffQualificationConfig,
  PlayoffQualifiedTeam,
  RfefCompetitionRules,
  RfefPlayoffRules,
  TiebreakResolutionStatus,
  TiebreakSortMeta,
  TwoTeamTiebreakCriterion,
  UnresolvedTiebreakAction,
} from "@/lib/rfef-rules/types";
