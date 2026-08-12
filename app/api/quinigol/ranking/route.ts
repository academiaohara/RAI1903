import { NextResponse } from "next/server";
import type { CompetitionSeasonId } from "@/data/mock";
import { computeQuinigolRankingFromSupabase } from "@/lib/juegos/compute-rankings";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createQuinielaRankingClient } from "@/lib/supabase/quiniela-ranking-client";

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no está configurado." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const seasonId = searchParams.get("seasonId");
  const scope = searchParams.get("scope");
  const roundParam = searchParams.get("round");

  if (!seasonId || (scope !== "round" && scope !== "season")) {
    return NextResponse.json(
      { error: "Parámetros requeridos: seasonId y scope (round|season)." },
      { status: 400 },
    );
  }

  if (scope === "round") {
    const round = Number(roundParam);
    if (!Number.isFinite(round) || round < 1) {
      return NextResponse.json({ error: "round inválido." }, { status: 400 });
    }

    try {
      const supabase = await createQuinielaRankingClient();
      const result = await computeQuinigolRankingFromSupabase(supabase, seasonId as CompetitionSeasonId, {
        scope: "round",
        round,
      });
      if (result.scope !== "round") {
        return NextResponse.json({ error: "Respuesta de ranking inválida." }, { status: 500 });
      }
      return NextResponse.json({
        scope: "round",
        round: result.round,
        countPoints: result.countPoints,
        entries: result.entries,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al calcular el ranking";
      console.error("quinigol ranking round", message);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  try {
    const supabase = await createQuinielaRankingClient();
    const result = await computeQuinigolRankingFromSupabase(supabase, seasonId as CompetitionSeasonId, {
      scope: "season",
    });
    return NextResponse.json({
      scope: "season",
      countPoints: result.countPoints,
      entries: result.entries,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al calcular el ranking";
    console.error("quinigol ranking season", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
