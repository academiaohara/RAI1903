"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { MatchPreviewModal } from "@/components/MatchPreviewModal";
import { players, RAI_TEAM_ID } from "@/data/mock";
import { getPreviaForMatch } from "@/lib/match-articles";
import { formatGoalsPick, getAvilesGoalsPick, isAvilesMatch } from "@/lib/quiniela";
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
  const avilesIsHome = match.homeTeamId === RAI_TEAM_ID;
  const previa = getPreviaForMatch(match.id);
  const previaHref = previa ? (`${primerEquipoBase("masculino")}/previas/${previa.id}` as Route) : undefined;
  const avilesGoalsPick = prediction ? getAvilesGoalsPick(match, prediction) : undefined;
  const scorerLockedToNadie = avilesGoalsPick === 0;

  const update = (patch: Partial<Prediction>) => {
    if (readOnly) return;
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
    if (avilesMatch && getAvilesGoalsPick(match, next) === 0) {
      next.scorer = "nadie";
    }
    onChange(next);
  };

  const handleAvilesGoalsPick = (isHomeSide: boolean, pick: GoalsPick) => {
    const patch: Partial<Prediction> = isHomeSide ? { goalsHome: pick } : { goalsAway: pick };
    if ((avilesIsHome && isHomeSide) || (!avilesIsHome && !isHomeSide)) {
      if (pick === 0) patch.scorer = "nadie";
    }
    update(patch);
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
                    onPick={(pick) => handleAvilesGoalsPick(true, pick)}
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
                  readOnly={readOnly || scorerLockedToNadie}
                  onChange={(scorer) => update({ scorer })}
                />
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
    <div ref={rootRef} className="relative flex min-w-[12rem] flex-1 items-center gap-2 sm:max-w-xs">
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
