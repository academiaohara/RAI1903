import { NextResponse } from "next/server";
import type { CompetitionSeasonId } from "@/data/mock";
import { publishFixturesBundleFromOverrides } from "@/lib/cms/publish-fixtures-server";
import { isEditorRequest } from "@/lib/auth/editor-server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no está configurado." }, { status: 503 });
  }

  const allowed = await isEditorRequest();
  if (!allowed) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  let body: { seasonId?: string; gender?: PrimerEquipoGender };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido." }, { status: 400 });
  }

  const seasonId = body.seasonId;
  const gender = body.gender ?? "masculino";

  if (!seasonId || (gender !== "masculino" && gender !== "femenino")) {
    return NextResponse.json(
      { error: "Parámetros requeridos: seasonId y gender (masculino|femenino)." },
      { status: 400 },
    );
  }

  try {
    const supabase = await createClient();
    const result = await publishFixturesBundleFromOverrides(
      supabase,
      seasonId as CompetitionSeasonId,
      gender,
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.error ?? "Error al publicar." }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      matchdaysUpdated: result.matchdaysUpdated,
      message:
        "Calendario publicado en cms_season_bundles (fixtures). Los resultados de Jornadas quedan también en el bundle.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al publicar calendario";
    console.error("publish-fixtures", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
