import { NextResponse } from "next/server";
import type { CompetitionSeasonId } from "@/data/mock";
import { computeClasificacionRankingFromSupabase } from "@/lib/juegos/compute-rankings";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createQuinielaRankingClient } from "@/lib/supabase/quiniela-ranking-client";

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no está configurado." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const seasonId = searchParams.get("seasonId");

  if (!seasonId) {
    return NextResponse.json({ error: "Parámetro requerido: seasonId." }, { status: 400 });
  }

  try {
    const supabase = await createQuinielaRankingClient();
    const result = await computeClasificacionRankingFromSupabase(
      supabase,
      seasonId as CompetitionSeasonId,
    );
    return NextResponse.json({
      countPoints: result.countPoints,
      entries: result.entries,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al calcular el ranking";
    console.error("clasificacion ranking", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
