import { NextResponse } from "next/server";
import { isEditorRequest } from "@/lib/auth/editor-server";
import { listCrestAssets, listStadiumAssets } from "@/lib/asset-catalog";

export async function GET() {
  const allowed = await isEditorRequest();
  if (!allowed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  return NextResponse.json({
    crests: listCrestAssets(),
    stadiums: listStadiumAssets(),
    hint: "Sube PNG a public/escudos/ o Escudos/ en GitHub y despliega. Asocia rutas en Editar → Escudos.",
  });
}
