"use client";

import { Card } from "@/components/Card";
import { PageHero } from "@/components/PageHero";
import { ClasificacionRankingList } from "@/components/clasificacion/ClasificacionRankingList";
import { useSeason } from "@/components/season/SeasonProvider";
import { useClasificacionRanking } from "@/hooks/useGameRankings";
import { useQuinielaSeason } from "@/hooks/useQuinielaSeason";

export default function ClasificacionRankingPage() {
  const { viewedSeason, getCompetitionConfig } = useSeason();
  const { seasonId, teams, leagueMatchdays } = useQuinielaSeason();
  const competitionConfig = getCompetitionConfig("masculino");
  const competitionLabel = competitionConfig.ligaLabel ?? "1ª RFEF — Grupo 1";
  const { entries, loading, countPoints, error } = useClasificacionRanking(seasonId);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="El Oráculo"
        title="Ranking"
        description="Clasificación según las predicciones enviadas antes del inicio de la temporada. 20 puntos por acierto exacto, menos 1 por cada puesto de diferencia."
      />
      <Card eyebrow="Ranking" title="Clasificación de predicciones">
        {loading ? (
          <p className="text-sm text-slate-500">Cargando clasificación…</p>
        ) : error ? (
          <p className="text-sm font-semibold text-[#981915]">{error}</p>
        ) : (
          <>
            <ClasificacionRankingList
              entries={entries}
              countPoints={countPoints}
              seasonId={seasonId}
              teams={teams}
              leagueMatchdays={leagueMatchdays}
              zones={competitionConfig.zones}
              seasonLabel={viewedSeason.label}
              competitionLabel={competitionLabel}
              emptyMessage="Aún no hay predicciones de clasificación enviadas en esta temporada."
            />
            {!countPoints && entries.length > 0 && (
              <p className="mt-3 text-xs text-slate-500 sm:mt-4 sm:text-sm">
                Aún no hay clasificación oficial con la que puntuar. Los puntos aparecerán cuando haya datos de liga cargados.
              </p>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
