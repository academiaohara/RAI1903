"use client";

import { Card } from "@/components/Card";
import { PageHero } from "@/components/PageHero";
import { QuinigolRankingList } from "@/components/quinigol/QuinigolRankingList";
import { useQuinigolSeasonRanking } from "@/hooks/useGameRankings";
import { useQuinielaSeason } from "@/hooks/useQuinielaSeason";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function QuinigolRankingPage() {
  const { seasonId, matchdays, currentRound, totalRounds } = useQuinielaSeason();
  const { entries, loading, countPoints, error } = useQuinigolSeasonRanking(seasonId);

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
          <>
            <QuinigolRankingList
            entries={entries}
            seasonId={seasonId}
            matchdays={matchdays}
            totalRounds={totalRounds}
            currentRound={currentRound}
            emptyMessage={
              isSupabaseConfigured()
                ? "Aún no hay quinigoles guardados en esta temporada."
                : "Conecta Supabase e inicia sesión para ver la clasificación."
            }
          />
          {!countPoints && entries.length > 0 && (
            <p className="mt-3 text-xs text-slate-500 sm:mt-4 sm:text-sm">
              Los puntos se publican cuando empiece la primera jornada disputada o haya resultados oficiales cargados.
            </p>
          )}
          </>
        )}
      </Card>
    </div>
  );
}
