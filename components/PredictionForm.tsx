"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { useMemo, useState } from "react";
import { MatchPreviewModal } from "@/components/MatchPreviewModal";
import { players } from "@/data/mock";
import { getPreviaForMatch } from "@/lib/match-articles";
import { formatGoalsPick, isAvilesMatch } from "@/lib/quiniela";
import { primerEquipoBase } from "@/lib/primer-equipo";
import type { GoalsPick, Match, Prediction, PredictionOutcome } from "@/types";
import type { Route } from "next";

const outcomes: PredictionOutcome[] = ["1", "X", "2"];
const goalOptions: GoalsPick[] = [0, 1, 2, "M"];

export function PredictionForm({
  match,
  prediction,
  readOnly,
  onChange,
}: {
  match: Match;
  prediction?: Prediction;
  readOnly?: boolean;
  onChange: (prediction: Prediction) => void;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const avilesMatch = isAvilesMatch(match);
  const avilesScorers = useMemo(() => players.filter((player) => player.position !== "Portero"), []);
  const previa = getPreviaForMatch(match.id);
  const previaHref = previa ? (`${primerEquipoBase("masculino")}/previas/${previa.id}` as Route) : undefined;

  const update = (patch: Partial<Prediction>) => {
    if (readOnly) return;
    onChange({
      matchId: match.id,
      matchday: match.matchday,
      outcome: prediction?.outcome,
      goalsHome: prediction?.goalsHome,
      goalsAway: prediction?.goalsAway,
      scorer: prediction?.scorer,
      ...patch,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <>
      <div className="space-y-4 rounded-2xl border border-[#214C9B]/20 bg-white p-4 shadow-[0_10px_24px_rgba(17,24,39,0.05)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-extrabold text-slate-800">{match.homeTeam}</p>
                {avilesMatch && (
                  <GoalsPickButtons
                    value={prediction?.goalsHome}
                    readOnly={readOnly}
                    onPick={(goalsHome) => update({ goalsHome })}
                  />
                )}
              </div>
              <span className="text-xs font-bold uppercase text-slate-400">vs</span>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-extrabold text-slate-800">{match.awayTeam}</p>
                {avilesMatch && (
                  <GoalsPickButtons
                    value={prediction?.goalsAway}
                    readOnly={readOnly}
                    onPick={(goalsAway) => update({ goalsAway })}
                  />
                )}
              </div>
              {avilesMatch && previaHref ? (
                <Link
                  href={previaHref}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#214C9B]/25 px-3 py-1.5 text-xs font-bold text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50"
                >
                  <Eye size={14} /> Previa
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#214C9B]/25 px-3 py-1.5 text-xs font-bold text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50"
                >
                  <Eye size={14} /> Previa
                </button>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <div className="flex items-center gap-2" aria-label="Prediccion 1 X 2">
              {outcomes.map((outcome) => (
                <button
                  key={outcome}
                  type="button"
                  disabled={readOnly}
                  onClick={() => update({ outcome })}
                  className={`h-12 w-12 rounded-2xl border text-lg font-extrabold transition disabled:cursor-not-allowed disabled:opacity-70 ${
                    prediction?.outcome === outcome
                      ? "border-[#214C9B] bg-[#214C9B] text-white"
                      : "border-[#214C9B]/20 bg-white text-slate-700 hover:bg-blue-50"
                  }`}
                >
                  {outcome}
                </button>
              ))}
            </div>
          </div>
        </div>

        {avilesMatch && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs font-bold uppercase tracking-normal text-[#214C9B]">Porra del Aviles</p>

            <div>
              <p className="text-xs font-bold uppercase tracking-normal text-slate-500">Goleador del Aviles</p>
              <p className="mt-1 text-xs text-slate-500">Elige un jugador o marca que nadie marca.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() => update({ scorer: "nadie" })}
                  className={`rounded-xl border px-3 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-70 ${
                    prediction?.scorer === "nadie"
                      ? "border-[#214C9B] bg-[#214C9B] text-white"
                      : "border-[#214C9B]/20 bg-white text-slate-700 hover:bg-blue-50"
                  }`}
                >
                  Nadie
                </button>
                {avilesScorers.map((player) => (
                  <button
                    key={player.id}
                    type="button"
                    disabled={readOnly}
                    onClick={() => update({ scorer: player.displayName })}
                    className={`rounded-xl border px-3 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-70 ${
                      prediction?.scorer === player.displayName
                        ? "border-[#214C9B] bg-[#214C9B] text-white"
                        : "border-[#214C9B]/20 bg-white text-slate-700 hover:bg-blue-50"
                    }`}
                  >
                    {player.displayName}
                  </button>
                ))}
              </div>
            </div>

            {prediction?.goalsHome !== undefined && prediction.goalsAway !== undefined && (
              <p className="mt-3 text-sm font-bold text-slate-700">
                Marcador porra: {formatGoalsPick(prediction.goalsHome)} - {formatGoalsPick(prediction.goalsAway)}
              </p>
            )}
          </div>
        )}
      </div>

      <MatchPreviewModal match={match} open={previewOpen} onClose={() => setPreviewOpen(false)} />
    </>
  );
}

function GoalsPickButtons({
  value,
  readOnly,
  onPick,
}: {
  value?: GoalsPick;
  readOnly?: boolean;
  onPick: (pick: GoalsPick) => void;
}) {
  return (
    <div className="flex gap-1">
      {goalOptions.map((option) => (
        <button
          key={String(option)}
          type="button"
          disabled={readOnly}
          onClick={() => onPick(option)}
          className={`h-9 w-9 rounded-xl border text-xs font-extrabold transition disabled:cursor-not-allowed disabled:opacity-70 ${
            value === option
              ? "border-[#214C9B] bg-[#214C9B] text-white"
              : "border-[#214C9B]/20 bg-white text-slate-700 hover:bg-blue-50"
          }`}
        >
          {formatGoalsPick(option)}
        </button>
      ))}
    </div>
  );
}
