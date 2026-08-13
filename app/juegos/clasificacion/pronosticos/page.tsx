"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDialog } from "@/components/AppDialogProvider";
import { Card } from "@/components/Card";
import { ClasificacionCompareBoard } from "@/components/clasificacion/ClasificacionCompareBoard";
import { ClasificacionTicket } from "@/components/juegos/GameTicket";
import { PageHero } from "@/components/PageHero";
import { useSeason } from "@/components/season/SeasonProvider";
import { bebasNeue } from "@/lib/fonts";
import { useQuinielaSeason } from "@/hooks/useQuinielaSeason";
import {
  buildActualStandingsByTeamId,
  isClasificacionComplete,
  isClasificacionLocked,
  orderedTeamIdsToPredictions,
  predictionsToOrderedTeamIds,
  scoreClasificacionPrediction,
  type ClasificacionPrediction,
} from "@/lib/clasificacion-prediction";
import {
  clasificacionRequiresAuth,
  loadClasificacionState,
  saveClasificacionPredictions,
  saveClasificacionSubmission,
} from "@/lib/clasificacion-storage";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { User } from "@supabase/supabase-js";

export default function ClasificacionPronosticosPage() {
  const { alert } = useAppDialog();
  const { viewedSeason, getCompetitionConfig } = useSeason();
  const { teams, matchdays, leagueMatchdays, seasonId } = useQuinielaSeason();
  const competitionConfig = getCompetitionConfig("masculino");
  const [predictions, setPredictions] = useState<Record<string, ClasificacionPrediction>>({});
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const defaultPredictions = useMemo(() => {
    if (teams.length === 0) return {};
    return orderedTeamIdsToPredictions(predictionsToOrderedTeamIds(teams, {}));
  }, [teams]);
  const effectivePredictions = Object.keys(predictions).length > 0 ? predictions : defaultPredictions;

  const actualPositions = useMemo(
    () => buildActualStandingsByTeamId(teams, leagueMatchdays),
    [teams, leagueMatchdays],
  );
  const isLocked = isClasificacionLocked(matchdays);
  const isSubmitted = submittedAt !== null;
  const readOnly = isLocked || (isSubmitted && !isEditing);
  const canEdit = isSubmitted && !isLocked;
  const canSave = !isLocked && (!isSubmitted || isEditing);
  const saveDisabled = clasificacionRequiresAuth() && !userId;
  const needsLogin = clasificacionRequiresAuth() && hydrated && !userId;
  const showCompare = isLocked && Object.keys(effectivePredictions).length > 0;
  const hasStandingsData = actualPositions.size > 0;
  const showScoring = hasStandingsData && Object.keys(effectivePredictions).length > 0;
  const totalPoints = useMemo(
    () => scoreClasificacionPrediction(effectivePredictions, actualPositions),
    [effectivePredictions, actualPositions],
  );

  useEffect(() => {
    let cancelled = false;

    const hydrate = async (user: User | null) => {
      const state = await loadClasificacionState(user?.id ?? null, seasonId);
      if (cancelled) return;
      setPredictions(state.predictions);
      setSubmittedAt(state.submittedAt);
      setUserId(user?.id ?? null);
      setIsEditing(false);
      setHydrated(true);
    };

    if (!isSupabaseConfigured()) {
      void hydrate(null);
      return () => {
        cancelled = true;
      };
    }

    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => void hydrate(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void hydrate(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [seasonId]);

  const handleReorder = useCallback(
    (orderedTeamIds: string[]) => {
      const next = orderedTeamIdsToPredictions(orderedTeamIds);
      setPredictions(next);
      if (!isSubmitted || isEditing) {
        void saveClasificacionPredictions(userId, next, seasonId);
      }
    },
    [isSubmitted, isEditing, userId, seasonId],
  );

  const handleSave = async () => {
    if (!isClasificacionComplete(effectivePredictions, teams.length)) {
      await alert("Ordena todos los equipos antes de guardar.");
      return;
    }
    void saveClasificacionPredictions(userId, effectivePredictions, seasonId);
    void saveClasificacionSubmission(userId, seasonId);
    setSubmittedAt(new Date().toISOString());
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="El Oráculo"
        title="Pronósticos"
        description="Ordena directamente en El Oráculo los equipos del Grupo I según crees que acabará la liga. 20 puntos por acierto exacto y se resta 1 por cada puesto de diferencia. Solo puedes enviarlo hasta que empiece el primer partido."
      />

      {needsLogin && (
        <p className="rounded-xl border border-[#214C9B]/25 bg-blue-50 px-3 py-2 text-xs font-bold text-[#214C9B] sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
          Inicia sesión para guardar tu predicción y aparecer en el ranking.
        </p>
      )}

      {hydrated && isLocked && (
        <p className="rounded-xl border border-[#981915]/30 bg-[#981915]/10 px-3 py-2 text-xs font-bold text-[#981915] sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
          La temporada ya ha empezado: tu predicción de clasificación queda cerrada.
        </p>
      )}

      {hydrated && !isSubmitted && !isLocked && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
          Ordena los equipos y pulsa Guardar antes del pitido inicial de la primera jornada.
        </p>
      )}

      <Card
        eyebrow="Temporada"
        title={showCompare ? "Tu Oráculo frente a la clasificación" : "Tu Oráculo"}
        action={
          hydrated && showScoring ? (
            <div className="flex min-w-[4.5rem] flex-col items-center rounded-2xl border border-[#214C9B]/15 bg-slate-50/80 px-3 py-2 text-center sm:min-w-[5.5rem] sm:px-4 sm:py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#981915] sm:text-xs">Puntos</p>
              <p
                className={`${bebasNeue.className} text-[1.35rem] font-normal leading-[0.9] tracking-[0.25px] text-[#214C9B] tabular-nums sm:text-[64px] sm:tracking-[1px] lg:text-[72px]`}
              >
                {totalPoints}
              </p>
            </div>
          ) : undefined
        }
      >
        {showCompare ? (
          <ClasificacionCompareBoard
            teams={teams}
            predictions={effectivePredictions}
            actualPositions={actualPositions}
            predictionLabel="Tu predicción"
          />
        ) : (
          <ClasificacionTicket
            teams={teams}
            predictions={effectivePredictions}
            zones={competitionConfig.zones}
            seasonLabel={viewedSeason.label}
            competitionLabel={competitionConfig.ligaLabel ?? "1ª RFEF — Grupo 1"}
            readOnly={readOnly}
            onReorder={handleReorder}
          />
        )}

        {showCompare && teams.length > 0 ? (
          <ClasificacionTicket
            teams={teams}
            predictions={effectivePredictions}
            zones={competitionConfig.zones}
            seasonLabel={viewedSeason.label}
            competitionLabel={competitionConfig.ligaLabel ?? "1ª RFEF — Grupo 1"}
            readOnly
          />
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2 border-t border-[#214C9B]/15 pt-3 sm:mt-6 sm:gap-3 sm:pt-5">
          {canSave && (
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saveDisabled}
              className="rounded-xl bg-[#214C9B] px-4 py-2.5 text-xs font-extrabold uppercase text-white transition hover:bg-[#173a78] disabled:cursor-not-allowed disabled:opacity-50 sm:rounded-2xl sm:px-6 sm:py-3 sm:text-sm"
            >
              Guardar
            </button>
          )}
          {canEdit && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={isEditing}
              className="rounded-xl border border-[#214C9B]/30 bg-white px-4 py-2.5 text-xs font-extrabold uppercase text-[#214C9B] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 sm:rounded-2xl sm:px-6 sm:py-3 sm:text-sm"
            >
              Editar
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
