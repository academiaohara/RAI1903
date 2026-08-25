"use client";

import { Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { useSeason } from "@/components/season/SeasonProvider";
import { getCompeticionSquadData } from "@/lib/competicion-squad";
import { resolveGroupTeams } from "@/lib/cms/group-teams";
import {
  countGoalsFromEntries,
  matchGoalsOverrideKey,
  OWN_GOAL_PLAYER_KEY,
  readMatchGoalsOverride,
} from "@/lib/match-goals";
import { getPlayerDisplayName } from "@/lib/squad-utils";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { RfefGrupoId } from "@/lib/rfef-grupos";
import type { JornadaFixture } from "@/types/jornadas";
import type { MatchGoalEntry } from "@/types/match-goals";
import type { SquadPlayer } from "@/types/squad";

type MatchGoalsEditorProps = {
  fixture: JornadaFixture;
  gender?: PrimerEquipoGender;
  grupo?: RfefGrupoId;
};

function squadOptions(squad: SquadPlayer[]): { value: string; label: string }[] {
  return squad
    .slice()
    .sort((a, b) => a.dorsal - b.dorsal)
    .map((player) => ({
      value: String(player.dorsal),
      label: `#${player.dorsal} ${getPlayerDisplayName(player)}`,
    }));
}

export function MatchGoalsEditor({
  fixture,
  gender = "masculino",
  grupo = "1",
}: MatchGoalsEditorProps) {
  const { editMode, getOverride, mergeSaveValue } = useInlineEditing();
  const { bundles, viewedSeason } = useSeason();
  const teams = useMemo(() => resolveGroupTeams(bundles, gender, grupo), [bundles, gender, grupo]);

  const homeTeam = teams.find((team) => team.id === fixture.homeTeamId);
  const awayTeam = teams.find((team) => team.id === fixture.awayTeamId);

  const homeSquad = useMemo(
    () =>
      homeTeam
        ? getCompeticionSquadData(gender, homeTeam, bundles, viewedSeason.label).squad
        : [],
    [bundles, gender, homeTeam, viewedSeason.label],
  );
  const awaySquad = useMemo(
    () =>
      awayTeam
        ? getCompeticionSquadData(gender, awayTeam, bundles, viewedSeason.label).squad
        : [],
    [bundles, gender, awayTeam, viewedSeason.label],
  );

  const goals =
    readMatchGoalsOverride(getOverride, gender, fixture.id)?.goals ??
    ([] as MatchGoalEntry[]);

  if (!editMode || gender !== "masculino" || grupo !== "1") return null;

  const saveGoals = (nextGoals: MatchGoalEntry[]) => {
    const sorted = [...nextGoals].sort((a, b) => a.minute - b.minute);
    const counts = countGoalsFromEntries(sorted);
    mergeSaveValue(matchGoalsOverrideKey(gender, fixture.id), { goals: sorted });
    mergeSaveValue(`match-result:${gender}:${fixture.id}`, {
      homeScore: counts.home,
      awayScore: counts.away,
      status: "finished",
      kickoffTime: undefined,
    });
  };

  const addGoal = () => {
    saveGoals([
      ...goals,
      {
        teamSide: "home",
        playerKey: homeSquad[0] ? String(homeSquad[0].dorsal) : "1",
        minute: 0,
      },
    ]);
  };

  const updateGoal = (index: number, patch: Partial<MatchGoalEntry>) => {
    const next = goals.map((goal, goalIndex) => (goalIndex === index ? { ...goal, ...patch } : goal));
    saveGoals(next);
  };

  const removeGoal = (index: number) => {
    saveGoals(goals.filter((_, goalIndex) => goalIndex !== index));
  };

  return (
    <div className="space-y-2 rounded-xl border border-dashed border-[#214C9B]/25 bg-white/80 p-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#214C9B] sm:text-xs">
          Goleadores
        </p>
        <button
          type="button"
          onClick={addGoal}
          className="inline-flex items-center gap-1 rounded-lg border border-[#214C9B]/20 px-2 py-1 text-[10px] font-bold text-[#214C9B] hover:bg-blue-50"
        >
          <Plus size={12} aria-hidden />
          Añadir gol
        </button>
      </div>

      {goals.length === 0 ? (
        <p className="text-[10px] text-slate-500 sm:text-xs">Sin goles registrados.</p>
      ) : (
        <ul className="space-y-1.5">
          {goals.map((goal, index) => {
            const squad = goal.teamSide === "home" ? homeSquad : awaySquad;
            const options = squadOptions(squad);
            return (
              <li
                key={`${goal.teamSide}-${goal.playerKey}-${goal.minute}-${index}`}
                className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_4rem_auto] items-center gap-1.5"
              >
                <select
                  value={goal.teamSide}
                  onChange={(event) =>
                    updateGoal(index, {
                      teamSide: event.target.value as MatchGoalEntry["teamSide"],
                      playerKey:
                        event.target.value === "home"
                          ? homeSquad[0]
                            ? String(homeSquad[0].dorsal)
                            : "1"
                          : awaySquad[0]
                            ? String(awaySquad[0].dorsal)
                            : "1",
                    })
                  }
                  className="rounded-lg border border-slate-200 px-1 py-1 text-[10px] font-bold"
                >
                  <option value="home">{fixture.homeTeamName}</option>
                  <option value="away">{fixture.awayTeamName}</option>
                </select>
                <select
                  value={goal.playerKey}
                  onChange={(event) => updateGoal(index, { playerKey: event.target.value })}
                  className="rounded-lg border border-slate-200 px-1 py-1 text-[10px] font-bold"
                >
                  <option value={OWN_GOAL_PLAYER_KEY}>Propia puerta</option>
                  {options.map((option) => (
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
                  onChange={(event) =>
                    updateGoal(index, { minute: Number(event.target.value) || 0 })
                  }
                  className="rounded-lg border border-slate-200 px-1 py-1 text-center text-[10px] font-bold"
                  aria-label="Minuto"
                />
                <button
                  type="button"
                  onClick={() => removeGoal(index)}
                  className="rounded-lg p-1 text-slate-500 hover:bg-red-50 hover:text-[#981915]"
                  aria-label="Eliminar gol"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
