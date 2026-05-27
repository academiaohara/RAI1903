"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { useMemo, useState } from "react";
import { MatchPreviewModal } from "@/components/MatchPreviewModal";
import { matchPickStats, players } from "@/data/mock";
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
  const pickStats = matchPickStats.find((item) => item.matchId === match.id);
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
      <div className="rounded-2xl border border-[#214C9B]/20 bg-white p-4 shadow-[0_10px_24px_rgba(17,24,39,0.05)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <p className="font-extrabold text-slate-800">{match.homeTeam}</p>
              <span className="text-xs font-bold uppercase text-slate-400">vs</span>
              <p className="font-extrabold text-slate-800">{match.awayTeam}</p>
              {avilesMatch && previaHref ? (
                <Link
                  href={previaHref}
                  className="ml-2 inline-flex items-center gap-1.5 rounded-xl border border-[#214C9B]/25 px-3 py-1.5 text-xs font-bold text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50"
                >
                  <Eye size={14} /> Previa
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="ml-2 inline-flex items-center gap-1.5 rounded-xl border border-[#214C9B]/25 px-3 py-1.5 text-xs font-bold text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50"
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

        {pickStats && (
          <div className="mt-3 border-t border-[#214C9B]/10 pt-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Apuestas de la comunidad</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {pickStats.picks.map((pick) => (
                <OutcomeStatBadge key={pick.outcome} outcome={pick.outcome} count={pick.count} percent={pick.percent} />
              ))}
              <span className="ml-auto text-xs text-slate-400">{pickStats.total} quinielas</span>
            </div>
          </div>
        )}

        {avilesMatch && (
          <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs font-bold uppercase tracking-normal text-[#214C9B]">Porra del Aviles</p>

            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <GoalsPickRow
                label={`Goles ${match.homeTeam}`}
                value={prediction?.goalsHome}
                readOnly={readOnly}
                onPick={(goalsHome) => update({ goalsHome })}
              />
              <GoalsPickRow
                label={`Goles ${match.awayTeam}`}
                value={prediction?.goalsAway}
                readOnly={readOnly}
                onPick={(goalsAway) => update({ goalsAway })}
              />
            </div>

            <div className="mt-4">
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

const outcomeStatStyles: Record<PredictionOutcome, string> = {
  "1": "border-[#981915]/30 bg-[#981915]/10 text-[#981915]",
  X: "border-amber-300 bg-amber-50 text-amber-900",
  "2": "border-[#214C9B]/30 bg-[#214C9B]/10 text-[#214C9B]",
};

function OutcomeStatBadge({
  outcome,
  count,
  percent,
}: {
  outcome: PredictionOutcome;
  count: number;
  percent: number;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${outcomeStatStyles[outcome]}`}
    >
      <span className="text-base font-extrabold leading-none">{outcome}</span>
      <span className="font-bold">{count}</span>
      <span className="opacity-70">({percent}%)</span>
    </div>
  );
}

function GoalsPickRow({
  label,
  value,
  readOnly,
  onPick,
}: {
  label: string;
  value?: GoalsPick;
  readOnly?: boolean;
  onPick: (pick: GoalsPick) => void;
}) {
  return (
    <div>
      <p className="text-sm font-bold text-slate-700">{label}</p>
      <div className="mt-2 flex gap-2">
        {goalOptions.map((option) => (
          <button
            key={String(option)}
            type="button"
            disabled={readOnly}
            onClick={() => onPick(option)}
            className={`h-11 w-11 rounded-2xl border text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-70 ${
              value === option
                ? "border-[#214C9B] bg-[#214C9B] text-white"
                : "border-[#214C9B]/20 bg-white text-slate-700 hover:bg-blue-50"
            }`}
          >
            {formatGoalsPick(option)}
          </button>
        ))}
      </div>
    </div>
  );
}
