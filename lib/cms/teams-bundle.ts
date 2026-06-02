import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import { bundleMapKey } from "@/lib/cms/season-bundles";
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
