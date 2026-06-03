import type { FanMediaLink } from "@/types";
import { parseFanVideoDate } from "@/lib/fan-videos";

/** Clave CMS global para espacios de X en Media RAI (p. ej. Tente firme). */
export function mediaRaiSpacesStorageKey(section: string): string {
  return `media-rai:${section}:spaces`;
}

function isFanSpaceList(value: unknown): value is FanMediaLink[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === "object" &&
        "id" in item &&
        "name" in item &&
        "url" in item &&
        "platform" in item,
    )
  );
}

export function sortFanSpacesByDate(spaces: FanMediaLink[]): FanMediaLink[] {
  return [...spaces].sort((a, b) => {
    const dateDiff = parseFanVideoDate(b.date) - parseFanVideoDate(a.date);
    if (dateDiff !== 0) return dateDiff;
    return a.id.localeCompare(b.id);
  });
}

/** Combina overrides CMS con la lista por defecto del mock. */
export function collectMediaRaiSpaces(
  section: string,
  overrides: Record<string, unknown>,
  fallback: FanMediaLink[],
): { spaces: FanMediaLink[]; hasCustomList: boolean } {
  const globalKey = mediaRaiSpacesStorageKey(section);
  const globalValue = overrides[globalKey];
  if (isFanSpaceList(globalValue)) {
    return { spaces: sortFanSpacesByDate(globalValue), hasCustomList: true };
  }

  return { spaces: fallback, hasCustomList: false };
}

export function createFanSpaceId(section: string): string {
  return `${section}-space-${Date.now()}`;
}

const DEFAULT_FAN_SPACE_NAME = "Nuevo espacio de X";

export function isDefaultFanSpaceName(name: string): boolean {
  return name.trim() === DEFAULT_FAN_SPACE_NAME;
}

export function newFanSpace(section: string): FanMediaLink {
  const today = new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());

  return {
    id: createFanSpaceId(section),
    name: DEFAULT_FAN_SPACE_NAME,
    platform: "twitter",
    url: "",
    description: "",
    date: today,
  };
}
