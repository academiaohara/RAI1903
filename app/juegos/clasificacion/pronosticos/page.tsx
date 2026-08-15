"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDialog } from "@/components/AppDialogProvider";
import { Card } from "@/components/Card";
import { ClasificacionTicket } from "@/components/juegos/GameTicket";
import { PageHero } from "@/components/PageHero";
import { useSeason } from "@/components/season/SeasonProvider";
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
import { getUserDisplayName } from "@/lib/auth/user-display";
import type { User } from "@supabase/supabase-js";

export default function ClasificacionPronosticosPage() {
  const { alert } = useAppDialog();
  const { viewedSeason, getCompetitionConfig } = useSeason();
  const { teams, matchdays, leagueMatchdays, seasonId } = useQuinielaSeason();
  const competitionConfig = getCompetitionConfig("masculino");
  const [predictions, setPredictions] = useState<Record<string, ClasificacionPrediction>>({});
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userHandle, setUserHandle] = useState("@usuario");
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
  const hasStandingsData = actualPositions.size > 0;
  const showCompare = hasStandingsData && Object.keys(effectivePredictions).length > 0;
  const showScoring = showCompare;
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
      setUserHandle(user ? getUserDisplayName(user) : "@usuario");
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

      <Card eyebrow="Temporada" title="Tu boleto">
        <ClasificacionTicket
          teams={teams}
          predictions={effectivePredictions}
          zones={competitionConfig.zones}
          seasonLabel={viewedSeason.label}
          competitionLabel={competitionConfig.ligaLabel ?? "1ª RFEF — Grupo 1"}
          readOnly={readOnly}
          onReorder={handleReorder}
          creatorHandle={userHandle}
          points={hydrated && showScoring ? totalPoints : undefined}
          savedAt={submittedAt ?? undefined}
          actualPositions={showCompare ? actualPositions : undefined}
          canSave={canSave}
          canEdit={canEdit}
          onSave={() => void handleSave()}
          onEdit={() => setIsEditing(true)}
          saveDisabled={saveDisabled}
          isEditing={isEditing}
          showLoginPrompt={needsLogin}
        />
      </Card>
    </div>
  );
}
