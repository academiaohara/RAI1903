"use client";

import type { KeyboardEvent } from "react";
import { TeamCrest } from "@/components/TeamCrest";
import { isMatchPlayed } from "@/lib/match-result";
import type { SimulatedScore } from "@/lib/league-calculator";
import { cn } from "@/lib/utils";
import type { Match, Team } from "@/types";

type LeagueCalculatorMatchRowProps = {
  match: Match;
  teamsById: Map<string, Team>;
  simulatedScore?: SimulatedScore;
  onScoreChange: (matchId: string, homeScore: number | null, awayScore: number | null) => void;
};

function parseIntegerScore(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  if (!/^\d+$/.test(trimmed)) return null;
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 99) return null;
  return parsed;
}

function blockNonIntegerKeys(event: KeyboardEvent<HTMLInputElement>) {
  if (["e", "E", "+", "-", ".", ",", " "].includes(event.key)) {
    event.preventDefault();
  }
}

function ScoreInput({
  value,
  disabled,
  editable,
  onChange,
  ariaLabel,
}: {
  value: number | null;
  disabled?: boolean;
  editable?: boolean;
  onChange: (value: number | null) => void;
  ariaLabel: string;
}) {
  if (!editable) {
    return (
      <span
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-lg border-2 text-base font-extrabold tabular-nums sm:h-12 sm:w-12 sm:text-lg",
          disabled
            ? "border-slate-200 bg-slate-50 text-slate-500"
            : "border-[#214C9B]/20 bg-[#214C9B]/5 text-[#214C9B]",
        )}
        aria-label={ariaLabel}
      >
        {value ?? "-"}
      </span>
    );
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      maxLength={2}
      disabled={disabled}
      value={value === null ? "" : String(value)}
      aria-label={ariaLabel}
      onKeyDown={blockNonIntegerKeys}
      onChange={(event) => {
        const digitsOnly = event.target.value.replace(/\D/g, "").slice(0, 2);
        event.target.value = digitsOnly;
        onChange(parseIntegerScore(digitsOnly));
      }}
      onPaste={(event) => {
        event.preventDefault();
        const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 2);
        onChange(parseIntegerScore(pasted));
      }}
      className={cn(
        "h-11 w-11 rounded-lg border-2 bg-white text-center text-base font-extrabold tabular-nums text-[#214C9B] shadow-[inset_0_1px_2px_rgba(17,24,39,0.06)] outline-none transition sm:h-12 sm:w-12 sm:text-lg",
        disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
          : "border-[#214C9B] focus:border-[#981915] focus:ring-2 focus:ring-[#981915]/25",
      )}
    />
  );
}

export function LeagueCalculatorMatchRow({
  match,
  teamsById,
  simulatedScore,
  onScoreChange,
}: LeagueCalculatorMatchRowProps) {
  const played = isMatchPlayed(match);
  const homeTeam = teamsById.get(match.homeTeamId);
  const awayTeam = teamsById.get(match.awayTeamId);
  const homeName = homeTeam?.name ?? match.homeTeam;
  const awayName = awayTeam?.name ?? match.awayTeam;
  const homeScore = played ? (match.homeScore ?? null) : (simulatedScore?.homeScore ?? null);
  const awayScore = played ? (match.awayScore ?? null) : (simulatedScore?.awayScore ?? null);

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white px-3 py-3 shadow-[0_8px_24px_rgba(17,24,39,0.04)] sm:px-4 sm:py-3.5",
        played ? "border-slate-200 bg-slate-50/40" : "border-[#214C9B]/20",
      )}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
        <div className="min-w-0 text-right">
          <p className="truncate text-xs font-bold text-slate-800 sm:text-sm">{homeName}</p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {homeTeam ? <TeamCrest team={homeTeam} size="sm" className="h-7 w-7 sm:h-8 sm:w-8" /> : null}
          <ScoreInput
            value={homeScore}
            disabled={played}
            editable={!played}
            ariaLabel={`Goles de ${homeName}`}
            onChange={(next) => onScoreChange(match.id, next, awayScore)}
          />
          <span className="px-0.5 text-base font-bold text-slate-400" aria-hidden>
            -
          </span>
          <ScoreInput
            value={awayScore}
            disabled={played}
            editable={!played}
            ariaLabel={`Goles de ${awayName}`}
            onChange={(next) => onScoreChange(match.id, homeScore, next)}
          />
          {awayTeam ? <TeamCrest team={awayTeam} size="sm" className="h-7 w-7 sm:h-8 sm:w-8" /> : null}
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-slate-800 sm:text-sm">{awayName}</p>
        </div>
      </div>

      {played ? (
        <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
          Resultado oficial
        </p>
      ) : (
        <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#214C9B]/70">
          Introduce marcador simulado
        </p>
      )}
    </div>
  );
}
