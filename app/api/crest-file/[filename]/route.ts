import { readFileSync } from "node:fs";
import { NextResponse } from "next/server";
import { findCrestFileOnDisk } from "@/lib/escudos-scan";

type RouteContext = { params: Promise<{ filename: string }> };

/** Sirve escudos subidos a la carpeta Escudos/ del repo (sin npm run import:assets). */
export async function GET(_request: Request, context: RouteContext) {
  const { filename } = await context.params;
  const decoded = decodeURIComponent(filename);
  const found = findCrestFileOnDisk(decoded);

  if (!found) {
    return new NextResponse(null, { status: 404 });
  }

  const body = readFileSync(found.filePath);
  return new NextResponse(body, {
    headers: {
      "Content-Type": found.contentType,
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
