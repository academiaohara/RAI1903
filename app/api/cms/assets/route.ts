import { NextResponse } from "next/server";
import { isEditorRequest } from "@/lib/auth/editor-server";
import { listCrestAssetsFromManifest, listStadiumAssets } from "@/lib/asset-catalog";
import { scanCrestAssetsFromDisk } from "@/lib/escudos-scan";

export async function GET() {
  const allowed = await isEditorRequest();
  if (!allowed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  let crests = listCrestAssetsFromManifest();
  try {
    crests = scanCrestAssetsFromDisk();
  } catch {
    // manifest fallback
  }

  return NextResponse.json({
    crests,
    stadiums: listStadiumAssets(),
    hint: "Sube PNG a public/escudos/ o Escudos/ en GitHub y despliega. Asocia rutas en Editar → Escudos.",
  });
}
