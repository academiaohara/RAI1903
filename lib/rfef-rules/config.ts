import type { StandingsZonesConfig } from "@/lib/standings";
import type { RfefCompetitionRules } from "@/lib/rfef-rules/types";

/** 1ª RFEF por grupo: 1º ascenso directo; 2º–5º playoff; 5 últimos descenso. */
export const PRIMERA_RFEF_STANDINGS_ZONES: StandingsZonesConfig = {
  promotion: 1,
  playoff: 4,
  relegation: 5,
};

/** Filiales y equipos dependientes sin derecho al playoff de ascenso en 1ª RFEF. */
export const PRIMERA_RFEF_INELIGIBLE_PLAYOFF_TEAM_IDS = [
  "castilla",
  "celta-fortuna",
  "athletic-bilbao-b",
  "osasuna-promesas",
  "villarreal-b",
  "atletico-madrileno",
  "betis-deportivo",
  "sevilla-atletico",
] as const;

export const PRIMERA_RFEF_RULES: RfefCompetitionRules = {
  zones: PRIMERA_RFEF_STANDINGS_ZONES,
  tiebreak: {
    rules: {
      twoTeam: [
        "head-to-head-goal-diff",
        "overall-goal-diff",
        "overall-goals-for",
        "fair-play",
      ],
      threePlus: [
        "mini-league-points",
        "mini-league-goal-diff",
        "overall-goal-diff",
        "overall-goals-for",
        "fair-play",
      ],
      unresolved: "pending-official",
    },
  },
  playoff: {
    qualification: {
      positions: [2, 3, 4, 5],
    },
    bracket: {
      semifinals: [
        {
          id: "sf1",
          home: { groupId: "2", position: 5 },
          away: { groupId: "1", position: 2 },
        },
        {
          id: "sf2",
          home: { groupId: "1", position: 4 },
          away: { groupId: "2", position: 3 },
        },
        {
          id: "sf3",
          home: { groupId: "1", position: 5 },
          away: { groupId: "2", position: 2 },
        },
        {
          id: "sf4",
          home: { groupId: "2", position: 4 },
          away: { groupId: "1", position: 3 },
        },
      ],
      finals: [
        { id: "f1", homeFromSemifinal: "sf1", awayFromSemifinal: "sf2" },
        { id: "f2", homeFromSemifinal: "sf3", awayFromSemifinal: "sf4" },
      ],
    },
    knockout: {
      firstLegHome: "worse-league-position",
      secondLegHome: "better-league-position",
      awayGoals: false,
      extraTimeOnAggregateDraw: true,
      penaltiesOnDraw: false,
      aggregateDrawTiebreaker: "better-league-position",
    },
  },
  ineligiblePlayoffTeamIds: [...PRIMERA_RFEF_INELIGIBLE_PLAYOFF_TEAM_IDS],
};
