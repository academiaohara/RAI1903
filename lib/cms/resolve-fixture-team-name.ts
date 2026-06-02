import { getGroupTeamSlots, slotDisplayName } from "@/lib/cms/group-teams";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import { getTeamsBundle, resolveTeamDisplayName } from "@/lib/cms/teams-bundle";
import { isPlaceholderTeamId } from "@/lib/competition/normalize-fixtures";
import { getTeam } from "@/lib/fixtures";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { RfefGrupoId } from "@/lib/rfef-grupos";

function isGenericEquipoLabel(name: string): boolean {
  return /^Equipo \d+$/.test(name.trim());
}

/** Nombre visible de un equipo en calendario / quiniela (slots de grupo, CMS, mock). */
export function resolveFixtureTeamName(
  teamId: string,
  fallback: string,
  bundles: SeasonBundlesMap,
  gender: PrimerEquipoGender,
  grupo: RfefGrupoId = "1",
): string {
  const slots = getGroupTeamSlots(bundles, gender, grupo);
  const slotIndex = slots.findIndex((entry) => entry.id === teamId);
  const slot = slotIndex >= 0 ? slots[slotIndex] : undefined;
  if (slot?.name?.trim()) return slot.name.trim();

  const cmsTeams = getTeamsBundle(bundles, gender)?.teams ?? [];
  const fromCms = resolveTeamDisplayName(teamId, "", cmsTeams);
  if (fromCms && fromCms !== "Equipo" && !isGenericEquipoLabel(fromCms)) return fromCms;

  const mock = getTeam(teamId);
  if (mock?.name?.trim()) return mock.name.trim();

  const trimmedFallback = fallback.trim();
  if (trimmedFallback && !isGenericEquipoLabel(trimmedFallback) && !isPlaceholderTeamId(teamId)) {
    return trimmedFallback;
  }

  if (slot) return slotDisplayName(slot, slotIndex);
  if (trimmedFallback) return trimmedFallback;
  return fromCms || "Equipo";
}

export function buildFixtureTeamNameResolver(
  bundles: SeasonBundlesMap,
  gender: PrimerEquipoGender,
  grupo: RfefGrupoId,
): (teamId: string, fallback: string) => string {
  return (teamId, fallback) => resolveFixtureTeamName(teamId, fallback, bundles, gender, grupo);
}
