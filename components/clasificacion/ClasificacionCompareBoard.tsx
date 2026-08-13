"use client";

import { useMemo } from "react";
import { ClasificacionPositionIndicator } from "@/components/clasificacion/ClasificacionPositionIndicator";
import { OpponentCrest } from "@/components/OpponentCrest";
import {
  CLASIFICACION_MAX_POSITION_POINTS,
  predictionsToOrderedTeamIds,
  scoreClasificacionPosition,
  type ClasificacionPrediction,
} from "@/lib/clasificacion-prediction";
import { getTeamCrestById } from "@/lib/team-crests";
import { cn } from "@/lib/utils";
import type { Team } from "@/types";

type ClasificacionCompareBoardProps = {
  teams: Team[];
  predictions: Record<string, ClasificacionPrediction>;
  actualPositions: Map<string, number>;
  predictionLabel?: string;
  actualLabel?: string;
};

function buildActualOrderedTeamIds(teams: Team[], actualPositions: Map<string, number>): string[] {
  return [...teams]
    .sort((a, b) => {
      const posA = actualPositions.get(a.id) ?? 999;
      const posB = actualPositions.get(b.id) ?? 999;
      return posA - posB || a.name.localeCompare(b.name, "es");
    })
    .map((team) => team.id);
}

type CompareRowProps = {
  rank: number;
  predictedTeam: Team;
  actualTeam: Team;
  predictedPosition: number;
  actualPosition?: number;
  showScoring: boolean;
};

function CompareTeamCell({
  team,
  position,
  align,
}: {
  team: Team;
  position: number;
  align: "left" | "right";
}) {
  const crest = getTeamCrestById(team.id, team.crestInitials);

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-1.5 sm:gap-2",
        align === "right" ? "justify-end" : "justify-start",
      )}
    >
      {align === "right" ? (
        <>
          <span className="hidden min-w-0 truncate text-xs font-extrabold text-slate-800 sm:block sm:text-sm">
            {team.shortName || team.name}
          </span>
          <OpponentCrest logo={crest} opponent={team.name} size="sm" teamId={team.id} />
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#214C9B]/10 text-[10px] font-extrabold text-[#214C9B] tabular-nums sm:h-7 sm:w-7 sm:text-xs">
            {position}
          </span>
        </>
      ) : (
        <>
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#214C9B]/10 text-[10px] font-extrabold text-[#214C9B] tabular-nums sm:h-7 sm:w-7 sm:text-xs">
            {position}
          </span>
          <OpponentCrest logo={crest} opponent={team.name} size="sm" teamId={team.id} />
          <span className="hidden min-w-0 truncate text-xs font-extrabold text-slate-800 sm:block sm:text-sm">
            {team.shortName || team.name}
          </span>
        </>
      )}
    </div>
  );
}

function CompareRow({
  rank,
  predictedTeam,
  actualTeam,
  predictedPosition,
  actualPosition,
  showScoring,
}: CompareRowProps) {
  const points =
    actualPosition !== undefined
      ? scoreClasificacionPosition(predictedPosition, actualPosition)
      : null;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1 rounded-xl border border-[#214C9B]/15 bg-white px-1.5 py-1.5 sm:gap-2 sm:rounded-2xl sm:px-3 sm:py-2">
      <CompareTeamCell team={predictedTeam} position={rank} align="left" />

      <div className="flex w-14 shrink-0 flex-col items-center justify-center gap-0.5 px-0.5 sm:w-20">
        {showScoring && actualPosition !== undefined ? (
          <>
            <ClasificacionPositionIndicator
              predicted={predictedPosition}
              actual={actualPosition}
              className="px-1.5 py-0.5 text-[9px] sm:px-2 sm:text-[10px]"
            />
            {points !== null ? (
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums sm:text-xs",
                  points === CLASIFICACION_MAX_POSITION_POINTS
                    ? "bg-[#214C9B] text-white"
                    : "bg-slate-100 text-slate-700",
                )}
              >
                {points} pts
              </span>
            ) : null}
          </>
        ) : (
          <span className="text-[10px] font-bold text-slate-400 sm:text-xs">—</span>
        )}
      </div>

      <CompareTeamCell team={actualTeam} position={rank} align="right" />
    </div>
  );
}

export function ClasificacionCompareBoard({
  teams,
  predictions,
  actualPositions,
  predictionLabel = "Predicción",
  actualLabel = "Clasificación real",
}: ClasificacionCompareBoardProps) {
  const teamById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);

  const predictedOrder = useMemo(
    () => predictionsToOrderedTeamIds(teams, predictions),
    [teams, predictions],
  );
  const actualOrder = useMemo(
    () => buildActualOrderedTeamIds(teams, actualPositions),
    [teams, actualPositions],
  );

  const showScoring = actualPositions.size > 0;
  const rowCount = Math.max(predictedOrder.length, actualOrder.length);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-1 px-1.5 sm:gap-2 sm:px-3">
        <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#214C9B] sm:text-xs">
          {predictionLabel}
        </p>
        <p className="text-center text-[10px] font-extrabold uppercase tracking-wide text-slate-500 sm:text-xs">
          {showScoring ? "Dif." : ""}
        </p>
        <p className="text-right text-[10px] font-extrabold uppercase tracking-wide text-[#981915] sm:text-xs">
          {actualLabel}
        </p>
      </div>

      {showScoring ? (
        <p className="px-1 text-[10px] leading-4 text-slate-600 sm:px-0 sm:text-xs sm:leading-5">
          Cada fila compara quién ocupa ese puesto en la predicción y en la clasificación actual. En móvil solo
          se muestran escudos.
        </p>
      ) : null}

      <div className="space-y-1.5 sm:space-y-2" role="list">
        {Array.from({ length: rowCount }, (_, index) => {
          const rank = index + 1;
          const predictedTeamId = predictedOrder[index];
          const actualTeamId = actualOrder[index];
          const predictedTeam = predictedTeamId ? teamById.get(predictedTeamId) : undefined;
          const actualTeam = actualTeamId ? teamById.get(actualTeamId) : undefined;
          if (!predictedTeam || !actualTeam) return null;

          const predictedPosition = predictions[predictedTeam.id]?.position ?? rank;
          const actualPosition = actualPositions.get(predictedTeam.id);

          return (
            <CompareRow
              key={`${predictedTeam.id}-${actualTeam.id}-${rank}`}
              rank={rank}
              predictedTeam={predictedTeam}
              actualTeam={actualTeam}
              predictedPosition={predictedPosition}
              actualPosition={actualPosition}
              showScoring={showScoring}
            />
          );
        })}
      </div>
    </div>
  );
}
