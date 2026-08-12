"use client";

import { Card } from "@/components/Card";
import { PageHero } from "@/components/PageHero";
import { GameRankingList } from "@/components/juegos/GameRankingList";
import { useClasificacionRanking } from "@/hooks/useGameRankings";
import { useQuinielaSeason } from "@/hooks/useQuinielaSeason";

export default function ClasificacionRankingPage() {
  const { seasonId } = useQuinielaSeason();
  const { entries, loading, error } = useClasificacionRanking(seasonId);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Clasificación"
        title="Ranking"
        description="Clasificación según las predicciones enviadas antes del inicio de la temporada. 20 puntos por acierto exacto, menos 1 por cada puesto de diferencia."
      />
      <Card eyebrow="Ranking" title="Clasificación de predicciones">
        {loading ? (
          <p className="text-sm text-slate-500">Cargando clasificación…</p>
        ) : error ? (
          <p className="text-sm font-semibold text-[#981915]">{error}</p>
        ) : (
          <GameRankingList
            entries={entries}
            emptyMessage="Aún no hay predicciones de clasificación enviadas en esta temporada."
          />
        )}
      </Card>
    </div>
  );
}
