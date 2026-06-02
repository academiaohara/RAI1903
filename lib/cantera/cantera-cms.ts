import type { CanteraTeamId } from "@/lib/cantera-data";

/** Scope en `cms_season_bundles` para equipos de cantera con CMS. */
export type CanteraCmsScope = "filial" | "juvenil";

export function canteraTeamIdToCmsScope(teamId: CanteraTeamId): CanteraCmsScope {
  return teamId === "filial" ? "filial" : "juvenil";
}

export function cmsScopeToCanteraTeamId(scope: CanteraCmsScope): CanteraTeamId {
  return scope === "filial" ? "filial" : "juvenil-a";
}

export function bundleKeyForCanteraScope(scope: CanteraCmsScope, bundleKey: string): string {
  return `${scope}:${bundleKey}`;
}
