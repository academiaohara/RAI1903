import { STADIUM_PATHS } from "@/lib/stadium-manifest";
import type { AssetCatalogEntry } from "@/lib/asset-catalog-types";

/** Catálogo estático de estadios (sin fs; seguro en cliente). */
export function listStadiumAssets(): AssetCatalogEntry[] {
  return Object.entries(STADIUM_PATHS)
    .map(([slug, path]) => ({ slug, path, kind: "stadium" as const }))
    .sort((a, b) => a.slug.localeCompare(b.slug, "es"));
}
