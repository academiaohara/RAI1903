import type { GroupTeamSlot } from "@/lib/cms/group-teams";
import { slugFromTeamName, uniqueTeamId } from "@/lib/cms/group-teams";
import type { Matchday } from "@/types";

/** Extrae equipos únicos de un calendario (orden de primera aparición). */
export function extractTeamNamesFromMatchdays(matchdays: Matchday[]): string[] {
  const names: string[] = [];
  const seen = new Set<string>();
  for (const md of matchdays) {
    for (const match of md.matches) {
      for (const name of [match.homeTeam, match.awayTeam]) {
        const trimmed = name.trim();
        if (!trimmed || seen.has(trimmed)) continue;
        seen.add(trimmed);
        names.push(trimmed);
      }
    }
  }
  return names;
}

/** Convierte nombres de equipos del calendario a slots de grupo CMS. */
export function teamNamesToGroupSlots(names: string[], existing?: GroupTeamSlot[]): GroupTeamSlot[] {
  const usedIds = new Set<string>();
  return names.map((rawName, index) => {
    const name = rawName.trim();
    const previous = existing?.find((slot) => slot.name.trim() === name);
    const slug = slugFromTeamName(name);
    const fallbackId = `equipo-${index + 1}`;
    const id = uniqueTeamId(previous?.id?.trim() || slug || fallbackId, usedIds, fallbackId);
    usedIds.add(id);
    return { id, name };
  });
}
