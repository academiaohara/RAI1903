import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";

export type TeamCrestsBundle = {
  /** teamId → ruta pública del escudo (/escudos/slug.png) */
  crests: Record<string, string>;
};

export function getTeamCrestsBundle(map: SeasonBundlesMap): TeamCrestsBundle {
  const payload = map["global:team_crests"];
  if (!payload || typeof payload !== "object") return { crests: {} };
  const crests = (payload as TeamCrestsBundle).crests;
  return { crests: crests && typeof crests === "object" ? crests : {} };
}

export function mergeTeamCrestMaps(...maps: Array<Record<string, string>>): Record<string, string> {
  return Object.assign({}, ...maps);
}
