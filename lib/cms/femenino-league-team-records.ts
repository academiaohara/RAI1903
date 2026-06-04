import { getGroupTeamSlots, slotDisplayName } from "@/lib/cms/group-teams";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import { getTeamsBundle, type CmsTeamRecord } from "@/lib/cms/teams-bundle";

/** Registros editables de la liga femenina (14 plazas), con nombres reales aunque el CMS tenga casillas vacías. */
export function femeninoLeagueTeamRecords(bundles: SeasonBundlesMap): CmsTeamRecord[] {
  const slots = getGroupTeamSlots(bundles, "femenino", "1");
  const byId = new Map((getTeamsBundle(bundles, "femenino")?.teams ?? []).map((team) => [team.id, team]));

  return slots.map((slot, index) => {
    const label = slotDisplayName(slot, index);
    const existing = byId.get(slot.id);
    return {
      id: slot.id,
      name: slot.name.trim() || label,
      shortName: existing?.shortName ?? label.slice(0, 12),
      coach: existing?.coach ?? "",
      stadium: existing?.stadium ?? "",
      crestInitials: existing?.crestInitials ?? label.slice(0, 3).toUpperCase(),
      removed: existing?.removed ?? false,
    };
  });
}

export function cmsTeamRecordsToGroupSlots(teams: CmsTeamRecord[]) {
  return teams.map((team) => ({
    id: team.id,
    name: team.removed ? "" : team.name.trim(),
  }));
}
