/** Bloques reordenables de la página de inicio (debajo del hero). */
export type HomeSectionId =
  | "match_banners"
  | "standings_stats"
  | "recent_upcoming"
  | "news"
  | "club_x"
  | "transfers";

export const HOME_SECTION_ORDER_KEY = "home:section_order";

export const DEFAULT_HOME_SECTION_ORDER: HomeSectionId[] = [
  "match_banners",
  "standings_stats",
  "recent_upcoming",
  "news",
  "club_x",
  "transfers",
];

export const HOME_SECTION_LABELS: Record<HomeSectionId, string> = {
  match_banners: "Último y próximo partido",
  standings_stats: "Clasificación y estadísticas",
  recent_upcoming: "Últimos 5 y próximos 5 partidos",
  news: "Noticiero",
  club_x: "Club en X",
  transfers: "Fichajes y renovaciones",
};

const ALL_SECTION_IDS = new Set<HomeSectionId>(DEFAULT_HOME_SECTION_ORDER);

export function isHomeSectionId(value: unknown): value is HomeSectionId {
  return typeof value === "string" && ALL_SECTION_IDS.has(value as HomeSectionId);
}

/** Garantiza todas las secciones, sin duplicados ni ids desconocidos. */
export function normalizeHomeSectionOrder(raw: unknown): HomeSectionId[] {
  if (!Array.isArray(raw)) return [...DEFAULT_HOME_SECTION_ORDER];

  const seen = new Set<HomeSectionId>();
  const ordered: HomeSectionId[] = [];

  for (const item of raw) {
    if (!isHomeSectionId(item) || seen.has(item)) continue;
    seen.add(item);
    ordered.push(item);
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
