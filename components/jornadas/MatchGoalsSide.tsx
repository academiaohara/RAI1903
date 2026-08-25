"use client";

import { Plus, Trash2 } from "lucide-react";
import {
  countGoalsFromEntries,
  goalEntryLabel,
  formatGoalMinute,
  matchGoalsOverrideKey,
  OWN_GOAL_PLAYER_KEY,
  readMatchGoalsOverride,
} from "@/lib/match-goals";
import { matchResultOverrideKey } from "@/lib/fixture-inline-keys";
import { getPlayerDisplayName, hasDisplayDorsal } from "@/lib/squad-utils";
import { squadPlayerGoalKey } from "@/lib/squad-player-resolve";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { JornadaFixture } from "@/types/jornadas";
import type { MatchGoalEntry } from "@/types/match-goals";
import type { SquadPlayer } from "@/types/squad";
import { cn } from "@/lib/utils";

type MatchGoalsSideProps = {
  side: "home" | "away";
  fixture: JornadaFixture;
  homeSquad: SquadPlayer[];
  awaySquad: SquadPlayer[];
  opponentName: string;
  editMode: boolean;
  goals: MatchGoalEntry[];
  onSaveGoals: (nextGoals: MatchGoalEntry[]) => void;
  align: "left" | "right";
};

function squadOptions(squad: SquadPlayer[]): { value: string; label: string }[] {
  return squad
    .slice()
    .sort((a, b) => a.dorsal - b.dorsal)
    .map((player) => ({
      value: squadPlayerGoalKey(player),
      label: `${hasDisplayDorsal(player.dorsal) ? `#${player.dorsal} ` : ""}${getPlayerDisplayName(player)}`,
    }));
}

export function MatchGoalsSide({
  side,
  fixture,
  homeSquad,
  awaySquad,
  opponentName,
  editMode,
  goals,
  onSaveGoals,
  align,
}: MatchGoalsSideProps) {
  const squad = side === "home" ? homeSquad : awaySquad;
  const sideGoals = goals
    .map((goal, index) => ({ goal, index }))
    .filter(({ goal }) => goal.teamSide === side)
    .sort((a, b) => a.goal.minute - b.goal.minute);

  const homeTeamName = fixture.homeTeamName;
  const awayTeamName = fixture.awayTeamName;

  const addGoal = () => {
    onSaveGoals([
      ...goals,
      {
        teamSide: side,
        playerKey: squad[0] ? squadPlayerGoalKey(squad[0]) : "1",
        minute: 0,
      },
    ]);
  };

  const updateGoal = (index: number, patch: Partial<MatchGoalEntry>) => {
    onSaveGoals(goals.map((goal, goalIndex) => (goalIndex === index ? { ...goal, ...patch } : goal)));
  };

  const removeGoal = (index: number) => {
    onSaveGoals(goals.filter((_, goalIndex) => goalIndex !== index));
  };

  if (!editMode && sideGoals.length === 0) {
    return <div className="min-h-0" />;
  }

  if (!editMode) {
    return (
      <ul
        className={cn(
          "space-y-0.5 text-[9px] font-semibold leading-tight text-slate-600 sm:text-[11px]",
          align === "right" ? "text-right" : "text-left",
        )}
      >
        {sideGoals.map(({ goal, index }) => {
          const label = goalEntryLabel(goal, homeTeamName, awayTeamName, homeSquad, awaySquad);
          return (
            <li key={`${side}-${goal.playerKey}-${goal.minute}-${index}`}>
              {label} {formatGoalMinute(goal.minute)}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className={cn("space-y-1", align === "right" ? "text-right" : "text-left")}>
      {sideGoals.length === 0 ? (
        <p className="text-[9px] font-medium text-slate-400 sm:text-[10px]">Sin goles</p>
      ) : (
        <ul className="space-y-1">
          {sideGoals.map(({ goal, index }) => (
            <li
              key={`${side}-edit-${goal.playerKey}-${goal.minute}-${index}`}
              className={cn(
                "flex flex-wrap items-center gap-1",
                align === "right" ? "justify-end" : "justify-start",
              )}
            >
              <select
                value={goal.playerKey}
                onChange={(event) => updateGoal(index, { playerKey: event.target.value })}
                className="max-w-[7.5rem] rounded-md border border-slate-200 px-1 py-0.5 text-[9px] font-bold sm:max-w-[9rem] sm:text-[10px]"
                aria-label="Goleador"
              >
                <option value={OWN_GOAL_PLAYER_KEY}>PP ({opponentName})</option>
                {squadOptions(squad).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={0}
                max={120}
                value={goal.minute}
                onChange={(event) => updateGoal(index, { minute: Number(event.target.value) || 0 })}
                className="w-10 rounded-md border border-slate-200 px-1 py-0.5 text-center text-[9px] font-bold sm:w-11 sm:text-[10px]"
                aria-label="Minuto"
              />
              <button
                type="button"
                onClick={() => removeGoal(index)}
                className="rounded-md p-0.5 text-slate-400 hover:bg-red-50 hover:text-[#981915]"
                aria-label="Eliminar gol"
              >
                <Trash2 size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={addGoal}
        className={cn(
          "inline-flex items-center gap-0.5 rounded-md border border-[#214C9B]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#214C9B] hover:bg-blue-50 sm:text-[10px]",
          align === "right" ? "ml-auto" : "",
        )}
      >
        <Plus size={10} aria-hidden />
        Gol
      </button>
    </div>
  );
}

type MatchGoalsInCardProps = {
  fixture: JornadaFixture;
  gender: PrimerEquipoGender;
  homeSquad: SquadPlayer[];
  awaySquad: SquadPlayer[];
  editMode: boolean;
  showGoalsEditor: boolean;
  getOverride: (key: string) => unknown;
  mergeSaveValue: <T extends Record<string, unknown>>(key: string, patch: Partial<T>) => void;
};

export function MatchGoalsInCard({
  fixture,
  gender,
  homeSquad,
  awaySquad,
  editMode,
  showGoalsEditor,
  getOverride,
  mergeSaveValue,
}: MatchGoalsInCardProps) {
  const goals = readMatchGoalsOverride(getOverride, gender, fixture.id)?.goals ?? [];

  const saveGoals = (nextGoals: MatchGoalEntry[]) => {
    const sorted = [...nextGoals].sort((a, b) => a.minute - b.minute);
    const counts = countGoalsFromEntries(sorted);
    mergeSaveValue(matchGoalsOverrideKey(gender, fixture.id), { goals: sorted });
    mergeSaveValue(matchResultOverrideKey(gender, fixture.id), {
      homeScore: counts.home,
      awayScore: counts.away,
      status: "finished",
      kickoffTime: undefined,
    });
  };

  const showGoalsRow =
    showGoalsEditor && editMode ? true : fixture.status === "finished" && goals.length > 0;

  if (!showGoalsRow) return null;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-1.5 border-t border-[#214C9B]/10 pt-1.5 sm:gap-3">
      <MatchGoalsSide
        side="home"
        fixture={fixture}
        homeSquad={homeSquad}
        awaySquad={awaySquad}
        opponentName={fixture.awayTeamName}
        editMode={showGoalsEditor && editMode}
        goals={goals}
        onSaveGoals={saveGoals}
        align="left"
      />
      <div className="min-w-[2.35rem] sm:min-w-[4.5rem]" aria-hidden />
      <MatchGoalsSide
        side="away"
        fixture={fixture}
        homeSquad={homeSquad}
        awaySquad={awaySquad}
        opponentName={fixture.homeTeamName}
        editMode={showGoalsEditor && editMode}
        goals={goals}
        onSaveGoals={saveGoals}
        align="right"
      />
    </div>
  );
}
