import type { CanteraCmsScope } from "@/lib/cantera/cantera-cms";
import {
  buildFilialMockBundleEntries,
  resolveFilialSeasonData,
  type FilialSeasonData,
} from "@/lib/cantera/filial-season-data";
import {
  buildJuvenilMockBundleEntries,
  resolveJuvenilSeasonData,
  type JuvenilSeasonData,
} from "@/lib/cantera/juvenil-season-data";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";

export type CanteraSeasonData = FilialSeasonData | JuvenilSeasonData;

export function resolveCanteraSeasonData(
  scope: CanteraCmsScope,
  bundles: SeasonBundlesMap,
  seasonLabel: string,
): CanteraSeasonData {
  if (scope === "filial") {
    return resolveFilialSeasonData(bundles, seasonLabel);
  }
  return resolveJuvenilSeasonData(bundles, seasonLabel);
}

export function buildCanteraMockBundleEntries(scope: CanteraCmsScope) {
  return scope === "filial" ? buildFilialMockBundleEntries() : buildJuvenilMockBundleEntries();
}
