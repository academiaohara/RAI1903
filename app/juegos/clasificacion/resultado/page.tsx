"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { ClasificacionForm } from "@/components/clasificacion/ClasificacionForm";
import { PageHero } from "@/components/PageHero";
import { GameRankingList } from "@/components/juegos/GameRankingList";
import { QuinielaViewToggle } from "@/components/QuinielaViewToggle";
import { useClasificacionRanking } from "@/hooks/useGameRankings";
import { useQuinielaSeason } from "@/hooks/useQuinielaSeason";
import { buildActualStandingsByTeamId } from "@/lib/clasificacion-prediction";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type ResultadoView = "clasificacion" | "ranking";

export default function ClasificacionResultadoPage() {
  const { teams, matchdays, seasonId } = useQuinielaSeason();
  const [view, setView] = useState<ResultadoView>("clasificacion");
  const actualPositions = useMemo(
    () => buildActualStandingsByTeamId(teams, matchdays),
    [teams, matchdays],
  );
  const { entries, loading, countPoints, error } = useClasificacionRanking(seasonId);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Clasificación"
        title="Resultado"
        description="Compara la clasificación actual del Grupo I con el ranking de predicciones enviadas."
      />

      <Card eyebrow="Temporada" title="Clasificación y ranking">
        <QuinielaViewToggle
          value={view}
          onChange={setView}
          layoutId="clasificacion-resultado-view"
          options={[
            { id: "clasificacion", label: "Clasificación actual" },
            { id: "ranking", label: "Ranking predicciones" },
          ]}
          className="mb-3 sm:mb-5"
        />

        {view === "clasificacion" ? (
          <div className="space-y-4">
            <p className="text-xs leading-5 text-slate-600 sm:text-sm">
              Clasificación actual del Grupo I según los resultados oficiales disputados.
            </p>
            <ClasificacionForm
              teams={teams}
              predictions={{}}
              actualPositions={actualPositions}
              readOnly
              mode="results"
              onChange={() => undefined}
            />
          </div>
        ) : loading ? (
          <p className="text-sm text-slate-500">Cargando participantes…</p>
        ) : error ? (
          <p className="text-sm font-semibold text-[#981915]">{error}</p>
        ) : (
          <>
            <GameRankingList
              entries={entries}
              emptyMessage={
                isSupabaseConfigured()
                  ? "Nadie ha enviado su predicción de clasificación todavía."
                  : "Conecta Supabase e inicia sesión para ver el ranking."
              }
            />
            {!countPoints && entries.length > 0 && (
              <p className="mt-3 text-xs text-slate-500 sm:mt-4 sm:text-sm">
                Los puntos se actualizan según la clasificación actual de la liga.
              </p>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
