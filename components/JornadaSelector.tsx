"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { scrollAlignForIndex, scrollElementHorizontally } from "@/lib/scroll-horizontal";
import { cn } from "@/lib/utils";

export function JornadaSelector({
  value,
  total,
  currentRound,
  onChange,
  compact = false,
  hideHeader = false,
  playedRounds,
}: {
  value: number;
  total: number;
  currentRound: number;
  onChange: (round: number) => void;
  /** Variante integrada en tarjetas (sin caja propia). */
  compact?: boolean;
  /** Oculta la cabecera interna (Jornada X de Y). */
  hideHeader?: boolean;
  /** Jornadas ya disputadas por completo (estilo distinto en el carrusel). */
  playedRounds?: ReadonlySet<number>;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const frame = requestAnimationFrame(() => {
      const selected = list.querySelector<HTMLButtonElement>(`[data-round="${value}"]`);
      if (!selected) return;

      scrollElementHorizontally(list, selected, {
        behavior: "smooth",
        align: scrollAlignForIndex(value, total),
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [value, total]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      if (list.scrollWidth <= list.clientWidth) return;

      event.preventDefault();
      event.stopPropagation();
      list.scrollLeft += event.deltaY;
    };

    list.addEventListener("wheel", handleWheel, { passive: false });
    return () => list.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div
      className={cn(
        "min-w-0",
        !compact && "rounded-2xl border border-[#214C9B]/20 bg-white p-3 shadow-[0_12px_30px_rgba(17,24,39,0.06)] sm:rounded-3xl sm:p-4",
      )}
    >
      {!hideHeader ? (
        <div className={cn("flex flex-wrap items-end justify-between", compact ? "gap-2" : "gap-3")}>
          <div>
            <p className={cn("font-bold uppercase tracking-normal text-[#214C9B]", compact ? "text-[10px]" : "text-[10px] sm:text-xs")}>
              Jornadas
            </p>
            <p className={cn("font-bold text-slate-600", compact ? "mt-0.5 text-xs" : "mt-0.5 text-xs sm:mt-1 sm:text-sm")}>
              Jornada <span className="text-[#214C9B]">{value}</span> de {total}
            </p>
          </div>
          <p className={cn("font-bold uppercase tracking-normal text-[#981915]", compact ? "text-[10px]" : "text-[10px] sm:text-xs")}>
            Actual: J{currentRound}
          </p>
        </div>
      ) : null}

      <div className={cn("flex items-center gap-2", !hideHeader && (compact ? "mt-2" : "mt-3 sm:mt-4"))}>
        <button
          type="button"
          disabled={value <= 1}
          onClick={() => onChange(value - 1)}
          aria-label="Jornada anterior"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded border-2 border-[#d43b2f] bg-[#fdf9f1] text-[#981915] disabled:opacity-30"
        >
          <ChevronLeft size={18} />
        </button>

        <div
          ref={listRef}
          className="no-scrollbar flex min-w-0 flex-1 touch-pan-x gap-2 overflow-x-auto overscroll-x-contain overscroll-y-none py-1 [overscroll-behavior:contain]"
        >
          {Array.from({ length: total }, (_, index) => {
            const round = index + 1;
            const isCurrent = round === currentRound;
            const isSelected = value === round;
            const isPlayed = playedRounds?.has(round) ?? false;

            return (
              <button
                key={round}
                type="button"
                data-round={round}
                onClick={() => onChange(round)}
                className={cn(
                  "relative h-10 min-w-10 shrink-0 rounded border-2 text-xs font-extrabold transition sm:h-11 sm:min-w-11 sm:text-sm",
                  isPlayed
                    ? isSelected
                      ? "border-slate-500 bg-slate-400 text-white shadow-sm"
                      : "border-slate-300 bg-slate-100 text-slate-500 hover:border-slate-400 hover:bg-slate-200"
                    : isSelected
                      ? "border-[#981915] bg-[#981915] text-white shadow-sm"
                      : "border-[#d43b2f] bg-[#fdf9f1] text-[#981915] hover:bg-red-50",
                  isCurrent && !isPlayed && "ring-2 ring-[#214C9B]/25 ring-offset-1",
                )}
              >
                {round}
                {isSelected ? (
                  <b className="hand-mark-x" aria-hidden>X</b>
                ) : null}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          disabled={value >= total}
          onClick={() => onChange(value + 1)}
          aria-label="Jornada siguiente"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded border-2 border-[#d43b2f] bg-[#fdf9f1] text-[#981915] disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
