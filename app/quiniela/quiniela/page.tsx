"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { JornadaSelector } from "@/components/JornadaSelector";
import { PageHero } from "@/components/PageHero";
import { PredictionForm } from "@/components/PredictionForm";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { QuinielaHowItWorks } from "@/components/QuinielaHowItWorks";
import { useQuinielaSeason } from "@/hooks/useQuinielaSeason";
import type { CompetitionSeasonId } from "@/data/mock";
import {
  countFinishedMatches,
  countOutcomeHits,
  getMatchdayByRound,
  hasFirstMatchStarted,
  isMatchdayComplete,
  isMatchdayFullyFinished,
  sortQuinielaMatches,
} from "@/lib/quiniela";
import { loadQuinielaState, saveQuinielaPredictions, saveQuinielaRound } from "@/lib/quiniela-storage";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Matchday, Prediction } from "@/types";
import type { User } from "@supabase/supabase-js";

type PronosticosBodyProps = {
  seasonId: CompetitionSeasonId;
  matchdays: Matchday[];
  currentRound: number;
  totalRounds: number;
  bundlesLoading: boolean;
};

function PronosticosBody({ seasonId, matchdays, currentRound, totalRounds, bundlesLoading }: PronosticosBodyProps) {
  const { canEdit: isCmsEditor } = useInlineEditing();
  const [round, setRound] = useState(currentRound);
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [savedRounds, setSavedRounds] = useState<Record<number, string>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async (user: User | null) => {
      const state = await loadQuinielaState(user?.id ?? null, seasonId);
      if (cancelled) return;
      setPredictions(state.predictions);
      setSavedRounds(state.savedRounds);
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

  const selectedMatchday = useMemo(() => getMatchdayByRound(matchdays, round), [matchdays, round]);
  const orderedMatches = useMemo(
    () => sortQuinielaMatches(selectedMatchday.matches),
    [selectedMatchday.matches],
  );
  const hasMatchesForRound = selectedMatchday.matches.length > 0;
  const isSaved = Boolean(savedRounds[round]);
  const isLocked = hasFirstMatchStarted(selectedMatchday);
  const readOnly = isLocked || (isSaved && !isEditing);
  const canEdit = isSaved && !isLocked;
  const canSave = !isLocked && (!isSaved || isEditing);
  const finishedMatches = countFinishedMatches(selectedMatchday);
  const jornadaFinalizada = isMatchdayFullyFinished(selectedMatchday);
  const hits = countOutcomeHits(selectedMatchday, predictions);
  const showCompare = readOnly && (isLocked || finishedMatches > 0);

  const statusBanner = useMemo(() => {
    if (jornadaFinalizada) return "finished" as const;
    if (isLocked) return "locked" as const;
    if (isSaved && !isEditing) return "saved" as const;
    if (!isSaved) return "unsaved" as const;
    return null;
  }, [jornadaFinalizada, isLocked, isSaved, isEditing]);

  const updatePrediction = useCallback(
    (prediction: Prediction) => {
      setPredictions((current) => {
        const next = { ...current, [prediction.matchId]: prediction };
        if (!isSaved || isEditing) {
          void saveQuinielaPredictions(userId, next, seasonId);
        }
        return next;
      });
    },
    [isSaved, isEditing, userId, seasonId],
  );

  const handleSave = () => {
    if (!isMatchdayComplete(selectedMatchday, predictions)) {
      window.alert("Completa los 10 partidos (signo 1-X-2 y porra del Avilés si aplica) antes de guardar.");
      return;
    }
    void saveQuinielaPredictions(userId, predictions, seasonId);
    void saveQuinielaRound(userId, round, seasonId);
    setSavedRounds((current) => ({ ...current, [round]: new Date().toISOString() }));
    setIsEditing(false);
  };

  const handleEdit = () => {
    if (isLocked) return;
    setIsEditing(true);
  };

  const handleRoundChange = (nextRound: number) => {
    setRound(nextRound);
    setIsEditing(false);
  };

  return (
    <>
      <JornadaSelector
        value={round}
        total={totalRounds}
        currentRound={currentRound}
        onChange={handleRoundChange}
      />

      {hydrated && statusBanner === "unsaved" && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
          No has hecho la quiniela de la jornada {round}. Rellena los partidos y pulsa Guardar.
        </p>
      )}

      {hydrated && statusBanner === "locked" && (
        <p className="rounded-2xl border border-[#981915]/30 bg-[#981915]/10 px-4 py-3 text-sm font-bold text-[#981915]">
          La jornada {round} ya ha empezado: tu quiniela queda cerrada.
        </p>
      )}

      {hydrated && statusBanner === "saved" && (
        <p className="rounded-2xl border border-[#214C9B]/20 bg-blue-50 px-4 py-3 text-sm font-bold text-[#214C9B]">
          Quiniela guardada. Pulsa Editar si quieres modificar algo antes del pitido inicial.
        </p>
      )}

      {hydrated && statusBanner === "finished" && (
        <p className="rounded-2xl border border-[#981915]/30 bg-[#981915]/10 px-4 py-3 text-sm font-bold text-[#981915]">
          La jornada {round} esta finalizada: todos los partidos tienen resultado oficial.
        </p>
      )}

      <Card eyebrow={`Jornada ${selectedMatchday.round}`} title="Tu quiniela">
        {!bundlesLoading && !hasMatchesForRound && (
          <p className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
            {isCmsEditor ? (
              <>
                No hay partidos del Grupo I configurados para la jornada {round}. Asigna equipos reales en Jornadas o
                guarda el calendario en Editar → Competición.
              </>
            ) : (
              <>No hay partidos del Grupo I disponibles para la jornada {round}.</>
            )}
          </p>
        )}

        {hydrated && isSaved && finishedMatches > 0 && (
          <p className="mb-4 text-sm font-bold text-slate-700">
            Aciertos:{" "}
            <span className="text-[#214C9B]">
              {hits} de {finishedMatches}
            </span>
            {jornadaFinalizada ? " (jornada completa)" : " (partidos con resultado)"}
          </p>
        )}

        {hydrated && showCompare && (
          <div className="mb-4 flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wide text-slate-600">
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-[#214C9B]" aria-hidden />
              Tu pronostico
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-[#981915]" aria-hidden />
              Resultado real
            </span>
          </div>
        )}

        <div className="space-y-4">
          {orderedMatches.map((match) => (
            <PredictionForm
              key={match.id}
              match={match}
              prediction={predictions[match.id]}
              readOnly={readOnly}
              mode={showCompare ? "compare" : "edit"}
              onChange={updatePrediction}
            />
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-[#214C9B]/15 pt-5">
          {canSave && (
            <button
              type="button"
              onClick={handleSave}
              className="rounded-2xl bg-[#214C9B] px-6 py-3 text-sm font-extrabold uppercase text-white transition hover:bg-[#173a78]"
            >
              Guardar
            </button>
          )}
          {canEdit && (
            <button
              type="button"
              onClick={handleEdit}
              disabled={isEditing}
              className="rounded-2xl border border-[#214C9B]/30 bg-white px-6 py-3 text-sm font-extrabold uppercase text-[#214C9B] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Editar
            </button>
          )}
        </div>
      </Card>
    </>
  );
}

export default function MiQuinielaPage() {
  const { matchdays, currentRound, totalRounds, seasonId, bundlesLoading } = useQuinielaSeason();

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Quiniela"
        title="Pronosticos"
        description="Rellena la quiniela con los 10 partidos del Grupo I de cada jornada. Al guardar queda bloqueada hasta que pulses editar. Cuando empiece el primer partido ya no podras cambiarla."
      />
      <QuinielaHowItWorks />
      {bundlesLoading ? (
        <p className="text-sm font-bold text-slate-500">Cargando partidos…</p>
      ) : null}
      <PronosticosBody
        key={seasonId}
        seasonId={seasonId}
        matchdays={matchdays}
        currentRound={currentRound}
        totalRounds={totalRounds}
        bundlesLoading={bundlesLoading}
      />
    </div>
  );
}
