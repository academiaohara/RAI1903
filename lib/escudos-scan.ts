import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { AssetCatalogEntry } from "@/lib/asset-catalog";
import { ESCUDO_PATHS } from "@/lib/escudo-manifest";

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|svg)$/i;

function slugFromFilename(filename: string): string {
  return filename.replace(IMAGE_EXT, "").toLowerCase().replace(/[^a-z0-9-]+/g, "-");
}

function scanDirectory(dir: string, urlPrefix: string): AssetCatalogEntry[] {
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter((name) => IMAGE_EXT.test(name))
    .map((name) => {
      const slug = slugFromFilename(name);
      return {
        slug,
        path: `${urlPrefix}/${encodeURIComponent(name)}`,
        kind: "crest" as const,
      };
    });
}

/** Escanea imágenes en disco (solo servidor). Sin npm: sube PNG a public/escudos o Escudos/. */
export function scanCrestAssetsFromDisk(): AssetCatalogEntry[] {
  const root = process.cwd();
  const fromPublic = scanDirectory(join(root, "public/escudos"), "/escudos");
  const fromUploads = scanDirectory(join(root, "Escudos"), "/api/crest-file");

  const byPath = new Map<string, AssetCatalogEntry>();

  for (const [slug, path] of Object.entries(ESCUDO_PATHS)) {
    byPath.set(path, { slug, path, kind: "crest" });
  }

  for (const entry of [...fromPublic, ...fromUploads]) {
    byPath.set(entry.path, entry);
  }

  return [...byPath.values()].sort((a, b) => a.slug.localeCompare(b.slug, "es"));
}

export function findCrestFileOnDisk(filename: string): { filePath: string; contentType: string } | null {
  const safeName = filename.replace(/[/\\]/g, "");
  if (!safeName || !IMAGE_EXT.test(safeName)) return null;

  const root = process.cwd();
  const candidates = [
    join(root, "public/escudos", safeName),
    join(root, "Escudos", safeName),
  ];

  for (const filePath of candidates) {
    if (!existsSync(filePath)) continue;
    const ext = safeName.split(".").pop()?.toLowerCase() ?? "png";
    const contentType =
      ext === "svg"
        ? "image/svg+xml"
        : ext === "webp"
          ? "image/webp"
          : ext === "gif"
            ? "image/gif"
            : ext === "jpg" || ext === "jpeg"
              ? "image/jpeg"
              : "image/png";
    return { filePath, contentType };
  }

  return null;
}
