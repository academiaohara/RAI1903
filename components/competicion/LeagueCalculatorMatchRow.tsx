"use client";

import { TeamCrest } from "@/components/TeamCrest";
import { isMatchPlayed } from "@/lib/match-result";
import { cn } from "@/lib/utils";
import type { Match, Team } from "@/types";

type LeagueCalculatorMatchRowProps = {
  match: Match;
  teamsById: Map<string, Team>;
  simulatedScore?: { homeScore: number; awayScore: number };
  onScoreChange: (matchId: string, homeScore: number | null, awayScore: number | null) => void;
};

function parseScoreInput(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 99) return null;
  return parsed;
}

function ScoreInput({
  value,
  disabled,
  onChange,
  ariaLabel,
}: {
  value: number | null;
  disabled?: boolean;
  onChange: (value: number | null) => void;
  ariaLabel: string;
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={2}
      disabled={disabled}
      value={value === null ? "" : String(value)}
      aria-label={ariaLabel}
      onChange={(event) => {
        const next = event.target.value.replace(/\D/g, "").slice(0, 2);
        if (next === "") {
          onChange(null);
          return;
        }
        const parsed = parseScoreInput(next);
        if (parsed !== null) onChange(parsed);
      }}
      className={cn(
        "h-9 w-9 rounded-lg border-2 text-center text-sm font-extrabold tabular-nums outline-none transition sm:h-10 sm:w-10 sm:text-base",
        disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-500"
          : "border-[#214C9B]/25 bg-white text-[#214C9B] focus:border-[#214C9B] focus:ring-2 focus:ring-[#214C9B]/20",
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
        played ? "border-slate-200" : "border-[#214C9B]/15",
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
            ariaLabel={`Goles de ${homeName}`}
            onChange={(next) => onScoreChange(match.id, next, awayScore)}
          />
          <span className="px-0.5 text-sm font-bold text-slate-400" aria-hidden>
            -
          </span>
          <ScoreInput
            value={awayScore}
            disabled={played}
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
      ) : null}
    </div>
  );
}
