import { RAI_TEAM_ID } from "@/data/mock";
import { slugFromTeamName } from "@/lib/cms/group-teams";
import type { SeasonFixturesBundle } from "@/lib/cms/season-bundles";
import type { CompetitionId, Match, Matchday } from "@/types";

export const EXTRA_FIXTURE_COMPETITION_OPTIONS: { id: CompetitionId; label: string }[] = [
  { id: "amistoso", label: "Amistoso / pretemporada" },
  { id: "copa-rey", label: "Copa del Rey" },
  { id: "primera-rfef", label: "Liga / RFEF (sin jornada)" },
];

export function newExtraMatchId(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}

export function emptyAmistosoMatch(rivalName = "Rival"): Match {
  const rivalId = slugFromTeamName(rivalName) || `rival-${Date.now()}`;
  return {
    id: newExtraMatchId("amistoso"),
    matchday: 1,
    homeTeamId: rivalId,
    awayTeamId: RAI_TEAM_ID,
    homeTeam: rivalName,
    awayTeam: "Real Avilés Industrial",
    date: new Date().toISOString(),
    competition: "amistoso",
    competitionStage: "Pretemporada",
    venue: "",
    status: "scheduled",
  };
}

export function emptyCopaMatch(rivalName = "Rival", stage = "Eliminatoria"): Match {
  const rivalId = slugFromTeamName(rivalName) || `rival-${Date.now()}`;
  return {
    id: newExtraMatchId("copa-rey"),
    matchday: 1,
    homeTeamId: RAI_TEAM_ID,
    awayTeamId: rivalId,
    homeTeam: "Real Avilés Industrial",
    awayTeam: rivalName,
    date: new Date().toISOString(),
    competition: "copa-rey",
    competitionStage: stage,
    venue: "Roman Suarez Puerta",
    status: "scheduled",
  };
}

export function emptyCalendarExtraMatch(rivalName = "Rival", competitionName = "Torneo / fase extra"): Match {
  const rivalId = slugFromTeamName(rivalName) || `rival-${Date.now()}`;
  return {
    id: newExtraMatchId("cal-extra"),
    matchday: 1,
    homeTeamId: RAI_TEAM_ID,
    awayTeamId: rivalId,
    homeTeam: "Real Avilés Industrial",
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

export function isExtraFixtureMatch(match: Pick<Match, "competition" | "id">): boolean {
  return (
    match.competition === "amistoso" ||
    match.competition === "copa-rey" ||
    match.id.startsWith("cal-extra-")
  );
}
