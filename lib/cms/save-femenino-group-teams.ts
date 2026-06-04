import {
  getGroupTeamSlots,
  normalizeGroupTeamSlots,
  slotDisplayName,
  slugFromTeamName,
  uniqueTeamId,
  withGroupTeamsInConfig,
  type GroupTeamSlot,
} from "@/lib/cms/group-teams";
import { resolveCompetitionConfig } from "@/lib/cms/competition-config-bundle";
import { collectFixtureTeamIdChanges, remapSeasonFixturesForTeamIdChanges } from "@/lib/cms/remap-fixture-team-ids";
import { bundleMapKey, upsertSeasonBundle, type SeasonBundlesMap } from "@/lib/cms/season-bundles";
import type { TeamCrestsBundle } from "@/lib/cms/team-crests-bundle";
import { getTeamCrestsBundle } from "@/lib/cms/team-crests-bundle";
import type { CmsTeamRecord, SeasonTeamsBundle } from "@/lib/cms/teams-bundle";
import type { CompetitionSeasonId } from "@/data/mock";
import type { RfefGrupoId } from "@/lib/rfef-grupos";

const FEMENINO_GRUPO: RfefGrupoId = "1";

function syncSlotIds(slots: GroupTeamSlot[], grupo: RfefGrupoId): GroupTeamSlot[] {
  const usedIds = new Set<string>();
  return slots.map((slot, index) => {
    const fallback = `grupo-${grupo}-slot-${index + 1}`;
    const slug = slot.name.trim() ? slugFromTeamName(slot.name) : "";
    const preferred = slug || slot.id.trim() || fallback;
    const id = uniqueTeamId(preferred, usedIds, fallback);
    usedIds.add(id);
    return { ...slot, id };
  });
}

export async function saveFemeninoGroupTeamsAndCrests(
  seasonId: CompetitionSeasonId,
  bundles: SeasonBundlesMap,
  slots: GroupTeamSlot[],
  crestOverrides: Record<string, string>,
): Promise<{ ok: boolean; error?: string }> {
  const config = resolveCompetitionConfig(bundles, "femenino");
  const storedSlots = getGroupTeamSlots(bundles, "femenino", FEMENINO_GRUPO);
  const normalized = normalizeGroupTeamSlots(
    syncSlotIds(slots, FEMENINO_GRUPO),
    config.teamsPerGroup,
    FEMENINO_GRUPO,
  );
  const idChanges = collectFixtureTeamIdChanges(storedSlots, normalized);
  const nextConfig = withGroupTeamsInConfig(config, FEMENINO_GRUPO, normalized);

  const existingTeams =
    (bundles[bundleMapKey("femenino", "teams")] as SeasonTeamsBundle | undefined)?.teams ?? [];
  const byId = new Map(existingTeams.map((team) => [team.id, team]));
  for (const [index, slot] of normalized.entries()) {
    const name = slotDisplayName(slot, index);
    const previous = byId.get(slot.id);
    const record: CmsTeamRecord = {
      id: slot.id,
      name: slot.name.trim() ? name : "",
      shortName: name.slice(0, 12),
      coach: previous?.coach ?? "",
      stadium: previous?.stadium ?? "",
      crestInitials: previous?.crestInitials ?? name.slice(0, 3).toUpperCase(),
      removed: !slot.name.trim(),
    };
    byId.set(slot.id, record);
  }

  const configResult = await upsertSeasonBundle(seasonId, "femenino", "competition_config", nextConfig);
  if (!configResult.ok) return configResult;

  const teamsResult = await upsertSeasonBundle(seasonId, "femenino", "teams", {
    teams: [...byId.values()],
  } satisfies SeasonTeamsBundle);
  if (!teamsResult.ok) return teamsResult;

  if (idChanges.length > 0) {
    const remapped = remapSeasonFixturesForTeamIdChanges(bundles, "femenino", idChanges);
    if (remapped) {
      const fixturesResult = await upsertSeasonBundle(seasonId, "femenino", "fixtures", remapped);
      if (!fixturesResult.ok) return fixturesResult;
    }
  }

  const crestsFromBundle = getTeamCrestsBundle(bundles).crests;
  const remappedCrests = { ...crestsFromBundle, ...crestOverrides };
  for (const change of idChanges) {
    if (remappedCrests[change.from] && !remappedCrests[change.to]) {
      remappedCrests[change.to] = remappedCrests[change.from];
    }
  }

  const crestResult = await upsertSeasonBundle(seasonId, "global", "team_crests", {
    crests: remappedCrests,
  } satisfies TeamCrestsBundle);
  if (!crestResult.ok) return crestResult;

  return { ok: true };
}
