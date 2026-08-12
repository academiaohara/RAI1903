"use client";

import { Eye } from "lucide-react";
import { useMemo, useState } from "react";
import { MatchPreviewModal } from "@/components/MatchPreviewModal";
import { OpponentCrest } from "@/components/OpponentCrest";
import { TeamLink } from "@/components/TeamLink";
import { useSeason } from "@/components/season/SeasonProvider";
import { resolveGroupTeams } from "@/lib/cms/group-teams";
import { getTeamsBundle, resolveFixtureTeamDisplayName } from "@/lib/cms/teams-bundle";
import { formatGoalsPick, getActualGoalsPicks, getTeamById } from "@/lib/quiniela";
import { getTeamCrestById } from "@/lib/team-crests";
import { cn } from "@/lib/utils";
import type { QuinigolPrediction } from "@/lib/quinigol";
import type { GoalsPick, Match } from "@/types";

const goalOptions: GoalsPick[] = [0, 1, 2, "M"];

export type QuinigolFormMode = "edit" | "results" | "compare";

function goalsButtonClass({
  mode,
  option,
  value,
  actual,
}: {
  mode: QuinigolFormMode;
  option: GoalsPick;
  value?: GoalsPick;
  actual: GoalsPick | null;
}): string {
  const base =
    "h-7 w-7 rounded-lg border text-[10px] font-extrabold transition disabled:cursor-not-allowed sm:h-9 sm:w-9 sm:rounded-xl sm:text-xs";

  const isUser = value === option;
  const isActual = actual === option;

  if (mode === "results") {
    return `${base} disabled:opacity-100 ${
      isActual
        ? "border-[#981915] bg-[#981915] text-white"
        : "border-[#214C9B]/15 bg-slate-50 text-slate-400"
    }`;
  }

  if (mode === "compare") {
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

  return cn(
    base,
    "disabled:opacity-70",
    isUser
      ? "border-[#214C9B] bg-[#214C9B] text-white"
      : "border-[#214C9B]/20 bg-white text-slate-700 hover:bg-blue-50",
  );
}

function GoalsPickButtons({
  value,
  actual,
  mode = "edit",
  readOnly,
  onPick,
}: {
  value?: GoalsPick;
  actual?: GoalsPick | null;
  mode?: QuinigolFormMode;
  readOnly?: boolean;
  onPick: (pick: GoalsPick) => void;
}) {
  const resolvedActual = actual ?? null;

  return (
    <div className="grid shrink-0 grid-cols-4 gap-0.5 sm:flex sm:gap-1" aria-label="Goles">
      {goalOptions.map((option) => (
        <button
          key={String(option)}
          type="button"
          disabled={readOnly}
          onClick={() => onPick(option)}
          className={goalsButtonClass({ mode, option, value, actual: resolvedActual })}
        >
          {formatGoalsPick(option)}
        </button>
      ))}
    </div>
  );
}

export function QuinigolMatchForm({
  match,
  prediction,
  readOnly,
  mode = "edit",
  onChange,
}: {
  match: Match;
  prediction?: QuinigolPrediction;
  readOnly?: boolean;
  mode?: QuinigolFormMode;
  onChange: (prediction: QuinigolPrediction) => void;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const { bundles } = useSeason();
  const teams = useMemo(() => resolveGroupTeams(bundles, "masculino", "1"), [bundles]);
  const cmsTeams = useMemo(() => getTeamsBundle(bundles, "masculino")?.teams ?? [], [bundles]);
  const homeTeamName = useMemo(
    () =>
      getTeamById(match.homeTeamId, teams)?.name ??
      resolveFixtureTeamDisplayName(match.homeTeamId, match.homeTeam, cmsTeams, bundles, "masculino"),
    [bundles, cmsTeams, match.homeTeam, match.homeTeamId, teams],
  );
  const awayTeamName = useMemo(
    () =>
      getTeamById(match.awayTeamId, teams)?.name ??
      resolveFixtureTeamDisplayName(match.awayTeamId, match.awayTeam, cmsTeams, bundles, "masculino"),
    [bundles, cmsTeams, match.awayTeam, match.awayTeamId, teams],
  );
  const homeCrest = getTeamCrestById(match.homeTeamId, getTeamById(match.homeTeamId, teams)?.crestInitials);
  const awayCrest = getTeamCrestById(match.awayTeamId, getTeamById(match.awayTeamId, teams)?.crestInitials);
  const actualGoals = getActualGoalsPicks(match);
  const displayMode = mode;
  const formReadOnly = readOnly || mode !== "edit";

  const update = (patch: Partial<Pick<QuinigolPrediction, "goalsHome" | "goalsAway">>) => {
    onChange({
      matchId: match.id,
      matchday: match.matchday,
      goalsHome: patch.goalsHome ?? prediction?.goalsHome,
      goalsAway: patch.goalsAway ?? prediction?.goalsAway,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <>
      <div className="rounded-xl border border-[#214C9B]/20 bg-white p-2.5 shadow-[0_10px_24px_rgba(17,24,39,0.05)] sm:rounded-2xl sm:p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <TeamLink gender="masculino" teamId={match.homeTeamId} teamName={homeTeamName} className="shrink-0">
                  <OpponentCrest logo={homeCrest} opponent={homeTeamName} size="sm" className="shrink-0" />
                </TeamLink>
                <TeamLink
                  gender="masculino"
                  teamId={match.homeTeamId}
                  teamName={homeTeamName}
                  className="min-w-0 truncate text-[11px] font-extrabold leading-tight text-slate-800 sm:text-sm"
                >
                  {homeTeamName}
                </TeamLink>
              </div>
              <GoalsPickButtons
                value={prediction?.goalsHome}
                actual={actualGoals.home}
                mode={displayMode}
                readOnly={formReadOnly}
                onPick={(pick) => update({ goalsHome: pick })}
              />
            </div>

            <span className="hidden shrink-0 self-center text-xs font-bold uppercase text-slate-400 sm:inline">vs</span>

            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:items-end">
              <div className="flex min-w-0 items-center gap-2 sm:flex-row-reverse">
                <TeamLink gender="masculino" teamId={match.awayTeamId} teamName={awayTeamName} className="shrink-0">
                  <OpponentCrest logo={awayCrest} opponent={awayTeamName} size="sm" className="shrink-0" />
                </TeamLink>
                <TeamLink
                  gender="masculino"
                  teamId={match.awayTeamId}
                  teamName={awayTeamName}
                  className="min-w-0 truncate text-right text-[11px] font-extrabold leading-tight text-slate-800 sm:text-sm"
                >
                  {awayTeamName}
                </TeamLink>
              </div>
              <GoalsPickButtons
                value={prediction?.goalsAway}
                actual={actualGoals.away}
                mode={displayMode}
                readOnly={formReadOnly}
                onPick={(pick) => update({ goalsAway: pick })}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex w-fit items-center justify-center gap-1.5 rounded-xl border border-[#214C9B]/25 px-2.5 py-1.5 text-[11px] font-bold text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50 sm:px-3 sm:text-xs"
          >
            <Eye size={14} /> Previa
          </button>
        </div>
      </div>

      <MatchPreviewModal match={match} open={previewOpen} onClose={() => setPreviewOpen(false)} />
    </>
  );
}
