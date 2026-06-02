import { ESCUDO_PATHS } from "@/lib/escudo-manifest";
import { STADIUM_PATHS } from "@/lib/stadium-manifest";
import type { AssetCatalogEntry } from "@/lib/asset-catalog-types";

export type { AssetCatalogEntry } from "@/lib/asset-catalog-types";

/** Catálogo estático (manifest). Seguro en cliente y servidor. */
export function listCrestAssetsFromManifest(): AssetCatalogEntry[] {
  return Object.entries(ESCUDO_PATHS)
    .map(([slug, path]) => ({ slug, path, kind: "crest" as const }))
    .sort((a, b) => a.slug.localeCompare(b.slug, "es"));
}

/** Manifest de escudos (sin lectura de disco). En API usar scanCrestAssetsFromDisk. */
export function listCrestAssets(): AssetCatalogEntry[] {
  return listCrestAssetsFromManifest();
}

export function listStadiumAssets(): AssetCatalogEntry[] {
  return Object.entries(STADIUM_PATHS)
    .map(([slug, path]) => ({ slug, path, kind: "stadium" as const }))
    .sort((a, b) => a.slug.localeCompare(b.slug, "es"));
}

export function crestPathFromSlug(slug: string): string | undefined {
  return ESCUDO_PATHS[slug];
}

export function findCrestAssetByPath(path: string): AssetCatalogEntry | undefined {
  return listCrestAssetsFromManifest().find((entry) => entry.path === path);
}
