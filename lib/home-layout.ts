/** Bloques reordenables de la página de inicio (debajo del hero). */
export type HomeSectionId =
  | "match_banners"
  | "standings_stats"
  | "recent_upcoming"
  | "news"
  | "media_rai"
  | "other_teams_matches"
  | "transfers";

export const HOME_SECTION_ORDER_KEY = "home:section_order";

export const DEFAULT_HOME_SECTION_ORDER: HomeSectionId[] = [
  "match_banners",
  "standings_stats",
  "recent_upcoming",
  "news",
  "media_rai",
  "other_teams_matches",
  "transfers",
];

export const HOME_SECTION_LABELS: Record<HomeSectionId, string> = {
  match_banners: "Último y próximo partido",
  standings_stats: "Clasificación y estadísticas",
  recent_upcoming: "Últimos 5 y próximos 5 partidos",
  news: "Noticiero",
  media_rai: "Carrusel Media RAI",
  other_teams_matches: "Femenino, filial y juvenil",
  transfers: "Fichajes y renovaciones",
};

const ALL_SECTION_IDS = new Set<HomeSectionId>(DEFAULT_HOME_SECTION_ORDER);

const LEGACY_HOME_SECTION_IDS: Record<string, HomeSectionId> = {
  club_x: "other_teams_matches",
};

function migrateHomeSectionId(value: unknown): HomeSectionId | null {
  if (typeof value !== "string") return null;
  if (isHomeSectionId(value)) return value;
  return LEGACY_HOME_SECTION_IDS[value] ?? null;
}

export function isHomeSectionId(value: unknown): value is HomeSectionId {
  return typeof value === "string" && ALL_SECTION_IDS.has(value as HomeSectionId);
}

/** Garantiza todas las secciones, sin duplicados ni ids desconocidos. */
export function normalizeHomeSectionOrder(raw: unknown): HomeSectionId[] {
  if (!Array.isArray(raw)) return [...DEFAULT_HOME_SECTION_ORDER];

  const seen = new Set<HomeSectionId>();
  const ordered: HomeSectionId[] = [];

  for (const item of raw) {
    const migrated = migrateHomeSectionId(item);
    if (!migrated || seen.has(migrated)) continue;
    seen.add(migrated);
    ordered.push(migrated);
  }

  for (const id of DEFAULT_HOME_SECTION_ORDER) {
    if (!seen.has(id)) ordered.push(id);
  }

  return ordered;
}

export function moveHomeSection(
  order: HomeSectionId[],
  id: HomeSectionId,
  direction: "up" | "down",
): HomeSectionId[] {
  const index = order.indexOf(id);
  if (index < 0) return order;

  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= order.length) return order;

  const next = [...order];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
