"use client";

import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { ClasificacionPositionIndicator } from "@/components/clasificacion/ClasificacionPositionIndicator";
import { OpponentCrest } from "@/components/OpponentCrest";
import { TeamLink } from "@/components/TeamLink";
import {
  CLASIFICACION_MAX_POSITION_POINTS,
  predictionsToOrderedTeamIds,
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
  onReorder: (orderedTeamIds: string[]) => void;
};

function moveItem<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [item] = next.splice(from, 1);
  if (!item) return items;
  next.splice(to, 0, item);
  return next;
}

export function ClasificacionForm({
  teams,
  predictions,
  actualPositions,
  readOnly,
  mode = "edit",
  onReorder,
}: ClasificacionFormProps) {
  const teamById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const orderedTeamIds = useMemo(() => {
    if (mode === "edit") {
      return predictionsToOrderedTeamIds(teams, predictions);
    }
    return [...teams]
      .sort((a, b) => {
        const posA = actualPositions.get(a.id) ?? 999;
        const posB = actualPositions.get(b.id) ?? 999;
        return posA - posB || a.name.localeCompare(b.name, "es");
      })
      .map((team) => team.id);
  }, [teams, predictions, actualPositions, mode]);

  const applyReorder = useCallback(
    (nextIds: string[]) => {
      onReorder(nextIds);
    },
    [onReorder],
  );

  const handleMove = (from: number, to: number) => {
    if (readOnly || from === to || from < 0 || to < 0 || from >= orderedTeamIds.length || to >= orderedTeamIds.length) {
      return;
    }
    applyReorder(moveItem(orderedTeamIds, from, to));
  };

  const showDiff = mode === "compare" || mode === "results";
  const hasScoringData = useMemo(
    () =>
      orderedTeamIds.some((teamId) => {
        const predicted = predictions[teamId]?.position;
        const actual = actualPositions.get(teamId);
        return predicted !== undefined && actual !== undefined;
      }),
    [orderedTeamIds, predictions, actualPositions],
  );
  const showTeamScoring = hasScoringData;

  return (
    <div className="space-y-2">
      {mode === "edit" && !readOnly ? (
        <p className="text-xs font-bold text-slate-600 sm:text-sm">
          Arrastra los equipos para ordenar la clasificación. El primero de la lista es el campeón.
        </p>
      ) : null}

      {showTeamScoring ? (
        <div className="mb-2 flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-wide text-slate-600 sm:text-xs">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-emerald-700">
              <ChevronUp size={12} aria-hidden />2
            </span>
            Mejor de lo predicho
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex items-center gap-0.5 rounded-md bg-[#981915]/10 px-1.5 py-0.5 text-[#981915]">
              <ChevronDown size={12} aria-hidden />2
            </span>
            Peor de lo predicho
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-emerald-800">=</span>
            Posición acertada
          </span>
        </div>
      ) : null}

      <ul className="space-y-2" role="list">
        {orderedTeamIds.map((teamId, index) => {
          const team = teamById.get(teamId);
          if (!team) return null;

          const prediction = predictions[team.id];
          const actual = actualPositions.get(team.id);
          const displayPosition = mode === "edit" ? index + 1 : actual;
          const predictedPosition = prediction?.position;
          const points =
            prediction && actual !== undefined
              ? scoreClasificacionPosition(prediction.position, actual)
              : null;
          const showRowScoring =
            showTeamScoring && predictedPosition !== undefined && actual !== undefined;
          const crest = getTeamCrestById(team.id, team.crestInitials);
          const isDragging = dragIndex === index;
          const isDropTarget = overIndex === index && dragIndex !== null && dragIndex !== index;

          return (
            <li
              key={team.id}
              draggable={mode === "edit" && !readOnly}
              onDragStart={() => setDragIndex(index)}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              onDragOver={(event) => {
                if (mode !== "edit" || readOnly) return;
                event.preventDefault();
                setOverIndex(index);
              }}
              onDragLeave={() => {
                if (overIndex === index) setOverIndex(null);
              }}
              onDrop={(event) => {
                if (mode !== "edit" || readOnly || dragIndex === null) return;
                event.preventDefault();
                handleMove(dragIndex, index);
                setDragIndex(null);
                setOverIndex(null);
              }}
              className={cn(
                "flex flex-col gap-2 rounded-xl border bg-white p-2.5 transition sm:flex-row sm:items-center sm:justify-between sm:rounded-2xl sm:p-4",
                isDragging ? "border-[#214C9B] opacity-60" : "border-[#214C9B]/20",
                isDropTarget ? "border-[#214C9B] ring-2 ring-[#214C9B]/20" : "",
              )}
            >
              <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                {mode === "edit" && !readOnly ? (
                  <span
                    className="cursor-grab text-slate-400 active:cursor-grabbing"
                    aria-hidden
                    onMouseDown={(event) => event.stopPropagation()}
                  >
                    <GripVertical size={18} />
                  </span>
                ) : null}
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#214C9B]/10 text-[11px] font-extrabold text-[#214C9B] tabular-nums sm:h-8 sm:w-8 sm:text-xs">
                  {displayPosition}
                </span>
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
                {showRowScoring ? (
                  <ClasificacionPositionIndicator predicted={predictedPosition} actual={actual} />
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:gap-3">
                {showRowScoring ? (
                  <>
                    {showDiff ? (
                      <span className="text-xs font-bold text-slate-500">
                        Predicho: <span className="tabular-nums text-[#214C9B]">{predictedPosition}º</span>
                      </span>
                    ) : null}
                    {points !== null ? (
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
                    ) : null}
                  </>
                ) : null}

                {mode === "edit" && !readOnly ? (
                  <div className="flex items-center gap-1 sm:hidden">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, index - 1)}
                      className="rounded-lg border border-[#214C9B]/20 p-1.5 text-[#214C9B] disabled:opacity-40"
                      aria-label={`Subir ${team.name}`}
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={index === orderedTeamIds.length - 1}
                      onClick={() => handleMove(index, index + 1)}
                      className="rounded-lg border border-[#214C9B]/20 p-1.5 text-[#214C9B] disabled:opacity-40"
                      aria-label={`Bajar ${team.name}`}
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
