import { getGroupTeamSlots, slotDisplayName, slugFromTeamName } from "@/lib/cms/group-teams";
import { getRivalStadiumName } from "@/lib/cms/rival-squads-bundle";
import { getTeamsBundle, type CmsTeamRecord } from "@/lib/cms/teams-bundle";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import { getAllTeamsForGender, getTeamByGender } from "@/lib/fixtures";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";

export type TeamCatalogEntry = {
  id: string;
  name: string;
  stadium: string;
};

/** Slugs habituales en calendarios importados → id del mock/CMS. */
const TEAM_ID_ALIASES: Record<string, string> = {
  "bilbao-athletic": "athletic-bilbao-b",
  "athletic-club-b": "athletic-bilbao-b",
  "barakaldo-cf": "barakaldo",
  "cd-lugo": "lugo",
  "pontevedra-cf": "pontevedra",
  "unionistas-de-salamanca-cf": "unionistas",
};

function normalizeRef(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function stadiumFromSources(
  teamId: string,
  mockStadium: string | undefined,
  cmsTeams: CmsTeamRecord[],
  bundles: SeasonBundlesMap,
  gender: PrimerEquipoGender,
): string {
  const cms = cmsTeams.find((team) => team.id === teamId);
  const fromCms = cms?.stadium?.trim();
  if (fromCms) return fromCms;
  const fromMock = mockStadium?.trim();
  if (fromMock) return fromMock;
  return getRivalStadiumName(bundles, gender, teamId);
}

function entryFromMock(
  mock: NonNullable<ReturnType<typeof getTeamByGender>>,
  cmsTeams: CmsTeamRecord[],
  bundles: SeasonBundlesMap,
  gender: PrimerEquipoGender,
): TeamCatalogEntry {
  return {
    id: mock.id,
    name: mock.name,
    stadium: stadiumFromSources(mock.id, mock.stadium, cmsTeams, bundles, gender),
  };
}

function entryFromCms(
  cms: CmsTeamRecord,
  bundles: SeasonBundlesMap,
  gender: PrimerEquipoGender,
): TeamCatalogEntry {
  return {
    id: cms.id,
    name: cms.name.trim() || cms.id,
    stadium: stadiumFromSources(cms.id, undefined, [cms], bundles, gender),
  };
}

/** Resuelve id, nombre y estadio desde slug/id/nombre (CMS, guía de liga o mock). */
export function resolveTeamCatalogEntry(
  teamRef: string,
  bundles: SeasonBundlesMap,
  gender: PrimerEquipoGender,
): TeamCatalogEntry {
  const trimmed = teamRef.trim();
  if (!trimmed) {
    return { id: "equipo-desconocido", name: "", stadium: "" };
  }

  const cmsTeams = getTeamsBundle(bundles, gender)?.teams ?? [];
  const normalizedRef = normalizeRef(trimmed);
  const aliasId = TEAM_ID_ALIASES[trimmed] ?? TEAM_ID_ALIASES[normalizedRef];
  if (aliasId && aliasId !== trimmed) {
    return resolveTeamCatalogEntry(aliasId, bundles, gender);
  }

  const cmsById = cmsTeams.find(
    (team) => team.id === trimmed || normalizeRef(team.id) === normalizedRef,
  );
  if (cmsById) return entryFromCms(cmsById, bundles, gender);

  const mockById = getTeamByGender(trimmed, gender);
  if (mockById) return entryFromMock(mockById, cmsTeams, bundles, gender);

  if (gender === "masculino") {
    for (const grupo of ["1", "2"] as const) {
      const slots = getGroupTeamSlots(bundles, gender, grupo);
      const index = slots.findIndex(
        (slot) => slot.id === trimmed || normalizeRef(slot.id) === normalizedRef,
      );
      if (index >= 0) {
        const slot = slots[index]!;
        const mock = getTeamByGender(slot.id, gender);
        return {
          id: slot.id,
          name: slotDisplayName(slot, index),
          stadium: stadiumFromSources(slot.id, mock?.stadium, cmsTeams, bundles, gender),
        };
      }
    }
  }

  for (const mock of getAllTeamsForGender(gender)) {
    if (mock.id === trimmed || normalizeRef(mock.id) === normalizedRef) {
      return entryFromMock(mock, cmsTeams, bundles, gender);
    }
    if (slugFromTeamName(mock.name) === trimmed || normalizeRef(slugFromTeamName(mock.name)) === normalizedRef) {
      return entryFromMock(mock, cmsTeams, bundles, gender);
    }
    if (normalizeRef(mock.name) === normalizedRef) {
      return entryFromMock(mock, cmsTeams, bundles, gender);
    }
  }

  for (const cms of cmsTeams) {
    if (
      normalizeRef(cms.name) === normalizedRef ||
      slugFromTeamName(cms.name) === trimmed ||
      normalizeRef(slugFromTeamName(cms.name)) === normalizedRef
    ) {
      return entryFromCms(cms, bundles, gender);
    }
  }

  if (gender === "masculino") {
    for (const grupo of ["1", "2"] as const) {
      const slots = getGroupTeamSlots(bundles, gender, grupo);
      const index = slots.findIndex((slot) => normalizeRef(slot.name) === normalizedRef);
      if (index >= 0) {
        const slot = slots[index]!;
        const mock = getTeamByGender(slot.id, gender);
        return {
          id: slot.id,
          name: slotDisplayName(slot, index),
          stadium: stadiumFromSources(slot.id, mock?.stadium, cmsTeams, bundles, gender),
        };
      }
    }
  }

  const id = slugFromTeamName(trimmed) || trimmed;
  const stadium = getRivalStadiumName(bundles, gender, id);
  return { id, name: trimmed, stadium };
}
