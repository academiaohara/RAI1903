"use client";

import { Card } from "@/components/Card";
import { PageHero } from "@/components/PageHero";
import { GameRankingList } from "@/components/juegos/GameRankingList";
import { useQuinigolSeasonRanking } from "@/hooks/useGameRankings";
import { useQuinielaSeason } from "@/hooks/useQuinielaSeason";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function QuinigolRankingPage() {
  const { seasonId } = useQuinielaSeason();
  const { entries, loading, error } = useQuinigolSeasonRanking(seasonId);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Quinigol"
        title="Ranking"
        description="Clasificación de la temporada según los quinigoles guardados. Solo suman puntos las jornadas ya iniciadas."
      />
      <Card eyebrow="Ranking" title="Clasificación general">
        {loading ? (
          <p className="text-sm text-slate-500">Cargando clasificación…</p>
        ) : error ? (
          <p className="text-sm font-semibold text-[#981915]">{error}</p>
        ) : (
          <GameRankingList
            entries={entries}
            emptyMessage={
              isSupabaseConfigured()
                ? "Aún no hay quinigoles guardados en esta temporada."
                : "Conecta Supabase e inicia sesión para ver la clasificación."
            }
          />
        )}
      </Card>
    </div>
  );
}
