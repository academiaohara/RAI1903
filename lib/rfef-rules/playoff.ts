import type { RfefGrupoId } from "@/lib/rfef-grupos";
import type {
  KnockoutLegRules,
  PlayoffBracket,
  PlayoffBracketConfig,
  PlayoffBracketSlot,
  PlayoffBracketTie,
  PlayoffGroupRef,
  PlayoffQualificationConfig,
  PlayoffQualifiedTeam,
  RfefPlayoffRules,
} from "@/lib/rfef-rules/types";
import type { Team } from "@/types";

export type GroupStandings = {
  groupId: RfefGrupoId;
  teams: Team[];
};

function isEligible(teamId: string, ineligible: ReadonlySet<string>): boolean {
  return !ineligible.has(teamId);
}

/**
 * Selecciona equipos clasificados al playoff por puesto en liga, sustituyendo
 * filiales o no elegibles por el siguiente mejor clasificado del mismo grupo.
 */
export function selectPlayoffQualifiers(
  groups: readonly GroupStandings[],
  config: PlayoffQualificationConfig,
  ineligibleTeamIds: readonly string[] = [],
): PlayoffQualifiedTeam[] {
  const ineligible = new Set(ineligibleTeamIds);
  const positions = [...config.positions].sort((a, b) => a - b);
  const qualified: PlayoffQualifiedTeam[] = [];
  const used = new Set<string>();

  for (const group of groups) {
    const sorted = [...group.teams].sort((a, b) => a.position - b.position);

    for (const slot of positions) {
      const team = sorted.find(
        (candidate) =>
          candidate.position >= slot &&
          isEligible(candidate.id, ineligible) &&
          !used.has(candidate.id),
      );
      if (!team) continue;

      used.add(team.id);
      qualified.push({
        teamId: team.id,
        groupId: group.groupId,
        leaguePosition: team.position,
        replacedIneligible: team.position !== slot,
      });
    }
  }

  return qualified;
}

function findQualified(
  qualified: readonly PlayoffQualifiedTeam[],
  ref: PlayoffGroupRef,
): PlayoffQualifiedTeam | undefined {
  return qualified.find((q) => q.groupId === ref.groupId && q.leaguePosition === ref.position);
}

function resolveSlotTeams(
  slot: PlayoffBracketSlot,
  qualified: readonly PlayoffQualifiedTeam[],
): { home: PlayoffQualifiedTeam; away: PlayoffQualifiedTeam } | null {
  const home = findQualified(qualified, slot.home);
  const away = findQualified(qualified, slot.away);
  if (!home || !away) return null;
  return { home, away };
}

function buildSemifinalTie(
  slot: PlayoffBracketSlot,
  home: PlayoffQualifiedTeam,
  away: PlayoffQualifiedTeam,
  knockout: KnockoutLegRules,
): PlayoffBracketTie {
  const worseIsHome = knockout.firstLegHome === "worse-league-position";
  const homeWorse =
    home.leaguePosition > away.leaguePosition ||
    (home.leaguePosition === away.leaguePosition && home.teamId.localeCompare(away.teamId) > 0);

  const firstLegHome = worseIsHome
    ? homeWorse
      ? home.teamId
      : away.teamId
    : homeWorse
      ? away.teamId
      : home.teamId;

  const secondLegHome = firstLegHome === home.teamId ? away.teamId : home.teamId;

  return {
    slotId: slot.id,
    round: "semifinal",
    homeTeamId: home.teamId,
    awayTeamId: away.teamId,
    homeLeaguePosition: home.leaguePosition,
    awayLeaguePosition: away.leaguePosition,
    firstLegHomeTeamId: firstLegHome,
    secondLegHomeTeamId: secondLegHome,
  };
}

function buildFinalTie(
  id: string,
  homeTeamId: string,
  awayTeamId: string,
  homeLeaguePosition: number,
  awayLeaguePosition: number,
  knockout: KnockoutLegRules,
): PlayoffBracketTie {
  const worseIsHome = knockout.firstLegHome === "worse-league-position";
  const homeWorse =
    homeLeaguePosition > awayLeaguePosition ||
    (homeLeaguePosition === awayLeaguePosition && homeTeamId.localeCompare(awayTeamId) > 0);

  const firstLegHome = worseIsHome
    ? homeWorse
      ? homeTeamId
      : awayTeamId
    : homeWorse
      ? awayTeamId
      : homeTeamId;

  return {
    slotId: id,
    round: "final",
    homeTeamId,
    awayTeamId,
    homeLeaguePosition,
    awayLeaguePosition,
    firstLegHomeTeamId: firstLegHome,
    secondLegHomeTeamId: firstLegHome === homeTeamId ? awayTeamId : homeTeamId,
  };
}

/**
 * Construye el cuadro de playoff a partir de las clasificaciones por grupo y la configuración.
 * Las finales usan placeholders de ganadores de semifinal (IDs de slot).
 */
export function buildPlayoffBracket(
  groups: readonly GroupStandings[],
  rules: RfefPlayoffRules,
): PlayoffBracket {
  const qualified = selectPlayoffQualifiers(
    groups,
    rules.qualification,
    [],
  );

  const semifinals: PlayoffBracketTie[] = [];
  for (const slot of rules.bracket.semifinals) {
    const teams = resolveSlotTeams(slot, qualified);
    if (!teams) continue;
    semifinals.push(buildSemifinalTie(slot, teams.home, teams.away, rules.knockout));
  }

  const finals: PlayoffBracketTie[] = rules.bracket.finals.map((finalSlot) =>
    buildFinalTie(
      finalSlot.id,
      `winner:${finalSlot.homeFromSemifinal}`,
      `winner:${finalSlot.awayFromSemifinal}`,
      0,
      0,
      rules.knockout,
    ),
  );

  return { qualified, semifinals, finals };
}

export function buildPlayoffBracketFromConfig(
  groups: readonly GroupStandings[],
  bracket: PlayoffBracketConfig,
  qualification: PlayoffQualificationConfig,
  knockout: KnockoutLegRules,
  ineligibleTeamIds: readonly string[] = [],
): PlayoffBracket {
  const qualified = selectPlayoffQualifiers(groups, qualification, ineligibleTeamIds);

  const semifinals: PlayoffBracketTie[] = [];
  for (const slot of bracket.semifinals) {
    const teams = resolveSlotTeams(slot, qualified);
    if (!teams) continue;
    semifinals.push(buildSemifinalTie(slot, teams.home, teams.away, knockout));
  }

  const finals: PlayoffBracketTie[] = bracket.finals.map((finalSlot) =>
    buildFinalTie(
      finalSlot.id,
      `winner:${finalSlot.homeFromSemifinal}`,
      `winner:${finalSlot.awayFromSemifinal}`,
      0,
      0,
      knockout,
    ),
  );

  return { qualified, semifinals, finals };
}
