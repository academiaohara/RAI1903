"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { ClasificacionForm } from "@/components/clasificacion/ClasificacionForm";
import { PageHero } from "@/components/PageHero";
import { useQuinielaSeason } from "@/hooks/useQuinielaSeason";
import {
  buildActualStandingsByTeamId,
  type ClasificacionPrediction,
} from "@/lib/clasificacion-prediction";
import { loadClasificacionState } from "@/lib/clasificacion-storage";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function ClasificacionResultadoPage() {
  const { teams, matchdays, seasonId } = useQuinielaSeason();
  const [predictions, setPredictions] = useState<Record<string, ClasificacionPrediction>>({});
  const actualPositions = useMemo(
    () => buildActualStandingsByTeamId(teams, matchdays),
    [teams, matchdays],
  );
  const hasPredictions = Object.keys(predictions).length > 0;

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      if (!isSupabaseConfigured()) {
        setPredictions({});
        return;
      }

      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      const state = await loadClasificacionState(data.user?.id ?? null, seasonId);
      if (cancelled) return;
      setPredictions(state.predictions);
    };

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [seasonId]);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Clasificación"
        title="Resultado"
        description="Clasificación actual del Grupo I según los resultados oficiales disputados."
      />

      <Card eyebrow="Temporada" title="Clasificación actual">
        <ClasificacionForm
          teams={teams}
          predictions={predictions}
          actualPositions={actualPositions}
          readOnly
          mode={hasPredictions ? "compare" : "results"}
          onReorder={() => undefined}
        />
      </Card>
    </div>
  );
}
