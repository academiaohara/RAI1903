import type { RfefGrupoId } from "@/lib/rfef-grupos";
import type { StandingsZonesConfig } from "@/lib/standings";

/** Criterio aplicable solo entre dos equipos empatados en puntos. */
export type TwoTeamTiebreakCriterion =
  | "head-to-head-goal-diff"
  | "overall-goal-diff"
  | "overall-goals-for"
  | "fair-play";

/** Criterio aplicable cuando tres o más equipos empatan en puntos. */
export type MultiTeamTiebreakCriterion =
  | "mini-league-points"
  | "mini-league-goal-diff"
  | "overall-goal-diff"
  | "overall-goals-for"
  | "fair-play";

export type UnresolvedTiebreakAction = "pending-official" | "playoff-match";

export type LeagueTiebreakRules = {
  twoTeam: readonly TwoTeamTiebreakCriterion[];
  threePlus: readonly MultiTeamTiebreakCriterion[];
  unresolved: UnresolvedTiebreakAction;
};

/** Puntos de juego limpio por equipo (menor = mejor). Opcional si no hay datos. */
export type FairPlayScores = Readonly<Record<string, number>>;

export type LeagueTiebreakContext = {
  rules: LeagueTiebreakRules;
  fairPlay?: FairPlayScores;
};

export type TiebreakResolutionStatus = "resolved" | "pending-official" | "playoff-match";

export type TiebreakSortMeta = {
  status: TiebreakResolutionStatus;
  /** Etiqueta legible del último criterio aplicado o del estado pendiente. */
  note?: string;
};

/** Posiciones de liga que clasifican al playoff (1-based). */
export type PlayoffQualificationConfig = {
  positions: readonly number[];
};

export type PlayoffGroupRef = {
  groupId: RfefGrupoId;
  /** Puesto en la clasificación del grupo (1-based). */
  position: number;
};

export type PlayoffBracketSlot = {
  id: string;
  home: PlayoffGroupRef;
  away: PlayoffGroupRef;
};

export type PlayoffBracketConfig = {
  semifinals: readonly PlayoffBracketSlot[];
  finals: readonly [
    { id: string; homeFromSemifinal: string; awayFromSemifinal: string },
    { id: string; homeFromSemifinal: string; awayFromSemifinal: string },
  ];
};

export type KnockoutFirstLegHome = "worse-league-position" | "better-league-position";

export type KnockoutAggregateDrawTiebreaker =
  | "better-league-position"
  | "away-goals"
  | "penalties";

export type KnockoutLegRules = {
  firstLegHome: KnockoutFirstLegHome;
  secondLegHome: KnockoutFirstLegHome;
  awayGoals: boolean;
  extraTimeOnAggregateDraw: boolean;
  penaltiesOnDraw: boolean;
  aggregateDrawTiebreaker: KnockoutAggregateDrawTiebreaker;
};

export type RfefPlayoffRules = {
  qualification: PlayoffQualificationConfig;
  bracket: PlayoffBracketConfig;
  knockout: KnockoutLegRules;
};

export type RfefCompetitionRules = {
  tiebreak: LeagueTiebreakContext;
  zones: StandingsZonesConfig;
  playoff: RfefPlayoffRules;
  /** Equipos sin derecho a playoff (filiales, etc.). */
  ineligiblePlayoffTeamIds?: readonly string[];
};

export type PlayoffQualifiedTeam = {
  teamId: string;
  groupId: RfefGrupoId;
  /** Puesto real en la tabla al cerrar la fase (puede ser >5 si sustituye a un filial). */
  leaguePosition: number;
  /** Plaza de playoff (2º–5º) que ocupa en el cuadro. */
  qualificationPosition: number;
  replacedIneligible?: boolean;
};

export type PlayoffBracketTie = {
  slotId: string;
  round: "semifinal" | "final";
  homeTeamId: string;
  awayTeamId: string;
  homeLeaguePosition: number;
  awayLeaguePosition: number;
  firstLegHomeTeamId: string;
  secondLegHomeTeamId: string;
};

export type PlayoffBracket = {
  qualified: PlayoffQualifiedTeam[];
  semifinals: PlayoffBracketTie[];
  finals: PlayoffBracketTie[];
};

export type KnockoutLegInput = {
  homeScore: number;
  awayScore: number;
  /** Goles en prórroga (solo ida o vuelta donde aplique). */
  extraTimeHome?: number;
  extraTimeAway?: number;
};

export type KnockoutLegWithTeams = KnockoutLegInput & {
  homeTeamId: string;
  awayTeamId: string;
};

export type KnockoutTwoLegInput = {
  firstLeg: KnockoutLegWithTeams;
  secondLeg: KnockoutLegWithTeams;
  homeTeamId: string;
  awayTeamId: string;
  homeLeaguePosition: number;
  awayLeaguePosition: number;
};

export type KnockoutTieResult =
  | { winnerId: string; method: "aggregate" }
  | { winnerId: string; method: "away-goals" }
  | { winnerId: string; method: "league-position" }
  | { winnerId: string; method: "penalties"; penaltyScore: { home: number; away: number } }
  | { status: "pending"; reason: string };
