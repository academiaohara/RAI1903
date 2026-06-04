import { RAI_FEM_TEAM_ID, RAI_TEAM_ID } from "@/data/mock";
import { slugFromTeamName } from "@/lib/cms/group-teams";
import type { SeasonFemeninoFixturesBundle, SeasonFixturesBundle } from "@/lib/cms/season-bundles";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { CompetitionId, Match, Matchday } from "@/types";

export const EXTRA_FIXTURE_COMPETITION_OPTIONS: { id: CompetitionId; label: string }[] = [
  { id: "amistoso", label: "Amistoso / pretemporada" },
  { id: "copa-rey", label: "Copa del Rey" },
  { id: "primera-rfef", label: "Liga / RFEF (sin jornada)" },
];

export const FEMENINO_EXTRA_FIXTURE_COMPETITION_OPTIONS: { id: CompetitionId; label: string }[] = [
  { id: "amistoso", label: "Amistoso / pretemporada" },
  { id: "liga-femenina", label: "Liga (sin jornada)" },
  { id: "primera-rfef", label: "Torneo / competición RFEF" },
];

export function extraFixtureCompetitionOptions(gender: PrimerEquipoGender) {
  return gender === "femenino" ? FEMENINO_EXTRA_FIXTURE_COMPETITION_OPTIONS : EXTRA_FIXTURE_COMPETITION_OPTIONS;
}

function raiTeamId(gender: PrimerEquipoGender): string {
  return gender === "femenino" ? RAI_FEM_TEAM_ID : RAI_TEAM_ID;
}

export function newExtraMatchId(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}

export function emptyAmistosoMatch(rivalName = "Rival", gender: PrimerEquipoGender = "masculino"): Match {
  const rivalId = slugFromTeamName(rivalName) || `rival-${Date.now()}`;
  const avilesId = raiTeamId(gender);
  const avilesName = gender === "femenino" ? "Real Avilés Industrial Femenino" : "Real Avilés Industrial";
  return {
    id: newExtraMatchId("amistoso"),
    matchday: 1,
    homeTeamId: rivalId,
    awayTeamId: avilesId,
    homeTeam: rivalName,
    awayTeam: avilesName,
    date: new Date().toISOString(),
    competition: "amistoso",
    competitionStage: "Pretemporada",
    venue: "",
    status: "scheduled",
  };
}

export function emptyCopaMatch(
  rivalName = "Rival",
  stage = "Eliminatoria",
  gender: PrimerEquipoGender = "masculino",
): Match {
  const rivalId = slugFromTeamName(rivalName) || `rival-${Date.now()}`;
  const avilesId = raiTeamId(gender);
  const avilesName = gender === "femenino" ? "Real Avilés Industrial Femenino" : "Real Avilés Industrial";
  return {
    id: newExtraMatchId("copa-rey"),
    matchday: 1,
    homeTeamId: avilesId,
    awayTeamId: rivalId,
    homeTeam: avilesName,
    awayTeam: rivalName,
    date: new Date().toISOString(),
    competition: "copa-rey",
    competitionStage: stage,
    venue: "Roman Suarez Puerta",
    status: "scheduled",
  };
}

export function emptyCalendarExtraMatch(
  rivalName = "Rival",
  competitionName = "Torneo / fase extra",
  gender: PrimerEquipoGender = "masculino",
): Match {
  const rivalId = slugFromTeamName(rivalName) || `rival-${Date.now()}`;
  const avilesId = raiTeamId(gender);
  const avilesName = gender === "femenino" ? "Real Avilés Industrial Femenino" : "Real Avilés Industrial";
  return {
    id: newExtraMatchId("cal-extra"),
    matchday: 1,
    homeTeamId: avilesId,
    awayTeamId: rivalId,
    homeTeam: avilesName,
    awayTeam: rivalName,
    date: new Date().toISOString(),
    competition: "amistoso",
    competitionStage: competitionName,
    venue: "",
    status: "scheduled",
  };
}

export function mergeExtraFixturesIntoBundle(
  bundle: SeasonFixturesBundle | null,
  matchdays: Matchday[],
  matchdaysGrupo2: Matchday[] | undefined,
  amistosoMatches: Match[],
  copaDelReyMatches: Match[],
  calendarExtraMatches: Match[],
): SeasonFixturesBundle {
  return {
    matchdays,
    matchdaysGrupo2: matchdaysGrupo2 ?? bundle?.matchdaysGrupo2,
    amistosoMatches,
    copaDelReyMatches,
    calendarExtraMatches,
    meta: bundle?.meta,
  };
}

export function mergeFemeninoExtraFixturesIntoBundle(
  bundle: SeasonFemeninoFixturesBundle | null,
  matchdaysFemenino: Matchday[],
  amistosoMatches: Match[],
  calendarExtraMatches: Match[],
): SeasonFemeninoFixturesBundle {
  return {
    matchdaysFemenino,
    amistosoMatches,
    calendarExtraMatches,
    meta: bundle?.meta,
  };
}

export function isExtraFixtureMatch(match: Pick<Match, "competition" | "id">): boolean {
  return (
    match.competition === "amistoso" ||
    match.competition === "copa-rey" ||
    match.id.startsWith("cal-extra-")
  );
}
