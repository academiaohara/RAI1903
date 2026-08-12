"use client";

import { ArrowDown, ArrowUp, Equal } from "lucide-react";
import { getPositionDiff, getPositionDiffKind } from "@/lib/clasificacion-prediction";
import { cn } from "@/lib/utils";

type ClasificacionPositionIndicatorProps = {
  predicted: number;
  actual: number;
  className?: string;
};

export function ClasificacionPositionIndicator({
  predicted,
  actual,
  className,
}: ClasificacionPositionIndicatorProps) {
  const kind = getPositionDiffKind(predicted, actual);
  const diff = Math.abs(getPositionDiff(predicted, actual));
  const arrowCount = Math.min(diff, 2);

  if (kind === "exact") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-800 sm:text-xs",
          className,
        )}
        title="Posición acertada"
      >
        <Equal size={14} aria-hidden />
        Acierto
      </span>
    );
  }

  const isBelow = kind === "below";
  const Icon = isBelow ? ArrowDown : ArrowUp;
  const tone = isBelow ? "text-[#981915] bg-[#981915]/10" : "text-emerald-700 bg-emerald-50";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide sm:text-xs",
        tone,
        className,
      )}
      title={
        isBelow
          ? `${diff} puesto${diff === 1 ? "" : "s"} peor de lo predicho`
          : `${diff} puesto${diff === 1 ? "" : "s"} mejor de lo predicho`
      }
    >
      {Array.from({ length: arrowCount }, (_, index) => (
        <Icon key={index} size={14} aria-hidden />
      ))}
      <span className="tabular-nums">{diff}</span>
    </span>
  );
}
