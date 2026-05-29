import { matchdays, matchdaysGrupo2, teams, teamsGrupo2 } from "@/data/mock";
import { getTeam } from "@/lib/fixtures";
import { PRIMERA_RFEF_RULES, buildPlayoffBracketFromConfig } from "@/lib/rfef-rules";
import type { PlayoffBracket, PlayoffBracketTie } from "@/lib/rfef-rules/types";
import { RESULTADOS_2526_LAST_ROUND } from "@/lib/resultados-2526";
import { getTeamsAtRound } from "@/lib/standings";
import type { JornadaFixture, JornadaGrupo, JornadaRoundId } from "@/types/jornadas";

export type PlayoffLegPhase = "first" | "second";

export type PlayoffRoundKey = "po-sf-ida" | "po-sf-vuelta" | "po-f-ida" | "po-f-vuelta";

const WINNER_PREFIX = "winner:";

const PLAYOFF_ROUND_META: Record<
  PlayoffRoundKey,
  { ties: "semifinals" | "finals"; leg: PlayoffLegPhase }
> = {
  "po-sf-ida": { ties: "semifinals", leg: "first" },
  "po-sf-vuelta": { ties: "semifinals", leg: "second" },
  "po-f-ida": { ties: "finals", leg: "first" },
  "po-f-vuelta": { ties: "finals", leg: "second" },
};

const SEMIFINAL_LABELS: Record<string, string> = {
  sf1: "Semifinal 1",
  sf2: "Semifinal 2",
  sf3: "Semifinal 3",
  sf4: "Semifinal 4",
};

const FINAL_LABELS: Record<string, string> = {
  f1: "Final cuadro A",
  f2: "Final cuadro B",
};

export type PlayoffCuadroId = "A" | "B";

export type PlayoffCuadroView = {
  id: PlayoffCuadroId;
  label: string;
  semifinals: PlayoffBracketTie[];
  final: PlayoffBracketTie | undefined;
};

/** Agrupa semifinales y final por cuadro (A: sf1–sf2, B: sf3–sf4). */
export function groupPlayoffBracketByCuadro(bracket: PlayoffBracket): PlayoffCuadroView[] {
  const cuadros: Array<{ id: PlayoffCuadroId; label: string; sfIds: [string, string]; finalId: string }> = [
    { id: "A", label: "Cuadro A", sfIds: ["sf1", "sf2"], finalId: "f1" },
    { id: "B", label: "Cuadro B", sfIds: ["sf3", "sf4"], finalId: "f2" },
  ];

  return cuadros.map(({ id, label, sfIds, finalId }) => ({
    id,
    label,
    semifinals: bracket.semifinals.filter((tie) => sfIds.includes(tie.slotId)),
    final: bracket.finals.find((tie) => tie.slotId === finalId),
  }));
}

export function playoffTeamDisplayName(teamId: string): string {
  if (isWinnerPlaceholder(teamId)) return placeholderLabel(teamId);
  const team = getTeam(teamId);
  return team?.name ?? teamId;
}

/** Jornada de liga tras la que se calculan los clasificados (incluye esa jornada). */
export function leagueRoundForQualifyingStandings(leagueRound: number): number {
  return Math.min(leagueRound + 1, RESULTADOS_2526_LAST_ROUND + 1);
}

/** Clasificación definitiva: todas las jornadas disputadas. */
export const DEFINITIVE_QUALIFYING_LEAGUE_ROUND = RESULTADOS_2526_LAST_ROUND + 1;

export function isDefinitiveQualifyingRound(qualifyingLeagueRound: number): boolean {
  return qualifyingLeagueRound >= DEFINITIVE_QUALIFYING_LEAGUE_ROUND;
}

export type PlayoffDirectChampion = {
  teamId: string;
  name: string;
  groupId: "1" | "2";
};

/** Campeones de grupo con ascenso directo (1.º de cada grupo). */
export function getPlayoffDirectChampions(qualifyingLeagueRound: number): PlayoffDirectChampion[] {
  const teamsG1 = getTeamsAtRound(
    teams,
    matchdays,
    qualifyingLeagueRound,
    PRIMERA_RFEF_RULES.zones,
    PRIMERA_RFEF_RULES.tiebreak,
  );
  const teamsG2 = getTeamsAtRound(
    teamsGrupo2,
    matchdaysGrupo2,
    qualifyingLeagueRound,
    PRIMERA_RFEF_RULES.zones,
    PRIMERA_RFEF_RULES.tiebreak,
  );

  const champion = (groupTeams: typeof teamsG1, groupId: "1" | "2") => {
    const leader = [...groupTeams].sort((a, b) => a.position - b.position)[0];
    return leader ? { teamId: leader.id, name: leader.name, groupId } : null;
  };

  return [champion(teamsG1, "1"), champion(teamsG2, "2")].filter(
    (entry): entry is PlayoffDirectChampion => entry !== null,
  );
}

export function buildPlayoffBracketThroughLeagueRound(qualifyingLeagueRound: number): PlayoffBracket {
  const teamsG1 = getTeamsAtRound(
    teams,
    matchdays,
    qualifyingLeagueRound,
    PRIMERA_RFEF_RULES.zones,
    PRIMERA_RFEF_RULES.tiebreak,
  );
  const teamsG2 = getTeamsAtRound(
    teamsGrupo2,
    matchdaysGrupo2,
    qualifyingLeagueRound,
    PRIMERA_RFEF_RULES.zones,
    PRIMERA_RFEF_RULES.tiebreak,
  );

  return buildPlayoffBracketFromConfig(
    [
      { groupId: "1", teams: teamsG1 },
      { groupId: "2", teams: teamsG2 },
    ],
    PRIMERA_RFEF_RULES.playoff.bracket,
    PRIMERA_RFEF_RULES.playoff.qualification,
    PRIMERA_RFEF_RULES.playoff.knockout,
    PRIMERA_RFEF_RULES.ineligiblePlayoffTeamIds ?? [],
  );
}

function isWinnerPlaceholder(teamId: string): boolean {
  return teamId.startsWith(WINNER_PREFIX);
}

function placeholderLabel(teamId: string): string {
  const slotId = teamId.slice(WINNER_PREFIX.length);
  const semifinal = SEMIFINAL_LABELS[slotId];
  if (semifinal) return `Ganador ${semifinal}`;
  const finalLabel = FINAL_LABELS[slotId];
  if (finalLabel) return `Ganador ${finalLabel}`;
  return "Por determinar";
}

function teamGrupo(teamId: string): JornadaGrupo {
  return teamsGrupo2.some((team) => team.id === teamId) ? "2" : "1";
}

function resolveParticipant(teamId: string): { teamId: string; name: string; placeholder: boolean } {
  if (isWinnerPlaceholder(teamId)) {
    return { teamId, name: placeholderLabel(teamId), placeholder: true };
  }
  const team = getTeam(teamId);
  return {
    teamId,
    name: team?.shortName ?? team?.name ?? teamId,
    placeholder: false,
  };
}

function legHomeTeamId(tie: PlayoffBracketTie, leg: PlayoffLegPhase): string {
  return leg === "first" ? tie.firstLegHomeTeamId : tie.secondLegHomeTeamId;
}

function buildLegMatch(
  tie: PlayoffBracketTie,
  leg: PlayoffLegPhase,
  jornadaId: JornadaRoundId,
  date: string,
  raiId: string,
): JornadaFixture {
  const homeId = legHomeTeamId(tie, leg);
  const awayId = homeId === tie.homeTeamId ? tie.awayTeamId : tie.homeTeamId;

  const home = resolveParticipant(homeId);
  const away = resolveParticipant(awayId);
  const involvesRai =
    !home.placeholder && !away.placeholder && (homeId === raiId || awayId === raiId);

  return {
    id: `${jornadaId}-${tie.slotId}-${leg}`,
    jornadaId,
    homeTeamId: home.teamId,
    awayTeamId: away.teamId,
    homeTeamName: home.name,
    awayTeamName: away.name,
    date,
    grupo: teamGrupo(homeId),
    involvesRai,
    status: "scheduled",
    kickoffTime: extractKickoffTime(date),
  };
}

function extractKickoffTime(iso: string): string | undefined {
  const date = new Date(iso);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  if (hours === 12 && minutes === 0) return undefined;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function buildPlayoffFixturesForRound(
  playoffRoundId: PlayoffRoundKey,
  date: string,
  bracket: PlayoffBracket,
  raiId: string,
): JornadaFixture[] {
  const meta = PLAYOFF_ROUND_META[playoffRoundId];
  const ties = meta.ties === "semifinals" ? bracket.semifinals : bracket.finals;

  const fixtures: JornadaFixture[] = ties.map((tie) =>
    buildLegMatch(tie, meta.leg, playoffRoundId, date, raiId),
  );

  return fixtures.sort((a, b) => {
    if (a.involvesRai !== b.involvesRai) return a.involvesRai ? -1 : 1;
    return a.homeTeamName.localeCompare(b.homeTeamName, "es");
  });
}

export function playoffFixturesForBothGrupos(
  fixtures: JornadaFixture[],
): Record<JornadaGrupo, JornadaFixture[]> {
  const byId = new Map(fixtures.map((fixture) => [fixture.id, fixture]));
  const all = [...byId.values()];
  return { "1": all, "2": all };
}
