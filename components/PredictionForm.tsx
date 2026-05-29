"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { MatchPreviewModal } from "@/components/MatchPreviewModal";
import { players, RAI_TEAM_ID } from "@/data/mock";
import { getPreviaForMatch } from "@/lib/match-articles";
import {
  actualOutcome,
  formatGoalsPick,
  getAvilesGoalsPick,
  isAvilesMatch,
  isOutcomeLockedByGoals,
  outcomeFromGoalsPicks,
} from "@/lib/quiniela";
import { primerEquipoBase } from "@/lib/primer-equipo";
import type { GoalsPick, Match, Prediction, PredictionOutcome } from "@/types";
import type { Route } from "next";

const outcomes: PredictionOutcome[] = ["1", "X", "2"];
const goalOptions: GoalsPick[] = [0, 1, 2, "M"];

const scorerOptions = [
  { value: "nadie", label: "Nadie" },
  ...players
    .filter((player) => player.position !== "Portero")
    .map((player) => ({ value: player.displayName, label: player.displayName })),
];

export type PredictionFormMode = "edit" | "results" | "compare";

function outcomeButtonClass({
  mode,
  outcome,
  userOutcome,
  actual,
  selected,
}: {
  mode: PredictionFormMode;
  outcome: PredictionOutcome;
  userOutcome?: PredictionOutcome;
  actual: PredictionOutcome | null;
  selected: boolean;
}): string {
  const base =
    "h-12 flex-1 rounded-2xl border text-lg font-extrabold transition disabled:cursor-not-allowed sm:w-12 sm:flex-none";

  if (mode === "results") {
    const isActual = actual === outcome;
    return `${base} disabled:opacity-100 ${
      isActual
        ? "border-[#981915] bg-[#981915] text-white"
        : "border-[#214C9B]/15 bg-slate-50 text-slate-400"
    }`;
  }

  if (mode === "compare") {
    const isUser = userOutcome === outcome;
    const isActual = actual === outcome;
    if (isUser && isActual) {
      return `${base} border-[#981915] bg-[#214C9B] text-white ring-2 ring-[#981915] ring-offset-1 disabled:opacity-100`;
    }
    if (isUser) {
      return `${base} border-[#214C9B] bg-[#214C9B] text-white disabled:opacity-100`;
    }
    if (isActual) {
      return `${base} border-[#981915] bg-[#981915] text-white disabled:opacity-100`;
    }
    return `${base} border-[#214C9B]/15 bg-slate-50 text-slate-400 disabled:opacity-70`;
  }

  return `${base} disabled:opacity-70 ${
    selected
      ? "border-[#214C9B] bg-[#214C9B] text-white"
      : "border-[#214C9B]/20 bg-white text-slate-700 hover:bg-blue-50"
  }`;
}

export function PredictionForm({
  match,
  prediction,
  readOnly,
  mode = "edit",
  onChange,
}: {
  match: Match;
  prediction?: Prediction;
  readOnly?: boolean;
  mode?: PredictionFormMode;
  onChange: (prediction: Prediction) => void;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const avilesMatch = isAvilesMatch(match);
  const avilesIsHome = match.homeTeamId === RAI_TEAM_ID;
  const previa = getPreviaForMatch(match.id);
  const previaHref = previa ? (`${primerEquipoBase("masculino")}/previas/${previa.id}` as Route) : undefined;
  const avilesGoalsPick = prediction ? getAvilesGoalsPick(match, prediction) : undefined;
  const scorerLockedToNadie = avilesGoalsPick === 0;
  const derivedOutcome =
    prediction?.goalsHome !== undefined && prediction?.goalsAway !== undefined
      ? outcomeFromGoalsPicks(prediction.goalsHome, prediction.goalsAway)
      : null;
  const outcomeLocked = avilesMatch && isOutcomeLockedByGoals(prediction?.goalsHome, prediction?.goalsAway);
  const displayMode = mode === "edit" ? "edit" : mode;
  const isDisplayOnly = displayMode !== "edit";
  const formReadOnly = readOnly || isDisplayOnly;
  const actual = actualOutcome(match);
  const userOutcome = (outcomeLocked ? derivedOutcome : prediction?.outcome) ?? undefined;

  const applyAvilesRules = (next: Prediction): Prediction => {
    const avilesGoals = getAvilesGoalsPick(match, next);
    if (avilesGoals === 0) {
      next.scorer = "nadie";
    } else if (avilesGoals !== undefined) {
      if (next.scorer === "nadie") next.scorer = undefined;
    }

    const outcome = outcomeFromGoalsPicks(next.goalsHome, next.goalsAway);
    if (outcome !== null) next.outcome = outcome;

    return next;
  };

  const update = (patch: Partial<Prediction>) => {
    if (formReadOnly) return;
    const next: Prediction = {
      matchId: match.id,
      matchday: match.matchday,
      outcome: prediction?.outcome,
      goalsHome: prediction?.goalsHome,
      goalsAway: prediction?.goalsAway,
      scorer: prediction?.scorer,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    onChange(avilesMatch ? applyAvilesRules(next) : next);
  };

  const handleAvilesGoalsPick = (isHomeSide: boolean, pick: GoalsPick) => {
    const patch: Partial<Prediction> = isHomeSide ? { goalsHome: pick } : { goalsAway: pick };
    if ((avilesIsHome && isHomeSide) || (!avilesIsHome && !isHomeSide)) {
      patch.scorer = pick === 0 ? "nadie" : undefined;
    }
    update(patch);
  };

  return (
    <>
      <div className="space-y-4 rounded-2xl border border-[#214C9B]/20 bg-white p-4 shadow-[0_10px_24px_rgba(17,24,39,0.05)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <div className="min-w-0 flex-1">
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
              <div className="flex min-w-0 flex-col gap-2 rounded-xl bg-slate-50 p-3 sm:flex-row sm:items-center sm:bg-transparent sm:p-0">
                <p className="min-w-0 break-words font-extrabold leading-tight text-slate-800">{match.homeTeam}</p>
                {avilesMatch && (
                  <GoalsPickButtons
                    value={prediction?.goalsHome}
                    readOnly={formReadOnly}
                    highlightVariant={displayMode === "compare" ? "user" : displayMode === "results" ? "neutral" : "user"}
                    onPick={(pick) => handleAvilesGoalsPick(true, pick)}
                  />
                )}
              </div>
              <span className="self-center text-xs font-bold uppercase text-slate-400">vs</span>
              <div className="flex min-w-0 flex-col gap-2 rounded-xl bg-slate-50 p-3 sm:flex-row sm:items-center sm:bg-transparent sm:p-0">
                <p className="min-w-0 break-words font-extrabold leading-tight text-slate-800">{match.awayTeam}</p>
                {avilesMatch && (
                  <GoalsPickButtons
                    value={prediction?.goalsAway}
                    readOnly={formReadOnly}
                    highlightVariant={displayMode === "compare" ? "user" : displayMode === "results" ? "neutral" : "user"}
                    onPick={(pick) => handleAvilesGoalsPick(false, pick)}
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
              {avilesMatch && (
                <ScorerCombobox
                  value={scorerLockedToNadie ? "nadie" : prediction?.scorer}
                  readOnly={formReadOnly || scorerLockedToNadie}
                  onChange={(scorer) => update({ scorer })}
                />
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <div className="flex w-full items-center gap-2 sm:w-auto" aria-label="Prediccion 1 X 2">
              {outcomes.map((outcome) => {
                const selected = userOutcome === outcome;
                return (
                  <button
                    key={outcome}
                    type="button"
                    disabled={formReadOnly || outcomeLocked}
                    onClick={() => update({ outcome })}
                    className={outcomeButtonClass({
                      mode: displayMode,
                      outcome,
                      userOutcome,
                      actual,
                      selected,
                    })}
                  >
                    {outcome}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <MatchPreviewModal match={match} open={previewOpen} onClose={() => setPreviewOpen(false)} />
    </>
  );
}

function ScorerCombobox({
  value,
  readOnly,
  onChange,
}: {
  value?: string;
  readOnly?: boolean;
  onChange: (scorer: string) => void;
}) {
  const inputId = useId();
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedLabel = scorerOptions.find((option) => option.value === value)?.label ?? "";
  const displayValue = open ? query : selectedLabel;

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return scorerOptions;
    return scorerOptions.filter((option) => option.label.toLowerCase().includes(normalized));
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const selectOption = (optionValue: string, optionLabel: string) => {
    onChange(optionValue);
    setQuery(optionLabel);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative flex w-full min-w-0 flex-col gap-2 sm:max-w-xs sm:flex-row sm:items-center">
      <label htmlFor={inputId} className="shrink-0 text-sm font-bold text-slate-700">
        Goleador:
      </label>
      <input
        id={inputId}
        type="text"
        role="combobox"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-autocomplete="list"
        disabled={readOnly}
        value={displayValue}
        placeholder="Buscar jugador..."
        onFocus={() => {
          if (readOnly) return;
          setOpen(true);
          setQuery(selectedLabel);
        }}
        onChange={(event) => {
          if (readOnly) return;
          setQuery(event.target.value);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
            setQuery("");
          }
        }}
        className="min-w-0 flex-1 rounded-xl border border-[#214C9B]/20 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#214C9B] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
      />
      <ul
        id={listboxId}
        role="listbox"
        hidden={!open || readOnly || filtered.length === 0}
        className="absolute inset-x-0 top-full z-20 mt-1 max-h-40 overflow-y-auto rounded-xl border border-[#214C9B]/20 bg-white py-1 shadow-lg empty:hidden"
      >
        {filtered.map((option) => (
          <li key={option.value}>
            <button
              type="button"
              role="option"
              aria-selected={value === option.value}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectOption(option.value, option.label)}
              className={`w-full px-3 py-1.5 text-left text-sm font-semibold transition hover:bg-blue-50 ${
                value === option.value ? "bg-blue-50 text-[#214C9B]" : "text-slate-700"
              }`}
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GoalsPickButtons({
  value,
  readOnly,
  highlightVariant = "user",
  onPick,
}: {
  value?: GoalsPick;
  readOnly?: boolean;
  highlightVariant?: "user" | "neutral";
  onPick: (pick: GoalsPick) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-1 sm:flex">
      {goalOptions.map((option) => (
        <button
          key={String(option)}
          type="button"
          disabled={readOnly}
          onClick={() => onPick(option)}
          className={`h-9 w-9 rounded-xl border text-xs font-extrabold transition disabled:cursor-not-allowed disabled:opacity-70 ${
            value === option
              ? highlightVariant === "user"
                ? "border-[#214C9B] bg-[#214C9B] text-white"
                : "border-[#214C9B]/20 bg-white text-slate-700"
              : "border-[#214C9B]/20 bg-white text-slate-700 hover:bg-blue-50"
          }`}
        >
          {formatGoalsPick(option)}
        </button>
      ))}
    </div>
  );
}
