"use client";

import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ClasificacionPositionIndicator } from "@/components/clasificacion/ClasificacionPositionIndicator";
import { ClasificacionPositionInput } from "@/components/clasificacion/ClasificacionPositionInput";
import { OpponentCrest } from "@/components/OpponentCrest";
import { TeamLink } from "@/components/TeamLink";
import { useDragAutoScroll } from "@/hooks/useDragAutoScroll";
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

function rowIndexFromPoint(clientX: number, clientY: number): number | null {
  const target = document.elementFromPoint(clientX, clientY);
  const row = target?.closest<HTMLElement>("[data-clasificacion-row]");
  if (!row) return null;
  const index = Number(row.dataset.clasificacionRow);
  return Number.isNaN(index) ? null : index;
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
  const pointerDragIndexRef = useRef<number | null>(null);
  const overIndexRef = useRef<number | null>(null);
  const orderedTeamIdsRef = useRef<string[]>([]);
  const applyReorderRef = useRef<(nextIds: string[]) => void>(() => undefined);
  const canReorder = mode === "edit" && !readOnly;

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

  useEffect(() => {
    orderedTeamIdsRef.current = orderedTeamIds;
    applyReorderRef.current = applyReorder;
  }, [orderedTeamIds, applyReorder]);

  const handleMove = useCallback(
    (from: number, to: number) => {
      if (
        !canReorder ||
        from === to ||
        from < 0 ||
        to < 0 ||
        from >= orderedTeamIds.length ||
        to >= orderedTeamIds.length
      ) {
        return;
      }
      applyReorder(moveItem(orderedTeamIds, from, to));
    },
    [applyReorder, canReorder, orderedTeamIds],
  );

  const handlePositionCommit = useCallback(
    (index: number, nextPosition: number) => {
      handleMove(index, nextPosition - 1);
    },
    [handleMove],
  );

  const clearDragState = useCallback(() => {
    pointerDragIndexRef.current = null;
    overIndexRef.current = null;
    setDragIndex(null);
    setOverIndex(null);
  }, []);

  const isDragging = dragIndex !== null;
  useDragAutoScroll(isDragging);

  useEffect(() => {
    overIndexRef.current = overIndex;
  }, [overIndex]);

  useEffect(() => {
    if (!isDragging) return;

    const onPointerMove = (event: PointerEvent) => {
      if (pointerDragIndexRef.current === null) return;
      const rowIndex = rowIndexFromPoint(event.clientX, event.clientY);
      if (rowIndex !== null) {
        overIndexRef.current = rowIndex;
        setOverIndex(rowIndex);
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      const from = pointerDragIndexRef.current;
      if (from !== null) {
        const target = rowIndexFromPoint(event.clientX, event.clientY) ?? overIndexRef.current;
        if (target !== null && target !== from) {
          applyReorderRef.current(moveItem(orderedTeamIdsRef.current, from, target));
        }
      }
      clearDragState();
    };

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerUp);
    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointercancel", onPointerUp);
    };
  }, [clearDragState, isDragging]);

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
  const showTeamScoring = hasScoringData && mode !== "edit";

  return (
    <div className="space-y-2">
      {canReorder ? (
        <p className="text-xs font-bold text-slate-600 sm:text-sm">
          Arrastra, usa las flechas o escribe la posición para ordenar la clasificación. El primero es el campeón.
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
          const isRowDragging = dragIndex === index;
          const isDropTarget = overIndex === index && dragIndex !== null && dragIndex !== index;

          return (
            <li
              key={team.id}
              data-clasificacion-row={index}
              draggable={canReorder}
              onDragStart={() => setDragIndex(index)}
              onDragEnd={clearDragState}
              onDragOver={(event) => {
                if (!canReorder) return;
                event.preventDefault();
                setOverIndex(index);
              }}
              onDragLeave={() => {
                if (overIndex === index) setOverIndex(null);
              }}
              onDrop={(event) => {
                if (!canReorder || dragIndex === null) return;
                event.preventDefault();
                handleMove(dragIndex, index);
                clearDragState();
              }}
              className={cn(
                "flex items-center gap-2 rounded-xl border bg-white p-2.5 transition sm:gap-3 sm:rounded-2xl sm:p-3",
                isRowDragging ? "border-[#214C9B] opacity-60" : "border-[#214C9B]/20",
                isDropTarget ? "border-[#214C9B] ring-2 ring-[#214C9B]/20" : "",
              )}
            >
              {canReorder ? (
                <button
                  type="button"
                  aria-label={`Arrastrar ${team.name}`}
                  className="touch-none shrink-0 cursor-grab rounded-lg p-1 text-slate-400 active:cursor-grabbing"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    pointerDragIndexRef.current = index;
                    setDragIndex(index);
                    setOverIndex(index);
                    event.currentTarget.setPointerCapture(event.pointerId);
                  }}
                  onPointerUp={(event) => {
                    if (pointerDragIndexRef.current === null) return;
                    const from = pointerDragIndexRef.current;
                    const target = rowIndexFromPoint(event.clientX, event.clientY) ?? overIndexRef.current;
                    if (target !== null && target !== from) {
                      applyReorderRef.current(moveItem(orderedTeamIdsRef.current, from, target));
                    }
                    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                      event.currentTarget.releasePointerCapture(event.pointerId);
                    }
                    clearDragState();
                  }}
                >
                  <GripVertical size={18} />
                </button>
              ) : null}

              {canReorder ? (
                <ClasificacionPositionInput
                  key={`${team.id}-${index + 1}`}
                  position={index + 1}
                  max={orderedTeamIds.length}
                  onCommit={(nextPosition) => handlePositionCommit(index, nextPosition)}
                />
              ) : (
                <span className="flex h-8 w-10 shrink-0 items-center justify-center rounded-full bg-[#214C9B]/10 text-xs font-extrabold text-[#214C9B] tabular-nums sm:h-9 sm:w-11 sm:text-sm">
                  {displayPosition}
                </span>
              )}

              <TeamLink gender="masculino" teamId={team.id} teamName={team.name} className="shrink-0">
                <OpponentCrest logo={crest} opponent={team.name} size="sm" />
              </TeamLink>

              <div className="min-w-0 flex-1">
                <TeamLink
                  gender="masculino"
                  teamId={team.id}
                  teamName={team.name}
                  className="block truncate text-sm font-extrabold text-slate-800"
                >
                  {team.name}
                </TeamLink>
                {showRowScoring ? (
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <ClasificacionPositionIndicator predicted={predictedPosition!} actual={actual!} />
                    {showDiff ? (
                      <span className="text-[11px] font-bold text-slate-500 sm:text-xs">
                        Predicho: <span className="tabular-nums text-[#214C9B]">{predictedPosition}º</span>
                      </span>
                    ) : null}
                    {points !== null ? (
                      <span
                        className={cn(
                          "rounded-lg px-2 py-0.5 text-[11px] font-extrabold tabular-nums sm:text-xs",
                          points === CLASIFICACION_MAX_POSITION_POINTS
                            ? "bg-[#214C9B] text-white"
                            : "bg-slate-100 text-slate-700",
                        )}
                      >
                        {points} pts
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {canReorder ? (
                <div className="flex shrink-0 flex-col gap-0.5">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMove(index, index - 1)}
                    className="rounded-lg border border-[#214C9B]/20 p-1.5 text-[#214C9B] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={`Subir ${team.name}`}
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={index === orderedTeamIds.length - 1}
                    onClick={() => handleMove(index, index + 1)}
                    className="rounded-lg border border-[#214C9B]/20 p-1.5 text-[#214C9B] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={`Bajar ${team.name}`}
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
