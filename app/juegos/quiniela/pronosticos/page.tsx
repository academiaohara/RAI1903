"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDialog } from "@/components/AppDialogProvider";
import { Card } from "@/components/Card";
import { JornadaSelector } from "@/components/JornadaSelector";
import { PageHero } from "@/components/PageHero";
import { QuinielaTicket } from "@/components/juegos/GameTicket";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { QuinielaHowItWorks } from "@/components/QuinielaHowItWorks";
import { useSeason } from "@/components/season/SeasonProvider";
import { useQuinielaSeason } from "@/hooks/useQuinielaSeason";
import { buildQuinielaScoringContext, scoringOptionsForMatch } from "@/lib/quiniela/scoring-context";
import { quinielaRequiresAuth } from "@/lib/quiniela-storage";
import type { CompetitionSeasonId } from "@/data/mock";
import {
  countFinishedMatches,
  countOutcomeHits,
  getMatchdayByRound,
  scoreMatchdayPoints,
  hasFirstMatchStarted,
  isMatchdayComplete,
  isMatchdayFullyFinished,
  isScorerPredictionCorrect,
  isAvilesMatch,
  sortQuinielaMatches,
} from "@/lib/quiniela";
import { loadQuinielaState, saveQuinielaPredictions, saveQuinielaRound } from "@/lib/quiniela-storage";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getUserDisplayName } from "@/lib/auth/user-display";
import { scorerLabelForPlayer } from "@/lib/squad-player-resolve";
import type { Matchday, Prediction } from "@/types";
import type { User } from "@supabase/supabase-js";

type PronosticosBodyProps = {
  seasonId: CompetitionSeasonId;
  matchdays: Matchday[];
  teams: ReturnType<typeof useQuinielaSeason>["teams"];
  currentRound: number;
  totalRounds: number;
  bundlesLoading: boolean;
};

function PronosticosBody({ seasonId, matchdays, teams, currentRound, totalRounds, bundlesLoading }: PronosticosBodyProps) {
  const { alert } = useAppDialog();
  const { bundles, viewedSeason, getCompetitionConfig } = useSeason();
  const { canEdit: isCmsEditor } = useInlineEditing();
  const scoringContext = useMemo(
    () => buildQuinielaScoringContext(bundles, matchdays),
    [bundles, matchdays],
  );
  const [round, setRound] = useState(currentRound);
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [savedRounds, setSavedRounds] = useState<Record<number, string>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [userHandle, setUserHandle] = useState("@usuario");
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
  const saveDisabled = quinielaRequiresAuth() && !userId;
  const finishedMatches = countFinishedMatches(selectedMatchday);
  const jornadaFinalizada = isMatchdayFullyFinished(selectedMatchday);
  const hits = countOutcomeHits(selectedMatchday, predictions);
  const matchdayPoints = useMemo(
    () =>
      scoreMatchdayPoints(selectedMatchday, predictions, (match) =>
        scoringOptionsForMatch(scoringContext, match),
      ),
    [selectedMatchday, predictions, scoringContext],
  );
  const needsLogin = quinielaRequiresAuth() && hydrated && !userId;
  const showScore = hydrated && finishedMatches > 0;
  const scorerCorrectByMatch = useMemo(
    () =>
      Object.fromEntries(
        selectedMatchday.matches
          .filter((match) => match.status === "finished" && isAvilesMatch(match) && predictions[match.id]?.scorer)
          .map((match) => [
            match.id,
            isScorerPredictionCorrect(
              match,
              predictions[match.id]!,
              scoringOptionsForMatch(scoringContext, match),
            ),
          ]),
      ),
    [predictions, scoringContext, selectedMatchday.matches],
  );
  const validScorers = useMemo(
    () => new Set(scoringContext.squad.map((player) => scorerLabelForPlayer(player))),
    [scoringContext.squad],
  );

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

  const handleSave = async () => {
    if (!isMatchdayComplete(selectedMatchday, predictions)) {
      await alert("Completa los 10 partidos (signo 1-X-2 y porra del Avilés si aplica) antes de guardar.");
      return;
    }
    const hasInvalidScorer = selectedMatchday.matches.some((match) => {
      if (!isAvilesMatch(match)) return false;
      const scorer = predictions[match.id]?.scorer;
      return scorer !== "nadie" && (!scorer || !validScorers.has(scorer));
    });
    if (hasInvalidScorer) {
      await alert("Selecciona el goleador del Avilés en la lista de la plantilla.");
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

      {needsLogin && (
        <p className="rounded-xl border border-[#214C9B]/25 bg-blue-50 px-3 py-2 text-xs font-bold text-[#214C9B] sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
          Inicia sesión para guardar tu quiniela en Supabase y aparecer en el ranking de jornada y el ranking general.
        </p>
      )}

      {hydrated && statusBanner === "unsaved" && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
          No has hecho la quiniela de la jornada {round}. Rellena los partidos y pulsa Guardar.
        </p>
      )}

      {hydrated && statusBanner === "locked" && (
        <p className="rounded-xl border border-[#981915]/30 bg-[#981915]/10 px-3 py-2 text-xs font-bold text-[#981915] sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
          La jornada {round} ya ha empezado: tu quiniela queda cerrada.
        </p>
      )}

      {hydrated && statusBanner === "saved" && (
        <p className="rounded-xl border border-[#214C9B]/20 bg-blue-50 px-3 py-2 text-xs font-bold text-[#214C9B] sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
          RAIniela guardada. Pulsa Editar si quieres modificar algo antes del pitido inicial.
        </p>
      )}

      {hydrated && statusBanner === "finished" && (
        <p className="rounded-xl border border-[#981915]/30 bg-[#981915]/10 px-3 py-2 text-xs font-bold text-[#981915] sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
          La jornada {round} esta finalizada: todos los partidos tienen resultado oficial.
        </p>
      )}

      <Card eyebrow={`Jornada ${selectedMatchday.round}`} title="Tu boleto">
        {!bundlesLoading && !hasMatchesForRound && (
          <p className="mb-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 sm:mb-4 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
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
          <p className="mb-3 text-xs font-bold text-slate-700 sm:mb-4 sm:text-sm">
            Aciertos:{" "}
            <span className="text-[#214C9B]">
              {hits} de {finishedMatches}
            </span>
            {jornadaFinalizada ? " (jornada completa)" : " (partidos con resultado)"}
          </p>
        )}

        {hasMatchesForRound ? (
          <QuinielaTicket
            matches={orderedMatches}
            teams={teams}
            predictions={predictions}
            round={round}
            seasonLabel={viewedSeason.label}
            competitionLabel={getCompetitionConfig("masculino").ligaLabel ?? "1ª RFEF — Grupo 1"}
            readOnly={readOnly}
            onChange={updatePrediction}
            creatorHandle={userHandle}
            points={showScore ? matchdayPoints : undefined}
            scorerCorrectByMatch={scorerCorrectByMatch}
            savedAt={savedRounds[round]}
          />
        ) : null}

        <div className="mt-3 flex max-w-[900px] flex-wrap gap-2 sm:gap-3">
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
              onClick={handleEdit}
              disabled={isEditing}
              className="rounded-xl border border-[#214C9B]/30 bg-white px-4 py-2.5 text-xs font-extrabold uppercase text-[#214C9B] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 sm:rounded-2xl sm:px-6 sm:py-3 sm:text-sm"
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
  const { matchdays, teams, currentRound, totalRounds, seasonId, bundlesLoading } = useQuinielaSeason();

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="RAIniela"
        title="Pronósticos"
        description="Marca directamente tu RAIniela con los 10 partidos del Grupo I. Al guardar queda bloqueada hasta que pulses editar; cuando empiece el primer partido ya no podrás cambiarla."
      />
      <QuinielaHowItWorks />
      {bundlesLoading ? (
        <p className="text-sm font-bold text-slate-500">Cargando partidos…</p>
      ) : null}
      <PronosticosBody
        key={seasonId}
        seasonId={seasonId}
        matchdays={matchdays}
        teams={teams}
        currentRound={currentRound}
        totalRounds={totalRounds}
        bundlesLoading={bundlesLoading}
      />
    </div>
  );
}
