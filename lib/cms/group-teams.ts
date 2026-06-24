import type { SeasonCompetitionConfigBundle } from "@/lib/cms/competition-config-bundle";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import { resolveCompetitionConfig } from "@/lib/cms/competition-config-bundle";
import { defaultTeamsForLeagueTemplate } from "@/lib/competition/league-team-sources";
import type { RfefGrupoId } from "@/lib/rfef-grupos";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { getTeamsBundle } from "@/lib/cms/teams-bundle";
import { getTeam } from "@/lib/fixtures";
import { resolveTeamColorsFromSources } from "@/lib/team-stripes";
import type { Team } from "@/types";

export type GroupTeamSlot = {
  id: string;
  name: string;
};

const EMPTY_STATS: Team["stats"] = {
  played: 0,
  won: 0,
  drawn: 0,
  lost: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  points: 0,
};

export function slugFromTeamName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function uniqueTeamId(baseId: string, usedIds: Set<string>, fallback: string): string {
  const trimmed = baseId.trim() || fallback;
  if (!usedIds.has(trimmed)) return trimmed;
  let index = 2;
  while (usedIds.has(`${trimmed}-${index}`)) index += 1;
  return `${trimmed}-${index}`;
}

export function slotDisplayName(slot: GroupTeamSlot, index: number): string {
  const trimmed = slot.name.trim();
  return trimmed || `Equipo ${index + 1}`;
}

export function defaultSlotId(grupo: RfefGrupoId, index: number): string {
  return `grupo-${grupo}-slot-${index + 1}`;
}

export function normalizeGroupTeamSlots(
  slots: GroupTeamSlot[] | undefined,
  count: number,
  grupo: RfefGrupoId,
): GroupTeamSlot[] {
  const usedIds = new Set<string>();
  const normalized: GroupTeamSlot[] = [];

  for (let index = 0; index < count; index += 1) {
    const incoming = slots?.[index];
    const fallbackId = defaultSlotId(grupo, index);
    const id = uniqueTeamId(incoming?.id?.trim() || fallbackId, usedIds, fallbackId);
    usedIds.add(id);
    normalized.push({
      id,
      name: incoming?.name?.trim() ?? "",
    });
  }

  return normalized;
}

export function defaultGroupTeamSlots(
  grupo: RfefGrupoId,
  gender: PrimerEquipoGender,
  count: number,
  config?: SeasonCompetitionConfigBundle,
): GroupTeamSlot[] {
  const mockTeams = defaultTeamsForLeagueTemplate(config?.templateId, gender, grupo, count);
  const slots = mockTeams.map((team) => ({ id: team.id, name: team.name }));
  return normalizeGroupTeamSlots(slots, count, grupo);
}

export function getGroupTeamSlots(
  bundles: SeasonBundlesMap,
  gender: PrimerEquipoGender,
  grupo: RfefGrupoId,
): GroupTeamSlot[] {
  const config = resolveCompetitionConfig(bundles, gender);
  const count = config.teamsPerGroup;
  const stored = config.groupTeams?.[grupo];
  if (stored?.length) {
    return normalizeGroupTeamSlots(stored, count, grupo);
  }
  return defaultGroupTeamSlots(grupo, gender, count, config);
}

export function groupSlotToTeam(slot: GroupTeamSlot, index: number, cmsColors?: string[]): Team {
  const name = slotDisplayName(slot, index);
  const mock = getTeam(slot.id);
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 3);
  const colors = resolveTeamColorsFromSources(slot.id, cmsColors);

  return {
    id: slot.id,
    name,
    shortName: mock?.shortName ?? name.slice(0, 12),
    city: mock?.city ?? "",
    stadium: mock?.stadium ?? "",
    coach: mock?.coach ?? "",
    founded: mock?.founded ?? 0,
    crestInitials: (mock?.crestInitials ?? initials) || "EQP",
    colors: [...colors],
    position: 0,
    form: [],
    stats: { ...EMPTY_STATS },
  };
}

export function teamsFromGroupSlots(
  slots: GroupTeamSlot[],
  cmsColorsByTeamId?: Map<string, string[]>,
): Team[] {
  return slots
    .map((slot, index) => groupSlotToTeam(slot, index, cmsColorsByTeamId?.get(slot.id)))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export function resolveGroupTeams(
  bundles: SeasonBundlesMap,
  gender: PrimerEquipoGender,
  grupo: RfefGrupoId,
): Team[] {
  const slots = getGroupTeamSlots(bundles, gender, grupo);
  const cmsColorsByTeamId = new Map(
    (getTeamsBundle(bundles, gender)?.teams ?? [])
      .filter((team) => team.colors?.length)
      .map((team) => [team.id, team.colors!]),
  );
  return teamsFromGroupSlots(slots, cmsColorsByTeamId);
}

export function slotsFromTeamNames(
  names: string[],
  grupo: RfefGrupoId,
  existing?: GroupTeamSlot[],
): GroupTeamSlot[] {
  const usedIds = new Set<string>();
  return names.map((rawName, index) => {
    const name = rawName.trim();
    const previous = existing?.[index];
    const fallbackId = defaultSlotId(grupo, index);
    let id = previous?.id?.trim() || fallbackId;

    if (name) {
      const slug = slugFromTeamName(name);
      if (!previous?.name.trim() || slugFromTeamName(previous.name) !== slug) {
        id = uniqueTeamId(slug || fallbackId, usedIds, fallbackId);
      } else {
        id = uniqueTeamId(id, usedIds, fallbackId);
      }
    } else {
      id = uniqueTeamId(fallbackId, usedIds, fallbackId);
    }

    usedIds.add(id);
    return { id, name };
  });
}

export function withGroupTeamsInConfig(
  config: SeasonCompetitionConfigBundle,
  grupo: RfefGrupoId,
  slots: GroupTeamSlot[],
): SeasonCompetitionConfigBundle {
  return {
    ...config,
    groupTeams: {
      ...(config.groupTeams ?? {}),
      [grupo]: slots,
    },
  };
}
