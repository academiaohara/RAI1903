"use client";

import { Card } from "@/components/Card";
import { PageHero } from "@/components/PageHero";
import { QuinielaRankingList } from "@/components/quiniela/QuinielaRankingList";
import { useQuinielaSeasonRanking } from "@/hooks/useQuinielaRoundRanking";
import { useQuinielaSeason } from "@/hooks/useQuinielaSeason";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function QuinielaRankingPage() {
  const { seasonId, matchdays, currentRound, totalRounds } = useQuinielaSeason();
  const { entries, loading, error } = useQuinielaSeasonRanking(seasonId);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Quiniela"
        title="Ranking"
        description="Clasificación de la temporada según las quinielas guardadas antes de cada jornada. Solo suman puntos las jornadas ya iniciadas."
      />

      <Card eyebrow="Ranking" title="Clasificación general">
        {loading ? (
          <p className="text-sm text-slate-500">Cargando clasificación…</p>
        ) : error ? (
          <p className="text-sm font-semibold text-[#981915]">{error}</p>
        ) : (
          <QuinielaRankingList
            entries={entries}
            seasonId={seasonId}
            matchdays={matchdays}
            totalRounds={totalRounds}
            currentRound={currentRound}
            emptyMessage={
              isSupabaseConfigured()
                ? "Aún no hay quinielas guardadas en esta temporada."
                : "Conecta Supabase e inicia sesión para ver la clasificación."
            }
          />
        )}
      </Card>
    </div>
  );
}
