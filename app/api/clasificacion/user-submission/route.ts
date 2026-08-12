import { NextResponse } from "next/server";
import type { CompetitionSeasonId } from "@/data/mock";
import { computeClasificacionUserSubmissionFromSupabase } from "@/lib/juegos/compute-rankings";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createQuinielaRankingClient } from "@/lib/supabase/quiniela-ranking-client";

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no está configurado." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const seasonId = searchParams.get("seasonId");
  const userId = searchParams.get("userId");

  if (!seasonId || !userId) {
    return NextResponse.json(
      { error: "Parámetros requeridos: seasonId y userId." },
      { status: 400 },
    );
  }

  try {
    const supabase = await createQuinielaRankingClient();
    const result = await computeClasificacionUserSubmissionFromSupabase(
      supabase,
      seasonId as CompetitionSeasonId,
      userId,
    );

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al cargar la predicción";
    console.error("clasificacion user-submission", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
