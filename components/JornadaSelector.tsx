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
}: {
  value: number;
  total: number;
  currentRound: number;
  onChange: (round: number) => void;
  /** Variante integrada en tarjetas (sin caja propia). */
  compact?: boolean;
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

      <div className={cn("flex items-center gap-2", compact ? "mt-2" : "mt-3 sm:mt-4")}>
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

            return (
              <button
                key={round}
                type="button"
                data-round={round}
                onClick={() => onChange(round)}
                className={cn(
                  "relative h-10 min-w-10 shrink-0 rounded border-2 border-[#d43b2f] bg-[#fdf9f1] text-xs font-extrabold text-[#981915] transition hover:bg-red-50 sm:h-11 sm:min-w-11 sm:text-sm",
                  isCurrent && "ring-2 ring-[#214C9B]/25 ring-offset-1",
                )}
              >
                {round}
                {isSelected ? (
                  <b className="absolute inset-0 flex rotate-[-7deg] items-center justify-center font-['Comic_Sans_MS',cursive] text-2xl font-bold text-[#171717]" aria-hidden>
                    X
                  </b>
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
