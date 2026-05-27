"use client";

import { Search } from "lucide-react";
import { motion } from "framer-motion";
import type { SquadPosition } from "@/types/squad";
import { SQUAD_POSITIONS } from "@/types/squad";
import { ViewToggle } from "@/components/squad/ViewToggle";
import type { SquadViewMode } from "@/types/squad";

type FiltersBarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  position: SquadPosition | "Todas";
  onPositionChange: (value: SquadPosition | "Todas") => void;
  viewMode: SquadViewMode;
  onViewModeChange: (mode: SquadViewMode) => void;
  resultsCount: number;
};

const positionFilters: Array<SquadPosition | "Todas"> = ["Todas", ...SQUAD_POSITIONS];

export function FiltersBar({
  query,
  onQueryChange,
  position,
  onPositionChange,
  viewMode,
  onViewModeChange,
  resultsCount,
}: FiltersBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.35 }}
      className="rounded-[1.75rem] border border-[#214C9B]/12 bg-white/90 p-4 shadow-[0_12px_40px_rgba(17,24,39,0.06)] backdrop-blur-sm sm:p-5"
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Buscar jugador por nombre o dorsal..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#214C9B] focus:bg-white focus:ring-2 focus:ring-[#214C9B]/15"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <ViewToggle value={viewMode} onChange={onViewModeChange} />
          <p className="text-center text-xs font-bold uppercase tracking-wide text-slate-500 sm:min-w-[5.5rem] sm:text-right">
            {resultsCount} {resultsCount === 1 ? "jugador" : "jugadores"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {positionFilters.map((item) => {
          const active = position === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onPositionChange(item)}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
                active
                  ? "bg-[#214C9B] text-white shadow-md shadow-blue-950/15"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-[#214C9B]/30 hover:text-[#214C9B]"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
