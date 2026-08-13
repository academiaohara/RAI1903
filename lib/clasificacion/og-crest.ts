import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { findCrestFileOnDisk } from "@/lib/escudos-scan";

const CREST_CELL_PX = 22;

function toDataUri(buffer: Buffer, contentType: string): string {
  return `data:${contentType};base64,${buffer.toString("base64")}`;
}

async function readCrestFromDisk(filePath: string, contentType: string): Promise<string | null> {
  try {
    const buffer = await readFile(filePath);
    return toDataUri(buffer, contentType);
  } catch {
    return null;
  }
}

/** Embeds crest files for Satori/OG (remote <img> URLs are unreliable there). */
export async function resolveCrestDataUri(webPath: string, origin: string): Promise<string | null> {
  if (!webPath || webPath.length < 2) return null;

  if (webPath.startsWith("/escudos/")) {
    const filename = decodeURIComponent(webPath.slice("/escudos/".length));
    const filePath = join(process.cwd(), "public/escudos", filename);
    return readCrestFromDisk(filePath, "image/png");
  }

  if (webPath.startsWith("/api/crest-file/")) {
    const filename = decodeURIComponent(webPath.slice("/api/crest-file/".length));
    const found = findCrestFileOnDisk(filename);
    if (!found) return null;
    return readCrestFromDisk(found.filePath, found.contentType);
  }

  if (webPath.startsWith("http")) {
    try {
      const response = await fetch(webPath);
      if (!response.ok) return null;
      const contentType = response.headers.get("content-type") ?? "image/png";
      const buffer = Buffer.from(await response.arrayBuffer());
      return toDataUri(buffer, contentType);
    } catch {
      return null;
    }
  }

  if (webPath.startsWith("/")) {
    try {
      const response = await fetch(`${origin}${webPath}`);
      if (!response.ok) return null;
      const contentType = response.headers.get("content-type") ?? "image/png";
      const buffer = Buffer.from(await response.arrayBuffer());
      return toDataUri(buffer, contentType);
    } catch {
      return null;
    }
  }

  return null;
}

export type CrestSpriteSheet = {
  dataUri: string;
  width: number;
  height: number;
  cellSize: number;
  rowsPerColumn: number;
};

function initialsBadgeSvg(x: number, y: number, initials: string, isAviles: boolean): string {
  const fill = isAviles ? "#214C9B" : "#e2e8f0";
  const textFill = isAviles ? "#ffffff" : "#475569";
  const label = initials.slice(0, 3).replace(/[<>&'"]/g, "");
  return `<rect x="${x + 1}" y="${y + 1}" width="${CREST_CELL_PX - 2}" height="${CREST_CELL_PX - 2}" rx="11" fill="${fill}" /><text x="${x + CREST_CELL_PX / 2}" y="${y + 14}" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" font-weight="700" fill="${textFill}">${label}</text>`;
}

/** One SVG sheet so Satori loads a single image (it caps embedded <img> count). */
export async function buildCrestSpriteSheet(
  crestPaths: string[],
  flags: Array<{ initials: string; isAviles: boolean }>,
  origin: string,
): Promise<CrestSpriteSheet> {
  const rowsPerColumn = Math.ceil(crestPaths.length / 2);
  const width = 2 * CREST_CELL_PX;
  const height = rowsPerColumn * CREST_CELL_PX;
  const parts: string[] = [];

  for (let index = 0; index < crestPaths.length; index += 1) {
    const col = index < rowsPerColumn ? 0 : 1;
    const row = index < rowsPerColumn ? index : index - rowsPerColumn;
    const x = col * CREST_CELL_PX;
    const y = row * CREST_CELL_PX;
    const crestDataUri = await resolveCrestDataUri(crestPaths[index] ?? "", origin);
    const flag = flags[index];

    if (crestDataUri) {
      parts.push(
        `<image href="${crestDataUri}" x="${x}" y="${y}" width="${CREST_CELL_PX}" height="${CREST_CELL_PX}" preserveAspectRatio="xMidYMid meet" />`,
      );
    } else if (flag) {
      parts.push(initialsBadgeSvg(x, y, flag.initials, flag.isAviles));
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${parts.join("")}</svg>`;
  const dataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  return { dataUri, width, height, cellSize: CREST_CELL_PX, rowsPerColumn };
}

export function crestSpriteBackgroundPosition(sheet: CrestSpriteSheet, index: number): { x: number; y: number } {
  const col = index < sheet.rowsPerColumn ? 0 : 1;
  const row = index < sheet.rowsPerColumn ? index : index - sheet.rowsPerColumn;
  return { x: col * sheet.cellSize, y: row * sheet.cellSize };
}
