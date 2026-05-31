import { NextResponse } from "next/server";
import { isEditorRequest } from "@/lib/auth/editor-server";
import { fetchUrlMetadata } from "@/lib/url-metadata";

export async function POST(request: Request) {
  if (!(await isEditorRequest())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let url: string;
  try {
    const body = (await request.json()) as { url?: string };
    url = body.url?.trim() ?? "";
    new URL(url);
  } catch {
    return NextResponse.json({ error: "URL no válida" }, { status: 400 });
  }

  try {
    const metadata = await fetchUrlMetadata(url);
    return NextResponse.json(metadata);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo obtener la URL";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
