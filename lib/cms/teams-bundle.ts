import { getGroupTeamSlots, slotDisplayName } from "@/lib/cms/group-teams";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import { bundleMapKey } from "@/lib/cms/season-bundles";
import { getTeamByGender } from "@/lib/fixtures";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Team } from "@/types";

export type CmsTeamRecord = {
  id: string;
  name: string;
  shortName?: string;
  city?: string;
  stadium?: string;
  coach?: string;
  crestInitials?: string;
  founded?: number;
  colors?: string[];
  /** Si true, en UI se muestra «Equipo N» según orden en la lista. */
  removed?: boolean;
};

export type SeasonTeamsBundle = {
  teams: CmsTeamRecord[];
};

export function getTeamsBundle(
  bundles: SeasonBundlesMap,
  gender: PrimerEquipoGender,
): SeasonTeamsBundle | null {
  const payload = bundles[bundleMapKey(gender, "teams")];
  return (payload as SeasonTeamsBundle | undefined) ?? null;
}

/** Etiqueta genérica «Equipo N» (placeholder de calendario o plaza vacía). */
export function isGenericEquipoLabel(name: string): boolean {
  return /^Equipo \d+$/i.test(name.trim());
}

function groupTeamNameById(
  teamId: string,
  bundles: SeasonBundlesMap,
  gender: PrimerEquipoGender,
): string | undefined {
  if (gender !== "masculino") return undefined;
  for (const grupo of ["1", "2"] as const) {
    const slots = getGroupTeamSlots(bundles, gender, grupo);
    const index = slots.findIndex((slot) => slot.id === teamId);
    if (index < 0) continue;
    const slot = slots[index]!;
    if (!slot.name.trim()) continue;
    return slotDisplayName(slot, index);
  }
  return undefined;
}

/**
 * Nombre visible en partidos: bundle `teams`, guía de liga (groupTeams) y mock histórico.
 * Prioriza nombres reales frente a «Equipo N» guardados en el calendario.
 */
export function resolveFixtureTeamDisplayName(
  teamId: string,
  fallbackName: string,
  cmsTeams: CmsTeamRecord[],
  bundles: SeasonBundlesMap,
  gender: PrimerEquipoGender,
): string {
  const fromGroup = groupTeamNameById(teamId, bundles, gender);
  if (fromGroup && !isGenericEquipoLabel(fromGroup)) return fromGroup;

  const mock = getTeamByGender(teamId, gender);
  if (mock?.name.trim() && !isGenericEquipoLabel(mock.name)) return mock.name.trim();

  const fromCms = resolveTeamDisplayName(teamId, "", cmsTeams);
  if (fromCms && fromCms !== "Equipo" && !isGenericEquipoLabel(fromCms)) return fromCms;

  const trimmedFallback = fallbackName.trim();
  if (trimmedFallback && !isGenericEquipoLabel(trimmedFallback)) return trimmedFallback;

  if (fromGroup) return fromGroup;
  if (fromCms) return fromCms;
  return trimmedFallback || "Equipo";
}

export function resolveTeamDisplayName(
  teamId: string,
  fallbackName: string,
  cmsTeams: CmsTeamRecord[],
  placeholderIndex?: number,
): string {
  const record = cmsTeams.find((t) => t.id === teamId);
  if (record?.removed) {
    const idx = placeholderIndex ?? cmsTeams.filter((t) => !t.removed).length + 1;
    return `Equipo ${idx}`;
  }
  if (record?.name?.trim()) return record.name.trim();
  if (fallbackName.trim()) return fallbackName.trim();
  if (placeholderIndex != null) return `Equipo ${placeholderIndex}`;
  return "Equipo";
}

export function applyCmsTeamToBase(base: Team, record: CmsTeamRecord | undefined, placeholderIndex?: number): Team {
  if (!record) return base;
  if (record.removed) {
    const label = placeholderIndex != null ? `Equipo ${placeholderIndex}` : "Equipo";
    return {
      ...base,
      name: label,
      shortName: label,
      coach: record.coach ?? "",
      stadium: record.stadium ?? base.stadium,
      city: record.city ?? base.city,
      crestInitials: record.crestInitials ?? label.slice(0, 3).toUpperCase(),
    };
  }
  return {
    ...base,
    name: record.name || base.name,
    shortName: record.shortName || record.name || base.shortName,
    city: record.city ?? base.city,
    stadium: record.stadium ?? base.stadium,
    coach: record.coach ?? base.coach,
    crestInitials: record.crestInitials ?? base.crestInitials,
    colors: record.colors ?? base.colors,
    founded: record.founded ?? base.founded,
  };
}

export function mergeTeamsWithCms(sourceTeams: Team[], cmsBundle: SeasonTeamsBundle | null): Team[] {
  if (!cmsBundle?.teams?.length) return sourceTeams;

  const byId = new Map(cmsBundle.teams.map((t, index) => [t.id, { record: t, index }]));
  let placeholderCounter = 1;

  return sourceTeams.map((team) => {
    const entry = byId.get(team.id);
    if (!entry) return team;
    const placeholderIndex = entry.record.removed ? placeholderCounter++ : undefined;
    return applyCmsTeamToBase(team, entry.record, placeholderIndex);
  });
}
