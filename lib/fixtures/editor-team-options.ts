import { RAI_TEAM_ID } from "@/data/mock";
import { resolveGroupTeams } from "@/lib/cms/group-teams";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import { getAllTeamsForGender } from "@/lib/fixtures";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Team } from "@/types";

/** Equipos disponibles en selectores de calendario/jornadas (mock + guía de liga). */
export function fixtureEditorTeamOptions(
  bundles: SeasonBundlesMap,
  gender: PrimerEquipoGender,
): Team[] {
  const byId = new Map<string, Team>();
  for (const team of getAllTeamsForGender(gender)) {
    byId.set(team.id, team);
  }
  if (gender === "masculino") {
    for (const team of resolveGroupTeams(bundles, gender, "1")) {
      if (!byId.has(team.id)) byId.set(team.id, team);
    }
    for (const team of resolveGroupTeams(bundles, gender, "2")) {
      if (!byId.has(team.id)) byId.set(team.id, team);
    }
  }
  return [...byId.values()].sort((a, b) => {
    if (a.id === RAI_TEAM_ID) return -1;
    if (b.id === RAI_TEAM_ID) return 1;
    return a.name.localeCompare(b.name, "es");
  });
}
