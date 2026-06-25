import { DEFAULT_FORMATION, isFormationId, type FormationId } from "@/lib/lineup-formations";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";

export type SavedLineup = {
  formation: FormationId;
  slots: Array<string | null>;
  showRival?: boolean;
};

const STORAGE_PREFIX = "rai-lineup";

function storageKey(seasonId: string, gender: PrimerEquipoGender) {
  return `${STORAGE_PREFIX}:${seasonId}:${gender}`;
}

export function loadSavedLineup(seasonId: string, gender: PrimerEquipoGender): SavedLineup | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(storageKey(seasonId, gender));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedLineup>;
    const formation = parsed.formation && isFormationId(parsed.formation) ? parsed.formation : DEFAULT_FORMATION;
    const slots = Array.isArray(parsed.slots)
      ? parsed.slots.map((entry) => (typeof entry === "string" ? entry : null))
      : [];
    return { formation, slots, showRival: parsed.showRival !== false };
  } catch {
    return null;
  }
}

export function saveLineup(seasonId: string, gender: PrimerEquipoGender, lineup: SavedLineup) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(seasonId, gender), JSON.stringify(lineup));
}

export function createEmptySlots(count: number): Array<string | null> {
  return Array.from({ length: count }, () => null);
}

export function resizeLineupSlots(
  current: Array<string | null>,
  nextCount: number,
): Array<string | null> {
  if (current.length === nextCount) return current;
  const next = createEmptySlots(nextCount);
  for (let index = 0; index < Math.min(current.length, nextCount); index += 1) {
    next[index] = current[index] ?? null;
  }
  return next;
}
