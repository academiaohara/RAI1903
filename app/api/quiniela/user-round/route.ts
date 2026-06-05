import { NextResponse } from "next/server";
import type { CompetitionSeasonId } from "@/data/mock";
import { computeQuinielaUserRoundFromSupabase } from "@/lib/quiniela/compute-rankings";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createQuinielaRankingClient } from "@/lib/supabase/quiniela-ranking-client";

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no está configurado." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const seasonId = searchParams.get("seasonId");
  const userId = searchParams.get("userId");
  const roundParam = searchParams.get("round");

  if (!seasonId || !userId) {
    return NextResponse.json(
      { error: "Parámetros requeridos: seasonId y userId." },
      { status: 400 },
    );
  }

  const round =
    roundParam !== null && roundParam !== ""
      ? Number(roundParam)
      : undefined;

  if (round !== undefined && (!Number.isFinite(round) || round < 1)) {
    return NextResponse.json({ error: "round inválido." }, { status: 400 });
  }

  try {
    const supabase = await createQuinielaRankingClient();
    const result = await computeQuinielaUserRoundFromSupabase(
      supabase,
      seasonId as CompetitionSeasonId,
      userId,
      round,
    );

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al cargar la quiniela";
    console.error("quiniela user-round", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
