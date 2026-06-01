import { ESCUDO_PATHS } from "@/lib/escudo-manifest";
import { STADIUM_PATHS } from "@/lib/stadium-manifest";

export type AssetCatalogEntry = {
  slug: string;
  path: string;
  kind: "crest" | "stadium";
};

/** Imágenes versionadas en GitHub (public/escudos, public/estadio). No son datos de competición. */
export function listCrestAssets(): AssetCatalogEntry[] {
  return Object.entries(ESCUDO_PATHS)
    .map(([slug, path]) => ({ slug, path, kind: "crest" as const }))
    .sort((a, b) => a.slug.localeCompare(b.slug, "es"));
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
  return listCrestAssets().find((entry) => entry.path === path);
}
