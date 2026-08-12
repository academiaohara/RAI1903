"use client";

import { useMemo } from "react";
import { OpponentCrest } from "@/components/OpponentCrest";
import { TeamLink } from "@/components/TeamLink";
import {
  CLASIFICACION_MAX_POSITION_POINTS,
  scoreClasificacionPosition,
  type ClasificacionPrediction,
} from "@/lib/clasificacion-prediction";
import { getTeamCrestById } from "@/lib/team-crests";
import { cn } from "@/lib/utils";
import type { Team } from "@/types";

export type ClasificacionFormMode = "edit" | "results" | "compare";

type ClasificacionFormProps = {
  teams: Team[];
  predictions: Record<string, ClasificacionPrediction>;
  actualPositions: Map<string, number>;
  readOnly?: boolean;
  mode?: ClasificacionFormMode;
  onChange: (teamId: string, position: number) => void;
};

export function ClasificacionForm({
  teams,
  predictions,
  actualPositions,
  readOnly,
  mode = "edit",
  onChange,
}: ClasificacionFormProps) {
  const teamCount = teams.length;
  const positionOptions = useMemo(
    () => Array.from({ length: teamCount }, (_, index) => index + 1),
    [teamCount],
  );

  const sortedTeams = useMemo(() => {
    if (mode === "edit") {
      return [...teams].sort((a, b) => a.name.localeCompare(b.name, "es"));
    }
    return [...teams].sort((a, b) => {
      const posA = actualPositions.get(a.id) ?? 999;
      const posB = actualPositions.get(b.id) ?? 999;
      return posA - posB;
    });
  }, [teams, actualPositions, mode]);

  return (
    <div className="space-y-2">
      {sortedTeams.map((team) => {
        const prediction = predictions[team.id];
        const actual = actualPositions.get(team.id);
        const points =
          prediction && actual !== undefined
            ? scoreClasificacionPosition(prediction.position, actual)
            : null;
        const crest = getTeamCrestById(team.id, team.crestInitials);

        return (
          <div
            key={team.id}
            className="flex flex-col gap-2 rounded-xl border border-[#214C9B]/20 bg-white p-2.5 sm:flex-row sm:items-center sm:justify-between sm:rounded-2xl sm:p-4"
          >
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              {mode !== "edit" && actual !== undefined ? (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#981915]/10 text-[11px] font-extrabold text-[#981915] sm:h-8 sm:w-8 sm:text-xs">
                  {actual}
                </span>
              ) : null}
              <TeamLink gender="masculino" teamId={team.id} teamName={team.name} className="shrink-0">
                <OpponentCrest logo={crest} opponent={team.name} size="sm" />
              </TeamLink>
              <TeamLink
                gender="masculino"
                teamId={team.id}
                teamName={team.name}
                className="min-w-0 truncate text-sm font-extrabold text-slate-800"
              >
                {team.name}
              </TeamLink>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {mode === "compare" && prediction ? (
                <span className="text-xs font-bold text-[#214C9B]">
                  Tu predicción: <span className="tabular-nums">{prediction.position}º</span>
                </span>
              ) : null}
              {mode === "results" || mode === "compare" ? (
                points !== null ? (
                  <span
                    className={cn(
                      "rounded-lg px-2 py-1 text-xs font-extrabold tabular-nums",
                      points === CLASIFICACION_MAX_POSITION_POINTS
                        ? "bg-[#214C9B] text-white"
                        : "bg-slate-100 text-slate-700",
                    )}
                  >
                    {points} pts
                  </span>
                ) : null
              ) : (
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  Posición
                  <select
                    value={prediction?.position ?? ""}
                    disabled={readOnly}
                    onChange={(event) => onChange(team.id, Number(event.target.value))}
                    className="rounded-xl border border-[#214C9B]/20 bg-white px-2 py-1.5 text-sm font-extrabold text-[#214C9B] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <option value="" disabled>
                      —
                    </option>
                    {positionOptions.map((position) => (
                      <option key={position} value={position}>
                        {position}º
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
