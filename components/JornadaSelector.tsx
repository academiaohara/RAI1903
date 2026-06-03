"use client";

import { useEffect, useRef, type WheelEvent } from "react";
import { scrollElementHorizontally } from "@/lib/scroll-horizontal";
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

    const selected = list.querySelector<HTMLButtonElement>(`[data-round="${value}"]`);
    if (selected) {
      scrollElementHorizontally(list, selected, { behavior: "smooth", align: "center" });
    }
  }, [value]);

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

    const list = event.currentTarget;
    if (list.scrollWidth <= list.clientWidth) return;

    event.preventDefault();
    list.scrollLeft += event.deltaY;
  };

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

      <input
        type="range"
        min={1}
        max={total}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={cn(
          "h-2 w-full min-w-0 cursor-pointer appearance-none rounded-full bg-[#214C9B]/15 accent-[#214C9B]",
          compact ? "mt-2" : "mt-3 sm:mt-4",
        )}
        aria-label="Barra de jornadas"
      />

      <div
        ref={listRef}
        onWheel={handleWheel}
        className={cn(
          "no-scrollbar flex w-full min-w-0 touch-pan-x flex-nowrap overflow-x-auto overscroll-x-contain pb-1",
          compact ? "mt-2 gap-1.5" : "mt-2 gap-1.5 sm:mt-3 sm:gap-2",
        )}
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
                "shrink-0 rounded-2xl border font-extrabold transition",
                compact ? "h-9 min-w-9 text-xs" : "h-9 min-w-9 text-xs sm:h-11 sm:min-w-11 sm:text-sm",
                isSelected
                  ? isCurrent
                    ? "border-[#981915] bg-[#981915] text-white"
                    : "border-[#214C9B] bg-[#214C9B] text-white"
                  : isCurrent
                    ? "border-[#981915]/50 bg-[#981915]/10 text-[#981915] hover:border-[#214C9B] hover:bg-blue-50 hover:text-[#214C9B]"
                    : "border-[#214C9B]/20 bg-white text-slate-700 hover:border-[#214C9B] hover:bg-blue-50 hover:text-[#214C9B]",
              )}
            >
              {round}
            </button>
          );
        })}
      </div>
    </div>
  );
}
