import { NextResponse } from "next/server";
import type { CompetitionSeasonId } from "@/data/mock";
import { publishCanteraFixturesBundleFromOverrides } from "@/lib/cms/publish-cantera-fixtures";
import { isEditorRequest } from "@/lib/auth/editor-server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { CanteraCmsScope } from "@/lib/cantera/cantera-cms";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no está configurado." }, { status: 503 });
  }

  const allowed = await isEditorRequest();
  if (!allowed) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  let body: { seasonId?: string; scope?: CanteraCmsScope };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido." }, { status: 400 });
  }

  const seasonId = body.seasonId;
  const scope = body.scope;

  if (!seasonId || (scope !== "filial" && scope !== "juvenil")) {
    return NextResponse.json(
      { error: "Parámetros requeridos: seasonId y scope (filial|juvenil)." },
      { status: 400 },
    );
  }

  try {
    const supabase = await createClient();
    const result = await publishCanteraFixturesBundleFromOverrides(
      supabase,
      seasonId as CompetitionSeasonId,
      scope,
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.error ?? "Error al publicar." }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      jornadasUpdated: result.jornadasUpdated,
      message: `Calendario ${scope} publicado en cms_season_bundles (fixtures).`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al publicar calendario";
    console.error("publish-cantera-fixtures", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
